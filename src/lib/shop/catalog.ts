import women from '@/assets/women-sage.jpg';
import men from '@/assets/men-linen.jpg';
import boys from '@/assets/boys-teal.jpg';
import girls from '@/assets/girls-rose.jpg';
import festive from '@/assets/festive-edit.jpg';
import { siriConfig } from '@/config/siri';
import { formatINR } from '@/lib/pricing';

export type Product = {
  id: string; name: string; descriptor: string; category: string; price: number; mrp: number;
  image: string; color: string; fabric: string; occasion: string; sizes: string[];
  badge?: string; isNew?: boolean; popularity: number;
};

const P = (p: Product) => p;
// Sample catalog — replace with live catalog service later.
export const products: Product[] = [
  P({id:'sage-kurta',name:'Sage Embroidered Kurta Set',descriptor:'Cotton kurta, pants & dupatta',category:'Women',price:1899,mrp:2499,image:women,color:'Sage',fabric:'Cotton',occasion:'Festive',sizes:['XS','S','M','L','XL'],badge:'NEW',isNew:true,popularity:9}),
  P({id:'rust-anarkali',name:'Terracotta Silk Anarkali Set',descriptor:'Zari-work anarkali with dupatta',category:'Women',price:3299,mrp:4299,image:festive,color:'Terracotta',fabric:'Silk blend',occasion:'Wedding Guest',sizes:['S','M','L','XL'],badge:'FESTIVE',popularity:10}),
  P({id:'linen-shirt',name:'Everyday Linen Shirt',descriptor:'Regular fit, full sleeves',category:'Men',price:1299,mrp:1699,image:men,color:'Ivory',fabric:'Linen',occasion:'Office',sizes:['S','M','L','XL','XXL'],popularity:8}),
  P({id:'teal-kurta',name:'Little Celebrations Kurta Set',descriptor:'Cotton kurta with pyjama',category:'Boys',price:999,mrp:1399,image:boys,color:'Teal',fabric:'Cotton',occasion:'Festive',sizes:['4–5Y','6–7Y','8–9Y','10–11Y'],popularity:7}),
  P({id:'rose-dress',name:'Rose Garden Festive Dress',descriptor:'Embroidered flared gown',category:'Girls',price:1499,mrp:1999,image:girls,color:'Rose',fabric:'Silk blend',occasion:'Wedding Guest',sizes:['4–5Y','6–7Y','8–9Y','10–11Y'],badge:'NEW',isNew:true,popularity:9}),
  P({id:'sage-daily-kurti',name:'Sage Chikan Daily Kurti',descriptor:'Straight cut, 3/4 sleeves',category:'Women',price:899,mrp:1299,image:women,color:'Sage',fabric:'Cotton',occasion:'Everyday',sizes:['S','M','L','XL','XXL'],popularity:8}),
  P({id:'ivory-festive-kurta',name:'Ivory Festive Kurta',descriptor:'Mandarin collar, straight fit',category:'Men',price:1699,mrp:2299,image:men,color:'Ivory',fabric:'Cotton',occasion:'Family Celebration',sizes:['S','M','L','XL','XXL'],isNew:true,popularity:6}),
  P({id:'teal-weekend-kurta',name:'Teal Weekend Kurta',descriptor:'Soft cotton, easy wear',category:'Boys',price:749,mrp:999,image:boys,color:'Teal',fabric:'Cotton',occasion:'Everyday',sizes:['4–5Y','6–7Y','8–9Y','10–11Y'],popularity:5}),
  P({id:'rose-party-frock',name:'Blush Party Frock',descriptor:'Net layers, zari border',category:'Girls',price:1199,mrp:1599,image:girls,color:'Rose',fabric:'Net',occasion:'Festive',sizes:['4–5Y','6–7Y','8–9Y','10–11Y'],popularity:6}),
  P({id:'rust-silk-dupatta-set',name:'Rust Silk Festive Suit',descriptor:'Kurta, palazzo & silk dupatta',category:'Women',price:2499,mrp:3499,image:festive,color:'Terracotta',fabric:'Silk blend',occasion:'Festive',sizes:['S','M','L','XL'],isNew:true,popularity:7}),
  P({id:'linen-office-shirt',name:'Linen Office Shirt',descriptor:'Slim fit, button-down',category:'Men',price:1099,mrp:1499,image:men,color:'Ivory',fabric:'Linen',occasion:'Office',sizes:['S','M','L','XL'],popularity:5}),
  P({id:'sage-office-kurta',name:'Sage Office Kurta',descriptor:'A-line, pocket detail',category:'Women',price:1199,mrp:1599,image:women,color:'Sage',fabric:'Cotton',occasion:'Office',sizes:['S','M','L','XL'],popularity:6}),
];

export const categories = ['Women', 'Men', 'Boys', 'Girls'];
// Sample offers — real codes come from the offers service later.
export const sampleOffers = siriConfig.coupons;
export const sampleFreeDeliveryThreshold = siriConfig.delivery.freeAt;
export const money = formatINR;
export const discount = (p: Product) => Math.round((1 - p.price / p.mrp) * 100);
const typos: Record<string, string> = { kurti: 'kurt', kurthi: 'kurt', kurta: 'kurt', green: 'sage', pink: 'rose', shirts: 'shirt', saree: 'silk', wedding: 'wedding', dress: 'dress', frock: 'frock' };
export function findProducts(query: string, catalog: Product[] = products) {
  const q = query.toLowerCase();
  const budget = q.match(/under\s*₹?\s*(\d+)/);
  const words = q.replace(/under\s*₹?\s*\d+/, '').split(/\s+/).filter(w => w.length > 2 && !['for', 'the', 'and', 'with'].includes(w)).map(w => typos[w] ?? w);
  return catalog.filter(p => {
    if (budget && p.price > Number(budget[1])) return false;
    if (!words.length) return !!budget;
    const hay = `${p.name} ${p.descriptor} ${p.category} ${p.color} ${p.fabric} ${p.occasion}`.toLowerCase();
    return words.some(w => hay.includes(w) || w === 'family');
  });
}
export const pageHead = (title: string, description: string) => ({ meta: [{title:`${title} | Siri Shopping Mall`},{name:'description',content:description},{property:'og:title',content:`${title} | Siri Shopping Mall`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] });
