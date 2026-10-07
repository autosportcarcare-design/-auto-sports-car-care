# Services and Content Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the complete service, samples/results, gallery, voucher, knowledge, and B2B experience required by the approved hybrid storefront.

**Architecture:** Introduce a typed verified-content registry for editorial/service content while preserving Prisma as the commerce source of truth. Public routes consume shared typed content helpers, making it possible to add verified content without duplicating product price/stock truth.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-07-premium-hybrid-storefront-upgrade-design.md`

## Global Constraints

- Never duplicate Shopify/product price, stock, or variant truth into editorial content.
- Any technical instruction must be marked verified in source content before rendering.
- Omit unavailable facts instead of inventing them.
- Service pages use one reusable template.
- Project stories use Before → Process → Final Result.
- Vouchers are enquiry-first unless a real payment/fulfilment flow is implemented.

## Review Focus

- Unknown service slug returns 404, not a generic fake service.
- Content with no verified technical section does not show invented instructions.
- Voucher without price/terms remains enquiry-only.
- Project with missing process media still presents before/final media cleanly.
- Gallery with no items displays a useful empty state.

---

### Task 1: Typed verified-content registry

**Files:**
- Create: `apps/storefront/lib/content/types.ts`
- Create: `apps/storefront/lib/content/services.ts`
- Create: `apps/storefront/lib/content/projects.ts`
- Create: `apps/storefront/lib/content/vouchers.ts`
- Create: `apps/storefront/lib/content/knowledge.ts`
- Create: `apps/storefront/lib/content/b2b.ts`
- Create: `apps/storefront/lib/content/index.ts`
- Test: `tests/content.mts`

**Interfaces:**
- Produces: `ServiceContent`, `ProjectContent`, `VoucherContent`, `KnowledgeContent`, helper functions `getService(slug)`, `getProject(slug)`, `getVoucher(slug)`, `getKnowledgeArticle(slug)`.
- Service/project types include optional verified relationships `relatedProductSlugs: string[]`, `relatedServiceSlugs: string[]`, and verification/source metadata; absent relationships render nothing.
- Consumes: no commerce data.

- [ ] **Step 1: Add content tests that reject duplicate slugs and require verification flags for technical sections**
- [ ] **Step 2: Run `node --import tsx tests/content.mts` and confirm failure**
- [ ] **Step 3: Implement content types and registries**
  Seed only approved service names and truthful descriptive content; leave unknown price/warranty/compatibility fields absent.
- [ ] **Step 4: Run content tests and typecheck**
- [ ] **Step 5: Commit**
  `git commit -am "feat: add verified service content registry"`

### Task 2: Services index and reusable service detail

**Files:**
- Create: `apps/storefront/app/services/page.tsx`
- Create: `apps/storefront/app/services/[slug]/page.tsx`
- Create: `apps/storefront/components/service/service-card.tsx`
- Create: `apps/storefront/components/service/service-detail.tsx`
- Modify: `apps/storefront/app/globals.css`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: `getService(slug)` and service registry.
- Produces: service routes covering overview, benefits, method, preparation, process, limitations, aftercare, FAQ, related-product area, samples, and Book / Request Quote / WhatsApp / Call actions via `CustomerActions`.

- [ ] **Step 1: Add browser tests for service index and one complete service-detail route**
- [ ] **Step 2: Verify failure**
- [ ] **Step 3: Implement routes/components with `notFound()` for unknown slugs**
- [ ] **Step 4: Run build and browser tests**
- [ ] **Step 5: Commit**
  `git commit -am "feat: add complete service pages"`

### Task 3: Samples/results and gallery

**Files:**
- Create: `apps/storefront/app/gallery/page.tsx`
- Create: `apps/storefront/app/gallery/[slug]/page.tsx`
- Create: `apps/storefront/components/gallery/project-card.tsx`
- Create: `apps/storefront/components/gallery/project-story.tsx`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: project registry and related service slugs.
- Produces: gallery collections and Before → Process → Final Result project stories.

- [ ] **Step 1: Add project-story browser assertions**
- [ ] **Step 2: Implement gallery index/filter structure and project detail**
- [ ] **Step 3: Verify missing media uses readable fallbacks**
- [ ] **Step 4: Run build/browser tests**
- [ ] **Step 5: Commit**
  `git commit -am "feat: add project gallery and result stories"`

### Task 4: Vouchers and service packages

**Files:**
- Create: `apps/storefront/app/vouchers/page.tsx`
- Create: `apps/storefront/app/vouchers/[slug]/page.tsx`
- Create: `apps/storefront/components/voucher/voucher-card.tsx`
- Create: `apps/storefront/components/voucher/voucher-detail.tsx`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: voucher registry.
- Produces: enquiry-first package/voucher browsing.

- [ ] **Step 1: Add tests proving vouchers without verified transactional data do not render a purchase button**
- [ ] **Step 2: Implement voucher list/detail and enquiry CTA**
- [ ] **Step 3: Run tests/build**
- [ ] **Step 4: Commit**
  `git commit -am "feat: add service vouchers and packages"`

### Task 5: Knowledge and B2B surfaces

**Files:**
- Create: `apps/storefront/app/knowledge/page.tsx`
- Create: `apps/storefront/app/knowledge/[slug]/page.tsx`
- Create: `apps/storefront/app/b2b/page.tsx`
- Create: `apps/storefront/components/knowledge/article.tsx`
- Create: `apps/storefront/components/b2b/b2b-panel.tsx`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: knowledge/B2B content registries.
- Produces: verified knowledge navigation and B2B enquiry entry points.

- [ ] **Step 1: Add browser assertions for verified-source labels and B2B quote CTA**
- [ ] **Step 2: Implement pages/components**
- [ ] **Step 3: Run build/browser tests**
- [ ] **Step 4: Commit**
  `git commit -am "feat: add knowledge and B2B experiences"`
