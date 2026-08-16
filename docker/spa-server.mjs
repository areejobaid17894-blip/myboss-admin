#!/usr/bin/env node
/**
 * Minimal static SPA server for admin portal.
 * Same port 80 as before; SPA fallback to index.html; /health for probes.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT || 80);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...headers,
  });
  res.end(body);
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent((reqPath || '/').split('?')[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/health' || req.url?.startsWith('/health?'))) {
    send(res, 200, 'OK', { 'Content-Type': 'text/plain' });
    return;
  }

  let filePath = safeJoin(ROOT, req.url === '/' ? '/index.html' : req.url);
  if (!filePath) {
    send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain' });
    return;
  }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      filePath = path.join(ROOT, 'index.html');
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(res, 500, 'Error', { 'Content-Type': 'text/plain' });
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      });
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`admin SPA listening on :${PORT}`);
});
