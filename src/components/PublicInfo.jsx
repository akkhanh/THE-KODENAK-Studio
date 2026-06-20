import { useEffect, useState } from 'react'
import { api } from '../api'
import './PublicInfo.css'

const tabs = [
  ['promo', 'Ưu đãi'],
  ['faq', 'FAQ'],
  ['policy', 'Chính sách dịch vụ'],
]

const benefits = [
  ['Khách hàng mới', 'Ưu đãi chào mừng dành cho dự án đầu tiên.'],
  ['Sinh viên & cá nhân', 'Hỗ trợ portfolio và website giới thiệu bản thân.'],
  ['Khách hàng giới thiệu', 'Quyền lợi riêng cho khách hàng được giới thiệu.'],
  ['Hợp tác portfolio', 'Ưu đãi khi hai bên thống nhất sử dụng dự án làm case study.'],
]

const policies = [
  ['Phạm vi rõ ràng', 'Mỗi gói có danh sách hạng mục cụ thể. Yêu cầu ngoài phạm vi sẽ được trao đổi trước khi thực hiện.'],
  ['Tiến độ minh bạch', 'Kế hoạch được thống nhất sau khi nhận brief, dựa trên nội dung, tài nguyên và thời gian phản hồi.'],
  ['Chỉnh sửa có định hướng', 'Các vòng chỉnh sửa tập trung vào mục tiêu đã thống nhất. Thay đổi lớn sẽ được đánh giá lại.'],
  ['Tài nguyên hợp lệ', 'Khách hàng chịu trách nhiệm về quyền sử dụng logo, hình ảnh và nội dung cung cấp.'],
  ['Domain & hosting', 'Chi phí và phạm vi dịch vụ bên thứ ba sẽ được ghi rõ trong xác nhận dự án.'],
  ['Tôn trọng quyền riêng tư', 'Dự án chỉ được sử dụng làm portfolio khi có sự đồng ý của khách hàng.'],
]

function EditorialPanel({ eyebrow, title, description, metric, metricLabel, children }) {
  return <aside className="information-editorial">
    <div>
      <p className="information-eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p className="information-description">{description}</p>
    </div>
    <div className="information-editorial-footer">
      {metric && <div className="information-metric"><strong>{metric}</strong><span>{metricLabel}</span></div>}
      {children}
    </div>
  </aside>
}

function PromoPanel({ promoCount, onClose }) {
  return <div className="information-layout">
    <EditorialPanel
      eyebrow="Ưu đãi theo từng nhu cầu"
      title="Quyền lợi phù hợp, không phát mã đại trà."
      description="THE KODENAK Studio sẽ tư vấn và gửi mã phù hợp với đối tượng, nhu cầu và điều kiện dự án của bạn."
      metric={promoCount || benefits.length}
      metricLabel="chương trình đang áp dụng"
    >
      <a className="information-cta" href="#lien-he" onClick={onClose}>Nhận mã phù hợp <span>→</span></a>
    </EditorialPanel>
    <div className="information-content information-promo-grid">
      {benefits.map(([title, text], index) => <article className="information-card information-promo-card" key={title}>
        <span className="information-number">{String(index + 1).padStart(2, '0')}</span>
        <div><h4>{title}</h4><p>{text}</p></div>
      </article>)}
    </div>
  </div>
}

function FaqPanel({ faqs, error }) {
  const [openFaq, setOpenFaq] = useState(null)

  return <div className="information-layout">
    <EditorialPanel
      eyebrow="Giải đáp nhanh"
      title="Hiểu rõ trước khi bắt đầu."
      description="Những điều khách hàng thường muốn biết trước khi bắt đầu một website."
      metric={faqs.length || '—'}
      metricLabel="câu trả lời từ THE KODENAK Studio"
    />
    <div className="information-content information-faq-list">
      {error ? <p className="information-state">{error}</p> : faqs.length ? faqs.map((faq, index) => {
        const isOpen = openFaq === faq.id
        return <article className={`information-faq-item${isOpen ? ' is-open' : ''}`} key={faq.id}>
          <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : faq.id)}>
            <span className="information-number">{String(index + 1).padStart(2, '0')}</span>
            <strong>{faq.question}</strong>
            <i aria-hidden="true"><span /><span /></i>
          </button>
          <div className="information-faq-answer" aria-hidden={!isOpen}><div><p>{faq.answer}</p></div></div>
        </article>
      }) : <p className="information-state">Chưa có câu hỏi thường gặp.</p>}
    </div>
  </div>
}

function PolicyPanel() {
  return <div className="information-layout">
    <EditorialPanel
      eyebrow="Cam kết làm việc"
      title="Rõ ràng từ đầu. An tâm đồng hành."
      description="Các nguyên tắc giúp hai bên cùng hiểu cách một dự án được triển khai."
      metric={policies.length}
      metricLabel="nguyên tắc đồng hành"
    />
    <div className="information-content information-policy-grid">
      {policies.map(([title, text], index) => <article className="information-card information-policy-card" key={title}>
        <span className="information-number">{String(index + 1).padStart(2, '0')}</span>
        <div><h4>{title}</h4><p>{text}</p></div>
      </article>)}
    </div>
  </div>
}

export default function PublicInfoModal({ initialTab = 'promo', onClose }) {
  const [active, setActive] = useState(initialTab)
  const [promoCount, setPromoCount] = useState(0)
  const [faqs, setFaqs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const close = (event) => event.key === 'Escape' && onClose()
    addEventListener('keydown', close)
    Promise.all([api('/promo'), api('/faqs')])
      .then(([promoData, faqData]) => {
        setPromoCount(promoData.promoCodes?.length || 0)
        setFaqs(faqData.faqs || [])
      })
      .catch(() => setError('Chưa thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.'))
    return () => {
      document.body.style.overflow = previous
      removeEventListener('keydown', close)
    }
  }, [onClose])

  return <div className="public-modal-layer">
    <button className="public-modal-backdrop" type="button" aria-label="Đóng cửa sổ thông tin" onClick={onClose} />
    <section className="public-modal" role="dialog" aria-modal="true" aria-labelledby="public-modal-title">
      <header className="public-modal-head">
        <div><span>THE KODENAK Studio · INFORMATION</span><h2 id="public-modal-title">Thông tin dành cho bạn</h2></div>
        <button className="public-modal-close" type="button" onClick={onClose} aria-label="Đóng"><span aria-hidden="true">×</span></button>
      </header>
      <nav className="public-modal-tabs" aria-label="Danh mục thông tin">
        {tabs.map(([value, label]) => <button className={active === value ? 'active' : ''} type="button" key={value} onClick={() => setActive(value)}>{label}</button>)}
      </nav>
      <div className="public-modal-body">
        {active === 'promo' && <PromoPanel promoCount={promoCount} onClose={onClose} />}
        {active === 'faq' && <FaqPanel faqs={faqs} error={error} />}
        {active === 'policy' && <PolicyPanel />}
      </div>
    </section>
  </div>
}
