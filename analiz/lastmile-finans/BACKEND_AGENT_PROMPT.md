# Last Mile Finans — Backend Agent Prompt (gonder-v0.1)

gonder-v0.1 Last Mile FE finans çalışmalarının tamamı için **backend agent’a yapıştırılacak** adım adım uygulama prompt’u.

- Sayfa rehberi: [`FE_GUIDE.md`](./FE_GUIDE.md)
- Audit / durum matrisi: [`BACKEND_PROMPT.md`](./BACKEND_PROMPT.md)
- API (canlı BFF): [`FINANCE_API.md`](./FINANCE_API.md) · Dev: [`FINANCE_DEV.md`](./FINANCE_DEV.md)
- FE tipler & façade: `_types/*`, `_api/*` under `app/(arf)/(workspaces)/lastmile/finance/`

Aşağıdaki fenced bloğu kopyala → backend Cursor agent’a yapıştır. Repo yolunu doldur.

---

## Kopyalanabilir prompt

```
Sen Cursor agent'ısın.
Repo: [LAST-MILE / ARF BACKEND REPO — yolu buraya].
Proje bağlamı: gonder-v0.1 Last Mile. Frontend finans UI mock/localStorage ile hazır;
app/api/lastmile altında pricing / invoice / cash / payout BFF YOK.
Mevcut gerçek BE: orders, customers, drivers, geography — bunları yeniden yazma; finans alanları EKLE.

Görev: Aşağıdaki adımları SIRAYLA uygula. Her adımı bitirmeden sonrakine geçme.
Sözleşme: FE tipleri birebir (camelCase veya map dokümante et).
Auth: mevcut last-mile tenant JWT/cookie; tenant isolation zorunlu.

FE referans (okuma):
- arf-superapp-frontend-main/app/(arf)/(workspaces)/lastmile/finance/
- FE_GUIDE.md, BACKEND_PROMPT.md, _types/, _api/, _lib/*-quote-engine.ts

════════════════════════════════════════
SKIP (asla implement etme)
════════════════════════════════════════
- Gelir / gider genel muhasebe defteri (FE: income→faturalar redirect; expenses placeholder)
- GİB / e-fatura PDF-XML
- Hakediş ↔ kurye nakit bakiyesi mahsup
- Complex COD event otomasyonu (Step 7’de manuel API yeterli; event sonra)

════════════════════════════════════════
STEP 0 — Mevcut şemayı oku
════════════════════════════════════════
Hedef: order, customer, courier/driver tablolarını ve auth/tenant pattern’ini anla.
Çıktı: kısa not — nereye FK bağlanacak (order_id, customer_id, courier_id).
Kabul: migration planı Step 1 ile uyumlu; mevcut endpoint’ler bozulmaz.

════════════════════════════════════════
STEP 1 — Order pricing persist (P0 — kritik)
════════════════════════════════════════
FE bugün: POST /orders sonrası localStorage saveOrderPricing → başka client’ta finans boş.

Tipler: OrderPricingSnapshot, OrderPayment
  (FE: _types/pricing.ts, _types/payment.ts)

Ekranlar: sipariş oluştur Ücret&Ödeme; sipariş detay Finans sekmesi; uninvoiced tutar kaynağı.

API (A tercih; B kabul):
  A) POST /last-mile-orders body: pricingSnapshot?, payment? → atomik
  B) PUT  /last-mile-orders/{id}/pricing  (create sonrası zorunlu; hata yönetimi net)
  GET     /last-mile-orders/{id}/pricing → { snapshot?, payment? }

Kurallar:
- Snapshot dondurulur.
- amountDue ≈ breakdown.total (manuel override gelebilir).
- Vadeli: dueDate = orderDate + creditDays; collectionStatus türet.

DB: lm_order_pricing_snapshots (1:1 order), lm_order_payments (1:1 order)

Kabul:
- Order create + pricing → başka client GET pricing dolu.
- Pricing olmadan order create hâlâ çalışır (alanlar optional) ama dokümante.

════════════════════════════════════════
STEP 2 — Price lists, zones, quote
════════════════════════════════════════
Tipler: PriceList, PriceRule, PriceZone, QuoteInput, QuoteResult
PricingMode: base_plus_km | od_district | zone_flat | desi_band_fixed | desi_dynamic

Ekranlar: /finance/price-lists*, /finance/zones; müşteri Fiyat&Ödeme quote; sipariş quote.

API:
  CRUD /last-mile-price-lists (+ clone, set-default, status)
  CRUD /last-mile-price-zones
  POST /last-mile-pricing/quote  (server-side tek kaynak)

Kurallar: tek isDefault; assignment yoksa default; rules priority DESC first-match;
minFee/maxFee; KDV default %20.
Parity: FE _lib/price-quote-engine.ts ile unit test.

DB: lm_price_lists, lm_price_rules, lm_price_zones, lm_price_zone_scopes

Kabul: seed senaryoları FE ile aynı tutar; default liste tekil enforce.

════════════════════════════════════════
STEP 3 — Customer assignment, terms, finance-summary
════════════════════════════════════════
Ekranlar: müşteri detay Fiyat&Ödeme; /finance/customers cari listesi.

API:
  GET/PUT /last-mile-customers/{id}/pricing-assignment
  GET/PUT /last-mile-customers/{id}/payment-terms
       settlementType: pesin|vadeli; creditDays; billingCycle
  GET     /last-mile-customers/{id}/finance-summary
       openBalance, totalCollected, overdueOrderCount, assignedPriceList*, paymentTerms?

DB: lm_customer_pricing_assignments, lm_customer_payment_terms

Kabul: summary openBalance collections/payments ile tutarlı; FE cari listesi BE summary kullanabilir.

════════════════════════════════════════
STEP 4 — Collections
════════════════════════════════════════
Ekranlar: sipariş finans tahsilat; (legacy collections UI); cari bakiyeyi besler.

API:
  GET  /last-mile-collections?customerId&status&from&to
  POST /last-mile-collections
  GET  /last-mile-collections/kpi (opsiyonel)

POST → OrderPayment.amountPaid artar; status:
  paid>=due → tahsil_edildi; kısmi → kismi; vade geçmiş unpaid → gecikti; else bekliyor

DB: lm_collections

Kabul: collection sonrası GET pricing/summary güncel.

════════════════════════════════════════
STEP 5 — Invoices + uninvoiced
════════════════════════════════════════
Tipler: LastmileInvoice, InvoiceLine, UninvoicedOrderRow
Status: taslak|kesildi|iptal  Source: manual|orders

Ekranlar: /finance/invoices*, /finance/uninvoiced-orders; sipariş listesi “Faturalamaya gönder”.

API:
  GET/POST /last-mile-invoices
  GET      /last-mile-invoices/{id}
  GET      /last-mile-uninvoiced-orders?customerId&search
  PATCH    /last-mile-invoices/{id}/status (iptal opsiyonel)

createInvoice atomik: invoice + lm_order_invoice_links (unique order_id).
Uninvoiced amount: payment.amountDue ?? snapshot.breakdown.total ?? 0; hasPricing flag.
Number: tenant unique LM-{year}-{seq}. GİB/PDF yok.

DB: lm_invoices, lm_invoice_lines, lm_order_invoice_links

Kabul: aynı order iki faturaya bağlanamaz; uninvoiced iptal siparişleri dışlar.

════════════════════════════════════════
STEP 6 — Courier cost lists + payouts (hakediş)
════════════════════════════════════════
Tipler: CourierCostList/Rule, assignment, payout terms, earnings, ledger, PayoutEntry
PayoutStatus: bekliyor|kismi|odendi|gecikti
PayoutMethod: havale|nakit|diger

Ekranlar: /finance/courier-cost-lists*; /finance/payouts; kurye detay Maliyet&Hakediş.

API:
  CRUD /last-mile-courier-cost-lists (+ clone, set-default, status)
  GET/PUT courier cost-assignment + employment-type defaults (sirket|esnaf)
  GET/PUT courier payout-terms
  POST /last-mile-courier-costing/quote  (FE courier-cost-quote-engine parity)
  GET/POST /last-mile-courier-payouts
  GET /last-mile-courier-earnings
  GET /last-mile-courier-payouts/kpi

Hakediş (şirket→kurye) ≠ nakit bakiye (kurye→şirket). Mahsup YOK.

DB: lm_courier_cost_*, lm_courier_earnings, lm_courier_payout_ledgers, lm_courier_payout_entries

Kabul: payout ledger status türetimi doğru; default cost list tekil.

════════════════════════════════════════
STEP 7 — Courier cash balances (COD / elde nakit)
════════════════════════════════════════
Tipler: CourierCashMovement (collection|remittance), CourierCashBalance
Source: kapida_gonderici|kapida_alici|diger_nakit|tenant_tahsilat
Net = sum(collection) − sum(remittance)

Ekranlar: /finance/courier-balances*; hakediş tablosu Nakit bakiye kolonu.

API:
  GET  /last-mile-courier-cash-balances
  GET  /last-mile-courier-cash-balances/kpi
  GET  /last-mile-courier-cash-balances/{courierId}
  GET  /last-mile-courier-cash-balances/{courierId}/movements
  POST .../remittances  { amount ≤ net, occurredAt, note? }
  POST .../collections  { amount, occurredAt, source, orderId?, takipNo?, note? }

DB: lm_courier_cash_movements

Kabul: remittance > net engellenir; net hesap doğru; orderId varsa FE deep-link için dön.

════════════════════════════════════════
STEP 8 — Other suppliers + unified list
════════════════════════════════════════
Tipler: SupplierAccount, OtherSupplierRecord (kind: kurye|diger)

Ekranlar: /finance/suppliers, /finance/suppliers/[id]

API:
  GET /last-mile-suppliers?kind&search
       kurye: driver + açık hakediş bakiyesi
       diger: OtherSupplierRecord
  CRUD /last-mile-suppliers/other

DB: lm_other_suppliers

Kabul: birleşik liste tutarlı balanceLabel (odenecek|tahsil_edilecek|sifir); kurye satırları driver id ile uyumlu.

════════════════════════════════════════
HER ADIMDA ORTAK ÇIKTI
════════════════════════════════════════
1) Migration
2) Domain service + validation
3) REST routes + tenant guard
4) Unit/integration test
5) OpenAPI veya route dokümanı (FE tip alan adlarıyla)

Bittiğinde: Step 0–8 checklist + hangi endpoint’lerin live olduğunu özetle.
Çalışmaya Step 0 ile başla.
```

---

## FE bağlama (backend bittikten sonra — frontend sprint)

1. `orders/new` — `saveOrderPricing` → BE  
2. `order-finance-section` — GET pricing BE  
3. `pricing-api.ts` / `invoices-api.ts` / `courier-cost-api.ts` / `courier-cash-api.ts` / `suppliers-api.ts` mock → BFF  
4. Quote client engine → `POST .../quote`  
5. Mock localStorage kaldır veya `NEXT_PUBLIC_USE_MOCK_FINANCE`
