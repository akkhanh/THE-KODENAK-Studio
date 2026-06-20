import { Router } from 'express'
import { publicFaqs, publicSettings } from '../controllers/contentController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const faqRoutes = Router().get('/', asyncHandler(publicFaqs))
export const settingsRoutes = Router().get('/', asyncHandler(publicSettings))
