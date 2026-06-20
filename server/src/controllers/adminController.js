import { prisma } from '../config/prisma.js'
import { publicUserSelect } from './authController.js'
import { PAYMENT_STATUSES, PROJECT_STATUSES } from '../utils/constants.js'
import { assertTransition, isTerminalOrder } from '../utils/orderState.js'

const orderInclude = { customer: { select: publicUserSelect }, servicePackage: { select: { id: true, name: true, slug: true } } }
const receivedAmount = (order) => order.paymentStatus === 'FULLY_PAID' ? order.finalPrice : ['DEPOSIT_PAID', 'FINAL_PAYMENT_PENDING'].includes(order.paymentStatus) ? order.depositAmount : 0
const countBy = (items, field) => items.reduce((counts, item) => ({ ...counts, [item[field]]: (counts[item[field]] || 0) + 1 }), {})
const adminActionFor = (order) => {
  if (order.paymentStatus === 'DEPOSIT_PENDING') return { actionType: 'CONFIRM_DEPOSIT', actionLabel: 'Xác nhận tiền cọc', actionDescription: 'Khách đang chờ admin xác nhận khoản cọc 30%.', actionPriority: 'HIGH' }
  if (order.paymentStatus === 'FINAL_PAYMENT_PENDING') return { actionType: 'CONFIRM_FINAL_PAYMENT', actionLabel: 'Xác nhận thanh toán còn lại', actionDescription: 'Kiểm tra và xác nhận khoản thanh toán 70% còn lại.', actionPriority: 'HIGH' }
  if (order.projectStatus === 'BRIEF_SUBMITTED') return { actionType: 'REVIEW_BRIEF', actionLabel: 'Review brief dự án', actionDescription: 'Khách đã gửi brief và đang chờ admin xem xét.', actionPriority: 'HIGH' }
  if (order.paymentStatus === 'UNPAID' || order.projectStatus === 'WAITING_DEPOSIT') return { actionType: 'FOLLOW_UP_DEPOSIT', actionLabel: 'Theo dõi khoản cọc 30%', actionDescription: 'Đơn mới chưa thanh toán; kiểm tra hoặc gửi lại hướng dẫn chuyển khoản.', actionPriority: 'MEDIUM' }
  if (order.projectStatus === 'WAITING_BRIEF') return { actionType: 'REQUEST_BRIEF', actionLabel: 'Nhắc khách gửi brief', actionDescription: 'Đã có đơn nhưng chưa nhận được thông tin dự án.', actionPriority: 'MEDIUM' }
  if (order.projectStatus === 'WAITING_FEEDBACK') return { actionType: 'CHECK_FEEDBACK', actionLabel: 'Kiểm tra phản hồi khách hàng', actionDescription: 'Dự án đang chờ phản hồi để tiếp tục xử lý.', actionPriority: 'MEDIUM' }
  if (order.projectStatus === 'WAITING_FINAL_PAYMENT') return { actionType: 'REQUEST_FINAL_PAYMENT', actionLabel: 'Theo dõi thanh toán cuối', actionDescription: 'Dự án đang chờ khách thanh toán phần còn lại.', actionPriority: 'MEDIUM' }
  if (order.projectStatus === 'READY_TO_DELIVER') return { actionType: 'DELIVER_PROJECT', actionLabel: 'Kiểm tra và bàn giao dự án', actionDescription: 'Dự án đã sẵn sàng cho bước bàn giao cuối.', actionPriority: 'LOW' }
  return null
}
const actionPriorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 }
const ordersRequiringAction = (orders) => orders.map((order) => {
  const action = adminActionFor(order)
  return action ? { ...order, ...action } : null
}).filter(Boolean).sort((a, b) => actionPriorityRank[a.actionPriority] - actionPriorityRank[b.actionPriority] || new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)

