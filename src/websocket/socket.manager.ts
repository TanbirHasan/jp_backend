import { WebSocket } from 'ws';

class SocketManager {
  private connections = new Map<number, WebSocket>();

  add(userId: number, socket: WebSocket): void {
    this.connections.set(userId, socket);
    console.log(`[WS] User ${userId} connected. Online: ${this.connections.size}`);
  }

  remove(userId: number): void {
    this.connections.delete(userId);
    console.log(`[WS] User ${userId} disconnected. Online: ${this.connections.size}`);
  }

  sendToUser(userId: number, payload: object): boolean {
    const socket = this.connections.get(userId);
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }

  isConnected(userId: number): boolean {
    const socket = this.connections.get(userId);
    return !!socket && socket.readyState === WebSocket.OPEN;
  }
}

export const socketManager = new SocketManager();
