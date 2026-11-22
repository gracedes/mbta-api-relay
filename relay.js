const http = require("http");
const https = require("https");

const KEY = process.env.MBTA_KEY;
const PORT = parseInt(process.env.PORT || "8080", 10);

if (!KEY) {
  console.error("MBTA_KEY not set");
  process.exit(1);
}

http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const target = new URL("https://api-v3.mbta.com" + req.url);
  const upstream = https.request(target, { method: req.method }, (up) => {
    res.writeHead(up.statusCode, {
      "Content-Type": up.headers["content-type"] || "application/vnd.api+json",
      "Cache-Control": "max-age=15",
    });
    up.pipe(res);
  });

  upstream.on("error", (err) => {
    console.error("upstream error:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
    }
    res.end("upstream error");
  });

  upstream.setHeader("X-API-Key", KEY);
  upstream.setHeader("Accept", "application/vnd.api+json");
  upstream.end();
}).listen(PORT, "127.0.0.1", () => console.log("relay listening on " + PORT));
