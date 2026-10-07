import assert from 'node:assert/strict'; import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url); const t=(p)=>readFile(new URL(p,root),'utf8');
const [services,detail,gallery,vouchers,knowledge,b2b]=await Promise.all([t('apps/storefront/app/services/page.tsx'),t('apps/storefront/app/services/[slug]/page.tsx'),t('apps/storefront/app/gallery/page.tsx'),t('apps/storefront/app/vouchers/page.tsx'),t('apps/storefront/app/knowledge/page.tsx'),t('apps/storefront/app/b2b/page.tsx')]);
for(const word of ['Overview','Preparation','Process','Limitations','Aftercare','FAQ']) assert.match(detail,new RegExp(word));
assert.match(detail,/notFound\(\)/); assert.match(gallery,/Before.*Process.*Final Result/s); assert.match(vouchers,/Enquire/); assert.doesNotMatch(vouchers,/Buy now/i); assert.match(knowledge,/Verified technical information|verification/i); assert.match(b2b,/Request B2B Quote/); assert.match(services,/Paint Protection Film|services\.map/);
console.log('PASS content routes contract');
