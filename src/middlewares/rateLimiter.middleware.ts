import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';

function createStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: ((...args: string[]) =>
      redis.call(...(args as [string, ...string[]]))) as any,
  });
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:general:'),
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:auth:'),
  message: { status: 'error', message: 'Too many login attempts, please try again later.' },
});
