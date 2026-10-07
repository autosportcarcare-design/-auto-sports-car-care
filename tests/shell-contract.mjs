import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
async function text(path) { return readFile(new URL(path, root), 'utf8'); }

const [header, footer, mobile, actions, layout, css] = await Promise.all([
  text('apps/storefront/components/site-header.tsx'),
  text('apps/storefront/components/site-footer.tsx'),
  text('apps/storefront/components/mobile-nav.tsx'),
  text('apps/storefront/components/customer-actions.tsx'),
  text('apps/storefront/app/layout.tsx'),
  text('apps/storefront/app/globals.css'),
]);

for (const label of ['Services', 'Products', 'Search', 'Account', 'Cart']) {
  assert.match(header + mobile, new RegExp(`>${label}<`), `missing ${label} navigation`);
}
for (const label of ['Book', 'Request Quote', 'WhatsApp', 'Call']) {
  assert.match(actions, new RegExp(label), `missing ${label} action`);
}
assert.match(layout, /<SiteHeader\s*\/>/);
assert.match(layout, /<SiteFooter\s*\/>/);
assert.match(layout, /<MobileNav\s*\/>/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /overflow-x:\s*hidden/);
console.log('PASS premium shell contract');
