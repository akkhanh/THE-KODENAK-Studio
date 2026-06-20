import { prisma } from '../config/prisma.js'
import { normalizePromoCode } from '../utils/constants.js'

const dateOrNull = (value) => value ? new Date(value) : null
const clean = (body, partial = false) => {
  const data = {}
  if (!partial || body.code !== undefined) data.code = normalizePromoCode(body.code)
  if (!partial || body.description !== undefined) data.description = String(body.description || '').trim()
  if (!partial || body.discountType !== undefined) data.discountType = body.discountType
  if (!partial || body.discountValue !== undefined) data.discountValue = Number(body.discountValue)
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)
  if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit === '' || body.usageLimit == null ? null : Number(body.usageLimit)
  if (body.startsAt !== undefined) data.startsAt = dateOrNull(body.startsAt)
  if (body.expiresAt !== undefined) data.expiresAt = dateOrNull(body.expiresAt)
  if ((!partial && (!data.code || !data.description)) || (data.code !== undefined && !/^[A-Z0-9_-]+$/.test(data.code)) || (data.discountType !== undefined && !['PERCENT', 'FIXED'].includes(data.discountType)) || (data.discountValue !== undefined && (!Number.isInteger(data.discountValue) || data.discountValue <= 0)) || (data.discountType === 'PERCENT' && data.discountValue > 100) || (data.usageLimit !== undefined && data.usageLimit !== null && (!Number.isInteger(data.usageLimit) || data.usageLimit < 1))) { const error = new Error('Thông tin mã khuyến mãi không hợp lệ.'); error.status = 400; throw error }
  return data
}

export async function promoCodes(_req, res) { res.json({ promoCodes: await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } }) }) }
export async function promoDetail(req, res) { const promoCode = await prisma.promoCode.findUnique({ where: { id: req.params.id } }); if (!promoCode) { const error = new Error('Không tìm thấy mã khuyến mãi.'); error.status = 404; throw error } res.json({ promoCode }) }
export async function createPromo(req, res) { res.status(201).json({ promoCode: await prisma.promoCode.create({ data: clean(req.body) }) }) }
export async function updatePromo(req, res) { res.json({ promoCode: await prisma.promoCode.update({ where: { id: req.params.id }, data: clean(req.body, true) }) }) }
export async function togglePromo(req, res) { const current = await prisma.promoCode.findUnique({ where: { id: req.params.id }, select: { isActive: true } }); if (!current) { const error = new Error('Không tìm thấy mã khuyến mãi.'); error.status = 404; throw error } res.json({ promoCode: await prisma.promoCode.update({ where: { id: req.params.id }, data: { isActive: !current.isActive } }) }) }
