const http = require("http");
const https = require("https");

const KEY = process.env.MBTA_KEY;
const PORT = parseInt(process.env.PORT || "8080", 10);

if (!KEY) {
  console.error("MBTA_KEY not set");
  process.exit(1);
}

http.createServer((req, res) => {
  const target = new URL("https://api-v3.mbta.com" + req.url);
  const upstream = https.request(target, { method: req.method }, (up) => {
    res.writeHead(up.statusCode, {
      "Content-Type": "application/vnd.api+json",
      "Cache-Control": "max-age=15",
    });
    up.pipe(res);
  });
  upstream.setHeader("X-API-Key", KEY);
  upstream.setHeader("Accept", "application/vnd.api+json");
  upstream.end();
}).listen(PORT, "127.0.0.1", () => console.log("relay listening on " + PORT));
