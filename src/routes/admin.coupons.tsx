import { createFileRoute } from '@tanstack/react-router';
import { CouponsPage } from '@/admin/management';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/coupons')({head:()=>pageHead('Manage coupons','Manage demo shopping coupons.'),component:CouponsPage});
