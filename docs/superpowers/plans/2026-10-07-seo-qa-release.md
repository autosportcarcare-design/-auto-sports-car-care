# SEO, QA, and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the premium hybrid storefront with crawlable metadata, performance/accessibility checks, visual fidelity verification, regression coverage, and a safe release gate.

**Architecture:** Add metadata/sitemap helpers to the App Router, extend automated browser checks, and keep production promotion separate from implementation so the protected good version remains recoverable.

**Tech Stack:** Next.js 15 metadata APIs, Playwright, TypeScript, GitHub Actions, Netlify continuous deployment.

**Spec:** `docs/superpowers/specs/2026-10-07-premium-hybrid-storefront-upgrade-design.md`

## Global Constraints

- No production promotion before build, journey, visual, mobile, and data-truth checks pass.
- Production remains recoverable from `stable-last-good`.
- Netlify production deploy is conditional on available production-deploy capacity.
- Do not generate thin duplicate SEO pages.
- Real visible UI must match the approved premium concept rather than a generic storefront.

## Review Focus

- Dynamic slugs have unique canonical URLs.
- Unknown slugs are 404 and absent from sitemap.
- Mobile viewport has no horizontal overflow.
- Reduced-motion preference suppresses nonessential motion.
- Existing checkout/account/auth journey remains functional after all visual/content work.

---

### Task 1: Metadata, sitemap, and robots

**Files:**
- Create: `apps/storefront/lib/seo.ts`
- Create: `apps/storefront/app/sitemap.ts`
- Create: `apps/storefront/app/robots.ts`
- Create: `apps/storefront/components/seo/json-ld.tsx`
- Modify: dynamic service/product/project/knowledge pages to export metadata and semantically valid Product / Service / Breadcrumb JSON-LD where source data supports it.
- Test: `tests/seo.mts`

**Interfaces:**
- Produces: metadata helpers with canonical URL, title, description, Open Graph data, and crawlable sitemap entries.

- [ ] **Step 1: Add tests for canonical uniqueness, no unknown slugs, required public-route sitemap coverage, and JSON-LD that never invents price/availability/ratings**
- [ ] **Step 2: Implement SEO helpers and route metadata**
- [ ] **Step 3: Run tests and production build**
- [ ] **Step 4: Commit**
  `git commit -am "feat: add storefront SEO metadata"`

### Task 2: Visual concept and fidelity gate

**Files:**
- Create: `docs/design/premium-storefront-concept.md`
- Store generated concept/reference assets under `apps/storefront/public/design/` only when approved and production-appropriate.
- Modify frontend files only for fidelity fixes discovered during comparison.

**Interfaces:**
- Consumes: approved theme/spec and the `carcare-shopee` reference direction.
- Produces: one approved desktop concept, one approved mobile concept, and a fidelity ledger.

- [ ] **Step 1: Generate complete desktop and mobile visual concepts before final UI polish**
- [ ] **Step 2: Compare implementation against concepts at native/representative sizes**
- [ ] **Step 3: Record at least five comparison points: first viewport, typography, palette, imagery, spacing/container model, mobile navigation, motion**
- [ ] **Step 4: Fix all material mismatches and repeat comparison**
- [ ] **Step 5: Commit**
  `git commit -am "fix: match premium storefront visual concept"`

### Task 3: Full regression and resilience QA

**Files:**
- Modify: `tests/browser.mts`
- Modify: `tests/integration.ts`
- Create: `tests/content.mts`
- Create: `tests/discovery.mts`
- Create: `tests/enquiry.mts`
- Create: `tests/seo.mts`

**Interfaces:**
- Produces: automated proof for core commerce journey plus new service/content/enquiry flows.

- [ ] **Step 1: Run `pnpm --filter @autosport/storefront lint`**
  Expected: PASS.
- [ ] **Step 2: Run `pnpm --filter @autosport/storefront build`**
  Expected: PASS.
- [ ] **Step 3: Run content/discovery/enquiry/SEO tests**
  Expected: PASS.
- [ ] **Step 4: Run `pnpm test:journey`**
  Expected: PASS including mobile no-overflow and existing commerce journey.
- [ ] **Step 5: Verify catalogue-unavailable, missing-media, empty-content, reduced-motion, keyboard focus order, mobile form usability, lazy below-the-fold media, and 390px no-overflow states**
- [ ] **Step 6: Commit any QA-only fixes**
  `git commit -am "test: complete premium storefront regression coverage"`

### Task 4: Automatic build and safe promotion

**Files:**
- Modify: `.github/workflows/verify.yml` only if required to include `improve/storefront-next`/PR verification.
- No production code changes in this task.

**Interfaces:**
- Consumes: all passing checks.
- Produces: verified branch eligible for merge to `main`.

- [ ] **Step 1: Ensure GitHub automatic build runs on the improvement branch or its pull request**
- [ ] **Step 2: Confirm workflow conclusion is success**
- [ ] **Step 3: Confirm `stable-last-good` still points to the protected baseline**
- [ ] **Step 4: Check Netlify production-deploy capacity before promotion**
- [ ] **Step 5: Merge/promote only after explicit visual acceptance and deploy capacity are both available**
- [ ] **Step 6: Verify resulting Netlify deploy is `ready` and smoke-test the public URL**
