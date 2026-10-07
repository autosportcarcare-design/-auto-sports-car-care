# Commerce Discovery Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade product discovery and product detail presentation while preserving the existing verified commerce contracts.

**Architecture:** Keep `lib/catalog.ts` as the authoritative product query layer, add a non-commerce discovery aggregator for services/knowledge/projects, and upgrade visual components without changing cart/checkout pricing logic.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma.

**Spec:** `docs/superpowers/specs/2026-10-07-premium-hybrid-storefront-upgrade-design.md`

## Global Constraints

- Shopify/Prisma catalogue remains authoritative for products, variants, price, stock, and product media.
- Existing cart/checkout APIs remain authoritative for server totals.
- Product content must never claim compatibility or technical instructions without verified data.
- Existing auth/account/order routes stay unchanged unless styling-only.

## Review Focus

- Product with zero availability cannot appear as “in stock”.
- Product with zero/unknown price cannot receive an invented market price.
- Product with no media has a readable fallback.
- Search query matching both a service and product labels result type clearly.
- Catalogue outage does not erase static service/knowledge search results.

---

### Task 1: Premium product cards and product listing

**Files:**
- Modify: `apps/storefront/components/common.tsx`
- Create: `apps/storefront/app/products/page.tsx`
- Modify: `apps/storefront/app/category/[slug]/page.tsx` if present
- Modify: `apps/storefront/app/brand/[slug]/page.tsx` if present
- Modify: `apps/storefront/app/globals.css`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: existing `Product` shape from `lib/types.ts`.
- Produces: premium product-card and product-list presentation only.

- [ ] **Step 1: Add browser assertions for product name, brand, verified price display, and truthful availability state**
- [ ] **Step 2: Run tests and confirm new assertions fail**
- [ ] **Step 3: Upgrade ProductCard/ProductGrid and add products index**
- [ ] **Step 4: Run typecheck/build/browser tests**
- [ ] **Step 5: Commit**
  `git commit -am "feat: upgrade product discovery cards"`

### Task 2: Product-detail experience

**Files:**
- Modify: `apps/storefront/app/product/[slug]/page.tsx`
- Modify: `apps/storefront/components/product-purchase.tsx`
- Modify: `apps/storefront/components/media.tsx`
- Create: `apps/storefront/components/product/product-information.tsx`
- Create: `apps/storefront/components/product/related-links.tsx`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: `getProduct(slug)`, existing purchase/cart interfaces.
- Produces: gallery, identifiers, variants, verified price/availability, overview, technical-info boundary, related services/projects, and support fallback.

- [ ] **Step 1: Add browser assertions that purchase controls still work and missing technical data is labeled unavailable rather than invented**
- [ ] **Step 2: Implement layout/components without changing add-to-cart API calls**
- [ ] **Step 3: Run full journey test**
  Expected: existing register → login → product → cart → checkout → order path still passes.
- [ ] **Step 4: Commit**
  `git commit -am "feat: upgrade product detail experience"`

### Task 3: Universal discovery search

**Files:**
- Create: `apps/storefront/lib/discovery.ts`
- Modify: `apps/storefront/app/search/page.tsx`
- Create: `apps/storefront/components/search/search-result.tsx`
- Test: `tests/discovery.mts`
- Test: `tests/browser.mts`

**Interfaces:**
- Consumes: `searchCatalog(query)` plus content registries.
- Produces: `searchDiscovery(query): Promise<DiscoveryResult[]>` with result types `PRODUCT | SERVICE | PROJECT | KNOWLEDGE | BRAND | CATEGORY`.

- [ ] **Step 1: Add tests for mixed result types, empty query, and catalogue failure with static content still available**
- [ ] **Step 2: Run tests and verify failure**
- [ ] **Step 3: Implement discovery aggregator and typed result rendering**
- [ ] **Step 4: Run content, browser, integration, typecheck, and build checks**
- [ ] **Step 5: Commit**
  `git commit -am "feat: add universal automotive discovery search"`
