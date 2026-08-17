#!/usr/bin/env node
/**
 * Static SPA server. App config is injected at runtime from GitLab CI/CD
 * variables (container env). The image itself has no environment secrets.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT || process.env.APP_PORT || 80);

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

function runtimeConfigJs() {
  const payload = {
    VITE_API_URL: process.env.VITE_API_URL || '',
    VITE_APP_ENV: process.env.VITE_APP_ENV || process.env.APP_ENV || 'production',
  };
  return `window.__MYBOSS_RUNTIME__=${JSON.stringify(payload)};`;
}

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
  const url = req.url || '/';
  if (req.method === 'GET' && (url === '/health' || url.startsWith('/health?'))) {
    send(res, 200, 'OK', { 'Content-Type': 'text/plain' });
    return;
  }

  if (req.method === 'GET' && (url === '/runtime-config.js' || url.startsWith('/runtime-config.js?'))) {
    send(res, 200, runtimeConfigJs(), {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    return;
  }

  let filePath = safeJoin(ROOT, url === '/' ? '/index.html' : url);
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
