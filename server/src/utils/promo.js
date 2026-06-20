import { prisma } from '../config/prisma.js'
import { normalizePromoCode } from './constants.js'

export async function getValidPromo(rawCode, { optional = false, client = prisma } = {}) {
  const code = normalizePromoCode(rawCode)
  if (!code && optional) return null
  const promo = code ? await client.promoCode.findUnique({ where: { code } }) : null
  const now = new Date()
  const valid = promo && promo.isActive && (!promo.startsAt || promo.startsAt <= now) && (!promo.expiresAt || promo.expiresAt > now) && (promo.usageLimit == null || promo.usedCount < promo.usageLimit)
  if (!valid) { const error = new Error('Mã khuyến mãi không hợp lệ.'); error.status = 400; throw error }
  return promo
}
