import { z } from 'zod';
import { siriConfig } from '@/config/siri';
import { products, money, type Product } from './catalog';
import type { Coupon } from '@/admin/models';
import { roundRupees } from '@/lib/pricing';
import { dateKey } from '@/lib/dates';

export type Delivery = 'Doorstep' | 'Store Pickup';
export type CheckoutItem = { id: string; size: string; quantity: number };
const required = (label: string, max = 100) => z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`).refine(v => !/[\u0000-\u001f<>]/.test(v), 'Remove unsupported characters.');
export const contactSchema = z.object({
  name: required('Full name'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number starting with 6–9.'),
});
export const addressSchema = contactSchema.extend({
  pin: z.string().trim().regex(/^\d{6}$/, 'Enter an exactly 6-digit PIN code.'),
  street: required('House/Flat and Street', 250).refine(v => v.length >= 10, 'Address must contain at least 10 characters.'),
  landmark: z.string().trim().max(150, 'Landmark must be under 150 characters.').refine(v => !/[\u0000-\u001f<>]/.test(v), 'Remove unsupported characters.'),
  city: required('City'), state: required('State'), type: z.enum(['Home', 'Work', 'Other']),
});
export type Address = z.infer<typeof addressSchema>;
export const upiSchema = z.object({ upi: z.string().trim().max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,63}@[a-zA-Z][a-zA-Z0-9.-]{1,31}$/, 'Enter a valid UPI ID, such as name@bank.') });
function luhn(value: string) {
  const digits = value.replace(/\s/g, '');
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) { let n = Number(digits[i]); if ((digits.length - 1 - i) % 2 === 1) { n *= 2; if (n > 9) n -= 9; } sum += n; }
  return sum % 10 === 0;
}
export const cardSchema = z.object({
  number: z.string().trim().regex(/^(?:\d[ ]?){12,18}\d$/, 'Enter a valid 13–19 digit card number.').refine(luhn, 'Enter a valid card number.'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Enter expiry as MM/YY.').refine(v => {
    const [month, year] = v.split('/').map(Number); const now = new Date();
    if (month === undefined || year === undefined) return false;
    return 2000 + year > now.getFullYear() || (2000 + year === now.getFullYear() && month >= now.getMonth() + 1);
  }, 'Card expiry must be current or in the future.'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Enter a 3 or 4-digit CVV.'), cardName: required('Name on card'),
});
export const couponSchema = z.string().trim().max(30, 'Coupon code is too long.').regex(/^[a-zA-Z0-9]+$/, 'Enter a valid coupon code.').transform(v => v.toUpperCase());
export function checkCoupon(code: string, amount: number, coupons: readonly (typeof siriConfig.coupons[number] | Coupon)[] = siriConfig.coupons) {
  const parsed = couponSchema.safeParse(code);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Enter a coupon code.' };
  const coupon = coupons.find(c => c.code === parsed.data);
  if (!coupon) return { error: 'This coupon code is invalid.' };
  if (('enabled' in coupon && !coupon.enabled) || ('expiry' in coupon && coupon.expiry && coupon.expiry < dateKey())) return { error: 'This coupon is disabled or expired.' };
  if (amount < coupon.minimum) return { error: `${coupon.code} requires a minimum order of ${money(coupon.minimum)} (before delivery).` };
  return { coupon };
}
export function totals(bag: CheckoutItem[], code = '', delivery: Delivery = 'Doorstep', catalog: Product[] = products, coupons: readonly (typeof siriConfig.coupons[number] | Coupon)[] = siriConfig.coupons, settings: {fee:number;freeAt:number} = siriConfig.delivery) {
  const rows = bag.flatMap(i => { const p = catalog.find(p => p.id === i.id); return p && p.sizes.includes(i.size) && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 99 ? [{ ...i, p }] : []; });
  const subtotal = roundRupees(rows.reduce((s, i) => s + roundRupees(i.p.mrp) * i.quantity, 0));
  const merchandise = roundRupees(rows.reduce((s, i) => s + roundRupees(i.p.price) * i.quantity, 0));
  const result = code ? checkCoupon(code, merchandise, coupons) : undefined;
  const coupon = result?.coupon;
  const rawCouponDiscount = coupon ? Math.min(merchandise, roundRupees(coupon.kind === 'percent' ? merchandise * coupon.value / 100 : coupon.value)) : 0;
  const couponDiscount = coupon && 'maxDiscount' in coupon && coupon.maxDiscount > 0 ? Math.min(rawCouponDiscount, roundRupees(coupon.maxDiscount)) : rawCouponDiscount;
  const deliveryFee = !rows.length || delivery === 'Store Pickup' || merchandise >= settings.freeAt ? 0 : roundRupees(settings.fee);
  return { rows, subtotal, merchandise, saving: subtotal - merchandise, coupon, couponError: result?.error, couponDiscount, deliveryFee, total: roundRupees(merchandise - couponDiscount + deliveryFee) };
}