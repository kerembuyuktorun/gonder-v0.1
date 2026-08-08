# Last Mile Fiyatlama & Finans — Backend Prompt

> **Agent için kopyala:** adım adım uygulama prompt’u → [`BACKEND_AGENT_PROMPT.md`](./BACKEND_AGENT_PROMPT.md)  
> Sayfa rehberi: [`FE_GUIDE.md`](./FE_GUIDE.md) · Tam indeks: [`../README.md`](../README.md)

> Frontend UI mock/localStorage ile tamam. Bu doküman BE implementasyonu içindir.
> Önce **durum matrisi** (gerçek API / mock / placeholder), sonra kopyalanabilir prompt.

FE kök: `app/(arf)/(workspaces)/lastmile/finance/`  
BFF kök: `app/api/lastmile/` — **finans/pricing/invoice/cash için route YOK**.

---

## 0) Sistem durumu (audit özeti)

### Gerçek BE’ye bağlı (finans dışı kimlik / operasyon)

| Kullanım | Endpoint (BFF) | Not |
|----------|----------------|-----|
| Sipariş oluştur / liste / detay | `/api/lastmile/orders*` | Sipariş entity; **pricing body’de yok** |
| Müşteri listesi / create | `/api/lastmile/customers*` | CRM; cari bakiye BE’de yok |
| Kurye (driver) listesi | `/api/lastmile/drivers*` | Kimlik; hakediş/nakit BE’de yok |
| Coğrafya | `/api/lastmile/geography/*` | Var; fiyat bölgeleri UI çoğunlukla seed geo kullanıyor |

### Tamamen mock / localStorage (finans façade)

| Façade | Store | Storage |
|--------|-------|---------|
| `_api/pricing-api.ts` | `_mock/pricing-store.ts` | `arf:lastmile:pricing:v4:*` |
| `_api/courier-cost-api.ts` | `_mock/courier-cost-store.ts` | `arf:lastmile:courier-cost:v3:*` |
| `_api/courier-cash-api.ts` | `_mock/courier-cash-store.ts` | `arf:lastmile:courier-cash:v1:*` |
| `_api/invoices-api.ts` | `_mock/invoice-store.ts` | `arf:lastmile:finance:v1:invoices*` |
| `_api/suppliers-api.ts` | `_mock/supplier-store.ts` + drivers BE | other-suppliers local |

Quote motorları client-side: `_lib/price-quote-engine.ts`, `_lib/courier-cost-quote-engine.ts`.

### Sayfa bazlı durum

| Route / ekran | Veri kaynağı | BE ihtiyacı |
|---------------|--------------|-------------|
| `/finance` hub | Linkler | — |
| `/finance/customers` | **Hybrid**: BE customers + mock collections bakiyesi | finance-summary / open balance |
| `/finance/suppliers` | **Hybrid**: BE drivers + mock other + mock payout | supplier list + payout open |
| `/finance/suppliers/[id]` | Mock other supplier | other-supplier CRUD |
| `/finance/payouts` (+ eski courier-payouts) | Mock ledgers/entries + mock cash kolon | payouts API |
| `/finance/courier-balances` + `[id]` | Mock cash movements | cash balances API |
| `/finance/invoices*` | Mock invoice store | invoices API |
| `/finance/uninvoiced-orders` | **Hybrid**: BE orders + mock pricing + mock invoice map | uninvoiced + pricing amounts |
| `/finance/price-lists*` | Mock | price-lists CRUD |
| `/finance/zones` | Mock (+ SEED_GEO) | zones; geo BFF’e bağlanabilir |
| `/finance/courier-cost-lists*` | Mock | courier-cost-lists CRUD |
| `/finance/collections` | Mock (legacy UI; income redirect var) | collections (Modül 1 ile) |
| `/finance/income` | **Redirect → invoices** | Gelir defteri yok; BE yapma |
| `/finance/expenses` | **Coming soon placeholder** | Şimdilik BE yapma |
| Sipariş oluştur → Ücret & Ödeme | Mock quote + **create sonrası local `saveOrderPricing`** | **Kritik:** order pricing persist |
| Sipariş detay → Finans sekmesi | Mock `getOrderPricing` | order pricing GET |
| Müşteri detay → Fiyat & Ödeme | Mock assignment/terms/quote | customer finance |
| Kurye detay → Maliyet & Hakediş | Mock cost assignment/payout | courier cost |

