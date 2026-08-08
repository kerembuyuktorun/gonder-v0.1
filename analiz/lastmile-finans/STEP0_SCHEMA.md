# Step 0 — Mevcut şema & FK bağları

> Tarih: 2026-08-08  
> Karar: Lojimod kullanılmaz. `arfplatform-backend` (Documents + GitHub zip) yalnızca IAM/Tenant/Notification; **last-mile order/customer/driver domain yok**.  
> Finans implementasyonu bu fazda **gonder FE BFF** (`app/api/lastmile/...`) üzerinde, tenant-scoped sunucu store ile yapılır. Upstream `api/v1/last-mile-*` hazır olunca aynı path sözleşmesi taşınır.

## Operasyon kimlikleri (mevcut FE ↔ upstream)

| Domain | FE alan / id | Upstream (IAM_BASE_URL) | Not |
|--------|--------------|-------------------------|-----|
| Sipariş | `order.id` | `api/v1/last-mile-orders` | Create sonrası pricing ayrı persist |
| Müşteri | `customer.id` / `musteri_id` | `api/v1/customers` | Cari / assignment FK |
| Kurye | `driver.id` / `courierId` | `api/v1/drivers` | Hakediş + nakit FK |
| Coğrafya | city/district ids | `api/v1/geography/*` | Zone scope referansı |

## Finans FK hedefleri (BFF store / ileride DB)

| Tablo / bag | FK | Kaynak |
|-------------|-----|--------|
| `orderSnapshots[orderId]` / `lm_order_pricing_snapshots` | `order_id` → last-mile order | Step 1 |
| `orderPayments[]` / `lm_order_payments` | `order_id`, `customer_id` | Step 1 |
| `priceLists` / `lm_price_lists` | `tenant_id` | Step 2 |
| `assignments` / `lm_customer_pricing_assignments` | `customer_id`, `price_list_id` | Step 3 |
| `paymentTerms` / `lm_customer_payment_terms` | `customer_id` | Step 3 |
| `collections` / `lm_collections` | `customer_id`, optional `order_id` | Step 4 |
| `invoices` + links | `customer_id`, `order_id` unique | Step 5 |
| courier cost / payout / cash | `courier_id` (= driver id) | Step 6–7 |
| other suppliers | tenant-scoped | Step 8 |

## Auth / tenant

- Cookie: `AUTH_ACCESS_COOKIE` → Bearer upstream.
- Tenant: JWT / `api/v1/auth/me` → `tenantId`; DEV bypass → `DEV_DEMO_TENANT_ID` (default seed UUID).
- Isolation: finance JSON bag path `.data/lastmile-finance/{tenantId}/`.

## Kabul (Step 0)

- Mevcut orders/customers/drivers BFF route’ları değiştirilmez (yalnızca opsiyonel pricing body eklenir).
- Migration planı Step 1+ ile uyumlu: 1:1 order pricing/payment bags.
