// Minimal static server for previewing remote-control.html (no dependencies)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const FILE = path.join(__dirname, 'remote-control.html');

http.createServer((req, res) => {
  fs.readFile(FILE, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
