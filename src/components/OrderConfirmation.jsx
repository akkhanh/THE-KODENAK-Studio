import { useMemo, useState } from 'react'
import { api } from '../api'
import PriceSummary from './PriceSummary'
import './OrderConfirmation.css'

const undiscounted = (price) => ({ originalPrice: price, promoCode: '', discountPercent: 0, discountAmount: 0, finalPrice: price, depositPercent: 30, depositAmount: Math.round(price * .3), remainingAmount: price - Math.round(price * .3) })

export default function OrderConfirmation({ service, token, onBack, onCreated }) {
  service = { ...service, name: service.name || service.title }
  const [input, setInput] = useState('')
  const [promo, setPromo] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const pricing = useMemo(() => promo?.pricing || undiscounted(service.price), [service.price, promo])
  const applyPromo = async (event) => {
    event.preventDefault(); setMessage(null)
    try { const result = await api('/promo/validate', { method: 'POST', token, body: { code: input, originalPrice: service.price } }); setPromo(result); setInput(result.code); setMessage({ type: 'success', text: result.message }) } catch (error) { setPromo(null); setMessage({ type: 'error', text: error.message }) }
  }
  const create = async () => {
    setLoading(true); setMessage(null)
    try { const result = await api('/orders', { method: 'POST', token, body: { packageId: service.id, promoCode: promo?.code || '' } }); onCreated(result.order, result.paymentInstructions) } catch (error) { setMessage({ type: 'error', text: error.message }) } finally { setLoading(false) }
  }
  return <main className="order-page"><div className="container order-shell"><button className="back-link" type="button" onClick={onBack}>← Quay lại chọn gói</button><div className="order-heading"><p className="eyebrow">Xác nhận đơn dịch vụ</p><h1>{service.name}</h1><p>Kiểm tra chi phí và khoản cọc trước khi tạo đơn.</p></div><div className="order-grid"><section className="order-panel"><span className="step-label">01 · Ưu đãi</span><h2>Mã khuyến mãi</h2><form className="promo-form" onSubmit={applyPromo}><label htmlFor="promo-code">Mã khuyến mãi</label><div className="promo-controls"><input id="promo-code" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập mã của bạn" /><button className="button" type="submit">Áp dụng</button></div>{message && <p className={`form-message ${message.type}`} role="status">{message.text}</p>}</form><div className="manual-note"><strong>Thanh toán cọc thủ công</strong><span>Thông tin chuyển khoản ngân hàng có thể được chỉnh sửa sau. Admin xác nhận giao dịch thủ công.</span></div></section><aside className="order-panel summary-panel"><span className="step-label">02 · Chi phí</span><h2>Chi tiết thanh toán</h2><PriceSummary pricing={pricing} promoLabel={promo?.label} /><button className="button create-order" type="button" disabled={loading} onClick={create}>{loading ? 'Đang tạo đơn…' : 'Tạo đơn dịch vụ'}</button><p className="summary-caption">Cọc 30% trên giá sau giảm. 70% còn lại thanh toán trước khi bàn giao.</p></aside></div></div></main>
}
