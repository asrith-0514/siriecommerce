import { Link } from '@tanstack/react-router';
import { Heart, Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { useShop } from './shop-provider';
import { money, discount, type Product } from '@/lib/shop/catalog';

export function ProductCard({ product: p }: { product: Product }) {
  const { wishlist, toggleWish, add } = useShop();
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);
  const saved = wishlist.includes(p.id);
  const quick = (size: string) => { add(p.id, size); setPicking(false); setAdded(true); setTimeout(() => setAdded(false), 1400); };
  return (
    <article className="pc">
      <div className="pc-photo">
        <Link to="/product/$id" params={{ id: p.id }} aria-label={p.name}>
          <img src={p.image} alt={p.name} width={768} height={1024} loading="lazy" />
        </Link>
        {p.badge && <span className="pc-badge">{p.badge}</span>}
        <button type="button" className={`pc-wish ${saved ? 'saved' : ''}`} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${p.name}`} onClick={() => toggleWish(p.id)}>
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {picking && (
          <div className="pc-sizes" role="group" aria-label="Choose a size">
            <span>Select size</span>
            <div>{p.sizes.map(s => <button type="button" key={s} onClick={() => quick(s)}>{s}</button>)}</div>
          </div>
        )}
      </div>
      <div className="pc-info">
        <Link to="/product/$id" params={{ id: p.id }} className="pc-name">{p.name}</Link>
        <p className="pc-desc">{p.descriptor}</p>
        <div className="pc-price"><strong>{money(p.price)}</strong><del>{money(p.mrp)}</del><span>{discount(p)}% OFF</span></div>
        <button type="button" className={`pc-add ${added ? 'done' : ''}`} onClick={() => setPicking(!picking)} aria-expanded={picking}>
          {added ? <><Check size={14} /> Added</> : picking ? 'Close' : <><Plus size={14} /> Add to Bag</>}
        </button>
      </div>
    </article>
  );
}

export function ProductSkeleton() {
  return <div className="pc" aria-hidden><div className="pc-photo skeleton-block" style={{ aspectRatio: '3/4', height: 'auto' }} /><div className="pc-info"><div className="skeleton-line" /><div className="skeleton-line short" /></div></div>;
}
