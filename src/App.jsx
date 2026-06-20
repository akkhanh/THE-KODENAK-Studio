import { useCallback, useEffect, useState } from 'react'
import { api, TOKEN_KEY } from './api'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Portfolio from './components/Portfolio'
import Process from './components/Process'
import About from './components/About'
import Contact from './components/Contact'
import PublicInfoModal from './components/PublicInfo'
import Footer from './components/Footer'
import OrderConfirmation from './components/OrderConfirmation'
import AuthPage from './components/AuthPage'
import ProjectBriefForm from './components/ProjectBriefForm'
import CustomerPortal from './components/customer/CustomerPortal'
import AdminDashboard from './components/admin/AdminDashboard'

const views = ['order', 'login', 'register', 'brief']
const getView = () => {
  const route = location.hash.slice(1)
  return route === 'admin' || route.startsWith('admin/') || route === 'customer' || route.startsWith('customer/') || views.includes(route) ? route : 'home'
}

export default function App() {
  const [view, setView] = useState(getView)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [packages, setPackages] = useState([])
  const [packageError, setPackageError] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [briefOrder, setBriefOrder] = useState(null)
  const [notice, setNotice] = useState('')
  const [infoModal, setInfoModal] = useState(null)
  const navigate = useCallback((next) => {
    if (next === 'home') {
      history.replaceState(null, '', '#top')
      setView('home')
    } else {
      location.hash = next
      setView(next)
    }
    scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const closeInfoModal = useCallback(() => setInfoModal(null), [])

  useEffect(() => { const handler = () => setView(getView()); addEventListener('hashchange', handler); return () => removeEventListener('hashchange', handler) }, [])
  useEffect(() => { api('/packages').then((data) => setPackages(data.packages)).catch(() => setPackageError('Không thể tải gói dịch vụ từ máy chủ. Hãy kiểm tra backend và dữ liệu seed.')) }, [])
  useEffect(() => { if (!token) return; api('/auth/me', { token }).then((data) => setUser(data.user)).catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null) }) }, [token])
  useEffect(() => { if (user && ['login', 'register'].includes(view)) navigate(user.role === 'ADMIN' ? 'admin' : 'customer') }, [navigate, user, view])
  useEffect(() => { if (!notice) return undefined; const timeout = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(timeout) }, [notice])

  const selectService = (service) => {
    if (!service.id) { setPackageError('Gói dịch vụ chưa sẵn sàng. Hãy khởi động backend và chạy seed.'); return }
    setSelectedService(service)
    if (!user) return navigate('login')
    if (user.role === 'ADMIN') return navigate('admin')
    navigate('order')
  }
  const authenticated = ({ token: nextToken, user: nextUser }) => { localStorage.setItem(TOKEN_KEY, nextToken); setToken(nextToken); setUser(nextUser); navigate(nextUser.role === 'ADMIN' ? 'admin' : selectedService ? 'order' : 'customer') }
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setSelectedService(null); navigate('home') }
  const openBrief = (order) => { setBriefOrder(order); navigate('brief') }

  if ((view === 'login' || view === 'register') && !user) return <AuthPage initialMode={view} onAuthenticated={authenticated} onHome={() => navigate('home')} />
  if (view === 'order' && user?.role === 'CUSTOMER' && selectedService) return <OrderConfirmation service={selectedService} token={token} onBack={() => navigate('customer/packages')} onCreated={(_order, instructions) => { setNotice(instructions); navigate('customer/orders') }} />
  if (view === 'brief' && user?.role === 'CUSTOMER' && briefOrder) return <ProjectBriefForm order={briefOrder} token={token} onBack={() => navigate('customer/briefs')} onDone={() => { setNotice('Brief dự án đã được gửi thành công.'); navigate('customer/briefs') }} />
  if ((view === 'customer' || view.startsWith('customer/')) && user?.role === 'CUSTOMER') return <CustomerPortal route={view} token={token} user={user} packages={packages} notice={notice} navigate={navigate} onSelect={selectService} onBrief={openBrief} onLogout={logout} onUserUpdated={setUser} />
  if ((view === 'admin' || view.startsWith('admin/')) && user?.role === 'ADMIN') return <AdminDashboard route={view} token={token} user={user} navigate={navigate} onLogout={logout} />
  if (view !== 'home' && !user) return <AuthPage onAuthenticated={authenticated} onHome={() => navigate('home')} />

  return <><Header user={user} onOpenInfo={setInfoModal} onAccount={() => navigate(user?.role === 'ADMIN' ? 'admin' : user ? 'customer' : 'login')} /><main><Hero /><Services onSelect={selectService} services={packages.length ? packages : undefined} apiError={packageError} /><Portfolio /><Process /><About /><Contact /></main><Footer onOpenInfo={setInfoModal} />{infoModal && <PublicInfoModal initialTab={infoModal} onClose={closeInfoModal} />}</>
}
