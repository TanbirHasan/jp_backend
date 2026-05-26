import Redis from 'ioredis';
import { socketManager } from './socket.manager';

const CHANNEL = 'notifications';

// Dedicated subscriber client — once subscribed it can only listen, nothing else
const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Dedicated publisher client — separate from subscriber
const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface NotificationPayload {
  userId: number;
  data: object;
}

export async function initSubscriber(): Promise<void> {
  await subscriber.subscribe(CHANNEL);
  console.log(`[PubSub] Worker ${process.pid} subscribed to "${CHANNEL}" channel`);

  subscriber.on('message', (_channel, message) => {
    try {
      const { userId, data } = JSON.parse(message) as NotificationPayload;
      const delivered = socketManager.sendToUser(userId, data);
      if (delivered) {
        console.log(`[PubSub] Worker ${process.pid} delivered notification to user ${userId}`);
      }
    } catch (err) {
      console.error('[PubSub] Failed to process message:', (err as Error).message);
    }
  });
}

export async function publishNotification(userId: number, data: object): Promise<void> {
  const payload: NotificationPayload = { userId, data };
  await publisher.publish(CHANNEL, JSON.stringify(payload));
  console.log(`[PubSub] Worker ${process.pid} published notification for user ${userId}`);
}
