const net = require("net");
const { spawn } = require("child_process");

const DEFAULT_NODE_URL = "lavalink.devamop.in:80";
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_INTERVAL_MS = 2000;

function parseNodeAddress(rawUrl) {
  const value = rawUrl || DEFAULT_NODE_URL;
  const url = value.includes("://") ? new URL(value) : new URL(`tcp://${value}`);
  const secure = String(process.env.NODE_SECURE || "false").toLowerCase() === "true";
  const fallbackPort = secure || url.protocol === "https:" ? 443 : 80;

  return {
    host: url.hostname,
    port: Number(url.port || fallbackPort),
  };
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function waitForTcp({ host, port }, timeoutMs, intervalMs) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      let settled = false;
      const socket = net.createConnection({ host, port });

      const retryOrFail = (error) => {
        if (settled) return;
        settled = true;
        socket.destroy();

        if (Date.now() >= deadline) {
          reject(error);
          return;
        }

        setTimeout(tryConnect, intervalMs);
      };

      socket.once("connect", () => {
        settled = true;
        socket.end();
        resolve();
      });

      socket.once("error", retryOrFail);

      socket.setTimeout(intervalMs, () => {
        retryOrFail(new Error(`Timed out connecting to ${host}:${port}`));
      });
    };

    tryConnect();
  });
}

function startBot() {
  const child = spawn("npm", ["start"], { stdio: "inherit" });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code || 0);
  });
}

async function main() {
  const address = parseNodeAddress(process.env.NODE_URL);
  const timeoutMs = parsePositiveInt(process.env.LAVALINK_WAIT_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const intervalMs = parsePositiveInt(process.env.LAVALINK_WAIT_INTERVAL_MS, DEFAULT_INTERVAL_MS);

  console.log(`Waiting for Lavalink at ${address.host}:${address.port}...`);

  await waitForTcp(address, timeoutMs, intervalMs);

  console.log(`Lavalink is reachable at ${address.host}:${address.port}. Starting bot...`);
  startBot();
}

main().catch((error) => {
  console.error(`Lavalink did not become reachable: ${error.message}`);
  process.exit(1);
});
