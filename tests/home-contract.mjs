import assert from 'node:assert/strict'; import { readFile } from 'node:fs/promises';
const s=await readFile(new URL('../apps/storefront/app/page.tsx',import.meta.url),'utf8');
for(const label of ['Services','Products','Brands','Results','Gallery','Vouchers','Why Choose Us','Process','Knowledge','B2B','Booking']) assert.match(s,new RegExp(label));
assert.match(s,/HomeHero/); assert.match(s,/catalogue is temporarily unavailable/i); console.log('PASS home discovery contract');
