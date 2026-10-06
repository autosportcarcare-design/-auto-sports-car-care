import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2026-07";
if (!domain || !token) throw new Error("SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required");

const query = `query Products($after:String){products(first:50,after:$after,sortKey:TITLE){pageInfo{hasNextPage endCursor} nodes{id title handle status vendor productType description descriptionHtml tags featuredImage{url altText} media(first:50){nodes{mediaContentType alt preview{image{url altText}}}} variants(first:100){nodes{id title sku barcode price compareAtPrice inventoryQuantity}}}}}`;
const slugify = (s) => (s || "uncategorized").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "uncategorized";
const statusMap = { ACTIVE:"ACTIVE", ARCHIVED:"ARCHIVED", DRAFT:"DRAFT" };

async function gql(variables){
  const r = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":token},body:JSON.stringify({query,variables})});
  if(!r.ok) throw new Error(`Shopify ${r.status}: ${await r.text()}`);
  const j=await r.json(); if(j.errors) throw new Error(JSON.stringify(j.errors)); return j.data.products;
}

async function main(){
  const department = await db.department.upsert({where:{slug:"shopify-catalogue"},update:{active:true},create:{name:"Shopify Catalogue",slug:"shopify-catalogue",active:true}});
  const taxClass = await db.taxClass.upsert({where:{name:"UAE VAT 5%"},update:{rate:"0.05"},create:{name:"UAE VAT 5%",rate:"0.05"}});
  let after=null, count=0;
  do {
    const page=await gql({after});
    for(const p of page.nodes){
      const brandName=(p.vendor||"Unbranded").trim(); const brandSlug=slugify(brandName);
      const brand=await db.brand.upsert({where:{slug:brandSlug},update:{name:brandName},create:{name:brandName,slug:brandSlug,active:true}});
      const categoryName=(p.productType||"Other").trim(); const categorySlug=slugify(categoryName);
      const category=await db.category.upsert({where:{slug:categorySlug},update:{name:categoryName,active:true},create:{departmentId:department.id,name:categoryName,slug:categorySlug,active:true}});
      const product=await db.product.upsert({where:{slug:p.handle},update:{brandId:brand.id,categoryId:category.id,name:p.title,shortDescription:p.description?.slice(0,320)||null,longDescription:p.description||null,status:statusMap[p.status]||"INACTIVE"},create:{brandId:brand.id,categoryId:category.id,name:p.title,slug:p.handle,shortDescription:p.description?.slice(0,320)||null,longDescription:p.description||null,status:statusMap[p.status]||"INACTIVE"}});
      const variantIds=[];
      for(const v of p.variants.nodes){
        const sku=(v.sku||`SHOPIFY-${v.id.split("/").pop()}`).trim();
        const row=await db.productVariant.upsert({where:{sku},update:{productId:product.id,barcode:v.barcode||null,title:v.title,price:v.price,compareAtPrice:v.compareAtPrice||null,taxClassId:taxClass.id,basicAvailability:Math.max(0,v.inventoryQuantity||0),status:p.status==="ACTIVE"?"ACTIVE":"ARCHIVED"},create:{productId:product.id,sku,barcode:v.barcode||null,title:v.title,price:v.price,compareAtPrice:v.compareAtPrice||null,taxClassId:taxClass.id,basicAvailability:Math.max(0,v.inventoryQuantity||0),status:p.status==="ACTIVE"?"ACTIVE":"ARCHIVED"}});
        variantIds.push(row.id);
      }
      await db.productMedia.deleteMany({where:{productId:product.id}});
      const media=p.media.nodes.map((m,i)=>({productId:product.id,type:m.mediaContentType==="IMAGE"?"IMAGE":m.mediaContentType,url:m.preview?.image?.url,altText:m.alt||m.preview?.image?.altText||p.title,sortOrder:i,verifiedSource:true,sourceName:"Shopify"})).filter(m=>m.url);
      if(!media.length && p.featuredImage?.url) media.push({productId:product.id,type:"IMAGE",url:p.featuredImage.url,altText:p.featuredImage.altText||p.title,sortOrder:0,verifiedSource:true,sourceName:"Shopify"});
      if(media.length) await db.productMedia.createMany({data:media});
      count++;
    }
    after=page.pageInfo.hasNextPage?page.pageInfo.endCursor:null;
    console.log(`Synced ${count} products`);
  } while(after);
  console.log(`Shopify sync complete: ${count} products`);
}
main().finally(()=>db.$disconnect());
