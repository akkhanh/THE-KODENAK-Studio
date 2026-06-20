import { prisma } from '../config/prisma.js'
import { calculateOrderPricing } from '../utils/constants.js'
import { getValidPromo } from '../utils/promo.js'

export async function publicPromos(_req, res) {
  const now = new Date()
  const promoCodes = await prisma.promoCode.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    select: { code: true, description: true, discountType: true, discountValue: true, expiresAt: true, usageLimit: true, usedCount: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ promoCodes: promoCodes.filter((promo) => promo.usageLimit == null || promo.usedCount < promo.usageLimit).map(({ usageLimit: _usageLimit, usedCount: _usedCount, ...promo }) => promo) })
}

export async function validatePromo(req, res) {
  const promo = await getValidPromo(req.body.code)
  const response = { valid: true, code: promo.code, description: promo.description, discountType: promo.discountType, discountValue: promo.discountValue, discountPercent: promo.discountType === 'PERCENT' ? promo.discountValue : 0, label: promo.description, message: 'Áp dụng mã khuyến mãi thành công.' }
  if (req.body.originalPrice !== undefined) {
    const originalPrice = Number(req.body.originalPrice)
    if (!Number.isInteger(originalPrice) || originalPrice <= 0) { const error = new Error('Giá gốc không hợp lệ.'); error.status = 400; throw error }
    response.pricing = calculateOrderPricing(originalPrice, promo)
  }
  res.json(response)
}
