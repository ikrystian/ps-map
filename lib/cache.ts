/**
 * High-performance, memory-efficient Server-Side Cache utility.
 * Designed for Next.js App Router API Routes and Server Actions.
 * 
 * Features:
 * - In-Memory storage using Map.
 * - HMR-safe: Persists cache state across hot-reloads in development by storing in globalThis.
 * - TTL (Time-To-Live) support.
 * - Regex/Pattern-based invalidation (e.g., clearing all "categories:*" keys on update).
 * - Automatic eviction of expired entries to prevent memory growth.
 * - Detailed diagnostic logging for hits, misses, writes, and invalidations.
 */

type CacheEntry<T> = {
  value: T;
  createdAt: number;
  expiresAt: number;
};

class InMemoryServerCache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.cache = new Map();
    this.startPeriodicCleanup();
  }

  /**
   * Retrieves a value from the cache. Returns null if key doesn't exist or is expired.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stores a value in the cache with a specified TTL in milliseconds.
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Deletes a specific key.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidates all keys matching a string pattern (prefix or substring) or regex.
   */
  invalidatePattern(pattern: string | RegExp): number {
    let count = 0;
    const keys = Array.from(this.cache.keys());

    for (const key of keys) {
      const match = typeof pattern === "string" 
        ? key.startsWith(pattern) || key.includes(pattern)
        : pattern.test(key);

      if (match) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[Cache Invalidation] Cleared ${count} keys matching pattern: "${pattern.toString()}"`);
    }
    return count;
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.cache.clear();
    console.log("[Cache Invalidation] Cleared all cache entries.");
  }

  /**
   * Returns current statistics of the cache.
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Evicts expired cache entries to free memory.
   */
  evictExpired(): void {
    const now = Date.now();
    let evictedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        evictedCount++;
      }
    }
    if (evictedCount > 0) {
      console.log(`[Cache Eviction] Cleaned up ${evictedCount} expired entries.`);
    }
  }

  private startPeriodicCleanup(): void {
    // Evict expired entries every 5 minutes
    if (typeof window === "undefined") {
      this.cleanupInterval = setInterval(() => {
        this.evictExpired();
      }, 5 * 60 * 1000);
      
      // Prevent timer from keeping the process alive if there are no other tasks
      if (this.cleanupInterval && typeof this.cleanupInterval.unref === "function") {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Clean up timer if needed.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// In Next.js (and other dev servers), hot reloading re-runs module initialization.
// Storing the cache instance on globalThis guarantees we don't wipe the cache on every HMR save.
const globalForCache = globalThis as unknown as {
  serverCache: InMemoryServerCache | undefined;
};

export const serverCache = globalForCache.serverCache ?? new InMemoryServerCache();

if (process.env.NODE_ENV !== "production") {
  globalForCache.serverCache = serverCache;
}

/**
 * Gets a cached value or sets it using the provided async function if it's a miss.
 * 
 * @param key Unique key for the cache entry
 * @param fetchFn Asynchronous callback that returns fresh data if cache is empty
 * @param ttlSeconds TTL in seconds (default is 1 hour / 3600 seconds)
 */
export async function getOrSetCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 3600
): Promise<T> {
  const cached = serverCache.get<T>(key);
  if (cached !== null) {
    console.log(`[Cache HIT] Key: "${key}"`);
    return cached;
  }

  const startTime = performance.now();
  console.log(`[Cache MISS] Key: "${key}". Fetching fresh data...`);
  
  const freshData = await fetchFn();
  
  const duration = (performance.now() - startTime).toFixed(1);
  console.log(`[Cache WRITE] Key: "${key}" | Fetched in ${duration}ms | TTL: ${ttlSeconds}s`);
  
  serverCache.set(key, freshData, ttlSeconds * 1000);
  return freshData;
}
