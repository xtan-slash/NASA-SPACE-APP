import { getRequest, setResponseStatus } from "@tanstack/react-start/server";

// Best-effort per-runtime rate limiting. A shared durable store or edge/WAF rule
// is still required for globally consistent limits across multiple server instances.
const buckets = new Map();
const WINDOW_MS = 60_000;
const MAX_BUCKETS = 5_000;

function clientKey() {
  try {
    const request = getRequest();
    // Cloudflare supplies this header at the edge. Do not trust arbitrary
    // X-Forwarded-For values supplied by clients.
    return request.headers.get("cf-connecting-ip") || "unknown-client";
  } catch {
    return "unknown-client";
  }
}

export function enforceRateLimit({ scope, identity, limit, windowMs = WINDOW_MS }) {
  const now = Date.now();
  const key = `${scope}:${identity || clientKey()}`;
  let bucket = buckets.get(key);

  if (!bucket || now - bucket.startedAt >= windowMs) {
    bucket = { startedAt: now, count: 0 };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (buckets.size > MAX_BUCKETS) {
    for (const [entryKey, entry] of buckets) {
      if (now - entry.startedAt >= windowMs) buckets.delete(entryKey);
    }
    while (buckets.size > MAX_BUCKETS) {
      buckets.delete(buckets.keys().next().value);
    }
  }

  if (bucket.count <= limit) return;

  const retryAfter = Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
  setResponseStatus(429);
  throw Object.assign(new Error("Too many requests. Please wait and try again."), {
    status: 429,
    code: "RATE_LIMITED",
    retryAfter,
  });
}