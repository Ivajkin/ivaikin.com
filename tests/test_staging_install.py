import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).parents[1] / 'scripts/staging-install.py'
TOKEN = 'A' * 32
HEADER = b'staging.edgefocus.ru, staging.edgefocus.io {\n'
ORIGINAL = b'other.example {\n respond "unchanged"\n}\n' + HEADER + b'  reverse_proxy app:3456\n}\nlast.example {\n respond "also unchanged"\n}\n'


class InstallerTests(unittest.TestCase):
    def setUp(self):
        self.assertTrue(SCRIPT.exists(), 'The fail-closed staging installer must exist')
        spec = importlib.util.spec_from_file_location('staging_install', SCRIPT)
        self.mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.mod)

    def test_insertion_preserves_every_preexisting_byte(self):
        candidate = self.mod.candidate_config(ORIGINAL, TOKEN)
        block = self.mod.owned_block(TOKEN)
        self.assertEqual(candidate.replace(block, b'', 1), ORIGINAL)
        self.assertIn(HEADER + block, candidate)
        self.assertEqual(self.mod.candidate_config(candidate, TOKEN), candidate)

    def test_existing_capability_cannot_be_silently_changed(self):
        candidate = self.mod.candidate_config(ORIGINAL, TOKEN)
        with self.assertRaises(self.mod.InstallError):
            self.mod.candidate_config(candidate, 'B' * 32)

    def test_ambiguous_or_modified_configuration_fails_closed(self):
        for data in (ORIGINAL.replace(HEADER, b'other {\n'), ORIGINAL + HEADER,
                     self.mod.candidate_config(ORIGINAL, TOKEN).replace(b'log_skip', b'changed')):
            with self.subTest(data=data[:20]):
                with self.assertRaises(self.mod.InstallError):
                    self.mod.candidate_config(data, TOKEN)

    def test_preview_responses_are_unlogged_and_noncacheable(self):
        block = self.mod.owned_block(TOKEN).decode()
        self.assertIn('log_skip /previews/ivaikin/*', block)
        self.assertIn('>Referrer-Policy "no-referrer"', block)
        self.assertIn('>X-Robots-Tag "noindex, nofollow, noarchive"', block)
        self.assertIn('>Cache-Control "private, no-store"', block)
        self.assertIn('respond "Not found" 404', block)
        self.assertIn(f'redir /previews/ivaikin/{TOKEN} /previews/ivaikin/{TOKEN}/ 308', block)

    def test_hostile_arguments_fail_before_subprocess_or_filesystem(self):
        for token, release in ((TOKEN, "release'quote"), (TOKEN, 'release;touch /tmp/bad'),
                               ('$(whoami)' + 'A' * 23, 'release'), (TOKEN, '../release')):
            with self.subTest(release=release), patch.object(self.mod.subprocess, 'run') as run, \
                 patch.object(self.mod, 'install') as install, contextlib.redirect_stdout(io.StringIO()) as out:
                self.assertEqual(self.mod.main([token, release]), 1)
                self.assertEqual(json.loads(out.getvalue())['status'], 'failed')
                run.assert_not_called()
                install.assert_not_called()

    def fixture(self, directory):
        directory = Path(directory).resolve()
        base = directory / 'static'
        state = directory / 'state'
        config = directory / 'Caddyfile'
        config.write_bytes(ORIGINAL)
        for release in ('one', 'two'):
            target = base / 'releases' / release
            target.mkdir(parents=True)
            (target / 'index.html').write_text('<h1>Review</h1>')
            (target / 'release.json').write_text(json.dumps({'release': release}))
        return base, state, config

    def test_redeploy_changes_release_without_reloading_shared_caddy(self):
        with tempfile.TemporaryDirectory() as directory:
            base, state, config = self.fixture(directory)
            inode = config.stat().st_ino
            with patch.multiple(self.mod, BASE=base, STATE=state, CONFIG=config), \
                 patch.object(self.mod, 'verify_mounts'), patch.object(self.mod, 'docker') as docker:
                self.mod.install(TOKEN, 'one')
                docker.reset_mock()
                first_config = config.read_bytes()
                self.mod.install(TOKEN, 'two')
                self.assertEqual(config.read_bytes(), first_config)
                self.assertEqual(config.stat().st_ino, inode)
                self.assertEqual((base / 'current').resolve(), base / 'releases/two')
                self.assertFalse(any('reload' in call.args for call in docker.call_args_list))
                self.assertEqual((state / 'preview-token').stat().st_mode & 0o777, 0o600)

    def test_failed_reload_restores_prior_pointer_and_config(self):
        with tempfile.TemporaryDirectory() as directory:
            base, state, config = self.fixture(directory)
            (base / 'current').symlink_to(base / 'releases/one')
            with patch.multiple(self.mod, BASE=base, STATE=state, CONFIG=config), \
                 patch.object(self.mod, 'verify_mounts'), patch.object(self.mod, 'docker'), \
                 patch.object(self.mod, 'reload_caddy', side_effect=[self.mod.InstallError('docker_failed'), None]):
                with self.assertRaises(self.mod.InstallError):
                    self.mod.install(TOKEN, 'two')
            self.assertEqual(config.read_bytes(), ORIGINAL)
            self.assertEqual((base / 'current').resolve(), base / 'releases/one')
            self.assertFalse((state / 'preview-token').exists())

    def test_concurrent_config_edit_is_never_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            base, state, config = self.fixture(directory)
            concurrent = ORIGINAL + b'# independent change\n'
            def validate(*args):
                config.write_bytes(concurrent)
            with patch.multiple(self.mod, BASE=base, STATE=state, CONFIG=config), \
                 patch.object(self.mod, 'verify_mounts'), patch.object(self.mod, 'docker', side_effect=validate):
                with self.assertRaises(self.mod.InstallError):
                    self.mod.install(TOKEN, 'one')
            self.assertEqual(config.read_bytes(), concurrent)
            self.assertFalse((base / 'current').exists())

    def test_write_failure_restores_bytes_without_replacing_config_inode(self):
        with tempfile.TemporaryDirectory() as directory:
            _, _, config = self.fixture(directory)
            inode = config.stat().st_ino
            with patch.object(self.mod.os, 'fsync', side_effect=[OSError('simulated write failure'), None]):
                with self.assertRaises(OSError):
                    self.mod.write_in_place(config, ORIGINAL, b'candidate')
            self.assertEqual(config.read_bytes(), ORIGINAL)
            self.assertEqual(config.stat().st_ino, inode)


if __name__ == '__main__':
    unittest.main()
