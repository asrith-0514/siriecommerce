import { describe, expect, it } from 'vitest';
import { totals, checkCoupon, addressSchema, contactSchema, upiSchema, cardSchema } from '@/lib/shop/checkout';
import { siriConfig } from '@/config/siri';

describe('Bag pricing', () => {
  it('uses the configured delivery boundary and free pickup', () => {
    expect(totals([{id:'rose-dress',size:'4–5Y',quantity:1}]).deliveryFee).toBe(0);
    expect(totals([{id:'teal-kurta',size:'4–5Y',quantity:1}]).deliveryFee).toBe(siriConfig.delivery.fee);
    expect(totals([{id:'teal-kurta',size:'4–5Y',quantity:1}], '', 'Store Pickup').deliveryFee).toBe(0);
  });
  it('validates coupon minimums on sale-price subtotal', () => {
    expect(checkCoupon('SIRI10',1998).error).toContain('minimum');
    expect(checkCoupon(' siri10 ',1999).coupon?.code).toBe('SIRI10');
    expect(checkCoupon('FESTIVE500',4998).error).toContain('minimum');
    expect(checkCoupon('FESTIVE500',4999).coupon?.code).toBe('FESTIVE500');
    expect(checkCoupon('<script>',5000).error).toBeTruthy();
    expect(checkCoupon('UNKNOWN',5000).error).toContain('invalid');
  });
  it('calculates and removes coupons without double-counting product discounts', () => {
    const bag=[{id:'sage-kurta',size:'M',quantity:3}];
    const price=totals(bag,'SIRI10');
    expect(price.subtotal).toBe(7497);expect(price.merchandise).toBe(5697);
    expect(price.couponDiscount).toBe(570);expect(price.total).toBe(5127);
    expect(totals(bag,'FESTIVE500').total).toBe(5197);
    expect(totals(bag).total).toBe(5697);
    expect(totals([{id:'sage-kurta',size:'M',quantity:1}],'SIRI10').couponError).toBeTruthy();
  });
  it('rejects invalid catalog items and quantities', () => {
    expect(totals([{id:'unknown',size:'M',quantity:1},{id:'sage-kurta',size:'bad',quantity:1},{id:'sage-kurta',size:'M',quantity:-1}]).rows).toHaveLength(0);
  });
});
describe('Checkout validation',()=>{
  it('requires full address only for doorstep',()=>{
    const contact={name:'Test Shopper',phone:'9876543210'};
    expect(contactSchema.safeParse(contact).success).toBe(true);
    expect(addressSchema.safeParse(contact).success).toBe(false);
    expect(addressSchema.safeParse({...contact,pin:'523105',street:'Flat 12, Main Street',landmark:'',city:'Kandukur',state:'Andhra Pradesh',type:'Home'}).success).toBe(true);
    expect(contactSchema.safeParse({...contact,phone:'1234567890'}).success).toBe(false);
  });
  it('validates UPI and demo card fields',()=>{
    expect(upiSchema.safeParse({upi:'shopper@bank'}).success).toBe(true);
    expect(upiSchema.safeParse({upi:'bad'}).success).toBe(false);
    const card={number:'4111 1111 1111 1111',expiry:'12/39',cvv:'123',cardName:'Test Shopper'};
    expect(cardSchema.safeParse(card).success).toBe(true);
    expect(cardSchema.safeParse({...card,number:'4111111111111112'}).success).toBe(false);
    expect(cardSchema.safeParse({...card,expiry:'01/20'}).success).toBe(false);
    expect(cardSchema.safeParse({...card,cvv:'12'}).success).toBe(false);
  });
});