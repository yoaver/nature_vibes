import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';

const clients = new Set();
let reloadTimer;
watch(new URL('./public/', import.meta.url), { recursive: true }, () => {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const client of clients) client.write('data: reload\n\n');
  }, 120);
});
setInterval(() => {
  for (const client of clients) client.write(': heartbeat\n\n');
}, 25000).unref();

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/assets/shared/style.css', ['assets/shared/style.css', 'text/css; charset=utf-8']],
  ['/assets/shared/app.js', ['assets/shared/app.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/bay/wildlife.js', ['assets/scenes/bay/wildlife.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/bay/scene.js', ['assets/scenes/bay/scene.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/jungle/jungle.js', ['assets/scenes/jungle/jungle.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/jungle/jungle.css', ['assets/scenes/jungle/jungle.css', 'text/css; charset=utf-8']],
  ['/assets/scenes/jungle/jungle-wildlife.js', ['assets/scenes/jungle/jungle-wildlife.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/jungle/jungle-birds.js', ['assets/scenes/jungle/jungle-birds.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/jungle/jungle-monkeys.js', ['assets/scenes/jungle/jungle-monkeys.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/jungle/jungle-toucans.js', ['assets/scenes/jungle/jungle-toucans.js', 'text/javascript; charset=utf-8']],
  ['/assets/scenes/jungle/bat-models.js', ['assets/scenes/jungle/bat-models.js', 'text/javascript; charset=utf-8']],
]);
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 1000\n\n');
    clients.add(res);
    res.on('close', () => clients.delete(res));
    return;
  }
  const asset = assets.get(pathname);
  if (!asset) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const content = await readFile(new URL(`./public/${asset[0]}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store' });
    res.end(content);
  } catch { res.writeHead(500); res.end('Unable to load scene'); }
}).listen(port, () => console.log(`Nature Vibes is ready at http://localhost:${port}`));
