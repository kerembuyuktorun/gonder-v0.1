# Last Mile — Frontend Yönlendirme

Bu dosya, Last Mile üzerinde yapılan frontend güncellemelerini **hangi sayfada ne yapılır / ne işe yarar** mantığıyla anlatır.  
Tarz: [`finance/FE_GUIDE.md`](./finance/FE_GUIDE.md) ile aynı — kısa tablolar + süreç anlatımı. Finans bölümü o dosyanın içeriğini de kapsar.

**Durum:** Veri çoğunlukla **mock / localStorage**. Gerçek backend hazır olunca aynı sayfa ve API şekilleri korunacak.  
Finans backend notları: [`finance/BACKEND_PROMPT.md`](./finance/BACKEND_PROMPT.md)

**Demo:** URL’ye `?demo=1` (veya `demo=true`) ekle. Sipariş listesinde API yoksa / hata varsa demo otomatik açılır.

---

## Kavramlar (tek bakış)

| Kavram | Anlamı |
|--------|--------|
| **Fiyat listesi** | Müşteriye satılan teslimat ücreti tarifesi |
| **Kurye ücret listesi** | Kuryeye ödenecek maliyet / hakediş tarifesi |
| **Hakediş** | Şirketin kuryeye ödeyeceği iş ücreti |
| **Kurye bakiyesi (nakit)** | Kapıda tahsil edilen, kuryenin elindeki zimmet |
| **Fatura** | Müşteriye kesilen satış belgesi (manuel veya siparişlerden) |
| **İptal talebi** | Rota/yolda siparişte admin onayı gerektiren iptal |
| **İade alt-siparişi** | Teslim sonrası, ana siparişe bağlı `iade` tipi yeni sipariş |
| **Ertesi güne devir** | Teslim edilemedi → yeniden planlama (zimmet değişimi değil) |
| **Transfer zimmeti** | Transfer tipinde paket handover’ı |

---

## 1. Dashboard

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| KPI Metrikler | `/lastmile` | Kartlar, grafikler, son siparişler, hızlı işlemler | Günün operasyon özetini görmek |
| Canlı İzleme | `/lastmile/dashboard/live` | Kurye pin’leri, istisna listesi | Sahayı ve acil konuları tek ekranda izlemek |

KPI ekranı mock senaryo verisiyle çalışır; hızlı işlemler demo listelere (`?demo=1`) ve canlı izlemeye gider. Canlı izlemede `?courier=` / `?vehicle=` ile odaklanılabilir; gerçek GPS henüz yok.

---

## 2. Sipariş Yönetimi

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| Sipariş Listesi | `/lastmile/orders` | Tip / durum sekmeleri, arama, toplu işlem | Operasyon havuzunu yönetmek |
| Sipariş Oluştur | `/lastmile/orders/new` | Adım adım form (lokasyon, paket, atama, **Ücret & Ödeme**) | Yeni sipariş + local ücret snapshot |
| Sipariş Detay | `/lastmile/orders/[id]` | Özet, paket, finans, harita, hareketler, **İşlemler** | Tek siparişte operasyon aksiyonu |
| İptal Talepleri | `/lastmile/orders/cancel-requests` | Bekleyen / onay / red | Planlandı-yolda iptalleri onaylamak |

### Liste sekmeleri

- **Tip:** Tümü · Dağıtım · Toplama · İade · Transfer · Değişim  
- **Durum (toggle):** İptal Edilenler · Atanmayanlar  
- **Toplu:** Atama hazırlığı, etiket, iptal, **Faturalamaya gönder** (seçilenler **aynı müşteri** olmalı → fatura oluşturma ekranı)

API başarısız olursa liste demo siparişlere düşer; “Demo veri” rozeti görünür. Detay linkleri `?demo=1` taşır.

---

### 2.1 İptal süreci (hibrit)

İptal tek düğme değil; siparişin durumuna göre **anında** veya **talep** akar.

```
atama_bekliyor (+ rota yok)  →  Anında İptal  →  iptal_edildi
planlandi / yolda            →  İptal Talebi  →  Admin onay/red
                                              ↘ onay: iptal_edildi
                                              ↘ red: sipariş devam
```

| Adım | Nerede? | Ne olur? |
|------|---------|----------|
| 1 | Detay → İşlemler → **İptal Et / İptal Talebi** | Sebep kodu (Ayarlar → Tanımlar, `cancel`) + not |
| 2a Anında | Erken durum | Durum `iptal_edildi`; hareket kaydı |
| 2b Talep | Geç durum | Talep oluşur; menü “Talep beklemede” olur |
| 3 | `/orders/cancel-requests` | Admin **Onayla** / **Reddet** |
| Liste | Satır menüsü / toplu iptal | Aynı kurallar (anında vs talep) |