### Belirsiz / hybrid (BE tasarlarken netleştir)

1. **Sipariş create atomikliği**  
   Bugün: `POST /orders` başarılı → ayrı `saveOrderPricing` local.  
   BE hedef: snapshot+payment create ile atomik **veya** `PUT /orders/{id}/pricing` zorunlu adım (hata → sipariş orphan olmamalı).

2. **Uninvoiced tutar kaynağı**  
   FE: `OrderPayment.amountDue` → yoksa `snapshot.breakdown.total` → yoksa `0`.  
   BE: aynı öncelik; pricing yoksa `hasPricing:false` dön.

3. **Tedarikçi birleşik liste**  
   FE: drivers + other-suppliers + payout openBalance birleştiriyor.  
   BE: tek view/endpoint veya FE join dokümante; tutarsız bakiye üretme.

4. **Hakediş vs nakit bakiye**  
   Ayrı defterler; mahsup yok. UI aynı satırda kolon gösterir; BE netleştirme yapmasın.

5. **COD collection üretimi**  
   FE seed/manuel. Production’da teslim+kapıda event → `collection` movement (ilk fazda manuel POST yeterli).

6. **Gelirler / Giderler**  
   Gelirler → Faturalar redirect. Giderler placeholder. **Bu fazda BE ledger yazma.**

---

## 1) Prompt (kopyalanabilir)

