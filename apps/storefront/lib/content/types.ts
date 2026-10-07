export type ContentSource = { label: string; url?: string };
export type ServiceContent = {
  slug: string; name: string; kicker: string; overview: string;
  benefits: string[]; method: string[]; preparation: string[]; process: string[];
  limitations: string[]; aftercare: string[]; faq: Array<{question:string;answer:string}>;
  technicalVerified: boolean; sources: ContentSource[];
  relatedProductSlugs: string[]; relatedServiceSlugs: string[];
};
export type ProjectContent = { slug:string; title:string; category:string; vehicle?:string; before:string; process:string[]; result:string; media:string[]; relatedServiceSlugs:string[]; relatedProductSlugs:string[]; verified:boolean };
export type VoucherContent = { slug:string; name:string; description:string; inclusions:string[]; enquiryOnly:true };
export type KnowledgeContent = { slug:string; title:string; summary:string; sections:Array<{heading:string;body:string}>; technicalVerified:boolean; sources:ContentSource[] };
