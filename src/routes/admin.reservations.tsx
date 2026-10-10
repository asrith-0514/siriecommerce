import { createFileRoute } from '@tanstack/react-router';
import { ReservationsPage } from '@/admin/operations';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/reservations')({validateSearch:(s:Record<string,unknown>):{date?:string|undefined}=>({date:s['date']==='today'?'today':undefined}),head:()=>pageHead('Trial reservations','Manage current and upcoming trial reservations.'),component:ReservationsPage});
