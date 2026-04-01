/**
 * ConnectFBLA Remote Control Server
 * Run: node server.js
 * Serves the phone mirror UI and relays commands between browser and app.
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json({ limit: '15mb' }));

// ─── Connected clients ────────────────────────────────────────────────────────
let phoneClient = null;
const browserClients = new Set();

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

function broadcastStatus() {
  const msg = JSON.stringify({
    type: 'status',
    phoneConnected: phoneClient !== null && phoneClient.readyState === WebSocket.OPEN,
    browserCount: browserClients.size,
  });
  browserClients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

// ─── WebSocket routing ────────────────────────────────────────────────────────
wss.on('connection', (ws, req) => {
  const isPhone = req.url && req.url.startsWith('/phone');

  if (isPhone) {
    // ── Phone client (Expo app) ──────────────────────────────────────────────
    if (phoneClient) {
      // Disconnect old phone client before accepting the new one
      try { phoneClient.close(); } catch (_) {}
    }
    phoneClient = ws;
    console.log('[server] 📱 Phone connected');
    broadcastStatus();

    ws.on('message', (data, isBinary) => {
      // Phone → browsers: forward screenshots and state updates.
      // Convert Buffer → UTF-8 string so the browser receives a text frame
      // that JSON.parse can handle (binary frames cause silent parse failures).
      const payload = isBinary ? data : data.toString('utf8');
      browserClients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) c.send(payload);
      });
    });

    ws.on('close', () => {
      if (phoneClient === ws) phoneClient = null;
      console.log('[server] 📱 Phone disconnected');
      broadcastStatus();
    });

    ws.on('error', (err) => {
      console.error('[server] Phone WS error:', err.message);
    });
  } else {
    // ── Browser client ───────────────────────────────────────────────────────
    browserClients.add(ws);
    console.log(`[server] 💻 Browser connected (total: ${browserClients.size})`);

    // Immediately tell the browser the current phone connection state
    ws.send(JSON.stringify({
      type: 'status',
      phoneConnected: phoneClient !== null && phoneClient.readyState === WebSocket.OPEN,
      browserCount: browserClients.size,
    }));

    ws.on('message', (data, isBinary) => {
      // Browser → phone: forward touch/navigate commands
      if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
        phoneClient.send(isBinary ? data : data.toString('utf8'));
      }
    });

    ws.on('close', () => {
      browserClients.delete(ws);
      console.log(`[server] 💻 Browser disconnected (remaining: ${browserClients.size})`);
    });

    ws.on('error', (err) => {
      console.error('[server] Browser WS error:', err.message);
    });
  }
});

// ─── HTTP routes ──────────────────────────────────────────────────────────────

// Serve the remote-control UI
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'remote-control.html'));
});

// Presentation mode: same page, flag injected via query param
app.get('/presentation-mode', (_req, res) => {
  res.sendFile(path.join(__dirname, 'remote-control.html'));
});

// REST command shortcut (lets you send commands via curl for testing)
app.post('/command', (req, res) => {
  const command = req.body;
  if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
    phoneClient.send(JSON.stringify(command));
    res.json({ ok: true });
  } else {
    res.status(503).json({ ok: false, error: 'Phone not connected' });
  }
});

// Health / status endpoint
app.get('/status', (_req, res) => {
  res.json({
    phoneConnected: phoneClient !== null && phoneClient.readyState === WebSocket.OPEN,
    browserClients: browserClients.size,
    uptime: process.uptime(),
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = 3001;
const localIP = getLocalIP();

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║        ConnectFBLA Remote Control Server             ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  console.log(`  Browser UI  →  http://${localIP}:${PORT}`);
  console.log(`  Presentation→  http://${localIP}:${PORT}/presentation-mode`);
  console.log(`  Status      →  http://${localIP}:${PORT}/status\n`);
  console.log(`  Phone WS    →  ws://${localIP}:${PORT}/phone`);
  console.log(`  Browser WS  →  ws://${localIP}:${PORT}/\n`);
  console.log('  ┌─────────────────────────────────────────────────┐');
  console.log(`  │  Set SERVER_IP = "${localIP}" in remoteConfig.js │`);
  console.log('  └─────────────────────────────────────────────────┘\n');
  console.log('  Waiting for phone and browser to connect...\n');
});
