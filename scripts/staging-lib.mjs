import { mkdir, readFile, writeFile, readdir, copyFile, lstat } from 'node:fs/promises';
import { resolve, dirname, isAbsolute } from 'node:path';

export function validateConfig(config) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}$/.test(config.sshHost || '')) throw new Error('Invalid SSH host');
  if (!/^[a-z_][a-z0-9_-]{0,31}$/.test(config.sshUser || '')) throw new Error('Invalid SSH user');
  if (!isAbsolute(config.sshKeyPath || '') || /[\r\n\0]/.test(config.sshKeyPath)) throw new Error('Invalid SSH key path');
  if (!/^[a-zA-Z0-9_-]{32}$/.test(config.token || '')) throw new Error('Invalid preview capability');
  const origin = new URL(config.origin);
  if (origin.protocol !== 'https:' || origin.origin !== config.origin || origin.username || origin.password) throw new Error('Staging origin must be an HTTPS origin');
  return { ...config, prefix: `/previews/ivaikin/${config.token}/` };
}

export function validateRelease(release) {
  if (!/^[a-zA-Z0-9-]{1,90}$/.test(release)) throw new Error('Invalid release identifier');
  return release;
}

export function transformHtml(source, prefix, release) {
  let html = source.replace(/<meta\b[^>]*\bname=["'](?:robots|referrer)["'][^>]*>\s*/gi, '');
  // Staged copies must not send analytics or form data to production services.
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script =>
    /googletagmanager\.com|google-analytics\.com|\bgtag\s*\(|\bsrc=["'][^"']*analytics\.js/i.test(script) ? '' : script);
  html = html.replace(/<form\b[^>]*>/gi, tag => tag.replace(/\saction=(['"])[\s\S]*?\1/i, '')
    .replace(/>$/, ' action="#" data-staging-form="disabled">'));
  html = html.replace(/<button\b[^>]*type=["']submit["'][^>]*>/gi, tag => tag.replace(/>$/, ' disabled>'));
  if (html.includes('data-staging-form="disabled"')) {
    html = html.replace('</head>', '<script>document.addEventListener("submit",function(event){event.preventDefault();event.stopImmediatePropagation();},true);</script>\n</head>');
  }
  html = html.replace(/<head>/i, `<head>\n<meta name="robots" content="noindex, nofollow, noarchive">\n<meta name="referrer" content="no-referrer">\n<meta name="staging-release" content="${validateRelease(release)}">`);
  // Absolute local asset/navigation paths must stay inside this isolated preview.
  html = html.replace(/\b(href|src|poster|action)=(['"])\/(?!\/)([^'"]*)\2/g, (_, attr, quote, path) => `${attr}=${quote}${prefix}${path}${quote}`);
  html = html.replace(/<a\b[^>]*>/gi, tag => tag.replace(/href=(['"])https:\/\/ivaikin\.com\/(.*?)\1/g, (_, quote, path) => `href=${quote}${prefix}${path}${quote}`));
  return html;
}

export function transformScript(source, prefix) {
  const marker = "const paths = { en: '/about/', ru: '/ru/about/', es: '/es/about/', zh: '/zh/about/' };";
  if (!source.includes(marker)) throw new Error('Language redirect source changed; staging adaptation needs review');
  return source.replace(marker, `${marker}\n  for (const key of Object.keys(paths)) paths[key] = ${JSON.stringify(prefix)} + paths[key].slice(1);`);
}

async function copyTree(source, target) {
  const info = await lstat(source);
  if (info.isSymbolicLink()) throw new Error('Symlinks are not allowed in staging artifacts');
  if (info.isDirectory()) {
    await mkdir(target, { recursive: true });
    for (const entry of await readdir(source)) await copyTree(resolve(source,entry), resolve(target,entry));
  } else if (info.isFile()) {
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source,target);
  } else throw new Error('Unsupported staging artifact');
}

export async function packageSite(root, target, rawConfig, release, sourceCommit) {
  const config = validateConfig(rawConfig);
  validateRelease(release);
  await mkdir(target, { recursive: true });
  const pages = ['index.html','about/index.html','ru/about/index.html','es/about/index.html','zh/about/index.html','en/interviews/tai-chi-business/index.html','ru/interviews/tai-chi-business/index.html'];
  for (const file of pages) {
    await mkdir(dirname(resolve(target,file)), { recursive:true });
    await writeFile(resolve(target,file), transformHtml(await readFile(resolve(root,file),'utf8'), config.prefix, release));
  }
  for (const file of ['assets/home','assets/interviews/tai-chi-business','favicon.svg','images','style.css','main.js','i18n.js']) await copyTree(resolve(root,file),resolve(target,file));
  await writeFile(resolve(target,'assets/home/home.js'),transformScript(await readFile(resolve(root,'assets/home/home.js'),'utf8'),config.prefix));
  // Compatibility for previously shared staging links only, never public routes.
  for (const lang of ['ru','es','zh']) {
    const path = `${config.prefix}${lang}/about/`;
    const redirect = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>Preview moved</title></head><body><a href="${path}">Open preview</a><script>const target=new URL(${JSON.stringify(path)},window.location.origin);target.search=window.location.search;target.hash=window.location.hash;window.location.replace(target.href);</script></body></html>`;
    // The target already contains the capability prefix; do not prefix it twice.
    await writeFile(resolve(target,lang,'index.html'),transformHtml(redirect,'/',release));
  }
  await writeFile(resolve(target,'robots.txt'),'User-agent: *\nDisallow: /\n');
  await writeFile(resolve(target,'release.json'),JSON.stringify({ release, sourceCommit, builtAt: new Date().toISOString() },null,2)+'\n');
}

export function sshArgs(rawConfig, command) {
  const config=validateConfig(rawConfig);
  return ['-i',config.sshKeyPath,'-o','BatchMode=yes','-o','ConnectTimeout=15',`${config.sshUser}@${config.sshHost}`,command];
}

export function remoteUploadCommand(release) {
  validateRelease(release);
  const dir=`/opt/static-sites/ivaikin-staging/releases/${release}`;
  // Identifiers are allowlisted; every argument remains a fixed path or identifier.
  return `umask 022 && mkdir -p /opt/static-sites/ivaikin-staging/releases && mkdir ${dir} && tar -xf - -C ${dir}`;
}
