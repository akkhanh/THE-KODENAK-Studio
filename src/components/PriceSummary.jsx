import { formatMoney } from '../data/services'
import './PriceSummary.css'

export default function PriceSummary({ pricing, promoLabel, compact = false }) {
  return <dl className={`price-summary${compact ? ' compact' : ''}`}>
    <div><dt>Giá gốc</dt><dd>{formatMoney(pricing.originalPrice)}</dd></div>
    <div><dt>Mã khuyến mãi</dt><dd>{pricing.promoCode || 'Không áp dụng'}</dd></div>
    {promoLabel && <div className="promo-label"><dt>Ưu đãi</dt><dd>{promoLabel}</dd></div>}
    <div className="discount-row"><dt>{compact ? 'Giảm giá' : 'Số tiền giảm'}{pricing.discountPercent ? ` (${pricing.discountPercent}%)` : ''}</dt><dd>-{formatMoney(pricing.discountAmount)}</dd></div>
    <div className="total-row"><dt>Giá sau giảm</dt><dd>{formatMoney(pricing.finalPrice)}</dd></div>
    <div><dt>Cọc {pricing.depositPercent}%</dt><dd>{formatMoney(pricing.depositAmount)}</dd></div>
    <div><dt>Còn lại 70%</dt><dd>{formatMoney(pricing.remainingAmount)}</dd></div>
  </dl>
}
