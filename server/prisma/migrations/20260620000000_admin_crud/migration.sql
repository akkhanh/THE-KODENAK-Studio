CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

ALTER TABLE "User"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

ALTER TABLE "ServicePackage"
  ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "ServiceOrder"
  ADD COLUMN "discountType" "DiscountType",
  ADD COLUMN "discountValue" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "paymentNote" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3);

UPDATE "ServiceOrder"
SET "discountType" = CASE WHEN "promoCode" <> '' THEN 'PERCENT'::"DiscountType" ELSE NULL END,
    "discountValue" = "discountPercent";

ALTER TABLE "ProjectBrief"
  ADD COLUMN "adminBriefNote" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "isReviewed" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENT',
  "discountValue" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "usageLimit" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

CREATE TABLE "FAQItem" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Chung',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FAQItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebsiteSetting" (
  "id" TEXT NOT NULL DEFAULT 'main',
  "brandName" TEXT NOT NULL DEFAULT 'THE KODENAK',
  "tagline" TEXT NOT NULL DEFAULT 'Your idea. Our code.',
  "contactEmail" TEXT NOT NULL DEFAULT 'hello@thekodenak.com',
  "facebookUrl" TEXT NOT NULL DEFAULT '',
  "zaloUrl" TEXT NOT NULL DEFAULT '',
  "locationText" TEXT NOT NULL DEFAULT 'Việt Nam / Remote',
  "bankName" TEXT NOT NULL DEFAULT '',
  "bankAccountName" TEXT NOT NULL DEFAULT '',
  "bankAccountNumber" TEXT NOT NULL DEFAULT '',
  "footerDescription" TEXT NOT NULL DEFAULT 'Websites for individuals, students, freelancers, and small businesses.',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteSetting_pkey" PRIMARY KEY ("id")
);
