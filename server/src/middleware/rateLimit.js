const buckets = new Map()

export function rateLimit({ windowMs, max, message }) {
  return (req, _res, next) => {
    const now = Date.now()
    const key = `${req.ip}:${req.baseUrl}:${req.path}`
    const recent = (buckets.get(key) || []).filter((time) => now - time < windowMs)
    if (recent.length >= max) {
      const error = new Error(message)
      error.status = 429
      return next(error)
    }
    recent.push(now)
    buckets.set(key, recent)
    next()
  }
}
