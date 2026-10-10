import { useCatalog } from '@/admin/store';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { SlidersHorizontal, SearchX, X, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ProductCard } from '@/components/shop/product-card';
import { products, pageHead, findProducts, discount, money } from '@/lib/shop/catalog';

type S = { category?: string | undefined; occasion?: string | undefined; q?: string | undefined; sort?: string | undefined; max?: number | undefined; fabric?: string | undefined; color?: string | undefined; size?: string | undefined; off?: number | undefined };
const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
const num = (v: unknown) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : undefined);

export const Route = createFileRoute('/shop')({
  validateSearch: (s: Record<string, unknown>): S => ({ category: str(s['category']), occasion: str(s['occasion']), q: str(s['q']), sort: str(s['sort']), max: num(s['max']), fabric: str(s['fabric']), color: str(s['color']), size: str(s['size']), off: num(s['off']) }),
  head: () => pageHead('Shop the collection', 'Browse sample Siri Shopping Mall fashion for women, men, boys and girls by size, colour, fabric, occasion, price and discount.'),
  component: Shop,
});

const sorts = ['Recommended', 'Popularity', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Discount'];
const uniq = (k: 'fabric' | 'color' | 'occasion') => [...new Set(products.map(p => p[k]))];


function Filters({ s, set }: { s: S; set: (patch: Partial<S>) => void }) {
 const {products}=useCatalog();const allSizes=[...new Set(products.flatMap(p=>p.sizes))];const uniq=(k:'fabric'|'color'|'occasion')=>[...new Set(products.map(p=>p[k]))];
  const Group = ({ title, k, opts }: { title: string; k: 'category' | 'fabric' | 'color' | 'occasion' | 'size'; opts: string[] }) => (
    <fieldset className="flt-group"><legend>{title}</legend><div className="chips">{opts.map(o => <button type="button" key={o} className={`chip ${s[k] === o ? 'on' : ''}`} aria-pressed={s[k] === o} onClick={() => set({ [k]: s[k] === o ? undefined : o })}>{o}</button>)}</div></fieldset>
  );
  return (
    <div className="flt">
      <Group title="Category" k="category" opts={['Women', 'Men', 'Boys', 'Girls']} />
      <fieldset className="flt-group"><legend>Price</legend><div className="chips">{[999, 1499, 1999, 2999].map(m => <button type="button" key={m} className={`chip ${s.max === m ? 'on' : ''}`} onClick={() => set({ max: s.max === m ? undefined : m })}>Under {money(m)}</button>)}</div></fieldset>
      <Group title="Size" k="size" opts={allSizes} />
      <Group title="Colour" k="color" opts={uniq('color')} />
      <Group title="Fabric" k="fabric" opts={uniq('fabric')} />
      <Group title="Occasion" k="occasion" opts={uniq('occasion')} />
      <fieldset className="flt-group"><legend>Discount</legend><div className="chips">{[20, 30].map(d => <button type="button" key={d} className={`chip ${s.off === d ? 'on' : ''}`} onClick={() => set({ off: s.off === d ? undefined : d })}>{d}% and above</button>)}</div></fieldset>
      <fieldset className="flt-group"><legend>Availability</legend><p className="text-xs muted">Live showroom stock coming soon.</p></fieldset>
    </div>
  );
}

function Shop() {const {products,sampleOffers}=useCatalog();
  const s = Route.useSearch();
  const nav = useNavigate({ from: '/shop' });
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<S>) => nav({ search: prev => ({ ...prev, ...patch }), replace: true });
  const base = s.q ? findProducts(s.q,products) : products;
  let list = base.filter(p =>
    (!s.category || (s.category === 'Kids' ? ['Boys', 'Girls'].includes(p.category) : p.category === s.category)) &&
    (!s.occasion || p.occasion === s.occasion) && (!s.fabric || p.fabric === s.fabric) && (!s.color || p.color === s.color) &&
    (!s.size || p.sizes.includes(s.size)) && (!s.max || p.price <= s.max) && (!s.off || discount(p) >= s.off));
  const sort = s.sort ?? 'Recommended';
  if (sort === 'Popularity') list = [...list].sort((a, b) => b.popularity - a.popularity);
  if (sort === 'Newest') list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
  if (sort === 'Price: Low to High') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'Price: High to Low') list = [...list].sort((a, b) => b.price - a.price);
  if (sort === 'Discount') list = [...list].sort((a, b) => discount(b) - discount(a));
  const chips: [keyof S, string][] = ([['category', s.category], ['occasion', s.occasion], ['q', s.q && `“${s.q}”`], ['max', s.max && `Under ${money(s.max)}`], ['size', s.size && `Size ${s.size}`], ['color', s.color], ['fabric', s.fabric], ['off', s.off && `${s.off}%+ off`]] as [keyof S, unknown][]).filter((c): c is [keyof S, string] => typeof c[1] === 'string' && !!c[1]);
  const title = s.q ? `Results for “${s.q}”` : s.occasion ?? (s.category && s.category !== 'All' ? s.category : 'All products');
  const clear = () => nav({ search: {}, replace: true });
  return (
    <div className="wrap page-tight">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span>{title}</span></nav>
      <div className="plp-head"><div><h1>{title}</h1><p>{list.length} products</p></div></div>
      <div className="plp">
        <aside className="plp-side" aria-label="Filters"><div className="flex justify-between items-center mb-2"><h2 className="text-sm font-semibold">Filters</h2>{chips.length > 0 && <button className="link-btn" onClick={clear}>Clear all</button>}</div><Filters s={s} set={set} /></aside>
        <div className="min-w-0">
          <div className="plp-bar">
            <button className="bar-btn plp-filter-btn" onClick={() => setOpen(true)}><SlidersHorizontal size={15} /> Filters{chips.length > 0 && <i className="dot-count">{chips.length}</i>}</button>
            <label className="bar-btn"><ArrowUpDown size={15} /><span className="sr-only">Sort by</span><select value={sort} onChange={e => set({ sort: e.target.value === 'Recommended' ? undefined : e.target.value })}>{sorts.map(o => <option key={o}>{o}</option>)}</select></label>
          </div>
          {chips.length > 0 && <div className="chips applied">{chips.map(([k, l]) => <button key={k} className="chip on" onClick={() => set({ [k]: undefined })} aria-label={`Remove ${l}`}>{l} <X size={12} /></button>)}<button className="link-btn" onClick={clear}>Clear all</button></div>}
          {list.length ? <div className="grid-products">{list.map(p => <ProductCard key={p.id} product={p} />)}</div> : (
            <div className="empty-state"><SearchX size={32} /><h2>Try another search.</h2><p>No styles match these filters yet. Remove a filter or explore everything.</p><Button onClick={clear}>Clear all filters</Button></div>
          )}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-auto rounded-t-xl">
          <SheetHeader><SheetTitle>Filters</SheetTitle><SheetDescription>{list.length} products match</SheetDescription></SheetHeader>
          <div className="px-4"><Filters s={s} set={set} /></div>
          <SheetFooter className="flex-row gap-2"><Button variant="outline" className="flex-1" onClick={clear}>Clear All</Button><Button className="flex-1" onClick={() => setOpen(false)}>Apply · {list.length}</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
