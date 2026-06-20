import { useEffect, useState } from 'react'
import './Header.css'

const links = [['Dịch vụ', '#dich-vu'], ['Portfolio', '#portfolio'], ['Quy trình', '#quy-trinh'], ['Giới thiệu', '#gioi-thieu']]
const infoLinks = [['Ưu đãi', 'promo'], ['Câu hỏi thường gặp', 'faq'], ['Chính sách dịch vụ', 'policy']]

export default function Header({ user, onAccount, onOpenInfo }) {
  const [open, setOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const closeMenu = () => { setOpen(false); setInfoOpen(false) }

  useEffect(() => {
    const close = (event) => event.key === 'Escape' && closeMenu()
    addEventListener('keydown', close)
    return () => removeEventListener('keydown', close)
  }, [])

  return <header className="site-header"><div className="container header-inner">
    <a className="logo header-logo" href="#top" aria-label="THE KODENAK Studio - Trang chủ"><span>TK</span><strong>THE KODENAK Studio</strong></a>
    <button className={`menu-toggle${open ? ' active' : ''}`} type="button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
    <nav className={open ? 'nav open' : 'nav'} aria-label="Điều hướng chính">
      {links.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
      <div className={`nav-dropdown${infoOpen ? ' open' : ''}`}>
        <button type="button" aria-expanded={infoOpen} onClick={() => setInfoOpen(!infoOpen)}>Thông tin <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></button>
        <div className="nav-dropdown-menu">{infoLinks.map(([label, tab]) => <button key={tab} type="button" onClick={() => { closeMenu(); onOpenInfo(tab) }}>{label}<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></span></button>)}</div>
      </div>
      <a href="#lien-he" onClick={closeMenu}>Liên hệ</a>
      <button className="button button-small nav-account" type="button" onClick={() => { closeMenu(); onAccount() }}>{user ? (user.role === 'ADMIN' ? 'Quản trị' : 'Dự án của tôi') : 'Đăng nhập'}</button>
    </nav>
  </div></header>
}
