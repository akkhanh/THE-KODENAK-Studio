# THE KODENAK — API and Database Flow

Tài liệu này mô tả luồng dữ liệu đang chạy thật trong project:

```text
React/Vite frontend
  -> src/api.js (fetch + JWT)
  -> Express API tại http://localhost:5000/api
  -> controller
  -> Prisma Client
  -> PostgreSQL database the_kodenak
```

## 1. Backend server entry file

### Điểm khởi động

- Entry file: `server/src/server.js`.
- Express app và việc mount route nằm tại `server/src/app.js`.
- `server/src/server.js` nạp `.env` bằng `dotenv/config`, kiểm tra cấu hình, gọi `prisma.$connect()`, sau đó mới chạy `app.listen(...)`.
- Port mặc định là `5000`. Có thể đổi bằng biến `PORT`.
- Health check: `GET http://localhost:5000/api/health`.
- CORS chỉ cho phép origin trong `CLIENT_URL`; mặc định là `http://localhost:5173`.

### Environment variables

File mẫu: `server/.env.example`. File chạy local là `server/.env` và không nên commit.

| Biến | Bắt buộc | Mục đích |
|---|---:|---|
| `DATABASE_URL` | Có | Chuỗi kết nối Prisma tới PostgreSQL. Server từ chối khởi động nếu thiếu. |
| `JWT_SECRET` | Có | Ký và xác minh JWT. Server từ chối khởi động nếu thiếu. |
| `PORT` | Không | Port Express, mặc định `5000`. |
| `CLIENT_URL` | Không | Origin frontend được CORS cho phép, mặc định `http://localhost:5173`. |
| `ADMIN_NAME` | Khi seed admin | Tên admin được tạo/cập nhật bởi seed. |
| `ADMIN_EMAIL` | Khi seed admin | Email đăng nhập admin. |
| `ADMIN_PHONE` | Khi seed admin | Số điện thoại admin. |
| `ADMIN_PASSWORD` | Khi seed admin | Mật khẩu admin; seed sẽ hash trước khi lưu. |
| `NODE_ENV` | Không | Điều khiển cách tái sử dụng Prisma Client trong development. |

Ví dụ:

```env
DATABASE_URL="postgresql://kodenak_user:kodenak123@localhost:5432/the_kodenak?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
CLIENT_URL=http://localhost:5173
```

Frontend có thể dùng thêm `VITE_API_URL`; nếu không khai báo thì mặc định là `http://localhost:5000/api`.

## 2. API routes

Tất cả route được mount trong `server/src/app.js`. Endpoint admin dùng cả `requireAuth` và `requireAdmin`. Route order/brief dùng `requireAuth` và controller luôn lọc theo `customerId` của JWT.

### Auth — `server/src/routes/authRoutes.js`

Base path: `/api/auth`

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Tạo tài khoản `CUSTOMER`; không cho public tự tạo `ADMIN`. |
| POST | `/api/auth/login` | Public | Kiểm tra bcrypt password và trả JWT. |
| GET | `/api/auth/me` | Đăng nhập | Lấy user hiện tại từ JWT. |
| PATCH | `/api/auth/me` | Đăng nhập | Sửa tên và số điện thoại; không sửa role. |

### Packages — `server/src/routes/packageRoutes.js`

Base path: `/api/packages`

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/packages` | Public | Danh sách package đang active từ PostgreSQL. |
| GET | `/api/packages/:id` | Public | Chi tiết một package active. |

### Promo — `server/src/routes/promoRoutes.js`

Base path: `/api/promo`

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/promo` | Public | Danh sách mã active, còn hạn và còn lượt để hiển thị trên landing page. |
| POST | `/api/promo/validate` | Public | Chuẩn hóa/kiểm tra code và trả phép tính giảm giá. |

### Customer orders và project briefs — `server/src/routes/orderRoutes.js`

