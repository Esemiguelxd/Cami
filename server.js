/**
 * Cami - Servidor Web Local y Proxy para Gemma 4
 * Sirve la aplicación web estática y gestiona peticiones CORS a Ollama / Gemma 4
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".gpx": "application/gpx+xml"
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // Endpoint Proxy para Gemma 4 / Ollama (evita bloqueos de CORS en el navegador)
  if (pathname.startsWith("/api/gemma-proxy")) {
    handleGemmaProxy(req, res);
    return;
  }

  // Enrutar raíz a index.html
  if (pathname === "/" || pathname === "") {
    pathname = "/index.html";
  }

  const filePath = path.join(PUBLIC_DIR, pathname);

  // Seguridad: evitar path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Acceso denegado");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`Archivo no encontrado: ${pathname}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function handleGemmaProxy(req, res) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", async () => {
    try {
      const { targetUrl, payload } = JSON.parse(body || "{}");
      const urlToCall = targetUrl || "http://localhost:11434/api/generate";

      const fetchRes = await fetch(urlToCall, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await fetchRes.text();
      res.writeHead(fetchRes.status, { "Content-Type": "application/json" });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`   🦐 CAMI - Asistente de Rutas en Ciudad del Carmen`);
  console.log(`   Aplicación web ejecutándose en:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
