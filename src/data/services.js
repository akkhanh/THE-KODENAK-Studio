export const SERVICES = [
  { id: 'personal-landing-page', number: '01', title: 'Personal Landing Page', audience: 'Dành cho sinh viên, freelancer và cá nhân cần portfolio chuyên nghiệp.', price: 600000, features: ['Website một trang', 'Giới thiệu cá nhân, kỹ năng và dự án', 'Thông tin liên hệ', 'Tối ưu điện thoại'] },
  { id: 'business-landing-page', number: '02', title: 'Business Landing Page', audience: 'Dành cho quán cà phê, shop, tiệm tóc, spa và hộ kinh doanh nhỏ.', price: 1200000, featured: true, features: ['Giới thiệu thương hiệu', 'Sản phẩm/dịch vụ', 'Menu/bảng giá', 'Google Maps', 'Nút gọi điện/Zalo'] },
  { id: 'small-business-website', number: '03', title: 'Small Business Website', audience: 'Dành cho cửa hàng cần website đầy đủ hơn để giới thiệu và nhận liên hệ.', price: 2500000, features: ['Trang chủ', 'Trang giới thiệu', 'Trang dịch vụ/sản phẩm', 'Form liên hệ', 'Hỗ trợ sau bàn giao'] },
]

export const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
