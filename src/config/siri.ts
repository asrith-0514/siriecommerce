// TODO(owner): Confirm all sample offers, delivery and showroom details before launch.
export const siriConfig = {
  coupons: [
    { code: 'SIRI10', title: '10% OFF', note: 'Min order ₹1,999', minimum: 1999, kind: 'percent', value: 10 },
    { code: 'FESTIVE500', title: '₹500 OFF', note: 'Min order ₹4,999', minimum: 4999, kind: 'fixed', value: 500 },
  ],
  delivery: { fee: 79, freeAt: 1499, deliveryMinDays: 3, deliveryMaxDays: 5 },
  showroom: {
    name: 'Kandukur Showroom',
    address: 'Siri Shopping Mall, Kandukur Showroom, [street address to be confirmed], Kandukur, Andhra Pradesh',
    phone: '+91 90000 00000',
    whatsapp: '919000000000',
    hours: '10:00 AM to 9:00 PM, all days',
    pickupReadyHours: 4,
  },
  exchangeDays: 7, // Demo setting only, not a confirmed exchange policy.
  sampleNote: 'Sample details',
} as const;