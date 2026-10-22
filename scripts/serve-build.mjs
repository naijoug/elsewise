// Test-only static hosting. Match Pages' 404 HTML fallback, including its status.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('dist');
const base = process.env.GHP_BASE || '/';
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};
// Fail before listening if there is no build to test.
await readFile(resolve(root, 'index.html'));

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname
    );
    if (!pathname.startsWith(base)) {
      response.writeHead(404).end('Outside application base path');
      return;
    }
    let file = resolve(root, pathname.slice(base.length) || 'index.html');
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    let status = 200;
    try {
      if (!(await stat(file)).isFile()) throw new Error('Not a file');
    } catch {
      status = 404;
      // Pages gets this exact fallback file in the deployment workflow.
      file = resolve(root, '404.html');
      try {
        await stat(file);
      } catch {
        file = resolve(root, 'index.html');
      }
    }
    response.writeHead(status, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(500).end('Unable to serve build');
  }
}).listen(4176, '127.0.0.1');
