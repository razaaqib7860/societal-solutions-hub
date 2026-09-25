const buckets = new Map();
export function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.user?._id || 'anonymous'}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return next(); }
    if (current.count >= max) return res.status(429).json({ success: false, message: 'Too many challenge submissions. Please try again shortly.' });
    current.count += 1; return next();
  };
}
