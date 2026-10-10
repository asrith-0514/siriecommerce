import { formatDate } from '@/lib/dates';
import { useAdminStore } from '@/admin/store';
import { pickupSteps, deliverySteps } from '@/admin/models';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ChevronRight, Search, Package, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShop } from '@/components/shop/shop-provider';
import { money, pageHead, products } from '@/lib/shop/catalog';

export const Route = createFileRoute('/account')({ head: () => pageHead('My account & orders', 'Preview your Siri Shopping Mall orders, saved styles, and future account services.'), component: Account });

const steps = { Doorstep: ['Placed', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered'], 'Store Pickup': ['Placed', 'Preparing at Kandukur Showroom', 'Ready for Pickup', 'Picked Up'] };

function Account() {
  const { orders, wishlist } = useShop();
  const {products}=useAdminStore();
  const [tab, setTab] = useState('My Orders');
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const list = orders.filter(o => (type === 'All' || o.delivery === type) && (!q || o.id.toLowerCase().includes(q.toLowerCase()) || o.items.some(i => products.find(p => p.id === i.id)?.name.toLowerCase().includes(q.toLowerCase()))));
  return (
    <div className="wrap page-tight">
      <h1 className="plp-title">My Account</h1>
      <p className="text-xs muted mb-3">Preview account · secure sign-in arrives with Siri’s customer services.</p>
      <div className="chips mb-4">{['My Orders', 'Wishlist', 'Saved Addresses', 'Alteration Passes', 'Profile'].map(t => <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tab === 'My Orders' ? (
        <>
          <div className="order-tools">
            <label className="order-search"><Search size={15} /><input placeholder="Search orders" aria-label="Search orders" value={q} onChange={e => setQ(e.target.value)} /></label>
            <div className="chips">{['All', 'Doorstep', 'Store Pickup'].map(t => <button key={t} className={`chip ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>{t}</button>)}</div>
          </div>
          {list.length ? list.map(o => {
            const first = products.find(p => p.id === o.items[0]?.id);
            const pickup = o.delivery === 'Store Pickup';
            return (
              <article className="order-card" key={o.id}>
                {first && <img src={first.image} alt="" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap"><span className={`status ${pickup ? 'pickup' : ''}`}>{pickup ? <Store size={12} /> : <Package size={12} />}{o.status}</span><span className="text-xs muted">{formatDate(o.date)}</span></div>
                  <p className="font-medium text-sm truncate mt-1">{first?.name}{o.items.length > 1 ? ` + ${o.items.length - 1} more` : ''}</p>
                  <p className="text-xs muted">{o.id} · Size {o.items[0]?.size} · Qty {o.items.reduce((s, i) => s + i.quantity, 0)} · <b className="text-foreground">{money(o.total)}</b></p>
                  <ol className="track" aria-label={pickup ? 'Pickup progress' : 'Delivery progress'}>{(pickup?pickupSteps:deliverySteps).map((s,i,all)=><li key={s} className={i<=all.indexOf(o.status)?'done':''}>{s}</li>)}</ol>
                  {o.pickupCode&&<p className="text-xs muted">Pickup code: {o.pickupCode}</p>}<p className="text-[10px] muted">Preview status · not a live tracking update</p>
                </div>
                <ChevronRight size={18} className="muted shrink-0" />
              </article>
            );
          }) : <div className="empty-state"><Package size={32} /><h2>No orders yet.</h2><p>Complete a checkout preview to see how your orders will look.</p><Button asChild><Link to="/shop">Start shopping</Link></Button></div>}
        </>
      ) : tab === 'Wishlist' ? <div className="empty-state"><h2>{wishlist.length} saved styles</h2><Button asChild><Link to="/wishlist">Open wishlist</Link></Button></div>
        : <div className="empty-state"><h2>{tab} coming soon.</h2><p>This space is ready for secure account services.</p></div>}
    </div>
  );
}
