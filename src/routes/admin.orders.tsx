import { createFileRoute } from '@tanstack/react-router';
import { OrdersPage } from '@/admin/orders';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/orders')({validateSearch:(s:Record<string,unknown>):{mode?:string|undefined;status?:string|undefined}=>({mode:typeof s['mode']==='string'?s['mode']:undefined,status:typeof s['status']==='string'?s['status']:undefined}),head:()=>pageHead('Manage orders','Manage mode-specific demo order fulfillment.'),component:OrdersPage});
