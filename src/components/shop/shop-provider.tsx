import { createContext, useContext, useState, type ReactNode } from 'react';
import { useAdminStore } from '@/admin/store';
import { type Order } from '@/admin/models';
import { roundRupees } from '@/lib/pricing';
import { addressSchema, contactSchema } from '@/lib/shop/checkout';
import { checkCoupon, totals, type Delivery } from '@/lib/shop/checkout';
export type BagItem = {id:string;size:string;quantity:number};
export type PreviewOrder = Order;
export type OrderContact = {name:string;phone:string;pin:string;street:string;landmark:string;city:string;state:string;type:string};
type ShopState = {bag:BagItem[];wishlist:string[];orders:PreviewOrder[];add:(id:string,size:string)=>void;quantity:(id:string,size:string,n:number)=>void;toggleWish:(id:string)=>void;place:(delivery:string,contact?:OrderContact,payment?:string)=>string;updateOrder:(id:string,status:string,courier?:string,tracking?:string)=>void;notice:string;couponCode:string;setCouponCode:(code:string)=>void;delivery:Delivery;setDelivery:(delivery:Delivery)=>void};
const ShopContext = createContext<ShopState | null>(null);
export function ShopProvider({children}:{children:ReactNode}) {
 const {products,coupons,settings,orders,setOrders,updateOrder}=useAdminStore();
 const priceFor=(items:BagItem[],code='',mode:Delivery='Doorstep')=>totals(items,code,mode,products.filter(p=>p.published),coupons,settings);
 const [couponCode,setCouponCode]=useState(''); const [delivery,setDelivery]=useState<Delivery>('Doorstep');
 const [bag,setBag]=useState<BagItem[]>([]); const [wishlist,setWishlist]=useState<string[]>([]); const [notice,setNotice]=useState('');
 const add=(id:string,size:string)=>{if(!products.some(p=>p.id===id&&p.published&&p.sizes.includes(size)))return;setBag(old=>{const item=old.find(i=>i.id===id&&i.size===size);return item?old.map(i=>i===item?{...i,quantity:Math.min(99,i.quantity+1)}:i):[...old,{id,size,quantity:1}];});setNotice('Added to your bag');setTimeout(()=>setNotice(''),2600);};
 const quantity=(id:string,size:string,n:number)=>{if(!Number.isInteger(n)||n<0||n>99)return;setBag(old=>old.map(i=>i.id===id&&i.size===size?{...i,quantity:n}:i).filter(i=>i.quantity>0));};
 const toggleWish=(id:string)=>setWishlist(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 const place=(deliveryValue:string,contact?:OrderContact,payment='UPI')=>{if(deliveryValue!=='Doorstep'&&deliveryValue!=='Store Pickup')return '';if(contact&&!(deliveryValue==='Store Pickup'?contactSchema:addressSchema).safeParse(contact).success)return '';const price=priceFor(bag,couponCode,deliveryValue);if(!price.rows.length||price.couponError)return '';const id=`SIRI-PREVIEW-${orders.length+1}`;const date=new Date().toISOString();const status=deliveryValue==='Store Pickup'?'Order Placed':'Confirmed';setOrders(old=>[{id,items:price.rows.map(({id,size,quantity,p})=>({id,size,quantity,name:p.name,image:p.image,price:roundRupees(p.price)})),total:price.total,delivery:deliveryValue,date,customer:{name:contact?.name??'Preview customer',phone:contact?.phone??''},address:deliveryValue==='Store Pickup'?settings.address:contact?`${contact.street}, ${contact.landmark}, ${contact.city}, ${contact.state} · ${contact.pin}`:'Preview address',payment,paid:payment!=='Pay at store'&&payment!=='Cash on delivery',status,timeline:[{status,at:date}]},...old]);setBag([]);setCouponCode('');return id;};
 const applyCoupon=(code:string)=>{if(!code){setCouponCode('');return;}const checked=checkCoupon(code,priceFor(bag).merchandise,coupons);if(checked.coupon)setCouponCode(checked.coupon.code);};
 return <ShopContext.Provider value={{bag,wishlist,orders,add,quantity,toggleWish,place,updateOrder,notice,couponCode,setCouponCode:applyCoupon,delivery,setDelivery}}>{children}<div className={`bag-notice ${notice?'is-visible':''}`} role="status">{notice}</div></ShopContext.Provider>;
}
export function useShop(){const state=useContext(ShopContext);if(!state)throw new Error('ShopProvider is required');return state;}
