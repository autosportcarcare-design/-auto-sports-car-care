# AUTO SPORTS Premium Hybrid Storefront Upgrade

Date: 2026-10-07  
Status: Approved design baseline, pending written-spec review  
Branch: `improve/storefront-next`  
Reference experience: `carcare-shopee` Netlify project

## 1. Product intent

Upgrade the existing AUTO SPORTS storefront without replacing or simplifying the working commerce foundation.

The upgraded experience must combine five jobs in one coherent customer journey:

1. Automotive service discovery and booking.
2. Shopify-backed product shopping.
3. Real project/sample discovery through before, process, and final-result content.
4. Service vouchers and packaged offers.
5. Verified automotive knowledge and B2B support.

The visual direction should preserve the richer `carcare-shopee` feeling rather than regress to a plain catalogue grid. The site should feel like a premium automotive service centre, specialist product store, project showroom, and knowledge centre in one system.

## 2. Design principles

- Premium automotive appearance with deep black/graphite surfaces, metallic neutral accents, restrained red/blue brand accents, crisp typography, realistic photography, and controlled motion.
- Real photographic or verified media should carry the visual storytelling. Avoid generic AI-looking workshop imagery where real media is available.
- Mobile-first, fast, thumb-friendly navigation.
- Strong visual hierarchy without turning every section into a floating card.
- Products and services are both first-class destinations.
- Every primary section should lead to a useful action.
- Existing working account, cart, checkout, wishlist, search, and catalogue flows must be preserved.
- Do not invent prices, stock, compatibility, warranties, technical instructions, delivery promises, mixing ratios, discounts, or order state.

## 3. Primary information architecture

### Home

Home becomes the main discovery surface and includes, in this order:

- Cinematic automotive hero.
- Primary actions: Explore Services, Shop Products, Request Quote, Book.
- Services showcase.
- Featured products and categories.
- Brand showcase.
- Before / Process / Final Result samples.
- Gallery / recent work.
- Offers and service vouchers.
- Why Choose AUTO SPORTS.
- How the process works.
- Knowledge / expert-help preview.
- B2B trade supply preview.
- Booking / quotation call-to-action.
- Contact / WhatsApp / call actions.
- Full footer with business navigation and support links.

The first viewport should immediately communicate that AUTO SPORTS handles both services and products.

### Services

Primary service groups:

- Paint Protection Film (PPF).
- Ceramic / graphene protection.
- Detailing and polishing.
- Paint, body, and denting.
- Restoration.
- Wraps and custom finishes.
- Window tinting.
- Wheels and headlights.
- Facelift / body kits / customisation.
- Additional automotive care services as verified content becomes available.

### Products

Products retain the commerce journey:

- Catalogue browsing.
- Departments and categories.
- Brands.
- Search by product, brand, SKU, and supported attributes.
- Product variants.
- Verified price and availability.
- Product media.
- Wishlist.
- Cart.
- Checkout.
- Account and order history.

The product side should visually match the service side rather than feeling like a separate app.

### Samples / Results

A reusable project-story format should support:

- Before.
- Work / process.
- Final result.
- Vehicle information when verified.
- Service(s) performed.
- Products used when verified.
- Gallery media.
- Related service.
- Related products.
- Quote / booking action.

### Gallery

Gallery categories:

- Before and after.
- Premium / luxury.
- Sports cars.
- Restoration.
- Facelift / customisation.
- PPF / protection.
- Detailing.
- Paint / body.
- Wrap / colour transformation.

Gallery items should open into project stories rather than dead-end image lightboxes when enough information exists.

### Service vouchers and packages

Support:

- Service packages.
- Gift / service vouchers.
- Package inclusions.
- Optional upgrades where verified.
- Enquiry / booking action.
- Clear validity and terms when supplied.
- Shareable voucher detail view.

A voucher must not silently become a purchasable financial instrument unless the payment and fulfilment flow is intentionally implemented and verified.

### Knowledge

Knowledge content should explain, where verified:

