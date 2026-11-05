import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const output = resolve(process.argv[2] || 'jungle-preview.png');
const profile = await mkdtemp(join(tmpdir(), 'nature-vibes-preview-'));
const server = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '3092' }, stdio: 'ignore' });
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless', '--disable-gpu', '--disable-extensions', '--no-first-run',
  '--no-default-browser-check', '--disable-background-networking',
  '--remote-debugging-port=9331', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { const response = await fetch('http://localhost:9331/json/version'); if (response.ok) { ready = true; break; } } catch {}
    await delay(100);
  }
  if (!ready) throw Error('Headless Chrome did not expose its debugging endpoint');
  const target = await (await fetch('http://localhost:9331/json/new?about:blank', { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
      if (message.error) reject(Error(message.error.message)); else resolve(message.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); socket.send(JSON.stringify({ id: next, method, params })); });
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: 'http://localhost:3092/?environment=jungle' });
  for (let i = 0; i < 50; i++) {
    const result = await call('Runtime.evaluate', { expression: "document.body?.dataset.environment === 'jungle' && document.querySelectorAll('.css-tree').length > 0", returnByValue: true });
    if (result.result.value) break;
    await delay(100);
  }
  await delay(800);
  if (process.argv.includes('--rainy')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('[data-weather=rainy]').click()" });
    await delay(3000);
  }
  if (process.argv.includes('--cloudy')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('[data-weather=cloudy]').click()" });
    await delay(3000);
  }
  if (process.argv.includes('--night')) {
    await call('Runtime.evaluate', { expression: "document.querySelector('[data-mode=night]').click()" });
    await delay(3000);
  }
  const frame = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(output, Buffer.from(frame.data, 'base64'));
  console.log(JSON.stringify({ screenshot: output, browserErrors: errors }));
  await call('Browser.close').catch(() => {});
} finally {
  socket?.close(); browser.kill(); server.kill();
}
