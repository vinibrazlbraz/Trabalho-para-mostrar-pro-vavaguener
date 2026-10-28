import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Arquivo não encontrado');
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
  const filePath = path.join(__dirname, relativePath);
  const publicFilePath = path.join(__dirname, 'public', relativePath);

  if (fs.existsSync(publicFilePath)) {
    sendFile(response, publicFilePath);
    return;
  }

  if (fs.existsSync(filePath)) {
    sendFile(response, filePath);
    return;
  }

  // Permite que as páginas funcionem mesmo quando o navegador acessa uma rota diretamente.
  sendFile(response, path.join(__dirname, 'index.html'));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Stock API rodando em http://0.0.0.0:${port}`);
});
