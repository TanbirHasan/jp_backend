import { redis } from '../config/redis';

async function get<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

async function set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function del(...keys: string[]): Promise<void> {
  if (keys.length > 0) await redis.del(...keys);
}

async function delByPattern(pattern: string): Promise<void> {
  let cursor = '0';
  const toDelete: string[] = [];

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
    cursor = nextCursor;
    toDelete.push(...keys);
  } while (cursor !== '0');

  if (toDelete.length > 0) await redis.del(...toDelete);
}

export const cache = { get, set, del, delByPattern };
