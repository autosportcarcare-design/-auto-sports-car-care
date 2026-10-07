CREATE TYPE "EnquiryKind" AS ENUM ('BOOKING', 'QUOTE', 'VOUCHER', 'B2B');
CREATE TABLE "Enquiry" (
  "id" TEXT NOT NULL,
  "kind" "EnquiryKind" NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "vehicle" TEXT,
  "serviceSlug" TEXT,
  "voucherSlug" TEXT,
  "preferredDate" TIMESTAMP(3),
  "notes" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Enquiry_idempotencyKey_key" ON "Enquiry"("idempotencyKey");
CREATE INDEX "Enquiry_kind_createdAt_idx" ON "Enquiry"("kind", "createdAt");
