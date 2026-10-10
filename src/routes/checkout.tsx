import { formatDate } from '@/lib/dates';
import { deliveryEstimate, pickupEstimate } from '@/lib/fulfillment';
import { useAdminStore } from '@/admin/store';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShop } from '@/components/shop/shop-provider';
import { CheckoutItems, PriceBreakdown } from '@/components/shop/checkout-summary';
import { pageHead, money } from '@/lib/shop/catalog';
import { addressSchema, contactSchema, upiSchema, cardSchema, totals, type Address, type Delivery } from '@/lib/shop/checkout';
import { siriConfig } from '@/config/siri';
export const Route = createFileRoute('/checkout')({head:()=>pageHead('Checkout preview','Preview your Siri Shopping Mall delivery, pickup and payment choices.'),component:Checkout});
type Payment = 'UPI' | 'Card' | 'Cash on delivery' | 'Pay at store';
function PickupDetails() {const {settings}=useAdminStore();return <div className="checkout-detail"><p>{settings.address}</p><p>{settings.hours}</p><p>{pickupEstimate(settings)}</p><p>{settings.phone}</p></div>;}
function Checkout() {
  const {products,coupons,settings}=useAdminStore();
  const {orders,bag,place,couponCode,setCouponCode,delivery,setDelivery}=useShop();
  const price=totals(bag,couponCode,delivery,products.filter(p=>p.published),coupons,settings);
  const [step,setStep]=useState(0); const [placed,setPlaced]=useState(''); const [errors,setErrors]=useState<Record<string,string>>({});
  const [address,setAddress]=useState<Address>({name:'',phone:'',pin:'',street:'',landmark:'',city:'',state:'',type:'Home'});
  const [payment,setPayment]=useState<Payment>('UPI');
  const [payFields,setPayFields]=useState({upi:'',number:'',expiry:'',cvv:'',cardName:''});
  const names=['Address','Delivery','Payment','Review'];
  const pickup=delivery==='Store Pickup';
  const chooseDelivery=(d:Delivery)=>{setDelivery(d);setErrors({});if(d==='Store Pickup'&&payment==='Cash on delivery')setPayment('Pay at store');if(d==='Doorstep'&&payment==='Pay at store')setPayment('Cash on delivery');};
  const validate=()=>{
    const result=(pickup?contactSchema:addressSchema).safeParse(address);
    if(!result.success){const fields:Record<string,string>={};result.error.issues.forEach(i=>{const key=String(i.path[0]);fields[key]??=i.message;});setErrors(fields);setStep(0);return false;}
    if(step>=2){const parsed=payment==='UPI'?upiSchema.safeParse(payFields):payment==='Card'?cardSchema.safeParse(payFields):null;
      if(parsed&&!parsed.success){const fields:Record<string,string>={};parsed.error.issues.forEach(i=>{fields[String(i.path[0])]??=i.message;});setErrors(fields);setStep(2);return false;}
      if((pickup&&payment==='Cash on delivery')||(!pickup&&payment==='Pay at store')){setErrors({payment:'Choose an available payment method.'});setStep(2);return false;}
    }
    if(price.couponError){setErrors({coupon:price.couponError});return false;}
    setErrors({});return true;
  };
  const next=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!validate())return;if(step<3)setStep(s=>s+1);else{const id=place(delivery,address,payment);if(id){setPayFields({upi:'',number:'',expiry:'',cvv:'',cardName:''});setPlaced(id);}else setErrors({order:'Your bag changed. Please review it again.'});}};
  const field=(key:keyof Address,label:string,maxLength=100,autoComplete?:string)=> <label className="field">{label}<input aria-label={label} value={address[key]} maxLength={maxLength} autoComplete={autoComplete} inputMode={key==='phone'||key==='pin'?'numeric':undefined} onChange={e=>{setAddress(a=>({...a,[key]:e.target.value}));setErrors(old=>({...old,[key]:''}));}} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined}/>{errors[key]&&<small id={`error-${key}`} className="text-destructive" role="alert">{errors[key]}</small>}</label>;
  const payField=(key:keyof typeof payFields,label:string,maxLength:number,placeholder?:string)=> <label className="field">{label}<input aria-label={label} value={payFields[key]} maxLength={maxLength} placeholder={placeholder} type={key==='cvv'?'password':'text'} autoComplete="off" inputMode={key==='number'||key==='cvv'?'numeric':undefined} onChange={e=>{setPayFields(p=>({...p,[key]:e.target.value}));setErrors(old=>({...old,[key]:''}));}} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined}/>{errors[key]&&<small id={`error-${key}`} className="text-destructive" role="alert">{errors[key]}</small>}</label>;
  const deliveryOptions=<fieldset className="checkout-options"><legend className="text-xs font-medium mb-2">Delivery method</legend>{(['Doorstep','Store Pickup'] as const).map(d=><label className="choice-option" key={d}><input type="radio" name="delivery" checked={delivery===d} onChange={()=>chooseDelivery(d)}/><span className="flex-1"><b>{d==='Doorstep'?'Doorstep delivery':`Store pickup · ${settings.name}`}</b><small className="block muted">{d==='Doorstep'?deliveryEstimate(settings):pickupEstimate(settings)}</small></span><span className={d==='Store Pickup'||!price.deliveryFee?'free':'text-xs font-medium'}>{d==='Store Pickup'||price.merchandise>=settings.freeAt?'FREE':money(settings.fee)}</span></label>)}</fieldset>;
  const completed=orders.find(o=>o.id===placed);
  if(placed)return <div className="wrap page-tight empty-state"><CheckCircle2 size={34}/><h2>Your preview order is ready.</h2><p>{placed} was created only in this browser preview. No payment was taken and nothing was sent to the store.</p><p>{completed?`${formatDate(completed.date)} · ${money(completed.total)}`:''}</p><Button asChild><Link to="/account">View preview orders</Link></Button></div>;
  if(!bag.length)return <div className="wrap page-tight empty-state"><h2>Your bag is empty.</h2><p>Add a style before previewing checkout.</p><Button asChild><Link to="/shop">Explore the collection</Link></Button></div>;
  return <div className="wrap page-tight checkout-page"><h1 className="plp-title">Checkout</h1><div className="steps">{names.map((n,i)=><span key={n} className={i===step?'active':''}>{i+1}. {n}</span>)}</div><div className="checkout-layout"><form className="checkout-form" onSubmit={next} noValidate>
    {step===0&&<>{deliveryOptions}{field('name','Full name',100,'name')}{field('phone','Mobile',10,'tel')}{!pickup&&<>{field('pin','PIN code',6,'postal-code')}{field('street','House/Flat and Street',250,'street-address')}{field('landmark','Landmark (optional)',150)}<div className="field-row">{field('city','City',100,'address-level2')}{field('state','State',100,'address-level1')}</div><fieldset className="checkout-options"><legend className="text-xs mb-2">Address type</legend><div className="flex gap-3 flex-wrap">{(['Home','Work','Other'] as const).map(t=><label className="flex items-center gap-2 text-xs" key={t}><input type="radio" name="addressType" checked={address.type===t} onChange={()=>setAddress(a=>({...a,type:t}))}/>{t}</label>)}</div></fieldset></>}{pickup&&<PickupDetails/>}</>}
    {step===1&&<>{deliveryOptions}{pickup?<PickupDetails/>:<div className="checkout-detail"><p>Delivery: {price.deliveryFee?money(price.deliveryFee):'FREE'}</p><p>{deliveryEstimate(settings)}</p></div>}</>}
    {step===2&&<><fieldset className="checkout-options"><legend className="text-xs font-medium mb-2">Payment method</legend>{(['UPI','Card',pickup?'Pay at store':'Cash on delivery'] as Payment[]).map(p=><label className="choice-option" key={p}><input type="radio" name="payment" checked={payment===p} onChange={()=>{setPayment(p);setPayFields({upi:'',number:'',expiry:'',cvv:'',cardName:''});setErrors({})}}/>{p}</label>)}</fieldset>{payment==='UPI'&&payField('upi','UPI ID',100,'name@bank')}{payment==='Card'&&<>{payField('number','Card number',23)}<div className="field-row">{payField('expiry','Expiry',5,'MM/YY')}{payField('cvv','CVV',4)}</div>{payField('cardName','Name on card',100)}</>}<p className="preview-note">Payment preview only. No real payment processing; do not enter real card details.</p></>}
    {step===3&&<><h2 className="text-base font-semibold font-sans">Review your order</h2><CheckoutItems price={price}/><section className="checkout-detail"><h3 className="text-sm font-semibold font-sans mb-2">{pickup?'Store pickup':'Delivery address'}</h3><p>{address.name} · {address.phone}</p>{pickup?<PickupDetails/>:<><p>{address.street}{address.landmark?`, ${address.landmark}`:''}</p><p>{address.city}, {address.state} · {address.pin}</p><p>{address.type}</p><p>{deliveryEstimate(settings)}</p></>}</section><div className="checkout-detail"><b>Payment method</b><p>{payment}</p></div><div><PriceBreakdown price={price}/></div><p className="preview-note">Placing this order creates a local preview record only. No payment is taken and nothing is sent to the store.</p></>}
    {(errors['coupon']||price.couponError)&&<div role="alert" className="text-destructive text-xs">{errors['coupon']||price.couponError}<Button type="button" variant="link" size="sm" onClick={()=>{setCouponCode('');setErrors({})}}>Remove coupon</Button></div>}{(errors['payment']||errors['order'])&&<p role="alert" className="text-destructive text-xs">{errors['payment']||errors['order']}</p>}
    <div className="flex gap-3">{step>0&&<Button type="button" variant="outline" onClick={()=>{setStep(s=>s-1);setErrors({})}}>Back</Button>}<Button type="submit">{step===3?'Place preview order':'Continue'}</Button></div>
    </form><aside className="summary checkout-summary"><h2>Order summary</h2><CheckoutItems price={price}/><PriceBreakdown price={price}/><p className="preview-note">Preview only · no payment will be taken.</p></aside></div></div>;
}
