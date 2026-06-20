import { Router } from 'express'
import { adminOrder, adminOrders, analytics, cancelOrder, completeOrder, payments, summary, updateNote, updatePaymentStatus, updateProjectStatus } from '../controllers/adminController.js'
import { createPackage, packageDetail, packages, togglePackage, updatePackage } from '../controllers/adminPackageController.js'
import { createPromo, promoCodes, promoDetail, togglePromo, updatePromo } from '../controllers/adminPromoController.js'
import { customerDetail, customerOrders, customers, toggleCustomer, updateCustomer } from '../controllers/adminCustomerController.js'
import { briefDetail, briefs, noteBrief, reviewBrief } from '../controllers/adminBriefController.js'
import { createFaq, faqDetail, faqs, settings, toggleFaq, updateFaq, updateSettings } from '../controllers/adminContentController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth, requireAdmin)
router.get('/summary', asyncHandler(summary))
router.get('/orders', asyncHandler(adminOrders))
router.get('/orders/:id', asyncHandler(adminOrder))
router.get('/customers', asyncHandler(customers))
router.get('/briefs', asyncHandler(briefs))
router.get('/analytics', asyncHandler(analytics))
router.get('/payments', asyncHandler(payments))
router.patch('/orders/:id/payment-status', asyncHandler(updatePaymentStatus))
router.patch('/orders/:id/project-status', asyncHandler(updateProjectStatus))
router.patch('/orders/:id/note', asyncHandler(updateNote))
router.patch('/orders/:id/cancel', asyncHandler(cancelOrder))
router.patch('/orders/:id/complete', asyncHandler(completeOrder))
router.get('/packages', asyncHandler(packages))
router.post('/packages', asyncHandler(createPackage))
router.get('/packages/:id', asyncHandler(packageDetail))
router.patch('/packages/:id', asyncHandler(updatePackage))
router.patch('/packages/:id/toggle-active', asyncHandler(togglePackage))
router.get('/promo-codes', asyncHandler(promoCodes))
router.post('/promo-codes', asyncHandler(createPromo))
router.get('/promo-codes/:id', asyncHandler(promoDetail))
router.patch('/promo-codes/:id', asyncHandler(updatePromo))
router.patch('/promo-codes/:id/toggle-active', asyncHandler(togglePromo))
router.get('/customers/:id', asyncHandler(customerDetail))
router.patch('/customers/:id', asyncHandler(updateCustomer))
router.patch('/customers/:id/toggle-active', asyncHandler(toggleCustomer))
router.get('/customers/:id/orders', asyncHandler(customerOrders))
router.get('/briefs/:id', asyncHandler(briefDetail))
router.patch('/briefs/:id/review', asyncHandler(reviewBrief))
router.patch('/briefs/:id/note', asyncHandler(noteBrief))
router.get('/faqs', asyncHandler(faqs))
router.post('/faqs', asyncHandler(createFaq))
router.get('/faqs/:id', asyncHandler(faqDetail))
router.patch('/faqs/:id', asyncHandler(updateFaq))
router.patch('/faqs/:id/toggle-active', asyncHandler(toggleFaq))
router.get('/settings', asyncHandler(settings))
router.patch('/settings', asyncHandler(updateSettings))
export default router
