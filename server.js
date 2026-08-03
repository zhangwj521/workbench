const http = require('http');
const fs = require('fs');
const path = require('path');
const mimes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
http.createServer((req, res) => {
  let p = req.url === '/' ? '/index.html' : req.url;
  const fp = path.join(process.cwd(), p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.statusCode = 404; res.end('Not Found'); return; }
    res.setHeader('Content-Type', mimes[path.extname(fp)] || 'text/plain');
    res.end(data);
  });
}).listen(8788, () => console.log('Server running at http://localhost:8788'));
