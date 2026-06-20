import { formatMoney, SERVICES } from '../data/services'
import './Services.css'

export default function Services({ onSelect, services = SERVICES, apiError = '' }) {
  return <section className="section services" id="dich-vu"><div className="container">
    <div className="section-heading"><p className="eyebrow">Dịch vụ</p><h2>Dịch vụ của THE KODENAK Studio</h2><p>Những giải pháp website vừa đủ cho mục tiêu của bạn — rõ ràng, đẹp mắt và dễ vận hành.</p></div>
    {apiError && <p className="api-warning">{apiError}</p>}
    <div className="service-grid">{services.map((service, index) => <article className={`card service-card${service.featured || service.slug === 'business-landing-page' ? ' featured' : ''}`} key={service.id}>
      <div className="card-top"><span className="card-number">{service.number || `0${index + 1}`}</span>{(service.featured || service.slug === 'business-landing-page') && <span className="popular-label">Phổ biến</span>}</div>
      <h3>{service.name || service.title}</h3><p>{service.description || service.audience}</p><p className="price">{formatMoney(service.price)}</p>
      <ul>{(service.features || []).map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <button className="text-link service-select" type="button" onClick={() => onSelect(service)}>Chọn gói này <span aria-hidden="true">→</span></button>
    </article>)}</div>
  </div></section>
}
