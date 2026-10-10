import { products } from '@/lib/shop/catalog';
import { dateKey } from '@/lib/dates';
import type { Order, Reservation, Stock } from './models';
export function demoOrders():Order[]{
 const date=new Date().toISOString();
 return [
 {id:'SIRI-DEMO-1001',items:[{id:'sage-kurta',size:'M',quantity:1}],total:1899,delivery:'Store Pickup',date,customer:{name:'Demo Asha',phone:'9000000001'},address:'Kandukur Showroom · sample details',payment:'Pay at store',paid:false,status:'Ready for Pickup',pickupCode:'SIRI-001001',timeline:[{status:'Order Placed',at:date},{status:'Preparing at Kandukur Showroom',at:date},{status:'Ready for Pickup',at:date}]},
 {id:'SIRI-DEMO-1002',items:[{id:'linen-shirt',size:'L',quantity:1}],total:1378,delivery:'Doorstep',date,customer:{name:'Demo Ravi',phone:'9000000002'},address:'12 Demo Street, Kandukur, Andhra Pradesh · 523105',payment:'UPI',paid:true,status:'Confirmed',timeline:[{status:'Confirmed',at:date}]},
 {id:'SIRI-DEMO-1003',items:[{id:'rose-dress',size:'6–7Y',quantity:1}],total:1499,delivery:'Doorstep',date,customer:{name:'Demo Lakshmi',phone:'9000000003'},address:'24 Sample Street, Kandukur, Andhra Pradesh · 523105',payment:'Card',paid:true,status:'Shipped',courier:'Demo courier',tracking:'DEMO3003',timeline:[{status:'Confirmed',at:date},{status:'Packed',at:date},{status:'Shipped',at:date}]},
 {id:'SIRI-DEMO-1004',items:[{id:'teal-kurta',size:'4–5Y',quantity:1}],total:999,delivery:'Store Pickup',date,customer:{name:'Demo Meena',phone:'9000000004'},address:'Kandukur Showroom · sample details',payment:'UPI',paid:true,status:'Order Placed',timeline:[{status:'Order Placed',at:date}]},
 ].map(o=>({...o,items:o.items.map(i=>{const p=products.find(p=>p.id===i.id);return {...i,name:p?.name,image:p?.image,price:p?.price};})})) as Order[];
}
export function demoReservations():Reservation[]{const date=dateKey();const next=new Date();next.setDate(next.getDate()+1);return [{id:'TRIAL-DEMO-1',date,slot:'11:00 AM',name:'Demo Asha',phone:'9000000001',items:[{id:'sage-kurta',size:'M',quantity:1}],status:'Upcoming'},{id:'TRIAL-DEMO-2',date:dateKey(next),slot:'4:00 PM',name:'Demo Meena',phone:'9000000004',items:[{id:'rose-dress',size:'6–7Y',quantity:1}],status:'Upcoming'}];}
export function demoStock():Stock[]{return products.flatMap((p,i)=>p.sizes.map((size,j)=>({productId:p.id,size,online:(i+j)%8,showroom:(i+j+2)%10})));}
