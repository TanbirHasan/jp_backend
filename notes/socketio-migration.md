# Replacing Manual WebSocket + Redis Pub/Sub with Socket.IO

## What We Built Manually vs What Socket.IO Gives You

| What we built manually | Socket.IO equivalent |
|---|---|
| `socket.manager.ts` — connection Map | Built-in, handled internally |
| `socket.server.ts` — WS server + JWT auth | `io.use()` middleware |
| `pubsub.ts` — Redis Pub/Sub for multi-worker | `@socket.io/redis-adapter` (one line) |
| `socketManager.sendToUser(userId, data)` | `io.to(roomId).emit('event', data)` |
| Manual reconnection handling | Automatic reconnection built-in |
| Manual fallback if WS fails | Auto falls back to HTTP long-polling |

---

## Step 1 — Install Socket.IO

```bash
npm install socket.io
npm install @socket.io/redis-adapter   # replaces our pubsub.ts entirely
```

Remove these packages:
```bash
npm uninstall ws @types/ws
```

---

## Step 2 — Replace `socket.server.ts`

### Current manual code (socket.server.ts + socket.manager.ts + pubsub.ts):
```typescript
// socket.server.ts
const wss = new WebSocketServer({ server });
wss.on('connection', (socket, req) => {
  const user = parseToken(req);
  if (!user) { socket.close(1008, 'Unauthorized'); return; }
  socketManager.add(user.id, socket);
  ...
});

// pubsub.ts
await subscriber.subscribe('notifications');
subscriber.on('message', (_ch, msg) => {
  const { userId, data } = JSON.parse(msg);
  socketManager.sendToUser(userId, data);
});
```

### Replaced with Socket.IO (single file):
```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'ioredis';
import jwt from 'jsonwebtoken';
import { Server as HttpServer } from 'http';

export function initSocketIO(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') }
  });

  // Redis adapter — replaces our entire pubsub.ts
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Auth middleware — replaces our parseToken() + socket.close(1008)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  // Connection — replaces socketManager.add() + on('close')
  io.on('connection', (socket) => {
    const userId = socket.data.user.id;

    // Each user joins their own room named by their userId
    socket.join(`user:${userId}`);
    console.log(`[Socket.IO] User ${userId} connected`);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User ${userId} disconnected`);
    });
  });

  return io;
}
```

---

## Step 3 — Replace `publishNotification()` in application.service.ts

### Current manual code:
```typescript
// publishes to Redis manually
await publishNotification(updated.applicant_id, {
  type: 'application_status_update',
  status,
  message: `Your application status has been updated to: ${status}`,
});
```

### Replaced with Socket.IO:
```typescript
// io is the Socket.IO server instance
io.to(`user:${updated.applicant_id}`).emit('application_status_update', {
  status,
  message: `Your application status has been updated to: ${status}`,
});
```

Socket.IO + Redis adapter handles the cross-worker delivery automatically.
You never write Pub/Sub code yourself.

---

## Step 4 — Replace server.ts initialization

### Current:
```typescript
const httpServer = http.createServer(app);
initWebSocketServer(httpServer); // our manual setup
httpServer.listen(PORT);
```

### With Socket.IO:
```typescript
const httpServer = http.createServer(app);
const io = initSocketIO(httpServer); // Socket.IO setup
httpServer.listen(PORT);
```

---

## Step 5 — Frontend Change

### Current manual frontend:
```javascript
const ws = new WebSocket(`ws://localhost:5000?token=${token}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
};
```

### With Socket.IO client:
```bash
npm install socket.io-client
```

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: accessToken }  // sent to server middleware
});

socket.on('application_status_update', (data) => {
  console.log(data.message);
});
```

---

## Files Deleted After Migration

```
src/websocket/socket.manager.ts   ← deleted (Socket.IO handles internally)
src/websocket/socket.server.ts    ← deleted (replaced by initSocketIO)
src/websocket/pubsub.ts           ← deleted (@socket.io/redis-adapter replaces this)
```

Only one new file: `src/websocket/socketio.server.ts`

---

## Why We Did It Manually First

Socket.IO's `io.to('user:7').emit(...)` is magic until you understand:
- How WebSocket connections are tracked (our Map)
- How cross-worker delivery works (our pubsub.ts)
- What the Redis adapter is actually doing underneath

Now that you built it manually you understand exactly what Socket.IO
is doing behind the scenes. That is what interviewers test.

---

## The One-Line Summary

> Socket.IO = WebSocket + auto-reconnect + Redis adapter (Pub/Sub) +
> rooms + fallback to HTTP long-polling — all in one library.
> We built each of those pieces manually to understand them.
