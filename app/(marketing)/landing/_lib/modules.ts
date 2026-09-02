import {
  ArrowLeftRight,
  BellRing,
  Boxes,
  Building2,
  CalendarRange,
  ClipboardCheck,
  FileText,
  Gauge,
  HandCoins,
  KeyRound,
  LayoutGrid,
  ListChecks,
  Map,
  Navigation,
  Package,
  PackageOpen,
  PackagePlus,
  ReceiptText,
  RefreshCw,
  Route,
  Ruler,
  ScanLine,
  Scale,
  ShoppingCart,
  Shuffle,
  Star,
  Store,
  Tags,
  Truck,
  Undo2,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type AppTone = 'petrol' | 'petrolLight' | 'accent' | 'ink' | 'yellow' | 'slate'

export type ModuleApp = {
  label: string
  icon: LucideIcon
  tone: AppTone
}

export type ModuleRecord = {
  title: string
  meta: string
}

export type ModuleEntity = {
  label: string
  count: string
  delta?: string
}

export type ModuleWorkflow = {
  label: string
  time: string
}

export type LandingModule = {
  id: string
  /** Sekmede görünen 1–2 kelimelik ad */
  label: string
  /** Modülün tam adı, panel başlığında kullanılır */
  fullName: string
  headline: string
  description: string
  workspace: string
  apps: ModuleApp[]
  recordsTitle: string
  records: ModuleRecord[]
  entities: ModuleEntity[]
  workflows: ModuleWorkflow[]
}

export const LANDING_MODULES: LandingModule[] = [
  {
    id: 'eticaret',
    label: 'E-Ticaret',
    fullName: 'E-ticaret yönetim modülü',
    headline: 'Tüm satış kanalların tek panelde',
    description:
      'Pazaryeri ve kendi mağazandan gelen siparişleri birleştir; stok, iade ve faturayı aynı akışta yönet.',
    workspace: 'Ticaret Ops',
    apps: [
      { label: 'Sipariş Yönetimi', icon: ShoppingCart, tone: 'accent' },
      { label: 'Pazaryeri Bağlantısı', icon: Store, tone: 'petrol' },
      { label: 'Ürün Kataloğu', icon: Tags, tone: 'ink' },
      { label: 'Stok Senkronu', icon: RefreshCw, tone: 'petrolLight' },
      { label: 'İade Merkezi', icon: Undo2, tone: 'yellow' },
      { label: 'Faturalama', icon: ReceiptText, tone: 'slate' },
      { label: 'Müşteri Portalı', icon: Users, tone: 'petrol' },
    ],
    recordsTitle: 'Son siparişler',
    records: [
      { title: '#TR-48219 · Trendyol', meta: '2 ürün · 1.240 ₺' },
      { title: '#HB-90142 · Hepsiburada', meta: '1 ürün · 680 ₺' },
      { title: '#ST-21877 · Shopify', meta: '5 ürün · 3.410 ₺' },
      { title: '#AM-55031 · Amazon', meta: '1 ürün · 249 ₺' },
      { title: '#N11-7742 · n11', meta: '3 ürün · 1.890 ₺' },
      { title: '#TR-48204 · Trendyol', meta: '2 ürün · 940 ₺' },
    ],
    entities: [
      { label: 'Siparişler', count: '12,4k', delta: '+45' },
      { label: 'Ürünler', count: '3,2k' },
      { label: 'Pazaryerleri', count: '9' },
      { label: 'İadeler', count: '412' },
      { label: 'Müşteriler', count: '28k' },
      { label: 'Faturalar', count: '11,8k' },
    ],
    workflows: [
      { label: 'Stok senkronizasyonu', time: '2dk' },
      { label: 'Sipariş onay bildirimi', time: '5dk' },
      { label: 'Kargo etiketi oluştur', time: '12dk' },
      { label: 'İade talebi yönlendirme', time: '1sa' },
      { label: 'Fatura kesimi', time: '1sa' },
      { label: 'Kritik stok uyarısı', time: '3sa' },
      { label: 'Pazaryeri fiyat güncelleme', time: '6sa' },
      { label: 'Kargo firması seçimi', time: '9sa' },
    ],
  },
  {
    id: 'ambar',
    label: 'Dijital Ambar',
    fullName: 'Dijital ambar ağı',
    headline: 'İhtiyacın kadar alan, istediğin şehirde',
    description:
      'Türkiye geneline yayılmış ambar ağında boş alanı anlık gör, kirala, doluluğu tek ekrandan izle.',
    workspace: 'Ambar Ağı',
    apps: [
      { label: 'Ambar Haritası', icon: Map, tone: 'petrol' },
      { label: 'Kapasite Planlama', icon: LayoutGrid, tone: 'accent' },
      { label: 'Alan Kiralama', icon: KeyRound, tone: 'ink' },
      { label: 'Aktarma Merkezi', icon: Shuffle, tone: 'petrolLight' },
      { label: 'Doluluk Takibi', icon: Gauge, tone: 'yellow' },
      { label: 'Sözleşmeler', icon: FileText, tone: 'slate' },
    ],
    recordsTitle: 'Ambar noktaları',
    records: [
      { title: 'Hadımköy, İstanbul', meta: '%78 dolu · 4.200 m²' },
      { title: 'Ostim, Ankara', meta: '%54 dolu · 2.800 m²' },
      { title: 'Çiğli, İzmir', meta: '%91 dolu · 3.100 m²' },
      { title: 'Nilüfer, Bursa', meta: '%39 dolu · 1.900 m²' },
      { title: 'Şehitkamil, Gaziantep', meta: '%66 dolu · 2.400 m²' },
      { title: 'Tarsus, Mersin', meta: '%47 dolu · 2.100 m²' },
    ],
    entities: [
      { label: 'Ambar noktası', count: '42' },
      { label: 'Toplam alan', count: '186k m²' },
      { label: 'Boş alan', count: '41k m²', delta: '+8' },
      { label: 'Raf / göz', count: '18k' },
      { label: 'Aktif sözleşme', count: '320' },
      { label: 'Aktarma hattı', count: '76' },
    ],
    workflows: [
      { label: 'Doluluk eşiği uyarısı', time: '4dk' },
      { label: 'Boş alan ilanı yayınla', time: '20dk' },
      { label: 'Aktarma planı oluştur', time: '1sa' },
      { label: 'Giriş-çıkış kaydı', time: '2sa' },
      { label: 'Kira dönemi hatırlatma', time: '5sa' },
      { label: 'Sayım randevusu', time: '8sa' },
      { label: 'Sözleşme yenileme teklifi', time: '1g' },
    ],
  },
  {
    id: 'ekspres',
    label: 'Ekspres Kargo',
    fullName: 'Ekspres e-ticaret kargosu',
    headline: 'Aynı gün çıkışlı e-ticaret teslimatı',
    description:
      'Gönderiyi oluştur, kuryeyi ata, alıcıya canlı takip gönder. Desi ölçümünden teslim kanıtına kadar tek akış.',
    workspace: 'Ekspres Ops',
    apps: [
      { label: 'Gönderi Oluştur', icon: PackagePlus, tone: 'accent' },
      { label: 'Kurye Takip', icon: Navigation, tone: 'petrol' },
      { label: 'Şube Ağı', icon: Building2, tone: 'ink' },
      { label: 'Rota Optimizasyonu', icon: Route, tone: 'petrolLight' },
      { label: 'Desi Ölçüm', icon: Ruler, tone: 'yellow' },
      { label: 'Teslim Kanıtı', icon: ScanLine, tone: 'slate' },
      { label: 'Alıcı Bildirimi', icon: BellRing, tone: 'petrol' },
    ],
    recordsTitle: 'Aktif gönderiler',
    records: [
      { title: 'GND-884210 · Kadıköy', meta: 'Dağıtımda · 14:20' },
      { title: 'GND-884198 · Ataşehir', meta: 'Kuryede · 13:55' },
      { title: 'GND-884155 · Beşiktaş', meta: 'Teslim edildi · 12:40' },
      { title: 'GND-884121 · Bornova', meta: 'Şubede · 11:05' },
      { title: 'GND-884090 · Çankaya', meta: 'Transferde · 09:30' },
      { title: 'GND-884061 · Nilüfer', meta: 'Toplandı · 08:45' },
    ],
    entities: [
      { label: 'Günlük gönderi', count: '84k', delta: '+45' },
      { label: 'Kurye', count: '1,2k' },
      { label: 'Şube', count: '320' },
      { label: 'Dağıtım rotası', count: '2,4k' },
      { label: 'Teslim oranı', count: '%97' },
      { label: 'Ort. teslim', count: '1,4 gün' },
    ],
    workflows: [
      { label: 'Adres doğrulama', time: '1dk' },
      { label: 'Kurye atama', time: '6dk' },
      { label: 'Yola çıktı SMS', time: '15dk' },
      { label: 'Gecikme uyarısı', time: '40dk' },
      { label: 'Teslim kanıtı yükleme', time: '2sa' },
      { label: 'Başarısız teslim yönlendirme', time: '4sa' },
      { label: 'Kapıda ödeme mutabakatı', time: '12sa' },
      { label: 'Şubeler arası transfer', time: '1g' },
    ],
  },
  {
    id: 'depo',
    label: 'Depo',
    fullName: 'Depo yönetim modülü',
    headline: 'Mal kabulden sevkiyata depo operasyonu',
    description:
      'Raf adresleme, toplama listesi, sayım ve stok hareketleri; her adımı barkodla doğrulanan depo yönetimi.',
    workspace: 'Depo Ops',
    apps: [
      { label: 'Mal Kabul', icon: PackageOpen, tone: 'petrol' },
      { label: 'Yerleştirme', icon: LayoutGrid, tone: 'ink' },
      { label: 'Toplama', icon: ListChecks, tone: 'accent' },
      { label: 'Paketleme', icon: Package, tone: 'petrolLight' },
      { label: 'Sayım', icon: ClipboardCheck, tone: 'yellow' },
      { label: 'Stok Hareketi', icon: ArrowLeftRight, tone: 'slate' },
      { label: 'Sevkiyat', icon: Truck, tone: 'petrol' },
    ],
    recordsTitle: 'Bugünkü operasyon',
    records: [
      { title: 'Mal kabul', meta: '24 palet · 6 tedarikçi' },
      { title: 'Yerleştirme', meta: '412 koli · %88 tamam' },
      { title: 'Toplama listesi', meta: '138 sipariş · 9 operatör' },
      { title: 'Paketleme', meta: '126 kutu hazır' },
      { title: 'Kalite kontrol', meta: '31 kalem · 2 red' },
      { title: 'Sevkiyat', meta: '18:00 kapanış · 4 araç' },
    ],
    entities: [
      { label: 'SKU', count: '9,4k' },
      { label: 'Stok hareketi', count: '41k', delta: '+45' },
      { label: 'Raf adresi', count: '12k' },
      { label: 'Bekleyen sipariş', count: '138' },
      { label: 'Sayım farkı', count: '12' },
      { label: 'Tedarikçi', count: '284' },
    ],
    workflows: [
      { label: 'Kritik stok uyarısı', time: '3dk' },
      { label: 'Toplama listesi oluştur', time: '9dk' },
      { label: 'Barkod doğrulama', time: '25dk' },
      { label: 'Raf transferi onayı', time: '1sa' },
      { label: 'Sayım planı', time: '3sa' },
      { label: 'Tedarikçi mal kabul randevusu', time: '7sa' },
      { label: 'Sevkiyat kapanışı', time: '10sa' },
    ],
  },
  {
    id: 'lojistik',
    label: 'Lojistik',
    fullName: 'Lojistik yönetim modülü',
    headline: 'Navlun, sefer ve taşıyıcı yönetimi',
    description:
      'Yük borsasından teklif topla, aracı eşleştir, seferi canlı izle. Belge ve navlun mutabakatı otomatik ilerlesin.',
    workspace: 'Navlun Ops',
    apps: [
      { label: 'Yük Borsası', icon: Boxes, tone: 'accent' },
      { label: 'Navlun Teklif', icon: HandCoins, tone: 'petrol' },
      { label: 'Sefer Planlama', icon: CalendarRange, tone: 'ink' },
      { label: 'Araç Takip', icon: Truck, tone: 'petrolLight' },
      { label: 'Taşıyıcı Skoru', icon: Star, tone: 'yellow' },
      { label: 'Belge Yönetimi', icon: FileText, tone: 'slate' },
      { label: 'Mutabakat', icon: Scale, tone: 'petrol' },
    ],
    recordsTitle: 'Aktif seferler',
    records: [
      { title: 'İstanbul → Ankara', meta: 'Tır · Tenteli · 24 t' },
      { title: 'Bursa → İzmir', meta: 'Kamyon · Kapalı · 8 t' },
      { title: 'Mersin → Gaziantep', meta: 'Tır · Frigorifik · 18 t' },
      { title: 'Kocaeli → Konya', meta: 'Kamyonet · 1,2 t' },
      { title: 'İzmir → Trabzon', meta: 'Tır · Tenteli · 22 t' },
      { title: 'Adana → Samsun', meta: 'Kırkayak · Açık · 15 t' },
    ],
    entities: [
      { label: 'Aktif sefer', count: '5,8k', delta: '+45' },
      { label: 'Taşıyıcı', count: '940' },
      { label: 'Araç', count: '3,1k' },
      { label: 'Açık teklif', count: '214' },
      { label: 'Tamamlanan sefer', count: '62k' },
      { label: 'Belge', count: '128k' },
    ],
    workflows: [
      { label: 'Teklif toplama', time: '4dk' },
      { label: 'Araç eşleştirme', time: '11dk' },
      { label: 'Dönüş yükü bildirimi', time: '35dk' },
      { label: 'Sefer gecikme uyarısı', time: '2sa' },
      { label: 'İrsaliye kontrolü', time: '5sa' },
      { label: 'Navlun faturası', time: '9sa' },
      { label: 'Taşıyıcı skor güncelleme', time: '1g' },
      { label: 'Ödeme mutabakatı', time: '2g' },
    ],
  },
]
