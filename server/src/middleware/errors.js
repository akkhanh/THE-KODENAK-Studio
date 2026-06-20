export function notFound(req, _res, next) { const error = new Error(`Không tìm thấy ${req.method} ${req.originalUrl}`); error.status = 404; next(error) }

export function errorHandler(error, _req, res, _next) {
  if (error.code === 'P2002') return res.status(409).json({ message: 'Dữ liệu đã tồn tại.', field: error.meta?.target?.[0] })
  if (error.code === 'P2025') return res.status(404).json({ message: 'Không tìm thấy dữ liệu.' })
  if (error.code?.startsWith?.('P')) return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' })
  const status = error.status || 500
  res.status(status).json({ message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ.' : error.message || 'Lỗi máy chủ.' })
}
