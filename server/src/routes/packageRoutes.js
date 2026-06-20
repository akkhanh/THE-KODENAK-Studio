import { Router } from 'express'
import { getPackage, listPackages } from '../controllers/packageController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.get('/', asyncHandler(listPackages))
router.get('/:id', asyncHandler(getPackage))
export default router
