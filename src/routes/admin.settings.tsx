import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/admin/management';
import { pageHead } from '@/lib/shop/catalog';
export const Route=createFileRoute('/admin/settings')({head:()=>pageHead('Store settings','Edit demo fulfillment and showroom settings.'),component:SettingsPage});
