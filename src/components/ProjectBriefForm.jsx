import { useState } from 'react'
import { api } from '../api'
import './ProjectBriefForm.css'

const initial = { businessName: '', businessType: '', websiteGoal: '', projectDescription: '', preferredStyle: '', referenceWebsite: '', timeline: '', hasLogo: false, hasContentReady: false, customerNote: '' }

const normalizeUrl = (value) => {
  const trimmed = value.trim()
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/+/, '')}`
}

export default function ProjectBriefForm({ order, token, onDone, onBack }) {
  const [form, setForm] = useState(() => Object.fromEntries(Object.keys(initial).map((key) => [key, order.brief?.[key] ?? initial[key]])))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })
  const normalizeReference = () => setForm((current) => ({ ...current, referenceWebsite: normalizeUrl(current.referenceWebsite) }))

  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    const normalizedForm = { ...form, referenceWebsite: normalizeUrl(form.referenceWebsite) }
    setForm(normalizedForm)
    try { await api(`/orders/${order.id}/brief`, { method: 'POST', token, body: normalizedForm }); onDone() } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  return <main className="dashboard-page"><div className="container brief-shell">
    <button className="back-link" type="button" onClick={onBack}>← Dự án của tôi</button>
    <div className="order-heading"><p className="eyebrow">Brief dự án</p><h1>{order.packageName}</h1><p>Không cần dùng từ chuyên ngành. Bạn chỉ cần kể điều mình đang nghĩ — THE KODENAK Studio sẽ đọc, xác nhận lại và giúp bạn làm rõ phần còn thiếu.</p></div>
    <form className="brief-form dashboard-card" onSubmit={submit}>
      <div className="brief-guide"><strong>Chưa biết viết gì?</strong><p>Hãy tưởng tượng bạn đang kể cho một người bạn: bạn làm gì, website dành cho ai, muốn khách xem hoặc làm điều gì, và bạn thích website trông như thế nào.</p></div>
      <div className="form-grid">
        <label>Tên doanh nghiệp / dự án
          <input required name="businessName" value={form.businessName} onChange={update} placeholder="Ví dụ: Tiệm bánh Mây, Portfolio của Ngọc Yến…" />
          <small className="brief-hint">Nếu chưa có tên chính thức, bạn có thể ghi tên tạm hoặc tên của mình.</small>
        </label>
        <label>Lĩnh vực hoạt động
          <input required name="businessType" value={form.businessType} onChange={update} placeholder="Ví dụ: Cá nhân, quán cà phê, bán quần áo…" />
          <small className="brief-hint">Bạn đang làm công việc gì hoặc dự án phục vụ lĩnh vực nào?</small>
        </label>
        <label className="full">Bạn muốn website giúp mình làm được điều gì?
          <textarea required name="websiteGoal" value={form.websiteGoal} onChange={update} placeholder="Ví dụ: Tôi muốn giới thiệu bản thân và các dự án đã làm để tìm việc; hoặc muốn khách xem menu, biết địa chỉ và nhắn Zalo đặt bàn." />
          <small className="brief-hint">Nghĩ về người sẽ vào website: bạn muốn họ hiểu điều gì và thực hiện hành động gì?</small>
        </label>
        <label className="full">Hãy kể thêm về nội dung bạn muốn có trên website
          <textarea required name="projectDescription" value={form.projectDescription} onChange={update} placeholder="Ví dụ: Trang đầu giới thiệu ngắn về tôi, bên dưới là kỹ năng, 4 dự án nổi bật, ảnh cá nhân và nút liên hệ. Tôi đã có ảnh nhưng chưa viết nội dung." />
          <small className="brief-hint">Bạn có thể liệt kê từng phần mong muốn, sản phẩm/dịch vụ cần giới thiệu và những tài liệu mình đã có. Chưa chắc chắn cũng không sao.</small>
        </label>
        <label>Website nên tạo cảm giác như thế nào?
          <input name="preferredStyle" value={form.preferredStyle} onChange={update} placeholder="Ví dụ: Tối giản, trẻ trung, ấm áp, cao cấp…" />
          <small className="brief-hint">Có thể ghi màu bạn thích/không thích hoặc cảm giác muốn khách nhận được.</small>
        </label>
        <label>Website tham khảo
          <input type="text" inputMode="url" name="referenceWebsite" value={form.referenceWebsite} onChange={update} onBlur={normalizeReference} placeholder="google.com hoặc https://example.com" />
          <small className="brief-hint">Dán website bạn thấy đẹp. Nếu thiếu https://, hệ thống sẽ tự thêm.</small>
        </label>
        <label>Bạn mong muốn hoàn thành khi nào?
          <input name="timeline" value={form.timeline} onChange={update} placeholder="Ví dụ: Trước 30/07, trong khoảng 3 tuần…" />
          <small className="brief-hint">Nếu chưa có thời hạn cụ thể, hãy ghi “Có thể trao đổi”.</small>
        </label>
        <label>Điều gì khác bạn muốn chúng mình biết?
          <input name="customerNote" value={form.customerNote} onChange={update} placeholder="Ví dụ: Tôi cần được tư vấn thêm về nội dung…" />
          <small className="brief-hint">Ghi bất kỳ băn khoăn, yêu cầu đặc biệt hoặc điều bạn chưa biết diễn đạt ở trên.</small>
        </label>
      </div>
      <div className="check-row">
        <label><input type="checkbox" name="hasLogo" checked={form.hasLogo} onChange={update} /> Tôi đã có logo</label>
        <label><input type="checkbox" name="hasContentReady" checked={form.hasContentReady} onChange={update} /> Tôi đã có sẵn hình ảnh/nội dung</label>
      </div>
      <p className="brief-reassurance">Bạn không cần trả lời hoàn hảo. Sau khi nhận brief, THE KODENAK Studio sẽ liên hệ để xác nhận và cùng bạn hoàn thiện yêu cầu.</p>
      {error && <p className="form-message error">{error}</p>}
      <button className="button" disabled={loading}>{loading ? 'Đang gửi…' : 'Gửi brief dự án'}</button>
    </form>
  </div></main>
}
