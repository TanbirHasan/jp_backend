# Node.js Clustering — Interview Ready Note

## The Core Problem

Node.js is **single-threaded**. No matter how many CPU cores your server has, by default your app only uses **one core**. The rest sit idle and wasted.

```
8-core server without clustering:

  Requests → Core 1 (your app) ← doing all the work
              Core 2 💤
              Core 3 💤
              Core 4 💤
              Core 5 💤
              Core 6 💤
              Core 7 💤
              Core 8 💤
```

Clustering fixes this.

---

## What Clustering Does

The `cluster` module (built into Node.js, no install needed) lets you spawn **one worker process per CPU core**. Each worker runs a full copy of your app and handles real traffic.

```
8-core server with clustering:

  Requests → Core 1 (Worker 1) ← your Express app
             Core 2 (Worker 2) ← your Express app
             Core 3 (Worker 3) ← your Express app
             Core 4 (Worker 4) ← your Express app
             ...
             
  OS distributes incoming requests across all workers automatically.
```

---

## The Two Roles: Primary and Worker

Every clustered Node.js app has exactly two types of processes:

### Primary Process
- Runs first when you start the app
- Reads how many CPU cores exist (`os.cpus().length`)
- Spawns one worker per core using `cluster.fork()`
- Monitors workers — if one dies, it spawns a replacement
- **Never handles any HTTP requests itself**

### Worker Process
- A full, independent copy of your Express app
- Has its own memory, own event loop, own DB connection pool
- Handles real incoming HTTP requests
- If it crashes, the primary notices and spawns a new one

```
[Primary Process]
      │
      ├── cluster.fork() → [Worker 1] → handles requests
      ├── cluster.fork() → [Worker 2] → handles requests
      ├── cluster.fork() → [Worker 3] → handles requests
      └── cluster.fork() → [Worker 4] → handles requests
```

---

## Key Concept: Worker = Process with its Own Single Thread

Node.js is single-threaded by nature. Clustering does NOT make Node multi-threaded.

Instead, it runs **multiple single-threaded processes** in parallel:

```
Worker 1 = Process → own single thread → own event loop → own memory
Worker 2 = Process → own single thread → own event loop → own memory
Worker 3 = Process → own single thread → own event loop → own memory
```

Each worker is completely isolated. One worker's variables, memory, and state are **invisible** to all other workers.

---

## No Shared State — This Is Critical

Because workers are separate processes (not threads), they share **nothing**:

```javascript
// Worker 1
let requestCount = 0;
requestCount++; // now 1

// Worker 2
let requestCount = 0; // still 0 — completely separate
```

This means anything that needs to be shared across workers **cannot live in memory**. It must live in an external store like **Redis**:

- Rate limit counters → Redis
- Session data → Redis
- Caches → Redis

This is why Redis becomes essential in clustered production apps.

---

## The Code (Production Pattern)

```typescript
import cluster from 'cluster';
import os from 'os';

const isProd = process.env.NODE_ENV === 'production';
const NUM_WORKERS = isProd ? os.cpus().length : 2;

if (cluster.isPrimary) {
  // PRIMARY: spawn workers, monitor them
  console.log(`[Primary ${process.pid}] Spawning ${NUM_WORKERS} workers...`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  // Auto-respawn if a worker dies
  cluster.on('exit', (worker, code, signal) => {
    console.log(`[Primary] Worker ${worker.process.pid} died. Respawning...`);
    cluster.fork();
  });

  // Graceful shutdown — tell all workers to stop cleanly
  process.on('SIGTERM', () => {
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill('SIGTERM');
    }
    process.exit(0);
  });

} else {
  // WORKER: run your actual Express app
  startServer(); // your existing app startup function
}
```

**Important:** Your `app.ts` (routes, middleware, business logic) does not change at all. Clustering is purely a wrapper in `server.ts`.

---

## Why Auto-Respawn Matters

```
Normal flow:
  Worker 1 → handles requests ✅
  Worker 2 → handles requests ✅

Worker 1 crashes:
  Worker 1 → DEAD ❌
  Primary  → detects exit event → forks new Worker 5
  Worker 5 → handles requests ✅  (traffic never fully stops)
  Worker 2 → handles requests ✅
```

Without respawning, a single unhandled error could take down a worker permanently. With respawning, the app self-heals automatically.

---

## Graceful Shutdown (SIGTERM)

When a server restarts (deployment, Docker stop, Kubernetes pod eviction), the OS sends `SIGTERM` to your process.

**Without handling it:** workers get killed mid-request. Active users get dropped connections.

**With handling it:** primary tells each worker to finish what it's doing and exit cleanly. No dropped requests.

This is what separates a production app from a hobby app.

---

## PM2 — The Production Shortcut

PM2 is a process manager that does clustering automatically without you writing any cluster code:

```bash
pm2 start dist/server.js -i max   # -i max = one worker per CPU core
pm2 reload app                    # zero-downtime restart
pm2 logs                          # see all worker logs
pm2 monit                         # live monitoring dashboard
```

PM2 uses the cluster module internally — it's the same concept, just with a management layer on top.

| | Manual Cluster Code | PM2 |
|---|---|---|
| Multi-core workers | ✅ you write it | ✅ automatic |
| Auto-respawn | ✅ you write it | ✅ automatic |
| Graceful shutdown | ✅ you write it | ✅ automatic |
| Log management | ❌ | ✅ |
| Zero-downtime reload | ❌ | ✅ |
| Monitoring dashboard | ❌ | ✅ |

### When to use what:
- **VPS / bare metal (DigitalOcean, EC2)** → PM2 is standard
- **Docker / Kubernetes** → skip PM2, let the orchestrator manage processes
- **Understanding the concept** → write it manually first (what we did), then PM2 makes sense

---

## Vertical vs Horizontal Scaling

Interviewers often ask this:

| | What it means | Example |
|---|---|---|
| **Vertical scaling** | Use all resources on ONE machine | Clustering (all 8 cores on your server) |
| **Horizontal scaling** | Add MORE machines | Multiple servers behind a load balancer |

Clustering = vertical scaling. Both approaches can be combined.

---

## Interview Questions & Answers

**Q: What is Node.js clustering?**
> Running multiple worker processes — one per CPU core — each a full copy of your app, managed by a primary process that handles spawning and crash recovery.

**Q: Why do we need it if Node.js has an event loop?**
> The event loop handles concurrency (many async operations) on one thread. But it can't use multiple CPU cores. Clustering gives you true parallelism across cores.

**Q: Do workers share memory?**
> No. Workers are separate processes, not threads. Each has its own memory. Shared state must live in an external store like Redis.

**Q: What happens if a worker crashes?**
> The primary process detects the exit event and immediately forks a replacement. Other workers keep serving traffic — the app never fully goes down.

**Q: What's the difference between cluster module and PM2?**
> PM2 is a process manager that uses the cluster module internally. PM2 adds log management, monitoring, and zero-downtime reloads on top.

**Q: How would you scale a Node.js app vertically?**
> Use the cluster module or PM2 in cluster mode to spawn one worker per CPU core, making full use of the server's hardware.

**Q: Is clustering the same as multi-threading?**
> No. Clustering is multi-process. Each worker is still single-threaded. Node does have worker_threads for true multi-threading, but cluster gives process isolation which is safer — a crash in one worker can't affect others.

---

## The One-Liner (memorize this)

> "Node.js clustering runs multiple single-threaded processes in parallel — one per CPU core — each with its own event loop and memory, giving you parallelism without shared state."
