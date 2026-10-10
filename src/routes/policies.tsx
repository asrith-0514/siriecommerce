import { useAdminStore } from '@/admin/store';
import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/shop/catalog';
export const Route = createFileRoute('/policies')({head:()=>pageHead('Shopping policies','Policy information for Siri Shopping Mall online shopping.'),component:Policies});
function Policies(){const {settings}=useAdminStore();return <div className="wrap page-tight"><h1 className="plp-title">Shopping policies</h1><p className="page-intro">Delivery, exchange, privacy, payment, and support policies will be published here after Siri Shopping Mall confirms them.</p><p className="page-intro">Exchange window: {settings.exchangeDays} days</p></div>}