Base path: `/api/orders`. Toàn bộ router yêu cầu JWT.

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/orders` | Tạo đơn từ package trong DB; server tự tính promo, giá cuối, cọc 30% và 70% còn lại. |
| GET | `/api/orders/my` | Lấy các đơn thuộc customer đang đăng nhập. |
| GET | `/api/orders/my/:id` | Lấy chi tiết đúng đơn thuộc customer, kèm brief và hướng dẫn thanh toán. |
| POST | `/api/orders/:orderId/brief` | Tạo/cập nhật brief cho đơn thuộc customer. |
| GET | `/api/orders/:orderId/brief` | Lấy brief của đơn thuộc customer. |

`adminNote`, `paymentNote`, `adminBriefNote` và cờ review nội bộ không được trả trong customer API.

### Public content — `server/src/routes/contentRoutes.js`

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/faqs` | FAQ active. |
| GET | `/api/settings` | Nội dung website/footer công khai; không trả thông tin ngân hàng. |

### Admin — `server/src/routes/adminRoutes.js`

Base path: `/api/admin`. Tất cả endpoint yêu cầu JWT của user có role `ADMIN`.

Tổng quan, đơn và thanh toán:

- `GET /api/admin/summary`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `GET /api/admin/payments`
- `GET /api/admin/analytics`
- `PATCH /api/admin/orders/:id/payment-status`
- `PATCH /api/admin/orders/:id/project-status`
- `PATCH /api/admin/orders/:id/note`
- `PATCH /api/admin/orders/:id/cancel`
- `PATCH /api/admin/orders/:id/complete`

Khách hàng:

- `GET /api/admin/customers`
- `GET /api/admin/customers/:id`
- `PATCH /api/admin/customers/:id`
- `PATCH /api/admin/customers/:id/toggle-active`
- `GET /api/admin/customers/:id/orders`

Packages:

- `GET /api/admin/packages`
- `POST /api/admin/packages`
- `GET /api/admin/packages/:id`
- `PATCH /api/admin/packages/:id`
- `PATCH /api/admin/packages/:id/toggle-active`

Promo codes:

- `GET /api/admin/promo-codes`
- `POST /api/admin/promo-codes`
- `GET /api/admin/promo-codes/:id`
- `PATCH /api/admin/promo-codes/:id`
- `PATCH /api/admin/promo-codes/:id/toggle-active`

Briefs:

- `GET /api/admin/briefs`
- `GET /api/admin/briefs/:id`
- `PATCH /api/admin/briefs/:id/review`
- `PATCH /api/admin/briefs/:id/note`

FAQ và website settings:

