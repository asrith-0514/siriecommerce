import { createFileRoute } from '@tanstack/react-router';
import { PickupPage } from '@/admin/orders';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/pickup')({head:()=>pageHead('Pickup Desk','Verify demo pickup codes and hand over orders.'),component:PickupPage});
