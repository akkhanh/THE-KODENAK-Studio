const projects = [
  { title: 'Coffee Shop Website', category: 'F&B', className: 'coffee' },
  { title: 'Rental Room Website', category: 'Real Estate', className: 'rental' },
  { title: 'Personal Portfolio', category: 'Personal Brand', className: 'personal' },
]

import './Portfolio.css'

export default function Portfolio() {
  return <section className="section portfolio" id="portfolio"><div className="container">
    <div className="section-heading split"><div><p className="eyebrow">Selected work</p><h2>Portfolio / Concept Projects</h2></div><p>Ba hướng thiết kế dành cho những nhu cầu thực tế của khách hàng nhỏ.</p></div>
    <div className="portfolio-grid">{projects.map((p, i) => <article className="project-card" key={p.title}>
      <div className={`project-visual ${p.className}`}><div className="mock-browser"><span /><span /><span /></div><div className="mock-content"><i /><b /><b /><em /></div></div>
      <div className="project-meta"><div><span>0{i + 1} / {p.category}</span><h3>{p.title}</h3></div><span className="round-arrow" aria-hidden="true">↗</span></div>
    </article>)}</div>
  </div></section>
}
