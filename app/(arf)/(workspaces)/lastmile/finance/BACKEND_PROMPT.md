# Last Mile Fiyatlama & Finans — Backend Prompt

> Frontend (mock/localStorage) tamamlandı. Bu prompt backend implementasyonu içindir.
> FE tipleri ve API façade: `app/(arf)/(workspaces)/lastmile/finance/`

---

## Prompt (kopyalanabilir)

```
Sen Cursor agent'ısın. Repo: [LAST-MILE / ARF BACKEND REPO — yolu buraya].
Görev: Last Mile için fiyatlama, müşteri ödeme koşulları, sipariş ücret snapshot'ı ve tahsilat API'lerini ekle.
Frontend zaten mock ile hazır; sözleşmeyi FE tiplerine birebir hizala.

────────────────────────────────────────
KAYNAK (FRONTEND SÖZLEŞMESİ)
────────────────────────────────────────
FE path (referans): arf-superapp-frontend-main/app/(arf)/(workspaces)/lastmile/finance/

Tipler:
- PriceList, PriceRule, PriceZone, PriceZoneScope
- CustomerPricingAssignment
- CustomerPaymentTerms (settlementType: pesin|vadeli, creditDays, billingCycle)
- OrderPricingSnapshot + QuoteBreakdown
- OrderPayment (collectionStatus: bekliyor|kismi|tahsil_edildi|gecikti)
- CollectionEntry
- QuoteInput / QuoteResult

PricingMode enum:
- base_plus_km
- od_district
- zone_flat
- desi_band_fixed
- desi_dynamic

FE mock API yüzeyi (backend'de gerçek endpoint olmalı):
- CRUD PriceLists (+ clone, setDefault, setStatus); rules list ile gömülü veya ayrı
- CRUD PriceZones
- get/set CustomerPricingAssignment
- get/set CustomerPaymentTerms
- POST quote (server-side tek kaynak — FE engine ile aynı kurallar)
- Order create/update ile OrderPricingSnapshot + OrderPayment persist
- list/create Collections; getCustomerFinanceSummary
- getOrderPricing(orderId)

Mevcut last-mile-orders list query'de `paymentType` forward ediliyor; yeni model ile hizala veya deprecate et.

────────────────────────────────────────
ÜRÜN KURALLARI
────────────────────────────────────────
1) Tenant fiyat listeleri tanımlar; bir liste isDefault=true (tek aktif default).
2) Müşteriye liste atanabilir; yoksa default kullanılır.
3) Quote eşleşme: rules priority DESC, ilk match kazanır.
   - od_district: origin/dest city(+optional district; district yoksa city wildcard)
   - zone_flat: DESTINATION district zone scopes içinde mi
   - base_plus_km: distanceKm zorunlu
   - desi_band_fixed: desi ∈ [start,end] → flatFee
   - desi_dynamic: baseFee + desi * perDesi (FE ile aynı formül)
4) minFee/maxFee uygula; KDV opsiyonel (default %20).
5) Sipariş oluşturulunca snapshot DONDURULUR (sonradan tarife değişse eski sipariş bozulmaz).
6) Vadeli: dueDate = orderDate + creditDays; tahsilat status türet:
   amountPaid >= amountDue → tahsil_edildi
   0 < paid < due → kismi
   dueDate < today && unpaid → gecikti
   else bekliyor
7) Collection kaydı order'a bağlanırsa amountPaid artar.

────────────────────────────────────────
ÖNERİLEN API ŞEKLİ (REST)
────────────────────────────────────────
Base: /api/v1/

Price lists:
  GET    /last-mile-price-lists
  POST   /last-mile-price-lists
  GET    /last-mile-price-lists/{id}
  PUT    /last-mile-price-lists/{id}
  POST   /last-mile-price-lists/{id}/clone
  POST   /last-mile-price-lists/{id}/set-default
  PATCH  /last-mile-price-lists/{id}/status

Zones:
  GET/POST /last-mile-price-zones
  GET/PUT/DELETE /last-mile-price-zones/{id}

Customer finance:
  GET/PUT /last-mile-customers/{id}/pricing-assignment
  GET/PUT /last-mile-customers/{id}/payment-terms
  GET     /last-mile-customers/{id}/finance-summary

Quote:
  POST /last-mile-pricing/quote
  Body: QuoteInput → QuoteResult

Order pricing (order create ile birlikte veya ayrı):
  - POST /last-mile-orders body'ye opsiyonel:
      pricingSnapshot?: OrderPricingSnapshot
      payment?: { settlementType, creditDays, amountDue, ... }
  - VEYA create sonrası:
      PUT /last-mile-orders/{id}/pricing
  GET /last-mile-orders/{id}/pricing

Collections:
  GET  /last-mile-collections?customerId&status&from&to
  POST /last-mile-collections
  GET  /last-mile-collections/kpi (opsiyonel)

Auth: mevcut last-mile tenant auth (JWT/cookie) ile aynı; tenant isolation zorunlu.

────────────────────────────────────────
VERİ MODELİ (DB)
────────────────────────────────────────
Tables (öneri):
- lm_price_lists
- lm_price_rules (FK list; JSON geo opsiyonel veya kolonlar)
- lm_price_zones + lm_price_zone_scopes
- lm_customer_pricing_assignments
- lm_customer_payment_terms
- lm_order_pricing_snapshots (1:1 order)
- lm_order_payments (1:1 order)
- lm_collections

Index: tenant_id, customer_id, order_id, status, due_date, is_default.

────────────────────────────────────────
QUOTE SERVİSİ
────────────────────────────────────────
Server-side pure function / domain service:
- Input validation
- Resolve list (assignment → default)
- Match + formula (FE price-quote-engine ile parity)
- Unit testler: OD, zone, desi band, desi dynamic, km, minFee, no-match, customer assignment

FE client engine geçici; production'da FE quote için BE endpoint kullanacak.

────────────────────────────────────────
MİGRASYON / UYUMLULUK
────────────────────────────────────────
- Mevcut orders/customers bozulmasın (pricing alanları optional).
- paymentType query varsa yeni settlementType/collectionStatus ile map et veya dokümante et.
- Soft-delete veya status=passive tercih et; hard delete zone → bağlı rules'u passive yap (FE davranışı).

────────────────────────────────────────
KABUL KRİTERLERİ
────────────────────────────────────────
1) OpenAPI/Swagger veya route dokümanı FE tipleriyle uyumlu.
2) Quote parity: seed senaryoları FE ile aynı tutar üretir.
3) Default liste tekil enforce (DB constraint veya transaction).
4) Order create + snapshot atomik (veya net hata).
5) Collection → payment status doğru güncellenir.
6) Tenant A başka tenant verisini göremez.
7) Integration test: assignment → quote → order → collection → summary.

────────────────────────────────────────
DIŞARIDA (şimdilik)
────────────────────────────────────────
- e-Fatura / PDF
- Kurye maliyet / alış fiyatı
- Çok para birimi
- Complex COD wallet
- Role matrix (FE roles ekranı henüz finance permission eklemedi)

Çalışmaya başla; önce mevcut last-mile order/customer şemasını oku, sonra migration + endpoints.
```

---

## FE → BE bağlama checklist (frontend sonraki iş)

1. `finance/_api/pricing-api.ts` mock'u BFF `app/api/lastmile/pricing/*` ile değiştir
2. Order create'te local `saveOrderPricing` yerine BE body/endpoint
3. Quote: client engine yerine `POST .../quote` (veya hybrid fallback)
4. Seed/localStorage kaldır veya dev-only flag
