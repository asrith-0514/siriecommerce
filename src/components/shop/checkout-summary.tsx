import { money } from '@/lib/shop/catalog';
import { totals } from '@/lib/shop/checkout';

export function PriceBreakdown({ price }: { price: ReturnType<typeof totals> }) {
  return <>
    <div className="summary-row"><span>Subtotal</span><span>{money(price.subtotal)}</span></div>
    <div className="summary-row text-success"><span>Discount</span><span>−{money(price.saving)}</span></div>
    <div className="summary-row text-success"><span>Coupon{price.coupon ? ` (${price.coupon.code})` : ''}</span><span>{price.couponDiscount ? `−${money(price.couponDiscount)}` : '—'}</span></div>
    <div className="summary-row"><span>Delivery</span><span>{price.deliveryFee ? money(price.deliveryFee) : 'FREE'}</span></div>
    <div className="summary-row total"><span>Total</span><span>{money(price.total)}</span></div>
  </>;
}
export function CheckoutItems({ price }: { price: ReturnType<typeof totals> }) {
  return <div className="checkout-items">{price.rows.map(i => <div className="checkout-summary-item" key={`${i.id}-${i.size}`}>
    <img src={i.p.image} alt={i.p.name} /><div><b>{i.p.name}</b><small>Size {i.size} · Qty {i.quantity}</small><strong>{money(i.p.price * i.quantity)}</strong></div>
  </div>)}</div>;
}