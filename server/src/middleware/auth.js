import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { publicUserSelect } from '../controllers/authController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) { const error = new Error('Bạn cần đăng nhập.'); error.status = 401; throw error }
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET) } catch { const error = new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'); error.status = 401; throw error }
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: publicUserSelect })
  if (!user) { const error = new Error('Tài khoản không tồn tại.'); error.status = 401; throw error }
  if (!user.isActive) { const error = new Error('Tài khoản đã bị khóa.'); error.status = 403; throw error }
  req.user = user
  next()
})

export function requireAdmin(req, _res, next) {
  if (req.user.role !== 'ADMIN') { const error = new Error('Bạn không có quyền quản trị.'); error.status = 403; return next(error) }
  next()
}
