CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 'FINAL_PAYMENT_PENDING', 'FULLY_PAID', 'CANCELLED');
CREATE TYPE "ProjectStatus" AS ENUM ('WAITING_DEPOSIT', 'WAITING_BRIEF', 'BRIEF_SUBMITTED', 'REVIEWING', 'IN_PROGRESS', 'WAITING_FEEDBACK', 'WAITING_FINAL_PAYMENT', 'READY_TO_DELIVER', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'MANUAL');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServicePackage" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "features" TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceOrder" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "packageName" TEXT NOT NULL,
  "originalPrice" INTEGER NOT NULL,
  "promoCode" TEXT NOT NULL DEFAULT '',
  "discountPercent" INTEGER NOT NULL DEFAULT 0,
  "discountAmount" INTEGER NOT NULL DEFAULT 0,
  "finalPrice" INTEGER NOT NULL,
  "depositPercent" INTEGER NOT NULL DEFAULT 30,
  "depositAmount" INTEGER NOT NULL,
  "remainingAmount" INTEGER NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "projectStatus" "ProjectStatus" NOT NULL DEFAULT 'WAITING_DEPOSIT',
  "adminNote" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectBrief" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "businessType" TEXT NOT NULL,
  "websiteGoal" TEXT NOT NULL,
  "projectDescription" TEXT NOT NULL,
  "preferredStyle" TEXT NOT NULL DEFAULT '',
  "referenceWebsite" TEXT NOT NULL DEFAULT '',
  "timeline" TEXT NOT NULL DEFAULT '',
  "hasLogo" BOOLEAN NOT NULL DEFAULT false,
  "hasContentReady" BOOLEAN NOT NULL DEFAULT false,
  "customerNote" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectBrief_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ServicePackage_slug_key" ON "ServicePackage"("slug");
CREATE INDEX "ServiceOrder_customerId_idx" ON "ServiceOrder"("customerId");
CREATE INDEX "ServiceOrder_packageId_idx" ON "ServiceOrder"("packageId");
CREATE INDEX "ServiceOrder_createdAt_idx" ON "ServiceOrder"("createdAt");
CREATE UNIQUE INDEX "ProjectBrief_orderId_key" ON "ProjectBrief"("orderId");

ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ServicePackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectBrief" ADD CONSTRAINT "ProjectBrief_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
