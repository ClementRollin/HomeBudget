type RateLimitEntry = { count: number; resetAt: number };

export const createRateLimiter = (options: { limit: number; windowMs: number }) => {
  const store = new Map<string, RateLimitEntry>();

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