- What a product or service is for.
- Where it can be used.
- Where it should not be used.
- Preparation required.
- Required tools / accessories.
- Application or service process.
- Compatibility.
- Related products.
- Related services.
- Aftercare.
- Safety or limitation notes.
- Source / verification status for technical information.

Knowledge content should link naturally into products, services, project samples, and quote / booking actions.

### B2B

B2B area should support:

- Trade supply.
- Wholesale enquiry.
- Workshop / detailing-centre support.
- Product sourcing requests.
- Bulk quotation request.
- Business customer contact flow.
- Saved customer/account capabilities when backend support exists.

Do not expose wholesale prices unless they are verified and intentionally available to that customer.

## 4. Service detail page template

Every service page should support the same complete structure:

1. Premium hero with real service imagery.
2. Service overview.
3. Benefits.
4. Suitable use cases.
5. Method / technology explanation.
6. Preparation.
7. Step-by-step process.
8. Limitations / what the service does not solve.
9. Aftercare.
10. Before / Process / Final Result samples.
11. Related products.
12. Related gallery projects.
13. Frequently asked questions.
14. Booking / Request Quote / WhatsApp / Call actions.

Optional verified pricing may appear when real pricing exists. Otherwise the page should use quote or inspection language rather than fabricated figures.

## 5. Product detail upgrade

The current product-detail flow should be expanded visually and structurally to support:

- Main media gallery.
- Product title and brand.
- Variant selector.
- Verified price.
- Verified availability.
- SKU / key identifiers.
- Add to cart.
- Wishlist.
- Product overview.
- Verified technical specifications.
- Suitable surfaces / applications.
- Restrictions / unsuitable use.
- Preparation.
- Required accessories.
- Related products.
- Related services.
- Verified documents / media.
- Knowledge / FAQ.
- Contact support when information is incomplete.

Technical information must visibly distinguish verified data from missing or unavailable data.

## 6. Global actions

Global customer actions:

- Book.
- Request Quote.
- WhatsApp.
- Call.
- Add to Cart.
- Buy / Checkout only when payment flow is valid.
- View Service.
- View Product.
- View Gallery.
- View Sample / Result.
- Save / Wishlist.
- Search.

Primary actions should remain consistent across desktop and mobile.

## 7. Mobile experience

Mobile receives a dedicated navigation model, not merely a collapsed desktop header.

Bottom navigation:

- Home.
- Services.
- Products.
- Search.
- Booking / Cart entry point.

Mobile requirements:

- Large touch targets.
- Sticky context-aware actions on service and product pages.
- Fast search access.
- Product cards readable at small widths.
- Service media that does not crop critical content.
- No horizontal overflow.
- Reduced-motion support.
- Forms usable with mobile keyboards.

## 8. Theme and motion

### Visual system

- Deep black / graphite base.
- Metallic silver / cool neutral text and dividers.
- Restricted red and blue accents for brand energy and actions.
- High-quality realistic automotive imagery.
- Strong contrast.
- Large editorial service imagery.
- Product imagery remains clean and legible.
- Rounded corners used selectively rather than everywhere.
- Avoid neon gaming aesthetics.

### Motion

Use controlled motion for:

- Hero media.
- Section reveals.
- Brand / category rails.
- Before / after interactions.
- Gallery transitions.
- Product-media transitions.
- Micro-interactions on primary actions.

Motion must not delay shopping or booking and must respect `prefers-reduced-motion`.

## 9. Data and content architecture

The upgrade should preserve the existing commerce data model and add presentation / content layers around it.

Recommended content entities:

- Service.
- ServiceCategory.
- ServiceMedia.
- ServiceFAQ.
- ServicePackage.
- Voucher.
- Project / Sample.
- ProjectMedia.
- GalleryCollection.
- KnowledgeArticle.
- KnowledgeSection.
- RelatedService.
- RelatedProduct.
- BrandStory / BrandMedia where useful.
- B2BEnquiry.
- Booking / QuoteRequest.

Existing product, variant, cart, account, order, and catalogue models remain authoritative for commerce.

