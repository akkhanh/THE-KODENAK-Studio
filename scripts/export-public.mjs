import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const source = await readFile(resolve(dist, 'index.html'), 'utf8')
const cssMatch = source.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)
const jsMatch = source.match(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/)

if (!cssMatch || !jsMatch) throw new Error('Không tìm thấy CSS/JS trong dist/index.html. Hãy chạy npm run build trước.')

const assetPath = (url) => resolve(dist, url.replace(/^\//, ''))
const [css, js] = await Promise.all([readFile(assetPath(cssMatch[1]), 'utf8'), readFile(assetPath(jsMatch[1]), 'utf8')])
const fallback = {
  packages: { packages: [
    { id: 'personal-landing-page', name: 'Personal Landing Page', slug: 'personal-landing-page', description: 'Website portfolio chuyên nghiệp cho sinh viên, freelancer và cá nhân.', price: 600000, features: ['Website một trang', 'Giới thiệu cá nhân, kỹ năng và dự án', 'Thông tin liên hệ', 'Tối ưu điện thoại'], isActive: true },
    { id: 'business-landing-page', name: 'Business Landing Page', slug: 'business-landing-page', description: 'Landing page giới thiệu thương hiệu cho hộ kinh doanh nhỏ.', price: 1200000, features: ['Giới thiệu thương hiệu', 'Sản phẩm/dịch vụ', 'Menu/bảng giá', 'Google Maps', 'Nút gọi điện/Zalo'], isActive: true },
    { id: 'small-business-website', name: 'Small Business Website', slug: 'small-business-website', description: 'Website đầy đủ cho cửa hàng cần giới thiệu dịch vụ và nhận liên hệ.', price: 2500000, features: ['Trang chủ', 'Trang giới thiệu', 'Trang dịch vụ/sản phẩm', 'Form liên hệ', 'Hỗ trợ sau bàn giao'], isActive: true },
  ] },
  promo: { promoCodes: [{ code: 'REFERENCE', description: 'Public reference promotion', discountType: 'PERCENT', discountValue: 0, expiresAt: null }] },
  faqs: { faqs: [
    { id: 'faq-1', question: 'THE KODENAK làm website trong bao lâu?', answer: 'Thời gian phụ thuộc phạm vi dự án; kế hoạch cụ thể được xác nhận sau khi nhận brief.' },
    { id: 'faq-2', question: 'Tôi cần chuẩn bị gì trước khi đặt gói?', answer: 'Bạn nên chuẩn bị mục tiêu website, nội dung chính, hình ảnh và website tham khảo nếu có.' },
    { id: 'faq-3', question: 'Có hỗ trợ chỉnh sửa sau bàn giao không?', answer: 'Có. Phạm vi và thời gian hỗ trợ được thống nhất theo từng gói.' },
    { id: 'faq-4', question: 'Có thể dùng mã khuyến mãi không?', answer: 'Có thể áp dụng một mã hợp lệ cho mỗi đơn trước khi tạo đơn dịch vụ.' },
    { id: 'faq-5', question: 'Dịch vụ có bao gồm domain và hosting không?', answer: 'Domain và hosting được báo riêng nếu mô tả gói không ghi rõ đã bao gồm.' },
  ] },
  settings: { settings: { brandName: 'THE KODENAK', tagline: 'Your idea. Our code.', contactEmail: 'hello@thekodenak.com', facebookUrl: '#', zaloUrl: '#', locationText: 'Việt Nam / Remote', footerDescription: 'Websites for individuals, students, freelancers, and small businesses.' } },
}
const apiData = {}
for (const key of Object.keys(fallback)) {
  try {
    const response = await fetch(`http://localhost:5000/api/${key === 'promo' ? 'promo' : key}`)
    apiData[key] = response.ok ? await response.json() : fallback[key]
  } catch { apiData[key] = fallback[key] }
}
const safeData = JSON.stringify(apiData).replaceAll('</script', '<\\/script')
const dataShim = `<script>
window.__THE_KODENAK_REFERENCE_DATA__=${safeData};
const __referenceFetch=window.fetch.bind(window);
window.fetch=(input,options)=>{
  const url=String(input);
  const key=url.endsWith('/api/packages')?'packages':url.endsWith('/api/promo')?'promo':url.endsWith('/api/faqs')?'faqs':url.endsWith('/api/settings')?'settings':null;
  if(key&&!options?.method) return Promise.resolve(new Response(JSON.stringify(window.__THE_KODENAK_REFERENCE_DATA__[key]),{status:200,headers:{'Content-Type':'application/json'}}));
  return __referenceFetch(input,options);
};
</script>`
const note = `<!--
  THE KODENAK public-page visual reference
  Generated from the current React production build.
  Open this file in a browser or provide it to another design-review AI.
  Dynamic API data may use frontend fallback content when localhost:5000 is unavailable.
-->
`

const standalone = note + source
  .replace(cssMatch[0], `<style>\n${css}\n</style>`)
  .replace(jsMatch[0], `${dataShim}\n<script type="module">\n${js}\n</script>`)
  .replace('<title>', '<title>Public Reference · ')

const output = resolve(root, 'THE_KODENAK_PUBLIC_REFERENCE.html')
await writeFile(output, standalone, 'utf8')
console.log(`Exported: ${output}`)
