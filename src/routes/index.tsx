import { useCatalog } from '@/admin/store';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles, Store, Shirt, Scissors, MessageCircle, PackageCheck, ShieldCheck, RefreshCcw, HeartHandshake, Tag } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';
import { products, pageHead, sampleOffers, discount } from '@/lib/shop/catalog';
import hero from '@/assets/family-campaign.jpg';
import festive from '@/assets/festive-edit.jpg';
import women from '@/assets/women-sage.jpg';
import men from '@/assets/men-linen.jpg';
import boys from '@/assets/boys-teal.jpg';
import girls from '@/assets/girls-rose.jpg';
import showroom from '@/assets/showroom.jpg';

export const Route = createFileRoute('/')({
  head: () => pageHead('Shop family fashion online', 'Shop kurtis, shirts, festive wear and kidswear from Siri Shopping Mall, Kandukur. Search, compare prices and offers, and add to bag in seconds.'),
  component: Index,
});

const cats = [
  { label: 'Women', img: women, search: { category: 'Women' } },
  { label: 'Men', img: men, search: { category: 'Men' } },
  { label: 'Boys', img: boys, search: { category: 'Boys' } },
  { label: 'Girls', img: girls, search: { category: 'Girls' } },
  { label: 'Festive', img: festive, search: { occasion: 'Festive' } },
  { label: 'New Arrivals', img: women, search: { sort: 'Newest' } },
  { label: 'Offers', img: girls, search: { off: 30 } },
] as const;

function Rail({ title, sub, link, items }: { title: string; sub?: string; link: { sort?: string; occasion?: string }; items: typeof products }) {
  return (
    <section className="wrap sec">
      <div className="sec-head"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div><Link to="/shop" search={link} className="see-all">View all <ArrowRight size={14} /></Link></div>
      <div className="rail-products">{items.map(p => <ProductCard key={p.id} product={p} />)}</div>
    </section>
  );
}

function Index() {const {products,sampleOffers}=useCatalog();
  const trending = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
  const deals = [...products].sort((a, b) => discount(b) - discount(a)).slice(0, 8);
  const fresh = products.filter(p => p.isNew);
  return (
    <>
      <nav className="wrap cat-tiles" aria-label="Shop by category">
        {cats.map(c => <Link key={c.label} to="/shop" search={c.search} className="cat-tile"><img src={c.img} alt="" width={160} height={160} loading="lazy" /><span>{c.label}</span></Link>)}
      </nav>

      <section className="wrap promo">
        <Link to="/shop" search={{ occasion: 'Festive' }} className="promo-main">
          <img src={hero} alt="Family in coordinated festive outfits" width={1920} height={1024} fetchPriority="high" />
          <div className="promo-copy"><span className="tag">THE FESTIVE EDIT</span><h1>Style for every celebration.</h1><p>Kurta sets, anarkalis & kidswear for the whole family.</p><span className="btn-solid">Shop Festive <ArrowRight size={15} /></span></div>
        </Link>
        <div className="promo-side">
          <Link to="/shop" search={{ max: 999 }} className="promo-tile t-rust"><b>Under ₹999</b><span>Everyday picks</span></Link>
          <Link to="/shop" search={{ occasion: 'Family Celebration' }} className="promo-tile t-navy"><b>Family Looks</b><span>Coordinate everyone</span></Link>
          <Link to="/shop" search={{ sort: 'Newest' }} className="promo-tile t-gold"><b>New Arrivals</b><span>Just landed</span></Link>
          <Link to="/shop" search={{ occasion: 'Everyday' }} className="promo-tile t-ivory"><b>Weekend Picks</b><span>Easy cotton styles</span></Link>
        </div>
      </section>

      <div className="wrap offer-row" aria-label="Sample offers">
        {sampleOffers.map(o => <div key={o.code} className="offer"><Tag size={16} /><div><b>{o.title}</b><span>{o.note}</span></div><code>{o.code}</code></div>)}
        <span className="offer-note">Sample offers · final offers confirmed at launch</span>
      </div>

      <Rail title="Trending now" sub="Most-loved styles this week" link={{ sort: 'Popularity' }} items={trending} />

      <section className="wrap sec">
        <div className="sec-head"><div><h2>Shop by category</h2></div></div>
        <div className="cat-cards">
          {cats.slice(0, 4).map(c => <Link key={c.label} to="/shop" search={c.search} className="cat-card"><img src={c.img} alt={`${c.label} collection`} loading="lazy" width={768} height={1024} /><span>{c.label}<small>{products.filter(p => p.category === c.label).length} styles</small></span></Link>)}
        </div>
      </section>

      <Rail title="Deals for you" sub="Biggest savings on the collection" link={{ sort: 'Discount' }} items={deals} />
      <Rail title="New arrivals" link={{ sort: 'Newest' }} items={fresh} />

      <section className="wrap sec">
        <div className="sec-head"><div><h2>Shop by occasion</h2></div></div>
        <div className="chips occasion-chips">{['Festive', 'Wedding Guest', 'Everyday', 'Office', 'Family Celebration'].map(o => <Link key={o} to="/shop" search={{ occasion: o }} className="chip big">{o}</Link>)}</div>
      </section>

      <section className="wrap sec">
        <div className="helper">
          <div className="helper-copy"><Sparkles size={20} /><div><h2>Need help finding something?</h2><p>Siri Stylist suggests styles from our collection.</p></div></div>
          <div className="chips">{['Wedding outfit', 'Under ₹2000', 'Family matching', 'Festive looks', 'Office wear'].map(q => <Link key={q} to="/stylist" search={{ q }} className="chip">{q}</Link>)}</div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="sec-head"><div><h2>Shop the whole family</h2><p>Coordinated festive looks for women, men, boys & girls</p></div><Link to="/shop" search={{ occasion: 'Festive' }} className="see-all">View all <ArrowRight size={14} /></Link></div>
        <div className="family">
          <img src={hero} alt="A family in coordinated festive wear" loading="lazy" width={1920} height={1024} />
          <div className="family-list">{['rust-anarkali', 'ivory-festive-kurta', 'teal-kurta', 'rose-dress'].flatMap(id => {const p=products.find(p=>p.id===id);return p?[p]:[];}).map(p => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      <section className="wrap sec">
        <div className="showroom">
          <img src={showroom} alt="Illustrative view of a Siri fashion showroom" loading="lazy" width={1280} height={768} />
          <div><h2>Kandukur Showroom</h2><p className="muted text-sm mb-3">Shop online, pick up and try on in store.</p>
            <ul className="svc">{[[PackageCheck, 'Check availability'], [Store, 'Store pickup'], [Shirt, 'Trial room'], [MessageCircle, 'WhatsApp assistance'], [Scissors, 'Alterations']].map(([I, t]) => { const Icon = I as typeof Store; return <li key={String(t)}><Icon size={17} />{String(t)}<small>Coming soon</small></li>; })}</ul>
            <Link to="/store" className="btn-solid mt-3">Explore showroom services <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <Rail title="Recommended for you" link={{}} items={products.slice(4, 12)} />

      <div className="wrap trust">{[[ShieldCheck, 'Authentic products'], [Store, 'Kandukur showroom'], [HeartHandshake, 'Human assistance'], [RefreshCcw, 'Exchanges · policy coming soon']].map(([I, t]) => { const Icon = I as typeof Store; return <span key={String(t)}><Icon size={17} />{String(t)}</span>; })}</div>
    </>
  );
}
