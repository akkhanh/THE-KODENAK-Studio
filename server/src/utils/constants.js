export const PAYMENT_STATUSES = ['UNPAID', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 'FINAL_PAYMENT_PENDING', 'FULLY_PAID', 'CANCELLED']
export const PROJECT_STATUSES = ['WAITING_DEPOSIT', 'WAITING_BRIEF', 'BRIEF_SUBMITTED', 'REVIEWING', 'IN_PROGRESS', 'WAITING_FEEDBACK', 'WAITING_FINAL_PAYMENT', 'READY_TO_DELIVER', 'COMPLETED', 'CANCELLED']
export const normalizePromoCode = (value = '') => String(value).trim().toUpperCase()

export function calculateOrderPricing(originalPrice, promo = null) {
  const discountType = promo?.discountType ?? null
  const discountValue = promo?.discountValue ?? 0
  const discountAmount = promo ? Math.min(originalPrice, Math.round(discountType === 'PERCENT' ? originalPrice * discountValue / 100 : discountValue)) : 0
  const finalPrice = originalPrice - discountAmount
  const depositPercent = 30
  const depositAmount = Math.round(finalPrice * depositPercent / 100)
  return { originalPrice, promoCode: promo?.code ?? '', discountType, discountValue, discountPercent: discountType === 'PERCENT' ? discountValue : 0, discountAmount, finalPrice, depositPercent, depositAmount, remainingAmount: finalPrice - depositAmount }
}
