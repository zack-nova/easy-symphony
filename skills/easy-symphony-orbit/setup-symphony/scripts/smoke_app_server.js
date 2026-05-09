#!/usr/bin/env node

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

const send = (payload) => {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
};

rl.on("line", (line) => {
  if (!line.trim()) return;

  let message;
  try {
    message = JSON.parse(line);
  } catch (_error) {
    return;
  }

  const { id, method } = message;

  if (method === "initialize") {
    send({ id, result: { capabilities: {} } });
    return;
  }

  if (method === "initialized") {
    return;
  }

  if (method === "thread/start") {
    send({
      id,
      result: {
        thread: {
          id: "smoke-thread",
        },
      },
    });
    return;
  }

  if (method === "turn/start") {
    send({
      id,
      result: {
        turn: {
          id: "smoke-turn",
        },
      },
    });

    setTimeout(() => {
      send({
        method: "turn/completed",
        params: {
          result: "smoke turn completed",
        },
      });
    }, 20);
    return;
  }

  if (id !== undefined) {
    send({ id, result: {} });
  }
});
