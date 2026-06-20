import { prisma } from '../config/prisma.js'
import { calculateOrderPricing } from '../utils/constants.js'
import { getValidPromo } from '../utils/promo.js'

const briefFields = ['businessName', 'businessType', 'websiteGoal', 'projectDescription', 'preferredStyle', 'referenceWebsite', 'timeline', 'hasLogo', 'hasContentReady', 'customerNote']
const booleanBriefFields = new Set(['hasLogo', 'hasContentReady'])
const cleanBrief = (body) => Object.fromEntries(briefFields.filter((field) => body[field] !== undefined).map((field) => {
  if (booleanBriefFields.has(field)) {
    if (typeof body[field] !== 'boolean') { const error = new Error(`Trường ${field} phải là true hoặc false.`); error.status = 400; throw error }
    return [field, body[field]]
  }
  if (typeof body[field] !== 'string') { const error = new Error(`Trường ${field} phải là chuỗi.`); error.status = 400; throw error }
  return [field, body[field].trim()]
}))
const customerBrief = (brief) => {
  if (!brief) return null
  const { adminBriefNote: _adminBriefNote, isReviewed: _isReviewed, ...safeBrief } = brief
  return safeBrief
}
const customerOrder = (order) => {
  const { adminNote: _adminNote, paymentNote: _paymentNote, brief, ...safeOrder } = order
  return brief === undefined ? safeOrder : { ...safeOrder, brief: customerBrief(brief) }
}

export async function createOrder(req, res) {
  const order = await prisma.$transaction(async (tx) => {
    const servicePackage = await tx.servicePackage.findFirst({ where: { id: req.body.packageId, isActive: true } })
    if (!servicePackage) { const error = new Error('Gói dịch vụ không hợp lệ.'); error.status = 400; throw error }
    const promo = await getValidPromo(req.body.promoCode, { optional: true, client: tx })
    const pricing = calculateOrderPricing(servicePackage.price, promo)
    if (promo) {
      const claimed = await tx.promoCode.updateMany({ where: { id: promo.id, isActive: true, ...(promo.usageLimit == null ? {} : { usedCount: { lt: promo.usageLimit } }) }, data: { usedCount: { increment: 1 } } })
      if (!claimed.count) { const error = new Error('Mã khuyến mãi đã hết lượt sử dụng.'); error.status = 400; throw error }
    }
    return tx.serviceOrder.create({ data: { customerId: req.user.id, packageId: servicePackage.id, packageName: servicePackage.name, ...pricing, paymentMethod: 'BANK_TRANSFER', paymentStatus: 'UNPAID', projectStatus: 'WAITING_DEPOSIT' } })
  }, { isolationLevel: 'Serializable' })
  const setting = await prisma.websiteSetting.findUnique({ where: { id: 'main' } })
  const paymentInstructions = setting?.bankAccountNumber ? `Chuyển khoản ${setting.bankName} · ${setting.bankAccountNumber} · ${setting.bankAccountName}. THE KODENAK Studio sẽ xác nhận thanh toán thủ công.` : 'Thông tin chuyển khoản ngân hàng sẽ được THE KODENAK Studio gửi sau. Thanh toán được xác nhận thủ công.'
  res.status(201).json({ order: customerOrder(order), paymentInstructions })
}

export async function myOrders(req, res) {
  const orders = await prisma.serviceOrder.findMany({ where: { customerId: req.user.id }, include: { brief: true }, orderBy: { createdAt: 'desc' } })
  res.json({ orders: orders.map(customerOrder) })
}
export async function myOrder(req, res) {
  const order = await prisma.serviceOrder.findFirst({ where: { id: req.params.id, customerId: req.user.id }, include: { brief: true } })
  if (!order) { const error = new Error('Không tìm thấy đơn dịch vụ.'); error.status = 404; throw error }
  const { brief, ...orderData } = customerOrder(order)
  const setting = await prisma.websiteSetting.findUnique({ where: { id: 'main' } })
  const paymentInstructions = setting?.bankAccountNumber ? `Chuyển khoản ${setting.bankName} · ${setting.bankAccountNumber} · ${setting.bankAccountName}. THE KODENAK Studio sẽ xác nhận thanh toán thủ công.` : 'Thông tin chuyển khoản ngân hàng sẽ được THE KODENAK Studio gửi sau. Thanh toán được xác nhận thủ công.'
  res.json({ order: orderData, brief, paymentInstructions })
}

export async function submitBrief(req, res) {
  const order = await prisma.serviceOrder.findFirst({ where: { id: req.params.orderId, customerId: req.user.id }, select: { id: true, projectStatus: true } })
  if (!order) { const error = new Error('Không tìm thấy đơn dịch vụ.'); error.status = 404; throw error }
  const data = cleanBrief(req.body)
  if (![data.businessName, data.businessType, data.websiteGoal, data.projectDescription].every(Boolean)) { const error = new Error('Vui lòng điền các trường brief bắt buộc.'); error.status = 400; throw error }
  if (['CANCELLED', 'COMPLETED'].includes(order.projectStatus)) { const error = new Error('Không thể sửa brief của đơn đã kết thúc.'); error.status = 409; throw error }
  const [brief] = await prisma.$transaction([
    prisma.projectBrief.upsert({ where: { orderId: order.id }, create: { ...data, orderId: order.id }, update: data }),
    ...(['WAITING_BRIEF'].includes(order.projectStatus) ? [prisma.serviceOrder.update({ where: { id: order.id }, data: { projectStatus: 'BRIEF_SUBMITTED' } })] : []),
  ])
  res.status(201).json({ brief: customerBrief(brief) })
}

export async function getBrief(req, res) {
  const order = await prisma.serviceOrder.findFirst({ where: { id: req.params.orderId, customerId: req.user.id }, select: { id: true } })
  if (!order) { const error = new Error('Không tìm thấy đơn dịch vụ.'); error.status = 404; throw error }
  const brief = await prisma.projectBrief.findUnique({ where: { orderId: order.id } })
  if (!brief) { const error = new Error('Brief dự án chưa được gửi.'); error.status = 404; throw error }
  res.json({ brief: customerBrief(brief) })
}
