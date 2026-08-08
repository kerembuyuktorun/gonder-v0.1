# Last Mile Finans — Frontend Yönlendirme

> **Güncel ve kapsamlı rehber:** [`YONLENDIRME.md`](./YONLENDIRME.md) · İndeks: [`../README.md`](../README.md)  
> Bu dosya finans/fiyatlandırma için kısa özet olarak durur; iptal–iade–devir, fiyat motoru ve demo turu ana dosyada anlatılır.

Kısa rehber: hangi sayfada ne yapılır, ne işe yarar.  
Veri şu an çoğunlukla **mock / localStorage**; gerçek BE henüz bağlı değil.  
Backend: [`BACKEND_AGENT_PROMPT.md`](./BACKEND_AGENT_PROMPT.md) (agent’a yapıştır) · [`BACKEND_PROMPT.md`](./BACKEND_PROMPT.md) (audit)

Sidebar: **Finans & Muhasebe** ve **Fiyatlandırma** (açılır menüler).

---

## Finans & Muhasebe

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|-------|-----|-------------|---------------|
| Müşteriler (cari) | `/lastmile/finance/customers` | Liste, arama, yeni müşteri; satıra tıklayınca müşteri detay | Müşteri açık bakiyesini (tahsil edilecek) görmek |
| Tedarikçiler | `/lastmile/finance/suppliers` | Kurye + diğer tedarikçi listesi; diğer için ekle/düzenle | Kime ödeme yapılacağını / cariyi bir arada görmek |
| Tedarikçi detay | `/lastmile/finance/suppliers/[id]` | Diğer tedarikçi bilgisi | Kurye olmayan tedarikçi kaydı |
| Hakedişler | `/lastmile/finance/payouts` | Açık hakedişler, ödeme kaydet; **Nakit bakiye** kolonu | Kuryeye ödenecek ücreti takip; elde nakit’e hızlı geçiş |
| Kurye Bakiyeleri | `/lastmile/finance/courier-balances` | Kurye net nakit listesi | Kapıda toplanan nakdin kuryede kalan zimmeti |
| Kurye bakiye detay | `/lastmile/finance/courier-balances/[courierId]` | Hareketler; **Tahsilat kaydet** | Bakiyenin neden oluştuğunu görmek; tenant’a nakit teslimi |
| Faturalar | `/lastmile/finance/invoices` | Liste, KPI, yeni fatura | Müşteri satış faturalarını yönetmek |
| Yeni fatura | `/lastmile/finance/invoices/new` | Manuel e-fatura **veya** siparişlerden oluştur | Fatura kesmek |
| Fatura detay | `/lastmile/finance/invoices/[id]` | Satırlar, tutar, durum | Kesilen faturayı incelemek |
| Faturalanmamış siparişler | `/lastmile/finance/uninvoiced-orders` | Seç → Faturala | Henüz faturaya bağlanmamış siparişleri toplu faturalamak |
| Giderler | `/lastmile/finance/expenses` | Placeholder (“Yakında”) | Henüz işlev yok |

**Yönlendirmeler:** `/finance/income` → Faturalar hattı; `/finance/collections` → income; eski `/finance/courier-payouts` → Hakedişler.

---

## Fiyatlandırma

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|-------|-----|-------------|---------------|
| Müşteri fiyat listeleri | `/lastmile/finance/price-lists` | Liste CRUD, varsayılan liste; **iade %** | Müşteriye uygulanacak tarife |
| Fiyat listesi detay / yeni | `.../price-lists/[id]` · `.../new` | Mesafe yapısı + desi kuralları, müşteri/simülasyon | Tarife kuralı tanımlamak / denemek |
| Fiyat bölgeleri | `/lastmile/finance/zones` | Bölge CRUD | Zone bazlı fiyat için coğrafi kapsam |
| Kurye ücret listeleri | `/lastmile/finance/courier-cost-lists` | Liste CRUD (müşteri fiyatının aynası) | Kuryeye ödenecek maliyet tarifesi |
| Kurye ücret detay / yeni | `.../courier-cost-lists/[id]` · `.../new` | Kurallar, kurye atama, quote | Hakediş hesabının tarife tarafı |

**Fiyat nasıl oluşur (özet):** Liste seviyesinde `km` | `zone` | `od` + `quantityBasis` (`desi` | `package`). **Paket** ölçüsünde katalog (`packages[].unitPrice`) × sipariş satır adedi (`packageLines`) asıl ücreti verir; kural satırları bant eşlemesi + km/taban içindir. Desi ölçüsünde satırda `fixed`/`dynamic`. İade: `orijinal × returnFeePercent` (+ min). Ayrıntı: [`YONLENDIRME.md` §3](./YONLENDIRME.md).

---

## Sipariş / müşteri / kurye içindeki finans

| Sayfa | Ne yapılır? | Ne işe yarar? |
|-------|-------------|---------------|
| Sipariş oluştur → **Ücret & Ödeme** | Quote, peşin/vadeli, manuel tutar | Sipariş ücretini hesaplamak (şimdilik local snapshot) |
| Sipariş listesi → çoklu seç → **Faturalamaya gönder** | Aynı müşteri kontrolü → fatura oluştur | Seçili siparişleri faturaya taşımak |
| Sipariş detay → Finans sekmesi | Snapshot / tahsilat (local) | Siparişin ücret ve ödeme durumunu görmek |
| Müşteri detay → **Fiyat & Ödeme** | Liste atama, vade koşulları, quote | Müşteriye özel fiyat / ödeme ayarı |
| Kurye detay → **Ücret & Ödeme** | Ücret listesi atama, ödeme döngüsü | Kuryenin maliyet tarifesi ve hakediş özeti |

---

## Kavramlar (tek cümle)

- **Hakediş** — Şirketin kuryeye ödeyeceği iş ücreti.  
- **Kurye bakiyesi (nakit)** — Kuryenin elindeki kapıda tahsilat; tenant tahsil edene kadar zimmet.  
- **Fatura** — Müşteriye kesilen satış belgesi (manuel veya siparişlerden).  
- **Fiyat listesi** — Müşteriye satılan teslimat ücreti.  
- **Kurye ücret listesi** — Kuryeye maliyet / hakediş tarifesi.

---

## Not

Para hareketleri tarayıcıda saklanır; cihaz/kullanıcı değişince kaybolabilir. Kalıcı API için `BACKEND_PROMPT.md` öncelik sırasına bakın (P0: sipariş pricing persist).
