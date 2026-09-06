import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var cachedRedis: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis =
  global.cachedRedis ||
  new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: () => null, // Không reconnect liên tục nếu offline
  });

// Bắt lỗi error event để tránh Unhandled Error Event khi Redis offline
redis.on("error", (err) => {
  // Chỉ log nhẹ dạng debug khi đang ở development
  if (process.env.NODE_ENV === "development") {
    console.debug("[Redis Offline]:", err.message);
  }
});

if (process.env.NODE_ENV !== "production") {
  global.cachedRedis = redis;
}

/**
 * Cache helper function: Stale-While-Revalidate pattern via Redis
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.warn(`[Redis Read Error] Key: ${key}`, error);
  }

  const freshData = await fetchFn();

  try {
    await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
  } catch (error) {
    console.warn(`[Redis Write Error] Key: ${key}`, error);
  }

  return freshData;
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn(`[Redis Invalidate Error] Pattern: ${pattern}`, error);
  }
}
