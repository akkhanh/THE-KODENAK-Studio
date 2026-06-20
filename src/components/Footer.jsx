import { useEffect, useState } from 'react'
import { api } from '../api'
import './Footer.css'

const serviceLinks = [
  {
    title: 'Dịch vụ',
    links: [
      ['Personal Landing Page', '#dich-vu'],
      ['Business Landing Page', '#dich-vu'],
      ['Small Business Website', '#dich-vu'],
    ],
  },
  {
    title: 'Thông tin',
    links: [
      ['Quy trình làm việc', '#quy-trinh'],
      ['Ưu đãi', '#info-promo', 'promo'],
      ['FAQ', '#info-faq', 'faq'],
      ['Chính sách dịch vụ', '#info-policy', 'policy'],
    ],
  },
]

export default function Footer({ onOpenInfo }) {
  const [settings, setSettings] = useState({ brandName: 'THE KODENAK Studio', tagline: 'Your idea. Our code.', contactEmail: 'hello@thekodenak.com', facebookUrl: '#', zaloUrl: '#', locationText: 'Việt Nam / Remote', footerDescription: 'Websites for individuals, students, freelancers, and small businesses.' })
  useEffect(() => { api('/settings').then((data) => data.settings && setSettings((current) => ({ ...current, ...data.settings }))).catch(() => {}) }, [])
  const columns = [serviceLinks[0], { title: 'Liên hệ', links: [[`Email: ${settings.contactEmail}`, `mailto:${settings.contactEmail}`], ['Facebook', settings.facebookUrl || '#'], ['Zalo', settings.zaloUrl || '#'], [`Khu vực: ${settings.locationText}`, '#lien-he']] }, serviceLinks[1]]
  return <footer className="footer"><div className="container footer-card">
    <div className="footer-columns">
      <div className="footer-brand"><a className="logo" href="#top">{settings.brandName}</a><p>{settings.footerDescription}</p><strong>{settings.tagline}</strong></div>
      {columns.map((column) => <nav className="footer-column" aria-label={column.title} key={column.title}><h3>{column.title}</h3>{column.links.map(([label, href, tab]) => tab ? <button type="button" key={label} onClick={() => onOpenInfo(tab)}>{label}</button> : <a href={href} key={label}>{label}</a>)}</nav>)}
    </div>
    <div className="footer-bottom"><p>© 2026 THE KODENAK Studio. All rights reserved.</p><p>Built with care by THE KODENAK Studio.</p></div>
  </div></footer>
}
