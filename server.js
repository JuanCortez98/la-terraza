const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const publicDirectory = __dirname;
const port = Number(process.env.PORT) || 3000;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  if (requestPath === '/galeria.html') {
    response.writeHead(301, { Location: '/nosotros.html#galeria' });
    response.end();
    return;
  }
  const requestedFile = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.resolve(publicDirectory, `.${requestedFile}`);

  if (!filePath.startsWith(`${publicDirectory}${path.sep}`)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const isAsset = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico', '.mp4'].includes(extension);
    const headers = {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Cache-Control': isAsset ? 'public, max-age=2592000' : 'no-cache'
    };
    const compressible = ['.html', '.css', '.js', '.svg'].includes(extension)
      && /\bgzip\b/.test(request.headers['accept-encoding'] || '');

    if (compressible) {
      headers['Content-Encoding'] = 'gzip';
      headers.Vary = 'Accept-Encoding';
      response.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(response);
      return;
    }

    headers['Content-Length'] = stats.size;
    response.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`La Terraza listening on port ${port}`);
});