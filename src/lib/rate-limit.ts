import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- In-memory fallback (used when Upstash is not configured) ---

type RateLimitEntry = { count: number; resetAt: number };

export const createRateLimiter = (options: { limit: number; windowMs: number }) => {
  const store = new Map<string, RateLimitEntry>();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, options.windowMs);

  if (typeof sweep.unref === "function") sweep.unref();

  return {
    async check(key: string): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
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

// --- Upstash distributed limiter (active when env vars are set) ---
// When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are configured,
// rate limits are enforced globally across all serverless instances.

const hasUpstash =
  typeof process.env.UPSTASH_REDIS_REST_URL === "string" &&
  process.env.UPSTASH_REDIS_REST_URL.length > 0;

const createUpstashLimiter = (options: { limit: number; windowMs: number }) => {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(options.limit, `${options.windowMs} ms`),
    analytics: false,
  });

  return {
    async check(key: string): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
      const { success, reset } = await ratelimit.limit(key);
      if (success) return { ok: true };
      return { ok: false, retryAfterMs: reset - Date.now() };
    },
  };
};

const createDistributedLimiter = (options: { limit: number; windowMs: number }) =>
  hasUpstash ? createUpstashLimiter(options) : createRateLimiter(options);

export const registerRateLimiter = createDistributedLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

// Login : 10 tentatives par 15 minutes par IP
export const loginRateLimiter = createDistributedLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

// Mutations API sensibles : 60 req/min par IP
export const apiMutationRateLimiter = createDistributedLimiter({ limit: 60, windowMs: 60 * 1000 });