**Not:** Oluşturmadan sonraki ~24 saat için `canSelfCancel` policy’si tanımlı (ileride self-serve iptal için). Yetki tarafında `orders.special.cancel` katalogda var; UI’da mock-first.

---

### 2.2 İade süreci

İade, mevcut siparişi “geri almak” değil; **ana siparişe bağlı yeni bir `iade` siparişi** açmaktır.

| Kural | Açıklama |
|-------|----------|
| Ne zaman? | Yalnızca `teslim_edildi`; sipariş tipi zaten `iade` olmamalı |
| Ne oluşur? | Ters adres (alış ↔ varış), durum `atama_bekliyor`, tip `iade` |
| Ücret | Fiyat listesindeki **iade ücreti %** × orijinal gönderi ara toplamı (+ opsiyonel minimum) |
| Bağ | Parent detayda “İade siparişleri”; iade detayda ana sipariş linki |
| Liste | **İade** sekmesi bu kayıtları gösterir |

**Akış:** Detay → **İade Oluştur** → sebep / ücret önizlemesi → oluştur → finans snapshot iade siparişine yazılır.

**Formül (özet):**

```
iade_ücreti = max( orijinal_ara_toplam × (returnFeePercent / 100) , returnFeeMin? )
```

Örn. orijinal 114 ₺, liste %50 → iade ücreti 57 ₺ (+ KDV ayrı hesaplanır).

---

### 2.3 Ertesi güne kargo devri

Teslim denemesi başarısız olduğunda siparişi **başka kuryeye zimmetlemek değil**; ertesi güne erteleyip yeniden planlamaktır.

| | Ertesi güne devir | Transfer zimmeti |
|--|-------------------|------------------|
| Amaç | Yeniden dağıtım | Transfer tipinde handover |
| Menü | **Ertesi Güne Devret** | **Transfer Zimmeti** |
| Sonuç | Rota/kurye koparılır → `atama_bekliyor`; ETA/pencere ertesi güne | Handover API / transfer akışı |

**Akış:** Detay → Ertesi Güne Devret → `undelivered` sebep + hedef tarih (varsayılan yarın) + not → kayıt + hareket (`DELIVERY_DEFERRED`) + durum güncellemesi.

---

### 2.4 Demo sipariş örnekleri

| ID | Durum / tip | Denenecek aksiyon |
|----|-------------|-------------------|
| `lm-1001` | Atama bekliyor | Anında iptal |
| `lm-1002` | Yolda | Ertesi güne devret |
| `lm-1007` | Yolda + bekleyen talep | İptal talepleri ekranı |
| `lm-1009` | Teslim edildi | İade oluştur |
| `lm-ret-1009` | İade alt-sipariş | Parent link / İade sekmesi |

Ops verisi: `localStorage` → `arf:lastmile:order-ops:v1:*` (talepler, iadeler, deferrals, durum overlay).

---

## 3. Fiyatlandırma — nasıl fiyat oluşur?

Sidebar: **Fiyatlandırma**. Müşteriye satılan ücret ile kuryeye ödenen maliyet **ayrı listeler**; kurguları benzer.

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| Müşteri fiyat listeleri | `/lastmile/finance/price-lists` | Liste CRUD, varsayılan işaretle | Müşteriye uygulanacak tarife |
| Liste detay / yeni | `.../price-lists/[id]` · `/new` | Kurallar + müşteri & simülasyon | Tarife yazmak / denemek |
| Fiyat bölgeleri | `/lastmile/finance/zones` | Bölge CRUD | Zone tarifesinin coğrafi kapsamı |
| Kurye ücret listeleri | `/lastmile/finance/courier-cost-lists` | Liste CRUD | Hakediş maliyet tarifesi |
| Kurye ücret detay / yeni | `.../courier-cost-lists/[id]` · `/new` | Kurallar + kuryeler & simülasyon | Kurye maliyeti denemek |

### 3.1 Liste kurgusu (müşteri fiyatı)

1. **Liste seviyesinde tek mesafe yapısı** seçilir:  
   - `km` — km × birim ücret  
   - `zone` — varış bölgesi sabit / kurallı  
   - `od` — çıkış ilçe → varış ilçe  
2. **Her kural satırında desi tipi:**  
   - `fixed` — desi bandına sabit ücret  
   - `dynamic` — taban + desi birim (+ km ise mesafe)  
3. Öncelik, min/max, geçerli aralıklar; zone’da bölge, od’da çıkış/varış zorunlu.  
4. **İade ücreti (% gönderi bedeli)** liste genelinde (satır başına değil); varsayılan **%50**, opsiyonel **minimum**.

Storage: `arf:lastmile:pricing:v4:*` (v4 bump ile seed yeniden yüklenir).

### 3.2 Quote (teslimat vs iade)

