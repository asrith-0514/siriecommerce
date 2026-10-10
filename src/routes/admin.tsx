import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/admin/layout';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin')({head:()=>pageHead('Administration','Demo owner and showroom staff workspace.'),component:AdminLayout});
