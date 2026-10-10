import { useCatalog } from '@/admin/store';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shop/product-card';
import { useShop } from '@/components/shop/shop-provider';
import { products, pageHead } from '@/lib/shop/catalog';
export const Route = createFileRoute('/wishlist')({head:()=>pageHead('Your wishlist','Keep track of the Siri Shopping Mall styles you love.'),component:Wishlist});
function Wishlist(){const {products,sampleOffers}=useCatalog();const {wishlist}=useShop();const list=products.filter(p=>wishlist.includes(p.id));return <div className="wrap page-tight"><h1 className="plp-title">Saved for later.</h1><p className="page-intro">The styles you love, all in one place.</p>{list.length?<div className="product-grid">{list.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty-state"><Heart size={32}/><h2>Your wishlist is waiting.</h2><p>Tap the heart on any style to keep it close.</p><Button asChild><Link to="/shop">Discover new favourites</Link></Button></div>}</div>}