```
Sen Cursor agent'ısın. Repo: [LAST-MILE / ARF BACKEND REPO — yolu buraya].

Bağlam: Last Mile FE finans UI hazır; para verisi %100 mock/localStorage.
app/api/lastmile altında pricing/invoice/cash/payout BFF YOK.
Gerçek BE: orders, customers, drivers, geography — finans alanları henüz yok.

Görev: Aşağıdaki öncelik sırasıyla API + DB ekle. Sözleşme FE tipleriyle birebir.
FE path: arf-superapp-frontend-main/app/(arf)/(workspaces)/lastmile/finance/
Auth: mevcut last-mile tenant JWT/cookie; tenant isolation zorunlu.

════════════════════════════════════════
ÖNCELİK (kullanıcı etkisi — buna uy)
════════════════════════════════════════
P0  Order pricing snapshot + payment (create/read)
P1  Price lists + zones + server quote
P2  Customer pricing assignment + payment terms + finance-summary
P3  Collections → OrderPayment status
P4  Invoices + order↔invoice link + uninvoiced-orders
P5  Courier cost lists + assignment + cost quote + earnings/ledgers/payouts
P6  Courier cash balances (movements + remittance)
P7  Other suppliers CRUD (+ unified supplier view)
SKIP income ledger, expenses ledger, GİB/e-fatura PDF, hakediş↔nakit mahsup

════════════════════════════════════════
P0 — ORDER PRICING (en kritik boşluk)
════════════════════════════════════════
Bugün FE: POST /orders sonrası localStorage saveOrderPricing.
Sonuç: başka tarayıcı/kullanıcıda finans sekmesi boş; fatura tutarı güvenilmez.

Tipler: OrderPricingSnapshot, OrderPayment (FE payment.ts / pricing.ts)

API (ikisini de destekle veya birini seç, dokümante et):
  A) POST /last-mile-orders body'ye opsiyonel:
       pricingSnapshot?, payment?  → atomik persist
  B) PUT  /last-mile-orders/{id}/pricing
  GET     /last-mile-orders/{id}/pricing
       → { snapshot?, payment? } | 404/empty

Kurallar:
- Snapshot dondurulur (tarife değişse eski sipariş bozulmaz).
- payment.amountDue = snapshot.breakdown.total (manuel override FE'den gelebilir).
- Vadeli: dueDate = orderDate + creditDays; collectionStatus türet.

DB: lm_order_pricing_snapshots (1:1 order), lm_order_payments (1:1 order)

════════════════════════════════════════
P1 — PRICE LISTS / ZONES / QUOTE
════════════════════════════════════════
Tipler: PriceList, PriceRule, PriceZone, QuoteInput, QuoteResult
PricingMode: base_plus_km | od_district | zone_flat | desi_band_fixed | desi_dynamic

API:
  CRUD /last-mile-price-lists (+ clone, set-default, status)
  CRUD /last-mile-price-zones
  POST /last-mile-pricing/quote  → server-side tek kaynak
     (FE price-quote-engine parity; unit test zorunlu)

Kurallar: tek isDefault; assignment yoksa default; rules priority DESC first-match;
minFee/maxFee; KDV default %20.

DB: lm_price_lists, lm_price_rules, lm_price_zones, lm_price_zone_scopes

════════════════════════════════════════
P2 — CUSTOMER FINANCE
════════════════════════════════════════
API:
  GET/PUT /last-mile-customers/{id}/pricing-assignment
  GET/PUT /last-mile-customers/{id}/payment-terms
  GET     /last-mile-customers/{id}/finance-summary
       → openBalance, totalCollected, overdueOrderCount, assignedPriceList*, paymentTerms?

FE finance/customers listesi bugün BE customers + local balance.
BE finance-summary veya list endpoint'inde openBalance ver.

DB: lm_customer_pricing_assignments, lm_customer_payment_terms

════════════════════════════════════════
P3 — COLLECTIONS
════════════════════════════════════════
API:
  GET  /last-mile-collections?customerId&status&from&to
  POST /last-mile-collections
  GET  /last-mile-collections/kpi (opsiyonel)

POST → ilgili OrderPayment.amountPaid artar; status yeniden türet:
  paid>=due → tahsil_edildi; kısmi → kismi; vade geçmiş unpaid → gecikti; else bekliyor

DB: lm_collections

════════════════════════════════════════
P4 — INVOICES
════════════════════════════════════════
Tipler: LastmileInvoice, InvoiceLine, UninvoicedOrderRow
Status: taslak|kesildi|iptal  Source: manual|orders

API:
  GET/POST /last-mile-invoices
  GET      /last-mile-invoices/{id}
  GET      /last-mile-uninvoiced-orders?customerId&search
  PATCH    /last-mile-invoices/{id}/status (iptal opsiyonel)

createInvoice atomik: invoice + order link (unique order_id).
Uninvoiced: iptal değil + link yok; amount = payment.amountDue ?? snapshot.total ?? 0; hasPricing flag.
Invoice number: tenant unique LM-{year}-{seq}.
GİB/PDF YOK.

DB: lm_invoices, lm_invoice_lines, lm_order_invoice_links

════════════════════════════════════════
P5 — COURIER COST + PAYOUTS
════════════════════════════════════════
Tipler: CourierCostList/Rule, assignment, payout terms, earnings, ledger, PayoutEntry
PayoutStatus: bekliyor|kismi|odendi|gecikti

API:
  CRUD /last-mile-courier-cost-lists (+ clone, set-default, status)
  GET/PUT courier cost-assignment + employment-type defaults
  GET/PUT courier payout-terms
  POST /last-mile-courier-costing/quote
  GET/POST /last-mile-courier-payouts
  GET /last-mile-courier-earnings
  GET /last-mile-courier-payouts/kpi

Hakediş (şirket→kurye) ≠ nakit bakiye (kurye→şirket). Mahsup yok.

DB: lm_courier_cost_*, lm_courier_earnings, lm_courier_payout_ledgers, lm_courier_payout_entries

════════════════════════════════════════
P6 — COURIER CASH (COD / ELDE NAKİT)
════════════════════════════════════════
Tipler: CourierCashMovement (collection|remittance), CourierCashBalance
Source: kapida_gonderici|kapida_alici|diger_nakit|tenant_tahsilat
Net = sum(collection) − sum(remittance)

API:
  GET  /last-mile-courier-cash-balances
  GET  /last-mile-courier-cash-balances/kpi
  GET  /last-mile-courier-cash-balances/{courierId}
  GET  /last-mile-courier-cash-balances/{courierId}/movements
  POST .../remittances  { amount ≤ net, occurredAt, note? }
  POST .../collections  (manuel veya internal; event-driven sonra)

DB: lm_courier_cash_movements

════════════════════════════════════════
P7 — OTHER SUPPLIERS
════════════════════════════════════════
API:
  GET /last-mile-suppliers?kind=kurye|diger|all&search
       kurye satırları: driver + açık hakediş bakiyesi
       diger: OtherSupplierRecord
  CRUD /last-mile-suppliers/other

DB: lm_other_suppliers

════════════════════════════════════════
KABUL KRİTERLERİ
════════════════════════════════════════
1) OpenAPI FE camelCase tiplerle uyumlu (veya map dokümanı).
2) P0: create order + pricing → başka client GET pricing dolu.
3) Quote parity (müşteri + kurye cost) FE engine seed ile aynı.
4) Default price/cost list tekil.
5) Collection/payout status türetimi doğru.
6) Invoice + order link atomik; uninvoiced doğru.
7) Remittance > net engeli.
8) Tenant izolasyonu.
9) SKIP edilenler implement edilmesin (income/expenses/GİB/mahsup).

Çalışma sırası: mevcut order/customer/courier şemasını oku → P0 migration+API → P1…P7.
Her öncelikte: migration → service → routes → tests → OpenAPI.
```

