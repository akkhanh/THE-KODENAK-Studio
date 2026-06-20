import { useEffect, useState } from 'react'
import { api } from '../api'
import './AuthPage.css'

export default function AuthPage({ initialMode = 'login', onAuthenticated, onHome }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { setMode(initialMode); setError('') }, [initialMode])
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { onAuthenticated(await api(`/auth/${mode}`, { method: 'POST', body: form })) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  return <main className="auth-page"><div className="auth-shell"><button className="back-link" onClick={onHome}>← Trang chủ</button><section className="auth-card"><a className="logo" href="#top">THE KODENAK Studio</a><p className="eyebrow">{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</p><h1>{mode === 'login' ? 'Chào mừng bạn trở lại' : 'Bắt đầu dự án mới'}</h1>
    <form className="stack-form" onSubmit={submit}>{mode === 'register' && <><label>Họ và tên<input required name="name" value={form.name} onChange={update} /></label><label>Số điện thoại<input required name="phone" value={form.phone} onChange={update} /></label></>}<label>Email<input required type="email" name="email" value={form.email} onChange={update} /></label><label>Mật khẩu<input required minLength="8" type="password" name="password" value={form.password} onChange={update} /></label>{error && <p className="form-message error" role="alert">{error}</p>}<button className="button" disabled={loading}>{loading ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</button></form>
    <p className="auth-switch">{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}</button></p>
  </section></div></main>
}
