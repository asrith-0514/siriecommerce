<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Frontend architecture
- Use a shared storefront shell and semantic global design tokens for all shopping routes so the product remains visually coherent.
- Keep sample catalog and simulated service responses in browser-safe data modules, separate from UI, so live services can replace them without redesign.
- Keep all six shopping/admin record collections in one browser-persisted React provider, restored after hydration; this provides shared reload-safe preview records without implying live services or storing payment credentials.
- Give every shareable shopping page a file-based route and unique metadata so direct links and page identities work correctly.
- Seed coupons and numeric fulfillment/contact settings from src/config/siri.ts into AdminStoreProvider; storefront and admin read that shared store, and shared checkout calculations accept it to keep prices consistent.
- Validate checkout input with shared Zod schemas at step transitions and again before creating a browser-local preview order; never persist or process payment credentials.

- Keep administration UI in src/admin and use file-based /admin child routes with demo role gating; this separates showroom controls without changing storefront presentation.
- Share order mutations through AdminStoreProvider with ShopProvider delegating to it and mode-specific transitions; customer history and the pickup desk must reflect the same persisted records.
- Use shared pricing, date and fulfillment formatters for presentation and calculations; this keeps every storefront and admin view consistent.
- Save all size stock rows atomically per product; this prevents partial inventory edits when any size fails validation.