- `GET /api/admin/faqs`
- `POST /api/admin/faqs`
- `GET /api/admin/faqs/:id`
- `PATCH /api/admin/faqs/:id`
- `PATCH /api/admin/faqs/:id/toggle-active`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`

## 3. Frontend API connection

### Base URL và helper

- Base URL nằm tại `src/api.js`:

  ```js
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
  ```

- Hàm `api(path, options)` trong cùng file là helper duy nhất gọi `fetch`.
- Helper tự JSON-encode `body`, thêm `Content-Type: application/json`, và thêm `Authorization: Bearer <token>` nếu có token.
- JWT được lưu trong `localStorage` với key `the-kodenak-token`.
- `src/App.jsx` dùng `GET /packages` khi app mở và `GET /auth/me` khi đã có token.

Nếu frontend và backend deploy ở hai domain khác nhau, tạo frontend `.env`:

```env
VITE_API_URL=https://api.example.com/api
```

Sau khi đổi biến `VITE_*`, cần khởi động lại Vite hoặc build lại frontend.

### Component → endpoint

| Frontend file/component | Endpoint đang gọi |
|---|---|
| `src/App.jsx` | `GET /api/packages`, `GET /api/auth/me` |
| `src/components/AuthPage.jsx` | `POST /api/auth/register`, `POST /api/auth/login` |
| `src/components/OrderConfirmation.jsx` | `POST /api/promo/validate`, `POST /api/orders` |
| `src/components/ProjectBriefForm.jsx` | `POST /api/orders/:orderId/brief` |
| `src/components/customer/CustomerPortal.jsx` | `GET /api/orders/my`, `GET /api/orders/my/:id`, `PATCH /api/auth/me` |
| `src/components/Footer.jsx` | `GET /api/settings` |
| `src/components/PublicInfo.jsx` | `GET /api/promo`, `GET /api/faqs` |
| `src/components/admin/AdminDashboard.jsx` | Admin summary, orders, order detail, payments và analytics endpoints. |
| `src/components/admin/AdminCrudPages.jsx` | Admin CRUD cho packages, promos, customers, briefs, FAQs và settings. |

`CustomerPortal` nhận danh sách packages từ `App.jsx`, vì vậy trang `/customer/packages` vẫn hiển thị dữ liệu lấy từ `GET /api/packages`, không phải dữ liệu riêng trong component.

## 4. Database connection

### Prisma configuration

- Prisma schema: `server/prisma/schema.prisma`.
- Prisma Client singleton: `server/src/config/prisma.js`.
- Seed: `server/prisma/seed.js`.
- SQL migrations: `server/prisma/migrations/`.
- Controllers import `prisma` từ `server/src/config/prisma.js` để đọc/ghi database.

Trong schema:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

`DATABASE_URL` được Prisma đọc từ environment. Khi backend chạy từ `server/`, `dotenv/config` nạp `server/.env`; Prisma Client sau đó kết nối tới database được khai báo trong URL.

### Prisma models và PostgreSQL tables

| Prisma model | PostgreSQL table mặc định | Nội dung |
|---|---|---|
| `User` | `User` | Customer/admin, password hash, role và trạng thái tài khoản. |
| `ServicePackage` | `ServicePackage` | Tên gói, giá, mô tả, features và trạng thái active. |
| `PromoCode` | `PromoCode` | Mã giảm giá, loại/mức giảm, giới hạn và số lượt dùng. |
| `ServiceOrder` | `ServiceOrder` | Đơn, snapshot package/price, promo, cọc, số tiền còn lại và trạng thái. |
| `ProjectBrief` | `ProjectBrief` | Brief gắn một-một với ServiceOrder. |
| `FAQItem` | `FAQItem` | FAQ/chính sách hiển thị công khai. |
| `WebsiteSetting` | `WebsiteSetting` | Thương hiệu, liên hệ, footer và thông tin chuyển khoản. |

Các enum PostgreSQL được tạo bởi Prisma: `UserRole`, `PaymentStatus`, `ProjectStatus`, `PaymentMethod`, `DiscountType`.

Prisma Studio và pgAdmin đều thao tác trên cùng PostgreSQL nếu chúng dùng đúng `DATABASE_URL`/database `the_kodenak`. Swagger không phải database manager; nó chỉ mô tả và thử HTTP API, và project hiện chưa cấu hình Swagger.

## 5. Real data verification

### Kiểm tra packages từ browser tới PostgreSQL

1. Chạy backend và frontend.
2. Mở browser DevTools → **Network** → lọc `packages`.
3. Reload trang và mở request `GET http://localhost:5000/api/packages`.
4. Kiểm tra status `200` và JSON có mảng `packages`.
5. Mở pgAdmin → database `the_kodenak` → Schemas → public → Tables → `ServicePackage` → **View/Edit Data → All Rows**.
6. Đổi `name` của một record active rồi lưu. Có thể dùng Query Tool:

   ```sql
   UPDATE "ServicePackage"
   SET "name" = 'Business Landing Page - DB TEST'
   WHERE "slug" = 'business-landing-page';
   ```

7. Reload frontend. Tên mới phải xuất hiện vì frontend gọi lại `/api/packages`.
8. Sau khi kiểm tra, đổi tên về giá trị đúng.

