import "dotenv/config";
import cluster from "cluster";
import os from "os";
import http from "http";
import app from "./app";
import { pool } from "./config/db";
import { initWebSocketServer } from "./websocket/socket.server";

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

const NUM_WORKERS = isProd ? os.cpus().length : 2;

async function startWorker(): Promise<void> {
  try {
    await pool.query("SELECT NOW()");
    console.log(`[Worker ${process.pid}] PostgreSQL connected`);

    const httpServer = http.createServer(app);
    initWebSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`[Worker ${process.pid}] Running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      `[Worker ${process.pid}] Failed to start:`,
      (error as Error).message,
    );
    process.exit(1);
  }
}

if (cluster.isPrimary && !isProd) {
  console.log(`[Primary ${process.pid}] Spawning ${NUM_WORKERS} workers...`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `[Primary] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Respawning...`,
    );
    cluster.fork();
  });

  process.on("SIGTERM", () => {
    console.log("[Primary] SIGTERM received. Shutting down gracefully...");
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill("SIGTERM");
    }
    process.exit(0);
  });
} else {
  startWorker();
}
