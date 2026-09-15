import type { Express, NextFunction, Request, Response } from "express";

const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

function clientKey(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function enforceRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number,
) {
  const now = Date.now();
  const bucketKey = `${bucket}:${key}`;
  const current = buckets.get(bucketKey);
  if (!current || current.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [storedKey, stored] of Array.from(buckets.entries())) {
        if (stored.resetAt <= now) buckets.delete(storedKey);
        if (buckets.size < MAX_BUCKETS) break;
      }
    }
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs };
  }

  current.count += 1;
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

export function rateLimitMiddleware(options: {
  bucket: string;
  limit: number;
  windowMs: number;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = enforceRateLimit(options.bucket, clientKey(req), options.limit, options.windowMs);
    res.setHeader("X-RateLimit-Limit", options.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));
    if (!result.allowed) {
      res.setHeader("Retry-After", Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}

export function applySecurityHeaders(app: Express) {
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    const scriptSource = process.env.NODE_ENV === "production" ? "script-src 'self'" : "script-src 'self' 'unsafe-inline'";
    res.setHeader("Content-Security-Policy", [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      scriptSource,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
    ].join("; "));
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
}

export function blockDebugPathsInProduction(app: Express) {
  if (process.env.NODE_ENV !== "production") return;
  app.use("/__manus__", (_req, res) => {
    res.status(404).end();
  });
}

export function requestIdentity(req: Request) {
  return clientKey(req);
}