Lưu ý: PostgreSQL table/column do Prisma tạo có chữ hoa, nên SQL trực tiếp phải dùng dấu ngoặc kép như `"ServicePackage"` và `"name"`.

### Kiểm tra order thật

1. Đăng ký/đăng nhập customer.
2. Chọn package, có thể nhập promo, rồi tạo order.
3. Trong DevTools Network, kiểm tra `POST /api/orders` trả `201` và có `order.id`.
4. Trong pgAdmin mở table `ServiceOrder`, hoặc chạy:

   ```sql
   SELECT *
   FROM "ServiceOrder"
   ORDER BY "createdAt" DESC;
   ```

5. Record mới phải có `customerId`, `packageId`, `originalPrice`, `finalPrice`, `depositAmount` và `remainingAmount` giống response API.

Không sửa trực tiếp `finalPrice`, cọc hoặc remaining của order production nếu không thật sự cần: các giá trị này là snapshot lịch sử và bình thường phải do backend tính khi tạo đơn.

## 6. Test and run commands

### Backend

```powershell
cd server
npm install
npm run dev
```

Mở Prisma Studio trong một terminal khác:

```powershell
cd server
npx prisma studio
```

Smoke test PostgreSQL:

```powershell
cd server
npm run test:admin
```

### Frontend

Project hiện **không có thư mục `client/`**; React/Vite nằm ở project root. Vì vậy lệnh đúng là:

```powershell
cd "C:\Users\khanh\Desktop\THE KODENAK"
npm install
npm run dev
npm run build
```

Nếu sau này chuyển React vào `client/`, khi đó mới dùng:

```powershell
cd client
npm run dev
npm run build
```

Không chạy `cd client` trong cấu trúc hiện tại vì thư mục đó chưa tồn tại.

## 7. Hardcoded data and recommendations

Phần business data chính hiện đã dùng PostgreSQL/API:

- Packages trên landing page và Customer Portal lấy từ `/api/packages`.
- Promo validation và phép tính order chạy ở backend.
- Orders, customers, briefs, statuses, FAQs và website settings được lưu trong PostgreSQL.
- Admin CRUD ghi trực tiếp qua API rồi Prisma cập nhật PostgreSQL.

Các phần còn hardcoded hoặc fallback:

1. `src/data/services.js` vẫn chứa ba package tĩnh. `Services.jsx` dùng chúng làm fallback khi chưa nhận được `services` từ API, đồng thời dùng `formatMoney`. Nên tách `formatMoney` sang file utility và thay fallback bằng loading/error UI nếu muốn tuyệt đối không hiển thị dữ liệu giả khi backend offline.
2. Nội dung landing page trong `Hero.jsx`, `About.jsx`, `Process.jsx`, `Portfolio.jsx` và `Contact.jsx` là nội dung marketing tĩnh. Đây không phải dữ liệu giao dịch; chỉ cần chuyển sang API/CMS nếu admin cần chỉnh trên web.
3. Nhãn tiếng Việt cho payment/project status nằm trong frontend constants. Đây là presentation mapping, không phải database data, nên có thể giữ hardcoded.
4. `src/components/Dashboards.jsx` là dashboard cũ và hiện không được `App.jsx` sử dụng; nó vẫn chứa API calls cũ. Có thể xóa trong một đợt cleanup riêng sau khi xác nhận không còn import, nhưng không cần thay đổi business logic lúc này.
5. Base API fallback `http://localhost:5000/api` là hardcoded cho local development. Production nên luôn cấu hình `VITE_API_URL`.

Không nên thay package/order bằng dữ liệu hardcoded. Mọi thay đổi giá, promo và trạng thái nên đi qua admin API để giữ validation và lịch sử; chỉnh trực tiếp bằng pgAdmin chỉ phù hợp cho kiểm tra, sửa dữ liệu có chủ đích hoặc xử lý sự cố.
