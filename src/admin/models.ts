import { z } from 'zod';
import type { Product } from '@/lib/shop/catalog';
import { roundRupees } from '@/lib/pricing';
export type DemoRole = 'Owner' | 'Showroom Staff';
export type ManagedProduct = Product & {sku:string;subcategory:string;description:string;tags:string[];isPicked:boolean;siriPick:boolean;published:boolean};
export type Coupon = {code:string;kind:'percent'|'fixed';value:number;minimum:number;maxDiscount:number;expiry:string;enabled:boolean;title:string;note:string};
export type Settings = {name:string;address:string;phone:string;whatsapp:string;hours:string;fee:number;freeAt:number;deliveryMinDays:number;deliveryMaxDays:number;pickupReadyHours:number;exchangeDays:number};
export type Stock = {productId:string;size:string;online:number;showroom:number};
export type Reservation = {id:string;date:string;slot:string;name:string;phone:string;items:{id:string;size:string;quantity:number}[];status:'Upcoming'|'Completed'|'Cancelled'};
const text=z.string().trim().min(1,'This field is required.').max(250,'Use at most 250 characters.').refine(v=>!/[<>\u0000-\u001f]/.test(v),'Remove unsupported characters');
const amount=z.number().finite().min(0).max(1000000);
export const imageSchema=z.string().max(2000).refine(v=>/^https:\/\//.test(v)||/^\/(?!\/)/.test(v),'Use an HTTPS image URL');
export const productSchema=z.object({id:text,name:text,sku:text,category:z.enum(['Women','Men','Boys','Girls']),subcategory:text,price:amount.transform(roundRupees),mrp:amount.refine(v=>v>0,'MRP must be positive').transform(roundRupees),fabric:text,occasion:text,color:text,sizes:z.array(text).min(1,'Add a size'),descriptor:text,description:text,image:imageSchema,tags:z.array(text).max(20),isNew:z.boolean().default(false),isPicked:z.boolean().default(false),siriPick:z.boolean().default(false),published:z.boolean().default(false),popularity:z.number(),badge:z.string().optional()}).refine(p=>p.price<=p.mrp,{path:['price'],message:'Price must be at most MRP'});
export const couponEditSchema=z.object({code:z.string().trim().regex(/^[A-Z0-9]{2,30}$/,'Use 2–30 uppercase letters/numbers'),kind:z.enum(['percent','fixed']),value:amount.refine(v=>v>0,'Value must be positive'),minimum:amount,maxDiscount:amount,expiry:z.string().refine(v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v),'Use a valid date'),enabled:z.boolean()}).refine(c=>c.kind!=='percent'||c.value<=100,{path:['value'],message:'Percent must be at most 100'});
export const settingsSchema=z.object({name:text,address:z.string().trim().min(1,'Address is required.').max(1000).refine(v=>!/[<>\u0000-\u0008]/.test(v),'Remove unsupported characters'),phone:z.string().regex(/^[+\d ()-]{10,30}$/,'Enter a valid phone'),whatsapp:z.string().regex(/^\d{10,15}$/,'Enter 10–15 digits'),hours:text,fee:amount.transform(roundRupees),freeAt:amount.transform(roundRupees),deliveryMinDays:z.number().int().min(0).max(365),deliveryMaxDays:z.number().int().min(0).max(365),pickupReadyHours:z.number().int().min(0).max(8760),exchangeDays:z.number().int().min(0).max(365)}).refine(s=>s.deliveryMaxDays>=s.deliveryMinDays,{path:['deliveryMaxDays'],message:'Maximum days must be at least minimum days.'});
export const stockSchema=z.object({online:z.number().int().min(0).max(99999),showroom:z.number().int().min(0).max(99999)});
export function stockLevel(value:number){return value===0?'Out':value>0&&value<=3?'Low':undefined;}
export const pickupSteps=['Order Placed','Preparing at Kandukur Showroom','Ready for Pickup','Picked Up'];
export const deliverySteps=['Confirmed','Packed','Shipped','Out for Delivery','Delivered'];
export type OrderStatus='Order Placed'|'Preparing at Kandukur Showroom'|'Ready for Pickup'|'Picked Up'|'Confirmed'|'Packed'|'Shipped'|'Out for Delivery'|'Delivered'|'Cancelled';
export type Order = {id:string;items:{id:string;size:string;quantity:number;name?:string;image?:string;price?:number}[];total:number;delivery:string;date:string;customer:{name:string;phone:string};address:string;payment:string;paid:boolean;status:OrderStatus;timeline:{status:string;at:string}[];pickupCode?:string;courier?:string;tracking?:string};
export function canCancel(o:Order){return o.delivery==='Store Pickup'?['Order Placed','Preparing at Kandukur Showroom'].includes(o.status):o.status==='Confirmed';}
export function nextStatus(o:Order){const steps=o.delivery==='Store Pickup'?pickupSteps:deliverySteps;return o.status==='Cancelled'?undefined:steps[steps.indexOf(o.status)+1];}
export function transitionOrder(o:Order,status:string,courier='',tracking=''):Order {
 if(status==='Cancelled'){if(!canCancel(o))throw new Error('This order can no longer be cancelled.');}
 else if(nextStatus(o)!==status)throw new Error('Invalid status transition.');
 if(status==='Shipped'&&(!text.safeParse(courier).success||!text.safeParse(tracking).success))throw new Error('Courier and tracking number are required.');
 const pickupCode=status==='Ready for Pickup'?`SIRI-${o.id.replace(/\D/g,'').padStart(6,'0')}`:o.pickupCode;
 return {...o,total:roundRupees(o.total),status:status as OrderStatus,...(pickupCode?{pickupCode}:{}),paid:status==='Picked Up'||status==='Delivered'?true:o.paid,...(status==='Shipped'?{courier,tracking}:{}),timeline:[...o.timeline,{status,at:new Date().toISOString()}]};
}
