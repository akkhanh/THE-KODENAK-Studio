# THE KODENAK full-stack MVP

React/Vite frontend with an Express, PostgreSQL, Prisma and JWT backend. Package prices, promo discounts and 30%/70% payment calculations are enforced by the API. Payment remains manual bank transfer only.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Install

```powershell
npm install
cd server
npm install
npm run prisma:generate
```

The existing React app remains at the repository root. Backend code and dependencies are isolated in `server/`.

## PostgreSQL setup

Start PostgreSQL, then create a database using your PostgreSQL superuser:

```powershell
psql -U postgres -c "CREATE DATABASE the_kodenak;"
```

Copy `server/.env.example` to `server/.env` and enter the real PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/the_kodenak?schema=public"
JWT_SECRET=use-a-long-random-production-secret
PORT=5000
CLIENT_URL=http://localhost:5173
ADMIN_NAME=THE KODENAK Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=0900000000
ADMIN_PASSWORD=Admin123456
```

Do not commit `server/.env`.

## Migration and seed

From `server/`:

```powershell
npm run prisma:migrate
npm run prisma:seed
```

The checked-in migrations create all tables, enums, indexes and relations. If the PostgreSQL role cannot create Prisma's shadow database, use `npx prisma migrate deploy` instead of `prisma migrate dev`. The idempotent seed creates or updates the admin, three packages, four promo codes, default FAQs and website settings. Public registration always creates a CUSTOMER, even if a client sends another role.

Admin login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`.

## Run

Use two terminals from the repository root:

```powershell
npm run dev:server
```

```powershell
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:5000`  
Health check: `GET /api/health`

## API

Public:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/packages`
- `GET /api/packages/:id`
- `POST /api/promo/validate`
- `GET /api/faqs`
- `GET /api/settings` (bank fields are intentionally excluded)

Authenticated customer (`Authorization: Bearer <token>`):

- `GET /api/auth/me`
- `PATCH /api/auth/me` (update name and phone)
- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders/my/:id`
- `POST /api/orders/:orderId/brief`
- `GET /api/orders/:orderId/brief`

ADMIN only:

- `GET /api/admin/summary`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `GET /api/admin/payments`
- `GET /api/admin/customers`
- `GET /api/admin/briefs`
- `GET /api/admin/analytics`
- `PATCH /api/admin/orders/:id/payment-status`
- `PATCH /api/admin/orders/:id/project-status`
- `PATCH /api/admin/orders/:id/note`
- `PATCH /api/admin/orders/:id/cancel`
- `PATCH /api/admin/orders/:id/complete`
- `GET|POST /api/admin/packages`
- `GET|PATCH /api/admin/packages/:id`
- `PATCH /api/admin/packages/:id/toggle-active`
- `GET|POST /api/admin/promo-codes`
- `GET|PATCH /api/admin/promo-codes/:id`
- `PATCH /api/admin/promo-codes/:id/toggle-active`
- `GET|PATCH /api/admin/customers/:id`
- `GET /api/admin/customers/:id/orders`
- `PATCH /api/admin/customers/:id/toggle-active`
- `GET /api/admin/briefs/:id`
- `PATCH /api/admin/briefs/:id/review`
- `PATCH /api/admin/briefs/:id/note`
- `GET|POST /api/admin/faqs`
- `GET|PATCH /api/admin/faqs/:id`
- `PATCH /api/admin/faqs/:id/toggle-active`
- `GET|PATCH /api/admin/settings`

## Admin CRUD permissions

- Packages, promo codes and FAQs use active/inactive toggles; no DELETE endpoints are exposed.
- Orders can be cancelled or completed, never hard-deleted through the API. Historical prices are immutable.
- Customer admins can edit name/phone and lock/unlock accounts, but cannot edit passwords or create ADMIN accounts.
- Brief customer content is preserved; admins can add a separate note and review flag.
- Promo usage is claimed in the same transaction as order creation and increments only when the order succeeds.
- Website bank information is returned only inside the authenticated order/payment flow, never in the public settings response or footer.

## Test flow

1. Migrate and seed PostgreSQL.
2. Start backend and frontend.
3. Register a customer and confirm its role is `CUSTOMER`.
4. Choose Business Landing Page and apply `FIRST30`.
5. Confirm 840,000₫ final, 252,000₫ deposit and 588,000₫ remaining.
6. Create the order and submit its project brief.
7. Log in as the seeded admin, view the brief, update statuses and save an internal note.
8. Run `npm run build` from the repository root.

Admin frontend routes use hash navigation:

- `#admin`
- `#admin/orders` and `#admin/orders/:id`
- `#admin/customers`
- `#admin/packages`
- `#admin/promo-codes`
- `#admin/payments`
- `#admin/briefs`
- `#admin/faqs`
- `#admin/analytics`
- `#admin/settings`

Customer Portal routes use the same hash navigation:

- `#customer` (overview)
- `#customer/packages`
- `#customer/orders` and `#customer/orders/:id`
- `#customer/payments`
- `#customer/briefs`
- `#customer/account`

Customer order endpoints enforce ownership and do not expose admin or payment notes. Brief responses also exclude the internal admin review note.

Run `cd server && npm run test:admin` for a PostgreSQL-backed smoke test covering customer profile updates, order ownership/private fields, packages, promo validation/usage, order creation, briefs, FAQs, settings, payments and admin analytics. Temporary records are removed after the test.

## Production follow-ups

- Add rate limiting, email/phone verification, password reset, refresh-token rotation and audit logs.
- Add request-schema validation and PostgreSQL-backed automated integration tests.
- Replace placeholder bank details and add proof-of-transfer uploads.
- Prefer secure HTTP-only cookies over local storage when deployment topology permits.
