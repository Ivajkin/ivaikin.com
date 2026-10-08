#!/usr/bin/env python3
"""Install an uploaded static release; never print the private preview capability."""
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import uuid

BASE = Path('/opt/static-sites/ivaikin-staging')
STATE = Path('/var/lib/ivaikin-staging')
CONFIG = Path('/opt/edgefocus/Caddyfile')
CONTAINER = 'edgefocus-caddy'
ANCHOR = b'staging.edgefocus.ru, staging.edgefocus.io {\n'
BEGIN = b'  # BEGIN IVAikin staging (managed)\n'
END = b'  # END IVAikin staging (managed)\n'


class InstallError(Exception):
    pass


def validate_arguments(token, release):
    if not re.fullmatch(r'[A-Za-z0-9_-]{32}', token) or not re.fullmatch(r'[A-Za-z0-9-]{1,90}', release):
        raise InstallError('invalid_arguments')


def owned_block(token):
    validate_arguments(token, 'valid')
    prefix = '/previews/ivaikin/' + token
    return BEGIN + f'''  log_skip /previews/ivaikin/*
  header /previews/ivaikin/* {{
    >X-Robots-Tag "noindex, nofollow, noarchive"
    >Cache-Control "private, no-store"
    >Referrer-Policy "no-referrer"
  }}
  redir {prefix} {prefix}/ 308
  handle_path {prefix}/* {{
    root * /opt/static-sites/ivaikin-staging/current
    file_server
  }}
  handle /previews/ivaikin/* {{
    respond "Not found" 404
  }}
'''.encode() + END


def candidate_config(original, token):
    block = owned_block(token)
    if original.count(ANCHOR) != 1:
        raise InstallError('staging_server_ambiguous')
    if BEGIN in original or END in original:
        if original.count(BEGIN) != 1 or original.count(END) != 1 or ANCHOR + block not in original:
            raise InstallError('managed_config_mismatch')
        return original
    if b'/previews/ivaikin/' in original:
        raise InstallError('unmanaged_preview_route')
    return original.replace(ANCHOR, ANCHOR + block, 1)


def docker(*args):
    result = subprocess.run(['docker', *args], capture_output=True, check=False, timeout=45)
    if result.returncode:
        raise InstallError('docker_failed')
    return result.stdout


def verify_mounts():
    mounts = json.loads(docker('inspect', CONTAINER, '--format', '{{json .Mounts}}'))
    pairs = {(item['Source'], item['Destination']) for item in mounts}
    if (str(CONFIG), '/etc/caddy/Caddyfile') not in pairs or ('/opt/static-sites', '/opt/static-sites') not in pairs:
        raise InstallError('unexpected_caddy_mounts')


def write_in_place(path, expected, content):
    with path.open('r+b') as handle:
        if handle.read() != expected:
            raise InstallError('config_race')
        def save(data):
            handle.seek(0)
            handle.write(data)
            handle.truncate()
            handle.flush()
            os.fsync(handle.fileno())
        try:
            save(content)
        except Exception:
            try:
                save(expected)
            except Exception as rollback:
                raise InstallError('rollback_failed') from rollback
            raise


def set_current(target):
    temporary = BASE / ('.current-' + uuid.uuid4().hex)
    try:
        temporary.symlink_to(target)
        os.replace(temporary, BASE / 'current')
    finally:
        temporary.unlink(missing_ok=True)


def reload_caddy():
    docker('exec', CONTAINER, 'caddy', 'reload', '--config', '/etc/caddy/Caddyfile', '--adapter', 'caddyfile')


def install(token, release):
    validate_arguments(token, release)
    os.umask(0o077)
    STATE.mkdir(mode=0o700, parents=True, exist_ok=True)
    with (STATE / 'deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        token_file = STATE / 'preview-token'
        if token_file.exists() and (token_file.is_symlink() or token_file.read_text().strip() != token):
            raise InstallError('token_mismatch')
        target = BASE / 'releases' / release
        if target.is_symlink() or target.resolve() != target or not target.is_dir():
            raise InstallError('release_invalid')
        if any(path.is_symlink() for path in target.rglob('*')):
            raise InstallError('release_symlink')
        metadata = target / 'release.json'
        if not (target / 'index.html').is_file() or not metadata.is_file() or metadata.stat().st_size > 8192:
            raise InstallError('release_incomplete')
        if json.loads(metadata.read_text()).get('release') != release:
            raise InstallError('release_mismatch')
        current = BASE / 'current'
        previous = os.readlink(current) if current.is_symlink() else None
        if current.exists() and previous is None:
            raise InstallError('current_not_symlink')
        if previous is not None and current.resolve().parent != BASE / 'releases':
            raise InstallError('current_outside_releases')
        verify_mounts()
        original = CONFIG.read_bytes()
        candidate = candidate_config(original, token)
        changed = original != candidate
        candidate_path = BASE / ('candidate-' + uuid.uuid4().hex + '.caddyfile')
        config_written = switched = False
        try:
            candidate_path.write_bytes(candidate)
            candidate_path.chmod(0o600)
            docker('exec', CONTAINER, 'caddy', 'validate', '--config', str(candidate_path), '--adapter', 'caddyfile')
            if CONFIG.read_bytes() != original:
                raise InstallError('config_race')
            set_current(str(target))
            switched = True
            if changed:
                write_in_place(CONFIG, original, candidate)
                config_written = True
                reload_caddy()
            if not token_file.exists():
                with token_file.open('x') as handle:
                    handle.write(token + '\n')
            token_file.chmod(0o600)
        except Exception:
            try:
                if switched:
                    set_current(previous) if previous else current.unlink(missing_ok=True)
                if config_written:
                    write_in_place(CONFIG, candidate, original)
                    reload_caddy()
            except Exception as rollback:
                raise InstallError('rollback_failed') from rollback
            raise
        finally:
            candidate_path.unlink(missing_ok=True)


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    revision = None
    try:
        if len(argv) != 2:
            raise InstallError('invalid_arguments')
        validate_arguments(*argv)
        revision = argv[1]
        install(*argv)
        print(json.dumps({'status': 'deployed', 'revision': revision}))
        return 0
    except Exception as error:
        reason = str(error) if isinstance(error, InstallError) else 'install_failed'
        print(json.dumps({'status': 'failed', 'revision': revision, 'reason': reason}))
        return 1


if __name__ == '__main__':
    sys.exit(main())
