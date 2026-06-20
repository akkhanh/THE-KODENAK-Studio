import './Contact.css'

export default function Contact() {
  return <section className="section contact" id="lien-he"><div className="container contact-card">
    <p className="eyebrow">Let’s build something good</p><h2>Sẵn sàng đưa ý tưởng của bạn lên Internet?</h2>
    <p>Liên hệ THE KODENAK Studio để được tư vấn website phù hợp với nhu cầu và ngân sách của bạn.</p>
    <div className="button-row contact-actions"><a className="button button-light" href="mailto:hello@thekodenak.com?subject=Tư%20vấn%20website">Bắt đầu ngay <span aria-hidden="true">→</span></a><a className="button button-outline-light" href="https://facebook.com/thekodenak" target="_blank" rel="noreferrer">Liên hệ qua Facebook</a><a className="button button-outline-light" href="mailto:hello@thekodenak.com">Gửi email</a></div>
  </div></section>
}
