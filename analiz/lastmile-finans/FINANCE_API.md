# Last Mile Finans — API Referansı (tam)

Base URL (dev): `http://localhost:3000/api/lastmile`  
Auth: session cookie (`AUTH_ACCESS_COOKIE`).  
Tenant: JWT `tenant_id` / `auth/me` / `DEV_DEMO_TENANT_ID` (default `11111111-1111-4111-8111-111111111111`).  
Response envelope: `{ success: true, data: ... }` veya `{ success: false, error, code? }`.  
Alan adları: **camelCase** (`finance/_types/*` ile birebir).

Persist: `.data/lastmile-finance/{tenantId}/*.json` (gitignored).

Upstream ops (orders/customers/drivers) ayrı: `IAM_BASE_URL` + `api/v1/...`. Finans BFF bağımsız.

---

## 0) SKIP (bilinçli yok)

| Alan | Not |
|------|-----|
| Gelir defteri | `/finance/income` → invoices redirect |
| Giderler | placeholder UI |
| GİB / e-fatura PDF-XML | yok |
| Hakediş ↔ nakit mahsup | yok; ayrı defterler |

---

## 1) Order pricing (P0)

| Method | Path | Body / not |
|--------|------|------------|
| GET | `/orders/:id/pricing` | `{ snapshot?, payment? }` |
| PUT | `/orders/:id/pricing` | `{ snapshot, payment }` — snapshot dondurulur |
| POST | `/orders` | opsiyonel `pricingSnapshot` + `payment` (upstream’e strip); create pricing’siz de çalışır |

Tipler: `OrderPricingSnapshot`, `OrderPayment` (`collectionStatus` türetilir).

---

## 2) Price lists, zones, quote

| Method | Path |
|--------|------|
| GET/POST | `/price-lists` |
| GET/PUT | `/price-lists/:id` |
| POST | `/price-lists/:id/clone` |
| POST | `/price-lists/:id/set-default` *(tek isDefault)* |
| PATCH | `/price-lists/:id/status` `{ status: active\|passive }` |
| GET/POST | `/price-zones` |
| GET/PUT/DELETE | `/price-zones/:id` |
| POST | `/pricing/quote` body: `QuoteInput` → `QuoteResult` |

Motor: `finance/_lib/price-quote-engine.ts` (server import). KDV default %20.

`quantityBasis=package` iken `packages` kataloğu zorunlu; quote’ta `packageLines: [{ packageId, quantity }]` ile ücret `Σ unitPrice × quantity` (+ mesafe kuralı). Yalnız `packageCount` verilirse kuraldaki `perPackage` yedek olarak kullanılır.

---

## 3) Customer finance

| Method | Path |
|--------|------|
| GET/PUT | `/customers/:id/pricing-assignment` `{ priceListId }` |
| GET | `/customers/pricing-assignments` |
| GET/PUT | `/customers/:id/payment-terms` `settlementType`, `creditDays`, `billingCycle` |
| GET | `/customers/:id/finance-summary` `openBalance`, `totalCollected`, `overdueOrderCount`, … |

---

## 4) Collections

| Method | Path |
|--------|------|
| GET | `/collections?customerId&status&from&to` → `{ entries, payments }` |
| POST | `/collections` → OrderPayment.amountPaid artar; status türet |
| GET | `/collections/kpi` → `{ toCollect, collected, overdue, openOrderCount }` |

---

## 5) Invoices + uninvoiced

| Method | Path |
|--------|------|
| GET/POST | `/invoices` |
| GET/PATCH | `/invoices/:id` PATCH `{ status: taslak\|kesildi\|iptal }` — iptal link serbest bırakır |
| GET | `/uninvoiced-orders?customerId&search` |

Kurallar: `orderIds` unique (409 `ORDER_ALREADY_INVOICED`); number `LM-{year}-{seq}`; tutar `amountDue ?? snapshot.total ?? 0`, `hasPricing`.

---

## 6) Courier cost + payouts (hakediş)

