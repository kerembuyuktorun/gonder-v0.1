# Last Mile Finans — Dev / Deploy

## Mimari karar

- `arfplatform-backend` (Documents + GitHub zip): IAM only — last-mile domain yok.
- Lojimod kullanılmıyor.
- Finans: **gonder FE BFF** (`app/api/lastmile/*`) + tenant JSON store `.data/lastmile-finance/{tenantId}/`.
- Dal: `cursor/lastmile-pricing-finance`.

## Servis dosyaları

| Dosya | Alan |
|-------|------|
| `order-pricing-service.ts` | sipariş snapshot/payment |
| `pricing-catalog-service.ts` | lists, zones, quote, customer, collections |
| `invoice-service.ts` | faturalar + order link |
| `courier-cost-service.ts` | maliyet listeleri, hakediş |
| `courier-cash-service.ts` | COD / nakit |
| `supplier-service.ts` | diğer tedarikçi |
| `tenant.ts` / `fs-json-store.ts` | auth + persist |

## Yerel

```bash
git checkout cursor/lastmile-pricing-finance
# .env.local: DEV_AUTH_BYPASS=true
npm run dev  # :3000
```

## Deploy notu

Vercel serverless’da `.data` kalıcı değil. Seçenekler:

1. Blob/KV/Postgres adaptörü (`fs-json-store` yerine)
2. Documents monorepo’da Nest last-mile + Prisma; BFF proxy’ye çevir

Client façade path’leri aynı kalır.

## Dokümanlar

- [FINANCE_API.md](./FINANCE_API.md) — tüm endpoint’ler + sayfa bağlama
- [STEP0_SCHEMA.md](./STEP0_SCHEMA.md) — FK / tenant
- [FE_GUIDE.md](./FE_GUIDE.md) — UI rehberi
- [BACKEND_PROMPT.md](./BACKEND_PROMPT.md) — orijinal sözleşme

## Checklist Step 0–8

- [x] 0 Schema
- [x] 1 Order pricing
- [x] 2 Price lists / zones / quote
- [x] 3 Customer finance
- [x] 4 Collections (+ kpi)
- [x] 5 Invoices / uninvoiced
- [x] 6 Courier cost / payouts
- [x] 7 Courier cash
- [x] 8 Suppliers
- [x] API + FE wiring docs
