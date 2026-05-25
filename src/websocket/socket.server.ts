import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';
import jwt from 'jsonwebtoken';
import { socketManager } from './socket.manager';
import { initSubscriber } from './pubsub';
import { JwtPayload } from '../types';

function parseToken(req: IncomingMessage): JwtPayload | null {
  try {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export function initWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server });

  initSubscriber();

  wss.on('connection', (socket: WebSocket, req: IncomingMessage) => {
    const user = parseToken(req);

    if (!user) {
      socket.close(1008, 'Unauthorized');
      return;
    }

    socketManager.add(user.id, socket);

    socket.send(
      JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established',
        userId: user.id,
      })
    );

    socket.on('close', () => {
      socketManager.remove(user.id);
    });

    socket.on('error', (err) => {
      console.error(`[WS] Socket error for user ${user.id}:`, err.message);
      socketManager.remove(user.id);
    });
  });

  console.log('[WS] WebSocket server initialized');
}
