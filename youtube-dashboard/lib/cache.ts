import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Generic cache wrapper.
// key: unique string identifying this cached value
// ttlSeconds: how long to keep it in cache
// fetchFn: the function to call on a cache miss

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        console.log(`Cache HIT: ${key}`);
        return cached;
      }
      console.log(`Cache MISS: ${key}`);
    } catch (error) {
      console.error("Redis error:", error);
      // Redis failed — fall through to fetch directly
      return fetchFn();
    }
  
    const fresh = await fetchFn();
    try {
      await redis.set(key, fresh, { ex: ttlSeconds });
    } catch (error) {
      console.error("Redis set error:", error);
    }
    return fresh;
  }