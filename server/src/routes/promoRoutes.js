import { Router } from 'express'
import { publicPromos, validatePromo } from '../controllers/promoController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = Router()
router.get('/', asyncHandler(publicPromos))
router.post('/validate', requireAuth, rateLimit({ windowMs: 60 * 1000, max: 30, message: 'Bạn đã thử mã quá nhiều lần. Vui lòng thử lại sau.' }), asyncHandler(validatePromo))
export default router
