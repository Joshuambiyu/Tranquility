type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, number[]>();

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;
  const existing = buckets.get(key) ?? [];
  const recent = existing.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= options.maxRequests) {
    const oldestInWindow = recent[0] ?? now;
    const retryAfterMs = Math.max(options.windowMs - (now - oldestInWindow), 0);

    buckets.set(key, recent);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  const updated = [...recent, now];
  buckets.set(key, updated);

  return {
    allowed: true,
    remaining: Math.max(options.maxRequests - updated.length, 0),
    retryAfterSeconds: 0,
  };
}