Sipariş oluşturma **Ücret & Ödeme** adımı, müşteri detay simülasyonu ve iade dialog’u aynı motoru kullanır.

| Amaç (`purpose`) | Nasıl hesaplanır? |
|------------------|-------------------|
| **delivery** | Aktif / müşteriye atanmış liste → desi + mesafe/zone/od kural eşleşmesi → ara toplam → isteğe KDV (~%20). Manuel tutar override edilebilir. |
| **return** | Kural satırı aranmaz. `orijinal_ara_toplam × %` (+ min). Orijinal tutar yoksa hesap yapılamaz. |

Özet: **Teslimat = tarife kuralı**; **İade = yüzde kuralı**.

### 3.3 Kurye ücret listeleri

Müşteri fiyatının **ayna modeli** (aynı mesafe yapısı + desi kuralları).  
Fark: müşteri atamak yerine **kurye atama** / istihdam varsayılanları; simülasyon kurye hakedişine gider.  
Storage: `arf:lastmile:courier-cost:v3:*`.

---

## 4. Finans & Muhasebe

Sidebar: **Finans & Muhasebe**. Aşağıdaki tablo [`FE_GUIDE.md`](./finance/FE_GUIDE.md) içeriğinin güncel özetidir.

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| Müşteriler (cari) | `/lastmile/finance/customers` | Liste, arama, yeni müşteri; satır → müşteri detay | Açık bakiyeyi (tahsil edilecek) görmek |
| Tedarikçiler | `/lastmile/finance/suppliers` | Kurye + diğer tedarikçi; diğer için ekle/düzenle | Kime ödeme yapılacağını bir arada görmek |
| Tedarikçi detay | `/lastmile/finance/suppliers/[id]` | Diğer tedarikçi bilgisi | Kurye olmayan tedarikçi kaydı |
| Hakedişler | `/lastmile/finance/payouts` | Açık hakediş, ödeme kaydet; **Nakit bakiye** kolonu | Kuryeye ödenecek ücreti takip |
| Kurye Bakiyeleri | `/lastmile/finance/courier-balances` | Net nakit listesi | Kapıda tahsilatın kuryede kalan zimmeti |
| Kurye bakiye detay | `.../courier-balances/[courierId]` | Hareketler; **Tahsilat kaydet** | Zimmeti tenant’a teslim etmek |
| Faturalar | `/lastmile/finance/invoices` | Liste, KPI, yeni fatura | Satış faturalarını yönetmek |
| Yeni fatura | `/lastmile/finance/invoices/new` | **Manuel** e-fatura **veya** siparişlerden | Fatura kesmek |
| Fatura detay | `/lastmile/finance/invoices/[id]` | Satırlar, tutar, durum | Kesilen faturayı incelemek |
| Faturalanmamış | `/lastmile/finance/uninvoiced-orders` | Seç → Faturala | Henüz faturaya bağlanmamış siparişleri toplamak |
| Giderler | `/lastmile/finance/expenses` | Placeholder (“Yakında”) | Henüz işlev yok |
| Gelirler | `/lastmile/finance/income` | Placeholder / yönlendirme | Asıl iş faturalarda |

**Yönlendirmeler:** `/finance/collections` → gelir/fatura hattı; eski `/finance/courier-payouts` → Hakedişler ile aynı içerik.

### Fatura akışı (kısa)

1. **Manuel:** Müşteri + satırlar + tutar.  
2. **Siparişlerden:** Müşteri seç → faturalanmamış siparişler → satır/toplam (KDV).  
3. Sipariş listesinden çoklu seç → **Faturalamaya gönder** → aynı müşteri zorunlu → `invoices/new?mode=orders&...`.

Kurye nakit: `arf:lastmile:courier-cash:v1:*`.

---

## 5. Sipariş / müşteri / kurye içindeki finans

| Yer | Ne yapılır? | Ne işe yarar? |
|-----|-------------|---------------|
| Sipariş oluştur → **Ücret & Ödeme** | Quote, peşin/vadeli, manuel tutar | Sipariş ücretini hesaplamak (local snapshot) |
| Sipariş listesi → çoklu seç → **Faturalamaya gönder** | Aynı müşteri kontrolü | Seçili siparişleri faturaya taşımak |
| Sipariş detay → **Finans** sekmesi | Snapshot / tahsilat | Ücret ve ödeme durumunu görmek |
| Müşteri detay → **Fiyat & Ödeme** | Liste atama, vade, quote | Müşteriye özel fiyat / ödeme |
| Kurye detay → **Ücret & Ödeme** (Maliyet & Hakediş) | Ücret listesi atama, döngü, quote | Maliyet tarifesi + hakediş özeti |

---

