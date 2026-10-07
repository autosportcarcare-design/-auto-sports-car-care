# Booking and Enquiry Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real persisted booking, quote, voucher, and B2B enquiry submissions without pretending to provide guaranteed appointment availability.

**Architecture:** Add one minimal Prisma `Enquiry` model with a typed enquiry kind instead of separate duplicated booking/quote tables. Validate requests server-side with Zod, persist them through a dedicated API, and reuse one accessible enquiry form across service, voucher, booking, and B2B entry points.

**Tech Stack:** Prisma 6, PostgreSQL, Next.js Route Handlers, Zod, React 19.

**Spec:** `docs/superpowers/specs/2026-10-07-premium-hybrid-storefront-upgrade-design.md`

## Global Constraints

- No guaranteed appointment slot unless a real availability system exists.
- Confirmation is shown only after the server has persisted the request.
- Do not require login for a basic enquiry.
- Store only necessary contact/vehicle/request information.
- Do not expose internal enquiry status to other customers.

## Review Focus

- Invalid email/phone or empty contact details are rejected server-side.
- Unknown service/voucher slug is not accepted as a verified reference.
- Duplicate form submit does not create uncontrolled repeated records when the same idempotency key is reused.
- Database failure returns a failure message, not success.
- Preferred date is treated as a request, never a confirmed appointment.

---

### Task 1: Enquiry data model and validation

**Files:**
- Modify: `packages/database/prisma/schema.prisma`
- Create: `packages/database/prisma/migrations/20261007050000_add_enquiry/migration.sql`
- Create: `apps/storefront/lib/enquiry-schema.ts`
- Test: `tests/enquiry.mts`

**Interfaces:**
- Produces: Prisma `Enquiry` model and `EnquiryKind` enum; Zod `enquiryInputSchema`.
- Fields: `id String @id @default(cuid())`, `kind EnquiryKind`, `name String`, `email String`, `phone String`, `vehicle String?`, `serviceSlug String?`, `voucherSlug String?`, `preferredDate DateTime?`, `notes String?`, `idempotencyKey String @unique`, `createdAt DateTime @default(now())`.
- `EnquiryKind` exact values: `BOOKING`, `QUOTE`, `VOUCHER`, `B2B`.

- [ ] **Step 1: Add validation tests for required contact information, enum kinds, optional request date, and idempotency key**
- [ ] **Step 2: Run tests and confirm failure**
- [ ] **Step 3: Add schema/model and generate migration**
- [ ] **Step 4: Run `pnpm db:generate` and enquiry tests**
- [ ] **Step 5: Commit**
  `git commit -am "feat: add enquiry data model"`

### Task 2: Enquiry API

**Files:**
- Create: `apps/storefront/app/api/enquiries/route.ts`
- Create: `apps/storefront/lib/enquiry.ts`
- Test: `tests/integration.ts`

**Interfaces:**
- Consumes: `enquiryInputSchema`.
- Produces: `POST /api/enquiries` returning `{ id: string, received: true }` after successful persistence only.

- [ ] **Step 1: Add integration tests for valid request, invalid input, duplicate idempotency key, and database-backed persistence**
- [ ] **Step 2: Run integration test and verify failure**
- [ ] **Step 3: Implement server handler and persistence helper**
- [ ] **Step 4: Run integration tests**
- [ ] **Step 5: Commit**
  `git commit -am "feat: persist customer enquiries"`

### Task 3: Reusable booking/quote form

**Files:**
- Create: `apps/storefront/components/enquiry/enquiry-form.tsx`
- Create: `apps/storefront/app/book/page.tsx`
- Modify: service/voucher/B2B components from the content plan
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: `POST /api/enquiries`.
- Produces: reusable client form with kinds `BOOKING | QUOTE | VOUCHER | B2B`.

- [ ] **Step 1: Add browser tests that submit a real enquiry and wait for a persisted success state**
- [ ] **Step 2: Add browser test proving preferred date copy says requested/preferred, not confirmed**
- [ ] **Step 3: Implement reusable form and wire entry points**
- [ ] **Step 4: Run browser/integration/build checks**
- [ ] **Step 5: Commit**
  `git commit -am "feat: add booking and quote enquiry flow"`