| Method | Path |
|--------|------|
| GET/POST | `/courier-cost-lists` |
| GET/PUT | `/courier-cost-lists/:id` |
| POST | `/courier-cost-lists/:id/clone` |
| POST | `/courier-cost-lists/:id/set-default` |
| PATCH | `/courier-cost-lists/:id/status` |
| GET/PUT | `/couriers/:courierId/cost-assignment` |
| GET | `/couriers/cost-assignments` |
| GET | `/couriers/employment-cost-defaults` |
| GET/PUT | `/couriers/:courierId/payout-terms` |
| GET | `/couriers/:courierId/payout-summary` |
| POST | `/courier-costing/quote` |
| GET/POST | `/courier-payouts` GET `?courierId&status` → `{ entries, ledgers, kpi }` |
| GET | `/courier-payouts/kpi` |
| GET | `/courier-earnings?courierId` |

Hakediş ≠ nakit bakiye. Status: `bekliyor|kismi|odendi|gecikti`.

---

## 7) Courier cash (COD)

| Method | Path |
|--------|------|
| GET | `/courier-cash-balances` |
| GET | `/courier-cash-balances/kpi` |
| GET | `/courier-cash-balances/:courierId` |
| GET | `/courier-cash-balances/:courierId/movements` |
| POST | `/courier-cash-balances/:courierId/remittances` `{ amount, occurredAt, note? }` — `amount ≤ net` |
| POST | `/courier-cash-balances/:courierId/collections` `{ amount, occurredAt, source, orderId?, takipNo?, note? }` |

Net = Σ collection − Σ remittance. `orderId` deep-link için döner.

---

## 8) Suppliers

| Method | Path |
|--------|------|
| GET | `/suppliers?kind=all\|kurye\|diger&search&tag` |
| GET/POST | `/suppliers/other` |
| GET/PUT/DELETE | `/suppliers/other/:id` |

`kind=kurye`: drivers upstream + açık hakediş; `balanceLabel`: `odenecek|tahsil_edilecek|sifir`.

---

## FE façade → BFF

| Façade | BFF kök |
|--------|---------|
| `_api/pricing-api.ts` | price-lists, zones, quote, customers/*, collections, orders/*/pricing |
| `_api/invoices-api.ts` | invoices, uninvoiced-orders |
| `_api/courier-cost-api.ts` | courier-cost-lists, couriers/*, courier-costing, courier-payouts, courier-earnings |
| `_api/courier-cash-api.ts` | courier-cash-balances |
| `_api/suppliers-api.ts` | suppliers |

---

## Sayfa bağlama

| Sayfa | Façade çağrıları |
|-------|------------------|
| `/lastmile/orders/new` Ücret&Ödeme | `quotePriceApi`, `saveOrderPricing` |
| `/lastmile/orders/[id]` Finans | `getOrderPricing`, collections |
| `/finance/price-lists*` | price-lists CRUD |
| `/finance/zones` | price-zones |
| `/finance/customers` | finance-summary + customers BE |
| Müşteri detay Fiyat&Ödeme | assignment, terms, quote |
| `/finance/collections` | collections |
| `/finance/invoices*`, uninvoiced | invoices-api |
| `/finance/courier-cost-lists*` | courier-cost-api |
| Kurye Maliyet&Hakediş | assignment, terms, quote, summary |
| `/finance/payouts` | payouts + cash kolon |
| `/finance/courier-balances*` | cash-api |
| `/finance/suppliers*` | suppliers-api |

---

## Upstream map (ileride Nest)

| BFF | Hedef |
|-----|--------|
| `/api/lastmile/...` | `/api/v1/last-mile-...` veya aynı path Kong altında |

---

## Checklist

- [x] Step 0–8 finans BFF
- [x] FE façade BFF
- [x] Bu API dokümanı
- [ ] Production persist (Postgres/KV) — `.data` ephemeral on Vercel
- [ ] Nest `arf-lastmile-service` taşıması (opsiyonel)