## 6. İlişki Yönetimi

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| Müşteri Listesi | `/lastmile/customers` | KPI + tablo; demo müşteriler | Operasyon müşteri havuzu |
| Müşteri detay | `/lastmile/customers/[id]` | Genel · Adresler · Siparişler · Fiyat & Ödeme · Entegrasyon | Tek müşteri operasyonu |
| Bağlantı Listesi | `/lastmile/connections` | Bireysel / kurumsal adres defteri | Alıcı / firma adresleri |

Demo müşteri id’leri sipariş/finans seed ile hizalıdır (`c-bnf`, `c-modanisa`, `c-trendyol`, …).

---

## 7. Kaynaklar

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| Araç Listesi | `/lastmile/resources/vehicles` | Filo, zimmet, doluluk | Araç havuzu |
| Araç detay | `.../vehicles/[id]` | Detay / atama | Tek araç |
| Kurye Listesi | `/lastmile/resources/couriers` | Durum sekmeleri, KPI | Kurye havuzu |
| Kurye detay | `.../couriers/[id]` | **Ücret & Ödeme** dahil sekmeler | Maliyet listesi + hakedişe köprü |

Kurye kimlikleri finans hakediş / bakiye ekranlarıyla aynı seed’e oturtulmuştur.

---

## 8. Planlama

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| Orkestratör | `/lastmile/planning/route-orchestrator` | Rota planlama / atama | Canlı planlama |
| Orkestratör demo | `.../route-orchestrator-demo` | Mock motor | Sunum / QA |
| Rota Listesi | `/lastmile/planning/routes` | Liste / harita (`?demo=1`) | Rotaları görmek |
| Rota detay | `.../routes/[id]` | Duraklar, notlar | Tek rota |

Ertesi güne devir sonrası sipariş tekrar **atama bekliyor** olur; orkestratör / rota ataması ile yeniden plana alınır.

---

## 9. Kullanıcılar & Ayarlar

| Sayfa | URL | Ne yapılır? | Ne işe yarar? |
|------|-----|-------------|---------------|
| Kullanıcı Listesi | `/lastmile/users` | İç ekip / müşteri kullanıcıları | Erişim yönetimi |
| Roller | `/lastmile/settings/roles` | Rol CRUD, yetki kataloğu | Yetkilendirme |
| Tanımlar | `/lastmile/settings/definitions` | Sipariş tipi, sebep kodları (`cancel` / `undelivered`), skill, POD… | Operasyon sözlüğü |
| Global bölgeler | `/lastmile/settings/global-operation-regions` | Operasyon coğrafyası | Kapsama |

İptal ve ertesi güne devir diyaloglarındaki sebepler buradaki aktif kodlardan gelir.

---

## 10. Demo gezinme

| Davranış | Açıklama |
|----------|----------|
| `?demo=1` | Listeler / detaylar mock’tan |
| Sipariş listesi API hata | Otomatik demo + rozet |
| Link taşıma | `withLastmileDemo` — demo query’yi korur |
| Kalıcılık | Ops + finans localStorage; tarayıcı/cihaz değişince sıfırlanabilir |

### Önerilen tur

1. `/lastmile` — KPI + hızlı işlemler  
2. `/lastmile/orders` — sekmeler, demo liste  
3. `/lastmile/orders/lm-1009?demo=1` — **İade Oluştur**  
4. `/lastmile/orders/lm-1002?demo=1` — **Ertesi Güne Devret**  
5. `/lastmile/orders/cancel-requests` — talep onay/red  
6. `/lastmile/finance/price-lists` — mesafe yapısı + **iade %**  
7. `/lastmile/finance/invoices` · `/uninvoiced-orders` — fatura  
8. `/lastmile/finance/courier-balances` · `/payouts` — nakit vs hakediş  
9. `/lastmile/resources/couriers?demo=1` — kurye Ücret & Ödeme  

---

## 11. Bilinçli sınırlar (MVP)

- Gerçek mobil uygulama yok; ertesi güne devir web’den simüle + mock API sözleşmesi  
- Admin onay = aynı iptal yetkisi / mock; ayrı approve permission yok  
- İade yalnızca teslim sonrası; kısmi paket UI’da seçilebilir, ücret yine % kuralı  
- Zimmet değişimi için ayrı “devir” ekranı yok — mevcut kurye/rota ataması kullanılır  
- Gelir / gider ekranları henüz placeholder  
- Para ve ops hareketleri tarayıcıda; kalıcı API için `BACKEND_PROMPT.md` (P0: sipariş pricing persist)

---

## İlgili dosyalar

| Dosya | Konu |
|-------|------|
| Bu dosya | Last Mile genel yönlendirme |
| [`finance/FE_GUIDE.md`](./finance/FE_GUIDE.md) | Finans odaklı kısa özet (içerik burada da var) |
| [`finance/BACKEND_PROMPT.md`](./finance/BACKEND_PROMPT.md) | Backend öncelikleri |
