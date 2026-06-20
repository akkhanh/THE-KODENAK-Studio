const keywords = ['Website Design', 'Landing Page', 'Portfolio', 'Small Business']

import './Hero.css'

export default function Hero() {
  return <section className="hero" id="top"><div className="container hero-grid">
    <div className="hero-copy"><p className="eyebrow">THE KODENAK Studio</p><h1>Your idea.<br /><span>Our code.</span></h1>
      <p className="hero-description">THE KODENAK Studio thiết kế website hiện đại, dễ sử dụng và tối ưu trên điện thoại dành cho cá nhân, sinh viên và doanh nghiệp nhỏ.</p>
      <div className="button-row"><a className="button" href="#lien-he">Bắt đầu ngay <span aria-hidden="true">→</span></a><a className="button button-secondary" href="#dich-vu">Xem dịch vụ</a></div>
      <div className="hero-proof" aria-label="Cam kết dịch vụ"><span><strong>Mobile-first</strong>Trên mọi thiết bị</span><span><strong>Rõ ràng</strong>Chi phí minh bạch</span></div>
    </div>
    <div className="hero-visual" aria-label="Các dịch vụ thiết kế website của THE KODENAK Studio">
      <div className="browser-bar"><i /><i /><i /><span>thekodenak.com</span></div>
      <div className="visual-body"><p>We create digital spaces</p><div className="keyword-list">{keywords.map((word, i) => <div key={word}><span>0{i + 1}</span>{word}</div>)}</div></div>
      <div className="floating-badge"><span aria-hidden="true">✓</span> Responsive<br /><strong>by default</strong></div>
    </div>
  </div></section>
}
