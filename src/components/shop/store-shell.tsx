import { useCatalog } from '@/admin/store';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Search, Heart, UserRound, ShoppingBag, ScanLine, Sparkles, MapPin, ArrowUpRight, Home, LayoutGrid, Clock, TrendingUp, X } from 'lucide-react';
import { categories, products, findProducts, money } from '@/lib/shop/catalog';
import { useShop } from './shop-provider';
import logo from '@/assets/siri-logo.jpg';

const shortcuts = [
  { label: 'Women', search: { category: 'Women' } },
  { label: 'Men', search: { category: 'Men' } },
  { label: 'Boys', search: { category: 'Boys' } },
  { label: 'Girls', search: { category: 'Girls' } },
  { label: 'Festive', search: { occasion: 'Festive' } },
  { label: 'New Arrivals', search: { sort: 'Newest' } },
  { label: 'Under ₹999', search: { max: 999 } },
] as const;
const trending = ['kurti', 'festive family outfits', 'men linen shirt', 'under 2000', 'girls party dress'];

function SearchBox({ onDone }: { onDone?: () => void }) {
  const {products}=useCatalog();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const nav = useNavigate();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const results = q.trim() ? findProducts(q,products).slice(0, 5) : products.slice(0, 4);
  const suggestions = q.trim() ? ['', ' sets', ' cotton', ' festive', ' under ₹1500'].map(s => (q.trim() + s)) : [];
  const go = (term: string) => { if (!term.trim()) return; setRecent(r => [term, ...r.filter(x => x !== term)].slice(0, 4)); setOpen(false); setQ(''); onDone?.(); nav({ to: '/shop', search: { q: term } }); };
  return (
    <div className="sb" ref={box}>
      <form className="sb-field" role="search" onSubmit={e => { e.preventDefault(); go(q); }}>
        <Search size={18} />
        <input value={q} onChange={e => setQ(e.target.value)} onFocus={() => setOpen(true)} onKeyDown={e => e.key === 'Escape' && setOpen(false)} placeholder="Search kurtis, shirts, festive wear…" aria-label="Search products" />
        {q && <button type="button" aria-label="Clear search" onClick={() => setQ('')}><X size={16} /></button>}
      </form>
      {open && (
        <div className="sb-panel">
          {!q.trim() && recent.length > 0 && <div className="sb-group"><h4>Recent searches</h4><div className="chips">{recent.map(r => <button key={r} className="chip" onClick={() => go(r)}><Clock size={12} />{r}</button>)}</div></div>}
          {!q.trim() && <div className="sb-group"><h4>Trending</h4><div className="chips">{trending.map(r => <button key={r} className="chip" onClick={() => go(r)}><TrendingUp size={12} />{r}</button>)}</div></div>}
          {!q.trim() && <div className="sb-group"><h4>Categories</h4><div className="chips">{categories.map(c => <Link key={c} className="chip" to="/shop" search={{ category: c }} onClick={() => { setOpen(false); onDone?.(); }}>{c}</Link>)}</div></div>}
          {suggestions.length > 0 && <div className="sb-group">{suggestions.map(s => <button key={s} className="sb-suggest" onClick={() => go(s)}><Search size={13} />{s}</button>)}</div>}
          <div className="sb-group"><h4>{q.trim() ? (results.length ? 'Products' : 'Try another search') : 'Popular products'}</h4>
            {results.map(p => <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="sb-item" onClick={() => { setOpen(false); onDone?.(); }}><img src={p.image} alt="" /><span><b>{p.name}</b><small>{p.category} · {money(p.price)}</small></span></Link>)}
            {q.trim() && !results.length && <p className="muted text-xs">Try a colour, fabric, occasion, or “under 2000”.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function StoreShell({ children }: { children: React.ReactNode }) {
  const { bag, wishlist } = useShop();
  const {settings}=useCatalog();
  const location = useLocation();
  const checkout = location.pathname === '/checkout';
  const count = bag.reduce((s, i) => s + i.quantity, 0);
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="utility-strip"><span><MapPin size={12} /> Siri Shopping Mall · {settings.name}</span><span className="hide-sm">Shop online or visit our showroom</span><Link to="/store">Store pickup & trial room <ArrowUpRight size={11} /></Link></div>
      <header className="hdr">
        <div className="hdr-row">
          <Link to="/" className="logo" aria-label="Siri Shopping Mall home">
            <img src={logo} alt="Siri Shopping Mall Logo" className="logo-img" width={44} height={44} />
            <span className="logo-text"><b>SIRI</b><span>SHOPPING<br />MALL</span></span>
          </Link>
          <div className="hdr-search"><SearchBox /></div>
          <nav className="hdr-icons" aria-label="Your shopping">
            {!checkout && <Link to="/stylist" className="hdr-icon hide-sm"><Sparkles size={20} /><span>Stylist</span></Link>}
            {!checkout && <Link to="/scan" className="hdr-icon hide-md"><ScanLine size={20} /><span>Scan</span></Link>}
            <Link to="/account" className="hdr-icon hide-sm"><UserRound size={20} /><span>Account</span></Link>
            <Link to="/wishlist" className="hdr-icon"><Heart size={20} />{wishlist.length > 0 && <i className="count">{wishlist.length}</i>}<span>Wishlist</span></Link>
            <Link to="/cart" className="hdr-icon" aria-label={`Bag, ${count} items`}><ShoppingBag size={20} />{count > 0 && <i className="count" key={count}>{count}</i>}<span>Bag</span></Link>
          </nav>
        </div>
        <div className="hdr-search-mobile"><SearchBox /></div>
        {!checkout && <nav className="cat-strip" aria-label="Categories">
          {shortcuts.map(s => <Link key={s.label} to="/shop" search={s.search} className={s.label === 'Festive' || s.label === 'Under ₹999' ? 'accent' : ''}>{s.label}</Link>)}
          <Link to="/store">Kandukur Showroom</Link>
        </nav>}
      </header>
      <main id="main-content">{children}</main>
      <footer className="ftr">
        <div className="ftr-grid">
          <div>
            <Link to="/" className="logo" aria-label="Siri Shopping Mall home">
              <img src={logo} alt="Siri Shopping Mall Logo" className="logo-img" width={48} height={48} />
              <span className="logo-text"><b>SIRI</b><span>SHOPPING<br />MALL</span></span>
            </Link>
            <p>Your family’s fashion store in Kandukur, Andhra Pradesh — now online.</p>
          </div>
          <div><h4>Shop</h4>{categories.map(c => <Link key={c} to="/shop" search={{ category: c }}>{c}</Link>)}</div>
          <div><h4>Help</h4><Link to="/account">My orders</Link><Link to="/stylist">Siri Stylist</Link><Link to="/scan">Garment scanner</Link></div>
          <div><h4>Store</h4><Link to="/store">Kandukur Showroom</Link><Link to="/store">Store pickup</Link><Link to="/policies">Policies</Link></div>
        </div>
        <div className="ftr-bottom"><span>© {new Date().getFullYear()} Siri Shopping Mall</span><span>Sample catalogue · shopping services preview</span></div>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[{ to: '/' as const, icon: Home, label: 'Home' }, { to: '/shop' as const, icon: LayoutGrid, label: 'Categories' }, { to: '/stylist' as const, icon: Sparkles, label: 'Stylist' }, { to: '/wishlist' as const, icon: Heart, label: 'Wishlist' }, { to: '/account' as const, icon: UserRound, label: 'Account' }].filter(item => !checkout || item.to !== '/stylist').map(({ to, icon: Icon, label }) => <Link key={to} to={to} className={location.pathname === to ? 'active' : ''}><Icon size={20} /><span>{label}</span></Link>)}
      </nav>
    </>
  );
}
