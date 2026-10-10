import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/admin/operations';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/')({head:()=>pageHead('Admin dashboard','Current order, pickup, reservation and stock counts.'),component:DashboardPage});
