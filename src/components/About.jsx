const values = [
  ['Rõ ràng', 'Quy trình, chi phí và nội dung đều được trao đổi minh bạch.'],
  ['Hiện đại', 'Thiết kế có thẩm mỹ, phù hợp xu hướng và đúng tinh thần thương hiệu.'],
  ['Dễ sử dụng', 'Trải nghiệm đơn giản, tải nhanh và hoạt động tốt trên mọi thiết bị.'],
]

import './About.css'

export default function About() {
  return <section className="section about" id="gioi-thieu"><div className="container">
    <div className="about-intro"><div><p className="eyebrow">The studio</p><h2>Về THE KODENAK Studio</h2></div><p>THE KODENAK Studio là một studio phát triển website tập trung vào các sản phẩm đơn giản, hiệu quả và dễ sử dụng. Mục tiêu của THE KODENAK Studio là giúp cá nhân và doanh nghiệp nhỏ có một hình ảnh chuyên nghiệp trên Internet với chi phí phù hợp.</p></div>
    <div className="value-grid">{values.map(([title, text], i) => <article className="value-card" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>
}
