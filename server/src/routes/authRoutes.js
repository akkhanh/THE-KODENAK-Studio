import { Router } from 'express'
import { login, me, register, updateMe } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = Router()
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.' })
router.post('/register', authLimiter, asyncHandler(register))
router.post('/login', authLimiter, asyncHandler(login))
router.get('/me', requireAuth, me)
router.patch('/me', requireAuth, asyncHandler(updateMe))
export default router
