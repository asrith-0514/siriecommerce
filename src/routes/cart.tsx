import { useAdminStore } from '@/admin/store';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShop } from '@/components/shop/shop-provider';
import { PriceBreakdown } from '@/components/shop/checkout-summary';
import { money, pageHead } from '@/lib/shop/catalog';
import { checkCoupon, totals } from '@/lib/shop/checkout';
import { siriConfig } from '@/config/siri';
export const Route = createFileRoute('/cart')({head:()=>pageHead('Your bag','Review the styles in your Siri Shopping Mall bag.'),component:Cart});
function Cart() {
  const {products,coupons,settings}=useAdminStore();
  const {bag,quantity,toggleWish,couponCode,setCouponCode,delivery}=useShop();
  const [input,setInput]=useState(couponCode); const [error,setError]=useState('');
  const price=totals(bag,couponCode,delivery,products.filter(p=>p.published),coupons,settings);
  const count=price.rows.reduce((s,i)=>s+i.quantity,0);
  if(!count)return <div className="wrap page-tight empty-state"><ShoppingBag size={34}/><h2>Your bag is empty.</h2><p>Explore our latest finds and discover a style that feels just right.</p><Button asChild><Link to="/shop">Start exploring</Link></Button></div>;
  return <div className="wrap page-tight"><h1 className="plp-title">My Bag <span>({count} {count===1?'item':'items'})</span></h1>
    <div className="free-bar">{delivery==='Store Pickup'||price.merchandise>=settings.freeAt?<b>You’ve unlocked FREE delivery</b>:<b>{money(settings.freeAt-price.merchandise)} more for FREE delivery</b>}<div><i style={{width:`${Math.min(100,price.merchandise/settings.freeAt*100)}%`}}/></div><small>Sample threshold · store pickup is always free</small></div>
    <div className="cart-layout mt-4"><div>{price.rows.map(i=><article className="cart-item" key={`${i.id}-${i.size}`}><img src={i.p.image} alt={i.p.name}/><div className="cart-item-content"><span className="micro muted">SIRI COLLECTION</span><h3>{i.p.name}</h3><p>Size {i.size} · {i.p.color}</p><div className="price-row"><strong>{money(i.p.price*i.quantity)}</strong><del>{money(i.p.mrp*i.quantity)}</del></div><div className="quantity"><Button variant="ghost" size="icon" aria-label={`Reduce quantity of ${i.p.name}`} onClick={()=>quantity(i.id,i.size,i.quantity-1)}><Minus/></Button><span>{i.quantity}</span><Button variant="ghost" size="icon" aria-label={`Increase quantity of ${i.p.name}`} disabled={i.quantity>=99} onClick={()=>quantity(i.id,i.size,i.quantity+1)}><Plus/></Button></div><div className="item-actions"><Button variant="link" className="px-0" onClick={()=>{toggleWish(i.id);quantity(i.id,i.size,0)}}>Move to wishlist</Button><Button variant="link" className="px-0 text-muted-foreground" onClick={()=>quantity(i.id,i.size,0)}>Remove</Button></div></div></article>)}</div>
    <aside className="summary"><h2>Price details</h2><form className="coupon" onSubmit={e=>{e.preventDefault();const result=checkCoupon(input,price.merchandise,coupons);if(result.error){setError(result.error);return;}setCouponCode(result.coupon?.code??'');setError('');}}><input aria-label="Coupon code" placeholder="Coupon code" value={input} maxLength={30} onChange={e=>{setInput(e.target.value);setError('')}} aria-invalid={!!error} aria-describedby="coupon-feedback"/><Button type="submit" variant="link" className="px-1">Apply</Button></form>
    {(error||price.couponError)&&<p id="coupon-feedback" role="alert" className="text-destructive text-xs mb-2">{error||price.couponError}</p>}
    {couponCode&&<div className="flex items-center justify-between gap-2 text-xs"><span>{couponCode}{price.coupon?' applied':' no longer eligible'}</span><Button variant="link" size="sm" onClick={()=>{setCouponCode('');setInput('');setError('')}}>Remove coupon</Button></div>}
    <PriceBreakdown price={price}/><div className="sticky-cta"><span className="sticky-total">{money(price.total)}<small>Total</small></span><Button asChild><Link to="/checkout">Checkout</Link></Button></div></aside></div></div>;
}
