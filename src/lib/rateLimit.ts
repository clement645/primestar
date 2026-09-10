// Lightweight in-memory rate limiter. In a serverless environment each
// warm function instance keeps its own counters — this is a best-effort
// guard against casual abuse (e.g. someone scripting the weather endpoint),
// not a substitute for an edge/WAF-level limiter under real load. For
// stronger guarantees in production, back this with Upstash Redis or a
// similar shared store.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
