import { useState } from 'react'
import './AdminLayout.css'

const items = [
  ['admin', '⌂', 'Tổng quan'], ['admin/orders', '▤', 'Đơn dịch vụ'], ['admin/customers', '♙', 'Khách hàng'],
  ['admin/packages', '◇', 'Gói dịch vụ'], ['admin/promo-codes', '%', 'Mã khuyến mãi'], ['admin/payments', '₫', 'Thanh toán'],
  ['admin/briefs', '▧', 'Brief dự án'], ['admin/faqs', '?', 'FAQ / Chính sách'], ['admin/settings', '⚙', 'Cài đặt website'], ['admin/analytics', '↗', 'Phân tích'],
]

export default function AdminLayout({ route, title, subtitle, user, navigate, onLogout, children, actions }) {
  const [open, setOpen] = useState(false)
  return <div className="admin-app"><aside className={`admin-sidebar${open ? ' open' : ''}`}><div className="admin-brand"><span className="admin-brand-mark">K</span><div><strong>THE KODENAK Studio</strong><small>Admin workspace</small></div><button className="admin-menu-close" onClick={() => setOpen(false)} aria-label="Đóng menu">×</button></div><nav className="admin-nav">{items.map(([path, icon, label]) => <button key={path} className={route === path || (path === 'admin/orders' && route.startsWith('admin/orders/')) ? 'active' : ''} onClick={() => { navigate(path); setOpen(false) }}><span>{icon}</span>{label}</button>)}</nav><div className="admin-profile"><div className="admin-avatar">{user.name.slice(0, 1).toUpperCase()}</div><div><strong>{user.name}</strong><small>{user.email}</small></div></div><button className="admin-logout" onClick={onLogout}><span>↪</span> Đăng xuất</button></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu-toggle" onClick={() => setOpen(true)} aria-label="Mở menu">☰</button><div><p className="admin-kicker">ADMIN CONSOLE</p><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div><div className="admin-top-actions">{actions}<button className="admin-home-button" onClick={() => navigate('home')}>Xem website ↗</button></div></header><main className="admin-content">{children}</main></div>{open && <button className="admin-overlay" aria-label="Đóng menu" onClick={() => setOpen(false)} />}</div>
}
