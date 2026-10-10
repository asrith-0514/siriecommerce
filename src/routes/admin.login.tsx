import { createFileRoute } from '@tanstack/react-router';
import { AdminLogin } from '@/admin/layout';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/login')({head:()=>pageHead('Demo access','Choose owner or showroom staff demo access.'),component:AdminLogin});
