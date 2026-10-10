import { createContext, useContext, useState, type ReactNode } from 'react';
import { products as seedProducts } from '@/lib/shop/catalog';
import { siriConfig } from '@/config/siri';
import { demoOrders, demoReservations, demoStock } from './data';
import { useBrowserStore } from '@/lib/browser-store';
import { formatINR, roundRupees } from '@/lib/pricing';
import { dateKey } from '@/lib/dates';
import { transitionOrder, type Order } from './models';
import { productSchema, couponEditSchema, settingsSchema, stockSchema, type ManagedProduct, type Coupon, type Settings, type Stock, type Reservation, type DemoRole } from './models';
const seedSettings:Settings={...siriConfig.showroom,...siriConfig.delivery,exchangeDays:siriConfig.exchangeDays};
export type AdminData={products:ManagedProduct[];coupons:Coupon[];settings:Settings;stock:Stock[];reservations:Reservation[];orders:Order[];setOrders:React.Dispatch<React.SetStateAction<Order[]>>;updateOrder:(id:string,status:string,courier?:string,tracking?:string)=>void;saveProductStock:(id:string,rows:Stock[])=>void;role:DemoRole|null;setRole:(role:DemoRole|null)=>void;saveProduct:(p:ManagedProduct)=>void;saveCoupon:(c:Coupon,oldCode?:string)=>void;saveSettings:(s:Settings)=>void;saveStock:(id:string,size:string,online:number,showroom:number)=>void;changeReservation:(id:string,status:'Completed'|'Cancelled')=>void};
const Context=createContext<AdminData|null>(null);
export type SharedStoreData={products:ManagedProduct[];coupons:Coupon[];settings:Settings;stock:Stock[];reservations:Reservation[];orders:Order[]};
export function seedData():SharedStoreData{return {products:seedProducts.map(p=>({...p,isNew:p.isNew??false,isPicked:false,sku:p.id.toUpperCase(),subcategory:'Fashion',description:p.descriptor,tags:[],siriPick:false,published:true})),coupons:siriConfig.coupons.map(c=>({...c,maxDiscount:0,expiry:'',enabled:true})),settings:seedSettings,stock:demoStock(),reservations:demoReservations(),orders:demoOrders()};}
export function normalizeData(value:unknown):SharedStoreData {
 if(!value||typeof value!=='object')throw new Error('Invalid saved store');
 const data=value as SharedStoreData;
 if(!Array.isArray(data.products)||!Array.isArray(data.coupons)||!Array.isArray(data.stock)||!Array.isArray(data.reservations)||!Array.isArray(data.orders))throw new Error('Invalid saved store');
 const settings={...seedSettings,...data.settings};
 return {...data,settings:settingsSchema.parse(settings),products:data.products.map(p=>({...p,isNew:p.isNew??false,isPicked:p.isPicked??p.siriPick??false,siriPick:p.isPicked??p.siriPick??false,published:p.published??false,price:roundRupees(p.price),mrp:roundRupees(p.mrp)})),orders:data.orders.map(o=>({...o,total:roundRupees(o.total),items:o.items.map(i=>({...i,...(i.price!==undefined?{price:roundRupees(i.price)}:{})}))}))};
}
export function AdminStoreProvider({children}:{children:ReactNode}){
 const [data,setData,ready,storageError]=useBrowserStore('siri-shared-store-v1',seedData,normalizeData);
 const {products,coupons,settings,stock,reservations,orders}=data;
 const [role,setRole]=useState<DemoRole|null>(null);
 const setProducts=(update:(old:ManagedProduct[])=>ManagedProduct[])=>setData(old=>({...old,products:update(old.products)}));
 const setCoupons=(update:(old:Coupon[])=>Coupon[])=>setData(old=>({...old,coupons:update(old.coupons)}));
 const setStock=(update:(old:Stock[])=>Stock[])=>setData(old=>({...old,stock:update(old.stock)}));
 const setReservations=(update:(old:Reservation[])=>Reservation[])=>setData(old=>({...old,reservations:update(old.reservations)}));
 const setOrders:React.Dispatch<React.SetStateAction<Order[]>>=update=>setData(old=>({...old,orders:typeof update==='function'?update(old.orders):update}));
 const updateOrder=(id:string,status:string,courier='',tracking='')=>{const order=orders.find(o=>o.id===id);if(!order)throw new Error('Order not found.');const changed=transitionOrder(order,status,courier,tracking);setOrders(old=>old.map(o=>o.id===id?changed:o));};
 const saveProductStock=(id:string,rows:Stock[])=>{const product=products.find(p=>p.id===id);if(!product||rows.length!==product.sizes.length||new Set(rows.map(r=>r.size)).size!==rows.length)throw new Error('Check all product sizes.');const parsed=rows.map(r=>{if(r.productId!==id||!product.sizes.includes(r.size))throw new Error('Unknown product size.');return {...r,...stockSchema.parse(r)};});setStock(old=>[...old.filter(r=>r.productId!==id),...parsed]);};
 const saveProduct=(input:ManagedProduct)=>{const parsed=productSchema.parse(input);const {badge,...rest}=parsed;const p:ManagedProduct={...rest,...(badge?{badge}:{})};if(products.some(x=>x.id!==p.id&&x.sku===p.sku))throw new Error('SKU is already used.');setProducts(old=>old.some(x=>x.id===p.id)?old.map(x=>x.id===p.id?p:x):[...old,p]);setStock(old=>[...old.filter(x=>x.productId!==p.id||p.sizes.includes(x.size)),...p.sizes.filter(size=>!old.some(x=>x.productId===p.id&&x.size===size)).map(size=>({productId:p.id,size,online:0,showroom:0}))]);};
 const saveCoupon=(input:Coupon,oldCode?:string)=>{const c=couponEditSchema.parse(input);if(coupons.some(x=>x.code===c.code&&x.code!==oldCode))throw new Error('Coupon code is already used.');const next={...c,title:c.kind==='percent'?`${c.value}% OFF`:`${formatINR(c.value)} OFF`,note:`Min order ${formatINR(c.minimum)}`};setCoupons(old=>oldCode?old.map(x=>x.code===oldCode?next:x):[...old,next]);};
 return <Context.Provider value={{products,coupons,settings,stock,reservations,orders,setOrders,updateOrder,saveProductStock,role,setRole,saveProduct,saveCoupon,saveSettings:s=>{const parsed=settingsSchema.parse(s);setData(old=>({...old,settings:parsed}));},saveStock:(id,size,online,showroom)=>{const v=stockSchema.parse({online,showroom});if(!products.some(p=>p.id===id&&p.sizes.includes(size)))throw new Error('Unknown product size.');setStock(old=>old.map(s=>s.productId===id&&s.size===size?{...s,...v}:s));},changeReservation:(id,status)=>setReservations(old=>old.map(r=>r.id===id&&r.status==='Upcoming'?{...r,status}:r))}}>{storageError&&<p className="preview-note" role="alert">{storageError}</p>}{ready?children:<div className="admin-empty" role="status">Loading store…</div>}</Context.Provider>;
}
export function useAdminStore(){const value=useContext(Context);if(!value)throw new Error('Shared demo store is required');return value;}
export function useCatalog(){const {products,coupons,settings}=useAdminStore();return {products:products.filter(p=>p.published),sampleOffers:coupons.filter(c=>c.enabled&&(!c.expiry||c.expiry>=dateKey())),settings};}
