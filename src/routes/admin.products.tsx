import { createFileRoute } from '@tanstack/react-router';
import { ProductsPage } from '@/admin/management';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/products')({head:()=>pageHead('Manage products','Edit the shared demo fashion catalog.'),component:ProductsPage});
