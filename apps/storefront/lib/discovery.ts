import { services,projects,knowledge,vouchers } from "./content";
export type DiscoveryResult={type:"SERVICE"|"PROJECT"|"KNOWLEDGE"|"VOUCHER";slug:string;title:string;summary:string;href:string};
export function searchDiscovery(query:string):DiscoveryResult[]{const q=query.trim().toLowerCase();if(!q)return [];const has=(...v:string[])=>v.join(" ").toLowerCase().includes(q);return [
 ...services.filter(x=>has(x.name,x.kicker,x.overview)).map(x=>({type:"SERVICE" as const,slug:x.slug,title:x.name,summary:x.overview,href:`/services/${x.slug}`})),
 ...projects.filter(x=>has(x.title,x.category,x.vehicle||"",x.before,x.result)).map(x=>({type:"PROJECT" as const,slug:x.slug,title:x.title,summary:x.result,href:`/gallery/${x.slug}`})),
 ...knowledge.filter(x=>has(x.title,x.summary)).map(x=>({type:"KNOWLEDGE" as const,slug:x.slug,title:x.title,summary:x.summary,href:`/knowledge/${x.slug}`})),
 ...vouchers.filter(x=>has(x.name,x.description)).map(x=>({type:"VOUCHER" as const,slug:x.slug,title:x.name,summary:x.description,href:`/vouchers/${x.slug}`})),
];}
