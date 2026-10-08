import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.ttf':'font/ttf', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8' };
const server = http.createServer(async (request,response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.split('/').some(p => p.startsWith('.') || ['content','scripts','tests','node_modules'].includes(p))) {
      response.writeHead(404); return response.end('Not found');
    }
    let path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(404); return response.end('Not found'); }
    if ((await stat(path)).isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(308, { Location: pathname + '/' + url.search }); return response.end(); }
      path = resolve(path, 'index.html');
    }
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type':types[extname(path)] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex', 'X-Content-Type-Options':'nosniff' });
    response.end(body);
  } catch { response.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); response.end('Not found'); }
});
server.listen(4187, '127.0.0.1', () => console.log('Private local preview: http://127.0.0.1:4187/ru/about/'));
