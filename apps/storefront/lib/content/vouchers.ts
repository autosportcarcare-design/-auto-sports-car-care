import type { VoucherContent } from "./types";
export const vouchers: VoucherContent[] = [
 {slug:"detail-care",name:"Detail Care Package",description:"An enquiry-first detailing package configured after vehicle review.",inclusions:["Vehicle condition review","Recommended detailing scope","Service quotation"],enquiryOnly:true},
 {slug:"protection-care",name:"Protection Care Package",description:"Build a protection package around the vehicle and preferred coverage.",inclusions:["Vehicle review","Protection options","Service quotation"],enquiryOnly:true},
 {slug:"gift-service",name:"AUTO SPORT Service Gift",description:"Request a service gift arrangement for an eligible AUTO SPORT service.",inclusions:["Recipient/service enquiry","Scope confirmation before issue"],enquiryOnly:true},
];
export function getVoucher(slug:string){ return vouchers.find((item)=>item.slug===slug); }
