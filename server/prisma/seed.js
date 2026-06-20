import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const packages = [
  { name: 'Personal Landing Page', slug: 'personal-landing-page', description: 'Website portfolio chuyên nghiệp cho sinh viên, freelancer và cá nhân.', price: 600000, features: ['Website một trang', 'Giới thiệu cá nhân, kỹ năng và dự án', 'Thông tin liên hệ', 'Tối ưu điện thoại'], isActive: true, displayOrder: 1 },
  { name: 'Business Landing Page', slug: 'business-landing-page', description: 'Landing page giới thiệu thương hiệu cho hộ kinh doanh nhỏ.', price: 1200000, features: ['Giới thiệu thương hiệu', 'Sản phẩm/dịch vụ', 'Menu/bảng giá', 'Google Maps', 'Nút gọi điện/Zalo'], isActive: true, displayOrder: 2 },
  { name: 'Small Business Website', slug: 'small-business-website', description: 'Website đầy đủ cho cửa hàng cần giới thiệu dịch vụ và nhận liên hệ.', price: 2500000, features: ['Trang chủ', 'Trang giới thiệu', 'Trang dịch vụ/sản phẩm', 'Form liên hệ', 'Hỗ trợ sau bàn giao'], isActive: true, displayOrder: 3 },
]
const promoCodes = [
  { code: 'FIRST30', description: 'Ưu đãi 30% cho khách hàng đầu tiên', discountType: 'PERCENT', discountValue: 30 },
  { code: 'STUDENT20', description: 'Ưu đãi 20% cho sinh viên', discountType: 'PERCENT', discountValue: 20 },
  { code: 'FRIEND25', description: 'Ưu đãi 25% cho người quen', discountType: 'PERCENT', discountValue: 25 },
  { code: 'PORTFOLIO50', description: 'Ưu đãi 50% khi đồng ý sử dụng dự án làm portfolio và để lại feedback', discountType: 'PERCENT', discountValue: 50 },
]
const faqs = [
  ['THE KODENAK Studio làm website trong bao lâu?', 'Thời gian phụ thuộc phạm vi dự án; kế hoạch cụ thể được xác nhận sau khi nhận brief.'],
  ['Tôi cần chuẩn bị gì trước khi đặt gói?', 'Bạn nên chuẩn bị mục tiêu website, nội dung chính, hình ảnh và các website tham khảo nếu có.'],
  ['Có hỗ trợ chỉnh sửa sau bàn giao không?', 'Có. Phạm vi và thời gian hỗ trợ được thống nhất trong chính sách của từng gói.'],
  ['Có thể dùng mã khuyến mãi không?', 'Có thể áp dụng một mã hợp lệ cho mỗi đơn trước khi tạo đơn dịch vụ.'],
  ['Dịch vụ có bao gồm domain và hosting không?', 'Domain và hosting được báo riêng nếu gói dịch vụ không ghi rõ đã bao gồm.'],
  ['Dịch vụ có bao gồm các khoản phí liên quan tới pháp luật chưa?', 'chưa á, nếu bạn cần tư vấn về pháp luật, hãy liên hệ trực tiếp để được hỗ trợ.'],
]

async function seed() {
  for (const servicePackage of packages) await prisma.servicePackage.upsert({ where: { slug: servicePackage.slug }, create: servicePackage, update: servicePackage })
  for (const promoCode of promoCodes) await prisma.promoCode.upsert({ where: { code: promoCode.code }, create: promoCode, update: promoCode })
  for (const [index, [question, answer]] of faqs.entries()) {
    const existing = await prisma.fAQItem.findFirst({ where: { question } })
    if (existing) await prisma.fAQItem.update({ where: { id: existing.id }, data: { answer, displayOrder: index + 1 } })
    else await prisma.fAQItem.create({ data: { question, answer, category: 'Chung', displayOrder: index + 1 } })
  }
  await prisma.websiteSetting.upsert({ where: { id: 'main' }, create: { id: 'main' }, update: {} })
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env
  if ([ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD].every(Boolean)) {
    if (ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must contain at least 8 characters')
    const email = ADMIN_EMAIL.trim().toLowerCase()
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
    await prisma.user.upsert({ where: { email }, create: { name: ADMIN_NAME.trim(), email, phone: ADMIN_PHONE.trim(), passwordHash, role: 'ADMIN' }, update: { name: ADMIN_NAME.trim(), phone: ADMIN_PHONE.trim(), passwordHash, role: 'ADMIN' } })
    console.log(`Admin seeded: ${email}`)
  } else console.log('Admin skipped: set all ADMIN_* variables to create/update it.')
  console.log('Service packages, promo codes, FAQs and website settings seeded.')
}

seed().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
