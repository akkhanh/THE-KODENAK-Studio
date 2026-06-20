import 'dotenv/config'
import assert from 'node:assert/strict'
import app from '../src/app.js'
import { prisma } from '../src/config/prisma.js'

const server = app.listen(0)
await new Promise((resolve) => server.once('listening', resolve))
const base = `http://127.0.0.1:${server.address().port}/api`, suffix = Date.now()
const created = { packageId: null, promoId: null, faqId: null, customerId: null, orderId: null, cancelledOrderId: null }
const request = async (path, options = {}, expected = 200) => {
  const response = await fetch(`${base}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } })
  const data = await response.json()
  assert.equal(response.status, expected, `${response.status} ${path}: ${JSON.stringify(data)}`)
  return data
}
const json = (method, body, headers = {}) => ({ method, headers, body: JSON.stringify(body) })

try {
  const adminLogin = await request('/auth/login', json('POST', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }))
  const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` }
  const servicePackage = (await request('/admin/packages', json('POST', { name: 'Smoke Package', slug: `smoke-package-${suffix}`, description: 'Temporary CRUD test', price: 900000, features: ['Feature one'], displayOrder: 99 }, adminHeaders), 201)).package
  created.packageId = servicePackage.id
  assert.equal((await request(`/admin/packages/${servicePackage.id}`, { headers: adminHeaders })).package.name, 'Smoke Package')
  await request(`/admin/packages/${servicePackage.id}`, json('PATCH', { price: 950000 }, adminHeaders))
  await request(`/admin/packages/${servicePackage.id}/toggle-active`, json('PATCH', {}, adminHeaders))
  assert.ok(!(await request('/packages')).packages.some((item) => item.id === servicePackage.id))
  await request(`/admin/packages/${servicePackage.id}/toggle-active`, json('PATCH', {}, adminHeaders))

  const promo = (await request('/admin/promo-codes', json('POST', { code: `SMOKE${suffix}`, description: 'Smoke promo', discountType: 'PERCENT', discountValue: 10, usageLimit: 2 }, adminHeaders), 201)).promoCode
  created.promoId = promo.id
  assert.ok((await request('/promo')).promoCodes.some((item) => item.code === promo.code))
  assert.equal((await request('/promo/validate', json('POST', { code: promo.code, originalPrice: 950000 }, adminHeaders))).pricing.finalPrice, 855000)
  await request(`/admin/promo-codes/${promo.id}/toggle-active`, json('PATCH', {}, adminHeaders))
  await request('/promo/validate', json('POST', { code: promo.code, originalPrice: 950000 }, adminHeaders), 400)
  await request(`/admin/promo-codes/${promo.id}/toggle-active`, json('PATCH', {}, adminHeaders))

  const faq = (await request('/admin/faqs', json('POST', { question: `Smoke question ${suffix}?`, answer: 'Smoke answer', category: 'Test', displayOrder: 999 }, adminHeaders), 201)).faq
  created.faqId = faq.id
  assert.ok((await request('/faqs')).faqs.some((item) => item.id === faq.id))
  await request(`/admin/faqs/${faq.id}/toggle-active`, json('PATCH', {}, adminHeaders))
  assert.ok(!(await request('/faqs')).faqs.some((item) => item.id === faq.id))
  await request(`/admin/faqs/${faq.id}/toggle-active`, json('PATCH', {}, adminHeaders))

  const customer = await request('/auth/register', json('POST', { name: 'Smoke Customer', email: `smoke-${suffix}@test.local`, phone: '0901234567', password: 'SmokePass123', role: 'ADMIN' }), 201)
  created.customerId = customer.user.id
  assert.equal(customer.user.role, 'CUSTOMER')
  const customerHeaders = { Authorization: `Bearer ${customer.token}` }
  const updatedProfile = await request('/auth/me', json('PATCH', { name: 'Customer Portal User', phone: '0912345678' }, customerHeaders))
  assert.equal(updatedProfile.user.name, 'Customer Portal User')
  await request(`/admin/customers/${customer.user.id}`, json('PATCH', { name: 'Smoke Customer Updated', phone: '0907654321' }, adminHeaders))
  assert.equal((await request(`/admin/customers/${customer.user.id}`, { headers: adminHeaders })).customer.name, 'Smoke Customer Updated')
  await request(`/admin/customers/${customer.user.id}/toggle-active`, json('PATCH', {}, adminHeaders))
  await request('/auth/login', json('POST', { email: customer.user.email, password: 'SmokePass123' }), 403)
  await request(`/admin/customers/${customer.user.id}/toggle-active`, json('PATCH', {}, adminHeaders))

  const order = (await request('/orders', json('POST', { packageId: servicePackage.id, promoCode: promo.code }, customerHeaders), 201)).order
  created.orderId = order.id
  assert.equal(order.finalPrice, 855000)
  assert.equal((await request(`/admin/promo-codes/${promo.id}`, { headers: adminHeaders })).promoCode.usedCount, 1)
  const brief = (await request(`/orders/${order.id}/brief`, json('POST', { businessName: 'Smoke Co', businessType: 'Test', websiteGoal: 'Test CRUD', projectDescription: 'Temporary brief' }, customerHeaders), 201)).brief
  await request(`/admin/briefs/${brief.id}/review`, json('PATCH', { isReviewed: true }, adminHeaders))
  await request(`/admin/briefs/${brief.id}/note`, json('PATCH', { adminBriefNote: 'Reviewed in smoke test' }, adminHeaders))
  await request(`/admin/orders/${order.id}/note`, json('PATCH', { adminNote: 'Internal only' }, adminHeaders))
  await request(`/admin/orders/${order.id}/complete`, json('PATCH', {}, adminHeaders), 409)
  await request(`/admin/orders/${order.id}/payment-status`, json('PATCH', { paymentStatus: 'DEPOSIT_PAID' }, adminHeaders))
  await request(`/admin/orders/${order.id}/project-status`, json('PATCH', { projectStatus: 'IN_PROGRESS' }, adminHeaders))
  await request(`/admin/orders/${order.id}/project-status`, json('PATCH', { projectStatus: 'WAITING_FINAL_PAYMENT' }, adminHeaders))
  await request(`/admin/orders/${order.id}/payment-status`, json('PATCH', { paymentStatus: 'FINAL_PAYMENT_PENDING' }, adminHeaders))
  await request(`/admin/orders/${order.id}/payment-status`, json('PATCH', { paymentStatus: 'FULLY_PAID' }, adminHeaders))
  const customerOrders = (await request('/orders/my', { headers: customerHeaders })).orders
  assert.equal(customerOrders.length, 1)
  assert.ok(!('adminNote' in customerOrders[0]))
  assert.ok(!('paymentNote' in customerOrders[0]))
  assert.ok(!('adminBriefNote' in customerOrders[0].brief))
  const customerOrder = await request(`/orders/my/${order.id}`, { headers: customerHeaders })
  assert.ok(!('adminNote' in customerOrder.order))
  assert.ok(!('paymentNote' in customerOrder.order))
  assert.ok(!('adminBriefNote' in customerOrder.brief))
  await request(`/orders/my/${order.id}`, { headers: adminHeaders }, 404)
  await request(`/admin/orders/${order.id}/complete`, json('PATCH', {}, adminHeaders))
  const cancelledOrder = (await request('/orders', json('POST', { packageId: servicePackage.id, promoCode: promo.code }, customerHeaders), 201)).order
  created.cancelledOrderId = cancelledOrder.id
  await request(`/admin/orders/${cancelledOrder.id}/cancel`, json('PATCH', {}, adminHeaders))
  assert.equal((await request(`/admin/promo-codes/${promo.id}`, { headers: adminHeaders })).promoCode.usedCount, 1)
  await request(`/admin/orders/${cancelledOrder.id}/cancel`, json('PATCH', {}, adminHeaders), 409)

  const originalSettings = (await request('/admin/settings', { headers: adminHeaders })).settings
  await request('/admin/settings', json('PATCH', { tagline: 'Smoke test tagline' }, adminHeaders))
  assert.equal((await request('/settings')).settings.tagline, 'Smoke test tagline')
  await request('/admin/settings', json('PATCH', { tagline: originalSettings.tagline }, adminHeaders))
  assert.equal(typeof (await request('/admin/analytics', { headers: adminHeaders })).totalOrders, 'number')
  assert.ok(Array.isArray((await request('/admin/payments', { headers: adminHeaders })).orders))
  console.log('Admin/customer smoke test passed: CRUD, customer profile, ownership, private notes, packages, promos, orders, briefs, settings and payments.')
} finally {
  if (created.orderId) await prisma.projectBrief.deleteMany({ where: { orderId: created.orderId } })
  if (created.cancelledOrderId) await prisma.serviceOrder.deleteMany({ where: { id: created.cancelledOrderId } })
  if (created.orderId) await prisma.serviceOrder.deleteMany({ where: { id: created.orderId } })
  if (created.customerId) await prisma.user.deleteMany({ where: { id: created.customerId } })
  if (created.packageId) await prisma.servicePackage.deleteMany({ where: { id: created.packageId } })
  if (created.promoId) await prisma.promoCode.deleteMany({ where: { id: created.promoId } })
  if (created.faqId) await prisma.fAQItem.deleteMany({ where: { id: created.faqId } })
  await new Promise((resolve) => server.close(resolve))
  await prisma.$disconnect()
}
