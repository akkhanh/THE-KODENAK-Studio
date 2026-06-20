import { prisma } from '../config/prisma.js'
import { publicUserSelect } from './authController.js'

const enriched = (row) => { const { orders, _count, ...customer } = row; return { ...customer, orderCount: _count.orders, totalOrderValue: orders.filter((order) => order.projectStatus !== 'CANCELLED' && order.paymentStatus !== 'CANCELLED').reduce((sum, order) => sum + order.finalPrice, 0) } }
const customerSelect = { ...publicUserSelect, orders: { select: { finalPrice: true, paymentStatus: true, projectStatus: true } }, _count: { select: { orders: true } } }

export async function customers(req, res) {
  const search = String(req.query.search || '').trim()
  const rows = await prisma.user.findMany({ where: { role: 'CUSTOMER', ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }] } : {}) }, select: customerSelect, orderBy: { createdAt: 'desc' } })
  res.json({ customers: rows.map(enriched) })
}
export async function customerDetail(req, res) { const row = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' }, select: customerSelect }); if (!row) { const error = new Error('Không tìm thấy khách hàng.'); error.status = 404; throw error } res.json({ customer: enriched(row) }) }
export async function updateCustomer(req, res) { const current = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' }, select: { id: true } }); if (!current) { const error = new Error('Không tìm thấy khách hàng.'); error.status = 404; throw error } const data = {}; if (req.body.name !== undefined) data.name = String(req.body.name).trim(); if (req.body.phone !== undefined) data.phone = String(req.body.phone).trim(); if (!Object.keys(data).length || Object.values(data).some((value) => !value)) { const error = new Error('Tên hoặc số điện thoại không hợp lệ.'); error.status = 400; throw error } res.json({ customer: await prisma.user.update({ where: { id: current.id }, data, select: publicUserSelect }) }) }
export async function toggleCustomer(req, res) { const current = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' }, select: { isActive: true } }); if (!current) { const error = new Error('Không tìm thấy khách hàng.'); error.status = 404; throw error } res.json({ customer: await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !current.isActive }, select: publicUserSelect }) }) }
export async function customerOrders(req, res) { const exists = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' }, select: { id: true } }); if (!exists) { const error = new Error('Không tìm thấy khách hàng.'); error.status = 404; throw error } res.json({ orders: await prisma.serviceOrder.findMany({ where: { customerId: req.params.id }, include: { servicePackage: true }, orderBy: { createdAt: 'desc' } }) }) }
