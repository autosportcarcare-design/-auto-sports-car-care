# Premium Shell and Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain storefront presentation with the approved premium AUTO SPORTS shell and complete home discovery experience without changing commerce behavior.

**Architecture:** Keep the existing Next.js App Router and server-first data reads. Split the visual shell and home sections into focused components, keep commerce queries in `lib/catalog.ts`, and keep visual styling centralized in `app/globals.css`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, existing workspace packages.

**Spec:** `docs/superpowers/specs/2026-10-07-premium-hybrid-storefront-upgrade-design.md`

## Global Constraints

- Preserve `stable-last-good` unchanged.
- Work only on `improve/storefront-next`.
- Keep existing account, wishlist, cart, checkout, auth, order, and PWA flows working.
- Use deep black/graphite, metallic neutrals, restrained red/blue accents, realistic automotive imagery, and controlled motion.
- Avoid neon/gaming aesthetics.
- Do not invent prices, stock, warranties, technical instructions, compatibility, discounts, delivery promises, or order state.
- Respect `prefers-reduced-motion`.
- No horizontal overflow at 390px mobile width.

## Review Focus

- Catalogue/database unavailable: home still renders service/content sections and a readable catalogue-unavailable state.
- Missing images: section layout remains intact and accessible.
- Small mobile viewport: header, hero, cards, and bottom navigation do not overflow.
- Reduced motion: cinematic motion becomes static without hiding content.
- Empty categories/products: no fabricated placeholders or fake inventory.

---

### Task 1: Premium site shell

**Files:**
- Create: `apps/storefront/components/site-header.tsx`
- Create: `apps/storefront/components/site-footer.tsx`
- Create: `apps/storefront/components/mobile-nav.tsx`
- Create: `apps/storefront/components/customer-actions.tsx`
- Modify: `apps/storefront/app/layout.tsx`
- Modify: `apps/storefront/app/globals.css`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: `siteConfig` from `apps/storefront/lib/site-config.ts`.
- Produces: `SiteHeader`, `SiteFooter`, `MobileNav`, and reusable `CustomerActions` React components for Book, Request Quote, WhatsApp, and Call.

- [ ] **Step 1: Write browser assertions for shell navigation**
  Assert visible links for Home, Services, Products, Search, Account/Cart as appropriate and assert document width does not exceed viewport.
- [ ] **Step 2: Run browser test and verify the new shell assertions fail**
  Run: `pnpm test:journey`
  Expected: FAIL because the new shell/navigation labels do not yet exist.
- [ ] **Step 3: Implement the three shell components and wire them into `layout.tsx`**
  Keep navigation semantic, keyboard accessible, and server-rendered.
- [ ] **Step 4: Add theme tokens, focus states, mobile bottom navigation, and reduced-motion rules to `globals.css`**
- [ ] **Step 5: Run `pnpm --filter @autosport/storefront lint && pnpm --filter @autosport/storefront build`**
  Expected: PASS.
- [ ] **Step 6: Run `pnpm test:journey`**
  Expected: PASS.
- [ ] **Step 7: Commit**
  `git commit -am "feat: add premium storefront shell"`

### Task 2: Cinematic home hero and primary actions

**Files:**
- Create: `apps/storefront/components/home/home-hero.tsx`
- Modify: `apps/storefront/app/page.tsx`
- Modify: `apps/storefront/app/globals.css`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: verified contact/site configuration only.
- Produces: `HomeHero` with actions to Services, Products, Request Quote, and Booking.

- [ ] **Step 1: Add browser assertions for hero heading and four primary actions**
- [ ] **Step 2: Run browser test and confirm failure**
- [ ] **Step 3: Implement `HomeHero` with a real-media-ready background slot, readable overlay treatment, and reduced-motion fallback**
- [ ] **Step 4: Verify mobile and desktop render with no overflow**
- [ ] **Step 5: Commit**
  `git commit -am "feat: add cinematic home hero"`

### Task 3: Complete home discovery sections

**Files:**
- Create: `apps/storefront/components/home/service-preview.tsx`
- Create: `apps/storefront/components/home/product-preview.tsx`
- Create: `apps/storefront/components/home/brand-preview.tsx`
- Create: `apps/storefront/components/home/project-preview.tsx`
- Create: `apps/storefront/components/home/voucher-preview.tsx`
- Create: `apps/storefront/components/home/why-choose.tsx`
- Create: `apps/storefront/components/home/process-preview.tsx`
- Create: `apps/storefront/components/home/knowledge-preview.tsx`
- Create: `apps/storefront/components/home/b2b-preview.tsx`
- Create: `apps/storefront/components/home/booking-cta.tsx`
- Modify: `apps/storefront/app/page.tsx`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: existing product/category reads plus content registries introduced by the service/content plan.
- Produces: complete home section order from the approved spec.

- [ ] **Step 1: Add home section-order assertions to the browser test**
  Assert Services → Products → Brands → Results → Gallery/Vouchers → Why Choose Us → Process → Knowledge → B2B → Booking.
- [ ] **Step 2: Run browser test and confirm failure**
- [ ] **Step 3: Implement focused section components**
  Missing data must render a truthful empty/unavailable state rather than sample inventory.
- [ ] **Step 4: Run typecheck/build and browser tests**
- [ ] **Step 5: Commit**
  `git commit -am "feat: complete premium home discovery"`