---

## 2) FE → BE bağlama checklist (frontend sonraki sprint)

| # | İş | Dosya |
|---|-----|-------|
| 1 | Order create pricing’i BE’ye yaz | `orders/new/page-content.tsx` — `saveOrderPricing` kaldır/BFF |
| 2 | Order detail finans GET BE | `orders/[id]/_components/order-finance-section.tsx` |
| 3 | `pricing-api.ts` mock → BFF | price lists, zones, quote, assignment, terms, collections |
| 4 | Quote: client engine → `POST .../quote` | `price-quote-engine` fallback opsiyonel |
| 5 | `invoices-api.ts` → BE | list/create/uninvoiced |
| 6 | `courier-cost-api.ts` → BE | lists + payouts |
| 7 | `courier-cash-api.ts` → BE | balances/remittance |
| 8 | `suppliers-api.ts` → BE | other + unified list |
| 9 | Zones geo → `/api/lastmile/geography` | `zones/page-content` SEED_GEO |
| 10 | Mock flag | `NEXT_PUBLIC_USE_MOCK_FINANCE` veya kaldır |

---

## 3) Net “yapma” listesi (belirsizlikleri kapatır)

| Konu | Karar |
|------|--------|
| `/finance/income` | FE redirect Faturalar; BE gelir defteri **yapma** |
| `/finance/expenses` | Placeholder; BE **yapma** |
| e-Fatura GİB/PDF | Dışarıda |
| Hakediş ↔ nakit mahsup | Dışarıda |
| Finance permission matrix | FE roles’a henüz eklenmedi; opsiyonel sonra |
| Complex COD otomatik event | P6 sonrası; ilk faz manuel remittance + collection POST |

---

## 4) Modül → FE dosya haritası

| Öncelik | Tipler | API façade | Ana UI |
|---------|--------|------------|--------|
| P0–P3 | `pricing.ts`, `payment.ts` | `pricing-api.ts` | order create/detail, customers tab, price-lists, zones, collections |
| P4 | `invoice.ts` | `invoices-api.ts` | invoices, uninvoiced, orders bulk |
| P5 | `courier-cost.ts` | `courier-cost-api.ts` | courier-cost-lists, payouts, courier tab |
| P6 | `courier-cash.ts` | `courier-cash-api.ts` | courier-balances, payouts kolon |
| P7 | `supplier.ts` | `suppliers-api.ts` | finance/suppliers |
