import { createFileRoute } from '@tanstack/react-router';
import { InventoryPage } from '@/admin/operations';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/inventory')({validateSearch:(s:Record<string,unknown>):{low?:string|undefined}=>({low:s['low']==='true'?'true':undefined}),head:()=>pageHead('Inventory','Edit demo online and showroom size stock.'),component:InventoryPage});
