import { useCallback, useEffect, useMemo, useState } from 'react'
import './CustomerPortal.css'
import { api } from '../../api'
import CustomerLayout from './CustomerLayout'

const money = (value = 0) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
const date = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value))
const paymentLabels = { UNPAID: 'Chưa thanh toán', DEPOSIT_PENDING: 'Chờ xác nhận cọc', DEPOSIT_PAID: 'Đã thanh toán cọc', FINAL_PAYMENT_PENDING: 'Chờ thanh toán cuối', FULLY_PAID: 'Đã thanh toán đủ', CANCELLED: 'Đã hủy' }
const projectLabels = { WAITING_DEPOSIT: 'Chờ cọc', WAITING_BRIEF: 'Chờ brief', BRIEF_SUBMITTED: 'Đã gửi brief', REVIEWING: 'Đang xem xét', IN_PROGRESS: 'Đang thực hiện', WAITING_FEEDBACK: 'Chờ phản hồi', WAITING_FINAL_PAYMENT: 'Chờ thanh toán cuối', READY_TO_DELIVER: 'Sẵn sàng bàn giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' }
const titles = {
  customer: ['Tổng quan', 'Mọi thông tin dự án của bạn trong một nơi.'],
  'customer/packages': ['Gói dịch vụ', 'Chọn giải pháp phù hợp để bắt đầu dự án mới.'],
  'customer/orders': ['Dự án của tôi', 'Theo dõi tiến độ và chi phí từng dự án.'],
  'customer/payments': ['Thanh toán', 'Theo dõi khoản cọc và số tiền còn lại.'],
  'customer/briefs': ['Brief dự án', 'Gửi thông tin để đội ngũ hiểu đúng ý tưởng của bạn.'],
  'customer/account': ['Tài khoản', 'Cập nhật thông tin liên hệ của bạn.'],
}