export async function summary(_req, res) {
  const orders = await prisma.serviceOrder.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' } })
  const activeOrders = orders.filter((order) => order.projectStatus !== 'CANCELLED' && order.paymentStatus !== 'CANCELLED')
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const revenueReceived = orders.reduce((total, order) => total + receivedAmount(order), 0)
  res.json({
    totalOrders: orders.length,
    newOrders: orders.filter((order) => order.createdAt >= since).length,
    inProgressOrders: orders.filter((order) => order.projectStatus === 'IN_PROGRESS').length,
    waitingDepositOrders: orders.filter((order) => ['UNPAID', 'DEPOSIT_PENDING'].includes(order.paymentStatus)).length,
    waitingFinalPaymentOrders: orders.filter((order) => order.paymentStatus === 'FINAL_PAYMENT_PENDING' || order.projectStatus === 'WAITING_FINAL_PAYMENT').length,
    completedOrders: orders.filter((order) => order.projectStatus === 'COMPLETED').length,
    revenueReceived,
    revenueRemaining: activeOrders.reduce((total, order) => total + order.finalPrice - receivedAmount(order), 0),
    recentOrders: orders.slice(0, 5),
    ordersNeedAction: ordersRequiringAction(orders),
  })
}

export async function adminOrders(req, res) {
  const search = String(req.query.search || '').trim(), paymentStatus = req.query.paymentStatus, projectStatus = req.query.projectStatus
  const where = { ...(PAYMENT_STATUSES.includes(paymentStatus) ? { paymentStatus } : {}), ...(PROJECT_STATUSES.includes(projectStatus) ? { projectStatus } : {}), ...(search ? { OR: [{ id: { contains: search, mode: 'insensitive' } }, { packageName: { contains: search, mode: 'insensitive' } }, { promoCode: { contains: search, mode: 'insensitive' } }, { customer: { is: { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } } }] } : {}) }
  res.json({ orders: await prisma.serviceOrder.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' } }) })
}
export async function adminOrder(req, res) {
  const order = await prisma.serviceOrder.findUnique({ where: { id: req.params.id }, include: { ...orderInclude, brief: true } })
  if (!order) { const error = new Error('Không tìm thấy đơn dịch vụ.'); error.status = 404; throw error }
  const { brief, ...orderData } = order
  res.json({ order: orderData, brief })
}
export async function analytics(_req, res) {
  const orders = await prisma.serviceOrder.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' } })
  const activeOrders = orders.filter((order) => order.projectStatus !== 'CANCELLED' && order.paymentStatus !== 'CANCELLED')
  const packageMap = new Map(), promoMap = new Map()
  for (const order of activeOrders) {
    const packageItem = packageMap.get(order.packageName) || { packageName: order.packageName, orderCount: 0, revenue: 0 }
    packageItem.orderCount += 1; packageItem.revenue += order.finalPrice; packageMap.set(order.packageName, packageItem)
    if (order.promoCode) promoMap.set(order.promoCode, (promoMap.get(order.promoCode) || 0) + 1)
  }
  const revenueReceived = orders.reduce((total, order) => total + receivedAmount(order), 0)
  res.json({
    totalOrders: orders.length,
    newOrders: orders.filter((order) => order.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    inProgressOrders: orders.filter((order) => order.projectStatus === 'IN_PROGRESS').length,
    completedOrders: orders.filter((order) => order.projectStatus === 'COMPLETED').length,
    cancelledOrders: orders.filter((order) => order.projectStatus === 'CANCELLED').length,
    revenueTotal: activeOrders.reduce((total, order) => total + order.finalPrice, 0),
    revenueReceived,
    revenueRemaining: activeOrders.reduce((total, order) => total + order.finalPrice - receivedAmount(order), 0),
    countByPaymentStatus: countBy(orders, 'paymentStatus'),
    countByProjectStatus: countBy(orders, 'projectStatus'),
    packageStats: [...packageMap.values()].sort((a, b) => b.orderCount - a.orderCount),
    promoCodeStats: [...promoMap.entries()].map(([promoCode, usageCount]) => ({ promoCode, usageCount })).sort((a, b) => b.usageCount - a.usageCount),
    recentOrders: orders.slice(0, 5),
    ordersNeedAction: ordersRequiringAction(orders),
  })
}

export async function payments(_req, res) {
  const orders = await prisma.serviceOrder.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' } })
  res.json({ orders: orders.map((order) => ({ ...order, receivedAmount: receivedAmount(order), revenueRemaining: order.projectStatus === 'CANCELLED' || order.paymentStatus === 'CANCELLED' ? 0 : order.finalPrice - receivedAmount(order) })) })
}

async function updateField(req, res, field, allowed) {
  const value = req.body[field]
  if (!allowed.includes(value)) { const error = new Error(`Giá trị ${field} không hợp lệ.`); error.status = 400; throw error }
  if (value === 'CANCELLED' || value === 'COMPLETED') { const error = new Error('Hãy dùng thao tác hủy hoặc hoàn thành đơn để cập nhật trạng thái kết thúc.'); error.status = 400; throw error }
  const current = await prisma.serviceOrder.findUnique({ where: { id: req.params.id }, include: { brief: { select: { id: true, isReviewed: true } } } })
  if (!current) { const error = new Error('Không tìm thấy đơn dịch vụ.'); error.status = 404; throw error }
  assertTransition(field === 'paymentStatus' ? 'payment' : 'project', current[field], value)
  if (field === 'projectStatus' && ['BRIEF_SUBMITTED', 'REVIEWING'].includes(value) && !current.brief) { const error = new Error('Cần có brief trước khi chuyển sang trạng thái này.'); error.status = 409; throw error }
  if (field === 'projectStatus' && value === 'WAITING_BRIEF' && !['DEPOSIT_PAID', 'FINAL_PAYMENT_PENDING', 'FULLY_PAID'].includes(current.paymentStatus)) { const error = new Error('Cần xác nhận tiền cọc trước khi yêu cầu brief.'); error.status = 409; throw error }
  if (field === 'projectStatus' && value === 'READY_TO_DELIVER' && current.paymentStatus !== 'FULLY_PAID') { const error = new Error('Cần xác nhận thanh toán đủ trước khi sẵn sàng bàn giao.'); error.status = 409; throw error }
  const data = { [field]: value }
  if (field === 'paymentStatus' && value === 'DEPOSIT_PAID' && current.projectStatus === 'WAITING_DEPOSIT') data.projectStatus = current.brief?.isReviewed ? 'REVIEWING' : current.brief ? 'BRIEF_SUBMITTED' : 'WAITING_BRIEF'
  if (field === 'paymentStatus' && value === 'FULLY_PAID' && current.projectStatus === 'WAITING_FINAL_PAYMENT') data.projectStatus = 'READY_TO_DELIVER'
  const order = await prisma.serviceOrder.update({ where: { id: current.id }, data })
  res.json({ order })
}
export const updatePaymentStatus = (req, res) => updateField(req, res, 'paymentStatus', PAYMENT_STATUSES)
export const updateProjectStatus = (req, res) => updateField(req, res, 'projectStatus', PROJECT_STATUSES)
export async function updateNote(req, res) {
  const data = { adminNote: String(req.body.adminNote || '').trim() }
  if (req.body.paymentNote !== undefined) data.paymentNote = String(req.body.paymentNote || '').trim()
  const order = await prisma.serviceOrder.update({ where: { id: req.params.id }, data })
  res.json({ order })
}
export async function cancelOrder(req, res) {
  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.serviceOrder.findUnique({ where: { id: req.params.id } })
    if (!current) { const error = new Error('Không tìm thấy đơn dịch vụ.'); error.status = 404; throw error }
    if (isTerminalOrder(current)) { const error = new Error('Đơn đã kết thúc nên không thể hủy lại.'); error.status = 409; throw error }
    const cancelled = await tx.serviceOrder.update({ where: { id: current.id }, data: { paymentStatus: 'CANCELLED', projectStatus: 'CANCELLED', cancelledAt: new Date() } })
    if (current.promoCode) await tx.promoCode.updateMany({ where: { code: current.promoCode, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } })
    return cancelled
  })
  res.json({ order })
}
export async function completeOrder(req, res) {
  const current = await prisma.serviceOrder.findUnique({ where: { id: req.params.id } })
  if (!current) { const error = new Error('Không tìm thấy đơn dịch vụ.'); error.status = 404; throw error }
  if (isTerminalOrder(current)) { const error = new Error('Đơn đã kết thúc nên không thể hoàn thành lại.'); error.status = 409; throw error }
  if (current.paymentStatus !== 'FULLY_PAID') { const error = new Error('Chỉ có thể hoàn thành đơn sau khi đã xác nhận thanh toán đủ.'); error.status = 409; throw error }
  if (current.projectStatus !== 'READY_TO_DELIVER') { const error = new Error('Dự án phải ở trạng thái sẵn sàng bàn giao trước khi hoàn thành.'); error.status = 409; throw error }
  res.json({ order: await prisma.serviceOrder.update({ where: { id: current.id }, data: { projectStatus: 'COMPLETED', completedAt: new Date() } }) })
}
