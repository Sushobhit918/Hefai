import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  retryStrategy: (times: number) => Math.min(times * 100, 2000)
});

export const redisSubscriber = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  retryStrategy: (times: number) => Math.min(times * 100, 2000)
});

redis.on("error", (error: Error) => {
  console.warn("Redis cache unavailable:", error.message);
});

redisSubscriber.on("error", (error: Error) => {
  console.warn("Redis subscriber unavailable:", error.message);
});

export async function getCachedJson<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds = 60) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Cache misses should never block store operations.
  }
}

export async function deleteByPattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(...keys);
    }
  } catch {
    // Cache invalidation failures fall back to TTL expiry.
  }
}

export async function publishEvent(type: string, payload: Record<string, unknown>) {
  try {
    await redis.publish("hefai:events", JSON.stringify({ type, payload, at: new Date().toISOString() }));
  } catch {
    // Realtime delivery is best effort; API writes remain authoritative.
  }
}