function Status({ type, value }) { return <span className={`customer-status ${type} ${value?.toLowerCase()}`}>{type === 'payment' ? paymentLabels[value] : projectLabels[value]}</span> }
function Empty({ title, text, action, onAction }) { return <div className="customer-empty"><span>◇</span><h2>{title}</h2><p>{text}</p>{action && <button className="button" type="button" onClick={onAction}>{action}</button>}</div> }
function PackageCards({ packages, onSelect }) { return <div className="customer-package-grid">{packages.filter((item) => item.isActive !== false).map((item) => <article className="customer-package" key={item.id}><p className="customer-kicker">Gói dịch vụ</p><h2>{item.name}</h2><p>{item.description}</p><strong>{money(item.price)}</strong>{item.features?.length > 0 && <ul>{item.features.slice(0, 5).map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>}<button className="button" type="button" onClick={() => onSelect(item)}>Chọn gói này</button></article>)}</div> }
function OrderCard({ order, navigate }) { return <article className="customer-order-card"><div><p>#{order.id.slice(-8).toUpperCase()} · {date(order.createdAt)}</p><h2>{order.packageName}</h2></div><div className="customer-status-row"><Status type="payment" value={order.paymentStatus} /><Status type="project" value={order.projectStatus} /></div><div className="customer-order-money"><span>Giá sau giảm<strong>{money(order.finalPrice)}</strong></span><span>Cọc 30%<strong>{money(order.depositAmount)}</strong></span><span>Còn lại 70%<strong>{money(order.remainingAmount)}</strong></span></div><button className="customer-link" type="button" onClick={() => navigate(`customer/orders/${order.id}`)}>Xem chi tiết →</button></article> }

export default function CustomerPortal({ route, token, user, packages, notice, navigate, onSelect, onBrief, onLogout, onUserUpdated }) {
  const [orders, setOrders] = useState([])
  const [ordersLoading, setLoading] = useState(true)
  const [ordersError, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const currentBase = route.startsWith('customer/orders/') ? 'customer/orders' : route
  const [title, subtitle] = titles[currentBase] || titles.customer
  const loadOrders = useCallback(() => { setLoading(true); setError(''); api('/orders/my', { token }).then((data) => setOrders(data.orders)).catch((err) => setError(err.message)).finally(() => setLoading(false)) }, [token])
  useEffect(() => { loadOrders() }, [loadOrders, route])
  useEffect(() => {
    const id = route.startsWith('customer/orders/') ? route.split('/')[2] : null
    if (!id) { setDetail(null); return }
    setDetail(null); api(`/orders/my/${id}`, { token }).then(setDetail).catch((err) => setError(err.message))
  }, [route, token])
  const activeOrders = useMemo(() => orders.filter((item) => !['COMPLETED', 'CANCELLED'].includes(item.projectStatus)), [orders])
  const waitingPayment = orders.filter((item) => !['FULLY_PAID', 'CANCELLED'].includes(item.paymentStatus)).length
  const waitingBrief = orders.filter((item) => !item.brief && !['COMPLETED', 'CANCELLED'].includes(item.projectStatus)).length
  const completed = orders.filter((item) => item.projectStatus === 'COMPLETED').length

  const needsOrders = !['customer/packages', 'customer/account'].includes(route)
  const loading = needsOrders && ordersLoading
  const error = needsOrders ? ordersError : ''
  let content
  if (loading) content = <div className="customer-loading">Đang tải dữ liệu của bạn…</div>
  else if (error) content = <div className="customer-alert error">{error}</div>
  else if (route === 'customer') content = <><section className="customer-welcome"><div><p className="customer-kicker">Không gian dự án của bạn</p><h2>Xin chào, {user.name}</h2><p>Quản lý dự án website, thanh toán và brief của bạn tại THE KODENAK Studio.</p><div className="customer-quick-actions"><button className="button" type="button" onClick={() => navigate('customer/packages')}>Đặt gói dịch vụ mới</button><button type="button" onClick={() => navigate('customer/orders')}>Xem dự án của tôi</button><button type="button" onClick={() => navigate('home')}>Về trang chủ</button></div></div></section>{notice && <div className="customer-alert success">{notice}</div>}<div className="customer-stat-grid"><article><span>Tổng dự án</span><strong>{orders.length}</strong></article><article><span>Đang thực hiện</span><strong>{activeOrders.length}</strong></article><article><span>Chờ thanh toán</span><strong>{waitingPayment}</strong></article><article><span>Chờ gửi brief</span><strong>{waitingBrief}</strong></article><article><span>Đã hoàn thành</span><strong>{completed}</strong></article></div><section className="customer-section-head"><div><p className="customer-kicker">Gần đây</p><h2>Dự án của tôi</h2></div>{orders.length > 0 && <button className="customer-link" type="button" onClick={() => navigate('customer/orders')}>Xem tất cả →</button>}</section>{orders.length ? <div className="customer-order-list">{orders.slice(0, 3).map((order) => <OrderCard key={order.id} order={order} navigate={navigate} />)}</div> : <><Empty title="Bạn chưa có dự án nào" text="Hãy chọn một gói dịch vụ phù hợp để bắt đầu." action="Khám phá gói dịch vụ" onAction={() => navigate('customer/packages')} /><section className="customer-section-head"><h2>Gói dành cho bạn</h2></section><PackageCards packages={packages} onSelect={onSelect} /></>}</>
  else if (route === 'customer/packages') content = packages.length ? <PackageCards packages={packages} onSelect={onSelect} /> : <Empty title="Chưa có gói dịch vụ" text="Các gói mới sẽ sớm được cập nhật." />
  else if (route === 'customer/orders') content = orders.length ? <div className="customer-order-list">{orders.map((order) => <OrderCard key={order.id} order={order} navigate={navigate} />)}</div> : <><Empty title="Chưa có dự án" text="Khi tạo đơn, dự án sẽ xuất hiện ở đây." action="Chọn gói dịch vụ" onAction={() => navigate('customer/packages')} /><section className="customer-section-head"><h2>Gói dịch vụ gợi ý</h2></section><PackageCards packages={packages} onSelect={onSelect} /></>
  else if (route.startsWith('customer/orders/')) content = detail ? <OrderDetail data={detail} navigate={navigate} onBrief={onBrief} /> : <div className="customer-loading">Đang tải chi tiết dự án…</div>
  else if (route === 'customer/payments') content = orders.length ? <div className="customer-order-list">{orders.map((order) => <article className="customer-payment-card" key={order.id}><div><p>{order.packageName}</p><Status type="payment" value={order.paymentStatus} /></div><div><span>Giá sau giảm<strong>{money(order.finalPrice)}</strong></span><span>Cọc 30%<strong>{money(order.depositAmount)}</strong></span><span>Còn lại 70%<strong>{money(order.remainingAmount)}</strong></span></div><small>Thanh toán thủ công · Admin xác nhận sau khi nhận chuyển khoản.</small><button className="customer-link" type="button" onClick={() => navigate(`customer/orders/${order.id}`)}>Xem chi tiết thanh toán →</button></article>)}</div> : <Empty title="Chưa có khoản thanh toán" text="Thông tin thanh toán sẽ xuất hiện sau khi bạn tạo dự án." />
  else if (route === 'customer/briefs') content = orders.length ? <div className="customer-order-list">{orders.map((order) => <article className="customer-brief-card" key={order.id}><div><p>Dự án</p><h2>{order.packageName}</h2><small>#{order.id.slice(-8).toUpperCase()}</small></div>{order.brief ? <><span className="customer-status project brief_submitted">Đã gửi brief</span><p><strong>{order.brief.businessName}</strong><br />{order.brief.websiteGoal}<br />{order.brief.projectDescription}<br /><small>Gửi ngày {date(order.brief.createdAt)}</small></p><div className="customer-brief-actions"><button className="customer-link" type="button" onClick={() => navigate(`customer/orders/${order.id}`)}>Xem brief →</button>{!['CANCELLED', 'COMPLETED'].includes(order.projectStatus) && <button className="button small" type="button" onClick={() => onBrief(order)}>Chỉnh sửa brief</button>}</div></> : <><span className="customer-status project waiting_brief">Chưa gửi brief</span><p>Cho chúng mình biết mục tiêu, phong cách và nội dung bạn mong muốn.</p><button className="button" type="button" disabled={['CANCELLED', 'COMPLETED'].includes(order.projectStatus)} onClick={() => onBrief(order)}>Gửi brief dự án</button></>}</article>)}</div> : <Empty title="Chưa có brief dự án" text="Bạn cần tạo một dự án trước khi gửi brief." action="Chọn gói dịch vụ" onAction={() => navigate('customer/packages')} />
  else if (route === 'customer/account') content = <AccountForm token={token} user={user} onUserUpdated={onUserUpdated} />

  return <CustomerLayout route={route} user={user} navigate={navigate} onLogout={onLogout} title={title} subtitle={subtitle}>{content}</CustomerLayout>
}

function OrderDetail({ data, navigate, onBrief }) {
  const { order, brief, paymentInstructions } = data
  return <><button className="customer-link back" type="button" onClick={() => navigate('customer/orders')}>← Quay lại dự án</button><div className="customer-detail-grid"><section className="customer-detail-panel"><p className="customer-kicker">Thông tin dự án</p><h2>{order.packageName}</h2><div className="customer-status-row"><Status type="payment" value={order.paymentStatus} /><Status type="project" value={order.projectStatus} /></div><dl><div><dt>Ngày tạo</dt><dd>{date(order.createdAt)}</dd></div><div><dt>Giá gốc</dt><dd>{money(order.originalPrice)}</dd></div><div><dt>Mã khuyến mãi</dt><dd>{order.promoCode || 'Không áp dụng'}</dd></div><div><dt>Giảm giá</dt><dd>{order.discountPercent}% · {money(order.discountAmount)}</dd></div><div><dt>Giá sau giảm</dt><dd>{money(order.finalPrice)}</dd></div></dl></section><aside className="customer-detail-panel payment"><p className="customer-kicker">Thanh toán thủ công</p><h2>Cọc 30%: {money(order.depositAmount)}</h2><p>Còn lại 70%: <strong>{money(order.remainingAmount)}</strong></p><div className="customer-bank-note">{paymentInstructions}</div></aside></div><section className="customer-detail-panel customer-detail-brief"><div><p className="customer-kicker">Brief dự án</p><h2>{brief ? 'Brief đã được gửi' : 'Hãy kể cho chúng mình về dự án'}</h2><p>{brief ? `${brief.businessName} · ${brief.websiteGoal}` : 'Brief tốt giúp quá trình thiết kế nhanh và chính xác hơn.'}</p></div>{!['CANCELLED', 'COMPLETED'].includes(order.projectStatus) && <button className="button" type="button" onClick={() => onBrief({...order, brief})}>{brief ? 'Chỉnh sửa brief' : 'Gửi brief dự án'}</button>}</section></>
}

function AccountForm({ token, user, onUserUpdated }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async (event) => { event.preventDefault(); setSaving(true); setMessage(''); try { const result = await api('/auth/me', { method: 'PATCH', token, body: form }); onUserUpdated(result.user); setMessage('Đã cập nhật thông tin tài khoản.') } catch (error) { setMessage(error.message) } finally { setSaving(false) } }
  return <form className="customer-account" onSubmit={submit}><div><p className="customer-kicker">Hồ sơ khách hàng</p><h2>Thông tin liên hệ</h2><p>Email không thể thay đổi tại đây. Liên hệ THE KODENAK Studio nếu bạn cần hỗ trợ.</p></div><label>Họ và tên<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Email<input value={user.email} disabled /></label><label>Số điện thoại<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label>{message && <p className="customer-form-message">{message}</p>}<button className="button" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></form>
}
