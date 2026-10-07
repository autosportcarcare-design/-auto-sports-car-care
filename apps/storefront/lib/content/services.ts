import type { ServiceContent } from "./types";
const service = (input: Pick<ServiceContent,"slug"|"name"|"kicker"|"overview"> & Partial<ServiceContent>): ServiceContent => ({
  benefits:[],method:[],preparation:["Vehicle condition is reviewed before work begins."],process:["Inspect","Confirm scope","Perform approved work","Quality check","Handover"],limitations:["Final scope depends on vehicle condition and inspection."],aftercare:["Follow the aftercare guidance provided for the completed service."],faq:[{question:"Can I request a quote first?",answer:"Yes. Send the vehicle and required work for review before booking."}],technicalVerified:false,sources:[],relatedProductSlugs:[],relatedServiceSlugs:[],...input,
});
export const services: ServiceContent[] = [
 service({slug:"ppf",name:"Paint Protection Film",kicker:"Protection & Films",overview:"Explore paint protection film options, preparation, installation workflow and aftercare before requesting a quote."}),
 service({slug:"ceramic",name:"Ceramic & Surface Protection",kicker:"Protection & Detailing",overview:"A structured surface-protection service beginning with inspection and preparation before the selected treatment."}),
 service({slug:"detailing",name:"Detailing & Polishing",kicker:"Wash & Detailing",overview:"Exterior and interior detailing options organised around vehicle condition, required correction and finish goals."}),
 service({slug:"paint-body",name:"Paint & Body",kicker:"Paint / Body / Restoration",overview:"Inspection-led paint and body work for panels, trim and approved refinishing requirements."}),
 service({slug:"restoration",name:"Restoration",kicker:"Paint / Body / Restoration",overview:"A staged restoration pathway that defines condition, scope, required work and final quality checks before execution."}),
 service({slug:"wraps",name:"Wraps & Styling Films",kicker:"Customisation & Wraps",overview:"Vehicle styling and wrap enquiries with material, finish and coverage confirmed before work is scheduled."}),
 service({slug:"tinting",name:"Window Tinting",kicker:"Protection & Films",overview:"Window-film enquiries organised around vehicle, coverage and selected film information available at quotation time."}),
 service({slug:"wheels-headlights",name:"Wheels & Headlights",kicker:"Wheels / Headlights",overview:"Cosmetic and restoration enquiries for wheels and headlights after condition review."}),
 service({slug:"customisation",name:"Customisation & Facelift",kicker:"Customisation",overview:"A project-based path for approved exterior styling, facelift and customisation work with scope confirmed before execution."}),
];
export function getService(slug:string){ return services.find((item)=>item.slug===slug); }
