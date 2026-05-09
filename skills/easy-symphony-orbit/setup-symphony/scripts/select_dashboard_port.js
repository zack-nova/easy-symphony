#!/usr/bin/env node

const net = require("net");

const unsafePorts = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79,
  87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135,
  137, 139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 531,
  532, 540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995, 1719,
  1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566, 6697, 10080,
]);

for (let port = 6665; port <= 6669; port += 1) {
  unsafePorts.add(port);
}

const parsePort = (value) => {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : null;
};

const candidates = process.argv.slice(2).map(parsePort).filter(Boolean);

if (candidates.length === 0) {
  candidates.push(4050, 4051, 4052, 4301, 5174, 7357);
  for (let port = 4100; port <= 4120; port += 1) {
    candidates.push(port);
  }
}

const uniqueCandidates = [...new Set(candidates)].filter((port) => !unsafePorts.has(port));

const canListen = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });

(async () => {
  for (const port of uniqueCandidates) {
    if (await canListen(port)) {
      console.log(port);
      return;
    }
  }

  console.error("No browser-safe free dashboard port found in candidates.");
  process.exit(1);
})();
