import { useState } from 'react'
import './CustomerLayout.css'

const navItems = [
  ['customer', '⌂', 'Tổng quan'],
  ['customer/packages', '◇', 'Gói dịch vụ'],
  ['customer/orders', '▤', 'Dự án của tôi'],
  ['customer/payments', '₫', 'Thanh toán'],
  ['customer/briefs', '✎', 'Brief dự án'],
  ['customer/account', '○', 'Tài khoản'],
]

export default function CustomerLayout({ route, user, navigate, onLogout, title, subtitle, children }) {
  const [open, setOpen] = useState(false)
  const go = (target) => { setOpen(false); navigate(target) }
  return <div className="customer-app">
    <aside className={`customer-sidebar ${open ? 'open' : ''}`}>
      <button className="customer-close" type="button" onClick={() => setOpen(false)}>×</button>
      <button className="customer-brand" type="button" onClick={() => go('home')}><strong>THE KODENAK Studio</strong><span>Customer Portal</span></button>
      <nav>{navItems.map(([target, icon, label]) => <button key={target} className={route === target || (target === 'customer/orders' && route.startsWith('customer/orders/')) ? 'active' : ''} type="button" onClick={() => go(target)}><span>{icon}</span>{label}</button>)}</nav>
      <div className="customer-sidebar-bottom"><button type="button" onClick={() => go('home')}>← Trang chủ</button><button type="button" onClick={onLogout}>Đăng xuất</button></div>
    </aside>
    {open && <button className="customer-overlay" type="button" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
    <div className="customer-main">
      <header className="customer-topbar"><button className="customer-menu" type="button" onClick={() => setOpen(true)}>☰</button><div><p>Xin chào, {user.name}</p><h1>{title}</h1>{subtitle && <span>{subtitle}</span>}</div><button className="customer-avatar" type="button" onClick={() => go('customer/account')}>{user.name?.trim()?.[0]?.toUpperCase() || 'K'}</button></header>
      <main className="customer-content">{children}</main>
    </div>
  </div>
}
