import { Router } from 'express'
import { createOrder, getBrief, myOrder, myOrders, submitBrief } from '../controllers/orderController.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth)
router.post('/', asyncHandler(createOrder))
router.get('/my', asyncHandler(myOrders))
router.get('/my/:id', asyncHandler(myOrder))
router.post('/:orderId/brief', asyncHandler(submitBrief))
router.get('/:orderId/brief', asyncHandler(getBrief))
export default router
