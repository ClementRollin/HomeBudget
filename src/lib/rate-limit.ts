type RateLimitEntry = { count: number; resetAt: number };

// In-memory: resets on cold-start, not shared across multiple serverless instances.
export const createRateLimiter = (options: { limit: number; windowMs: number }) => {
  const store = new Map<string, RateLimitEntry>();

  // Evict expired entries once per window to prevent unbounded Map growth.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, options.windowMs);

  // Allow GC when the limiter is no longer needed (e.g. in tests).
  if (typeof sweep.unref === "function") sweep.unref();

  return {
    check(key: string): { ok: true } | { ok: false; retryAfterMs: number } {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now >= entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return { ok: true };
      }

      if (entry.count >= options.limit) {
        return { ok: false, retryAfterMs: entry.resetAt - now };
      }

      entry.count++;
      return { ok: true };
    },
  };
};

export const registerRateLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

// Login : 10 tentatives par 15 minutes par IP
export const loginRateLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

// Mutations API sensibles : 60 req/min par IP
export const apiMutationRateLimiter = createRateLimiter({ limit: 60, windowMs: 60 * 1000 });