Shopify remains the catalogue source where configured. Content relationships should reference product IDs / slugs rather than duplicate product truth.

## 10. Booking and enquiry model

The first safe production flow should be enquiry-first:

- Customer chooses a service / package.
- Customer adds vehicle and contact details.
- Customer adds preferred date / notes if supported.
- Request is saved or submitted through a configured backend.
- Customer receives confirmation only after submission succeeds.
- Staff can follow up through configured contact channels.

Do not display a guaranteed appointment slot unless a real availability system exists.

## 11. Search and discovery

Search should evolve into a universal automotive discovery surface covering, where indexed:

- Products.
- Services.
- Brands.
- Knowledge.
- Gallery / project stories.
- Categories.

Search results must clearly identify result type so a service is not mistaken for a product.

## 12. SEO and discoverability

Every public service, product, project, category, brand, and knowledge page should support:

- Unique title and description.
- Canonical URL.
- Open Graph data.
- Structured data where semantically valid.
- Crawlable heading structure.
- Internal linking.
- Descriptive media alt text.

Do not create spam pages or duplicate thin pages solely for search ranking.

## 13. Performance and resilience

- Preserve Next.js server-first rendering patterns.
- Keep client components focused on actual interaction.
- Parallelize independent server reads.
- Avoid loading heavy gallery / animation code on pages that do not use it.
- Lazy-load below-the-fold media.
- Provide useful skeleton / empty / unavailable states.
- A catalogue outage should not make static service and knowledge content unusable where separation is practical.

## 14. Accessibility

- Semantic navigation and landmarks.
- Keyboard-accessible controls.
- Visible focus states.
- Sufficient contrast.
- Meaningful alt text.
- Accessible form labels and error messages.
- Motion reduction.
- No essential information conveyed by colour alone.

## 15. Preserved existing flows

The upgrade must not regress these existing routes / capabilities:

- Home.
- Search.
- Departments / categories.
- Product detail.
- Account.
- Wishlist.
- Cart.
- Checkout.
- Authentication flows.
- Order-related flows already implemented.
- PWA behaviour already implemented.

Any route changed visually must retain its functional contract unless a separate approved change explicitly replaces it.

## 16. Verification and acceptance checklist

The upgrade is not considered complete merely because it builds.

Required verification:

- Typecheck passes.
- Next.js production build passes.
- No critical console errors on core pages.
- Desktop and mobile visual verification.
- Home renders all approved major areas.
- Service index works.
- At least one complete service-detail template works.
- Products remain searchable and purchasable through the existing valid flow.
- Product detail retains verified data behaviour.
- Sample / Result structure works.
- Gallery works.
- Voucher / package content works.
- Knowledge page works.
- B2B enquiry surface works.
- Booking / quote flow has a real submission outcome or is clearly labelled unavailable.
- WhatsApp and call actions use verified contact data.
- Cart and checkout are not broken.
- Account / authentication routes are not broken.
- Empty / missing data does not fabricate content.
- Mobile bottom navigation works.
- Reduced-motion behaviour is respected.
- No horizontal overflow on target mobile width.
- Current good production remains recoverable from `stable-last-good`.

## 17. Release strategy

1. Build only on `improve/storefront-next`.
2. Keep `stable-last-good` untouched as recovery reference.
3. Verify the improvement branch.
4. Do not replace production solely because the branch builds.
5. Merge / promote to `main` only after functional and visual acceptance.
6. Netlify production deployment remains dependent on available production-deploy capacity / plan limits.

## 18. Definition of done

The finished site should no longer feel like a simple catalogue with a few links.

It should present AUTO SPORTS as one integrated automotive platform where a customer can:

Discover a service → understand it → see real results → view related products → request a quote / book → continue shopping → save or buy products → access support.

Likewise, a product customer should be able to:

Search → understand the product → see verified use information → discover related services / projects → add to cart → checkout through the existing valid commerce flow.

Any feature that cannot be backed by real data or a working backend must degrade clearly rather than pretending to be complete.
