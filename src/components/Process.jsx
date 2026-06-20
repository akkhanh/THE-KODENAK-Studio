const steps = ['Nhận nhu cầu', 'Tư vấn giải pháp', 'Báo giá & xác nhận', 'Thiết kế & phát triển', 'Bàn giao & hỗ trợ']

import './Process.css'

export default function Process() {
  return <section className="section process" id="quy-trinh"><div className="container process-grid">
    <div className="section-heading sticky"><p className="eyebrow">Từ ý tưởng đến website</p><h2>Quy trình làm việc</h2><p>Mỗi bước đều minh bạch, gọn gàng và luôn có sự trao đổi cùng bạn.</p></div>
    <ol className="process-list">{steps.map((step, i) => <li key={step}><span>0{i + 1}</span><h3>{step}</h3><i aria-hidden="true">→</i></li>)}</ol>
  </div></section>
}
