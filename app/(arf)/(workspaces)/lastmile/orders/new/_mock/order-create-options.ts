import type {
  ActiveRouteOption,
  AddressSuggestion,
  CustomerOption,
  FacilityOption,
  GelAlOption,
  OrderCreateFormState,
} from '../_types/order-create'

export const CREATE_ORDER_TYPE_OPTIONS = [
  { value: 'dagitim', label: 'Dağıtım' },
  { value: 'toplama', label: 'Toplama' },
  { value: 'iade', label: 'İade' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'degisim', label: 'Değişim' },
  { value: 'gel_al', label: 'Gel-Al' },
  { value: 'kurulumlu_teslimat', label: 'Kurulumlu' },
] as const

export const CREATE_ROUTE_TYPE_OPTIONS = [
  { value: 'Standart Rota', label: 'Standart Rota' },
  { value: 'Ekspres Rota', label: 'Ekspres Teslimat' },
  { value: 'Toplama Ringi', label: 'Toplama Ringi' },
] as const

export const ADDRESS_TITLE_OPTIONS = [
  { value: 'Ev', label: 'Ev' },
  { value: 'Ofis', label: 'Ofis' },
  { value: 'İşyeri', label: 'İşyeri' },
  { value: 'Depo', label: 'Depo' },
  { value: 'Şube', label: 'Şube' },
  { value: 'Mağaza', label: 'Mağaza' },
  { value: 'Teslimat Noktası', label: 'Teslimat Noktası' },
] as const

export const PACKAGE_SIZE_OPTIONS = [
  {
    value: 'S',
    label: 'S — Small',
    description: 'Zarf, evrak veya çok küçük e-ticaret paketi',
  },
  {
    value: 'M',
    label: 'M — Medium',
    description: 'Ayakkabı kutusu, standart giyim veya küçük elektronik',
  },
  {
    value: 'L',
    label: 'L — Large',
    description: 'Büyük koli veya hacimli eşya',
  },
  {
    value: 'XL',
    label: 'XL — Extra Large',
    description: 'Çuval, TV, mobilya parçası',
  },
] as const

export const TAG_OPTIONS = [
  'Kırılabilir Paket',
  'Zile Basma',
  'Kapıya Bırak',
  'Acil',
] as const

export const mockCustomers: CustomerOption[] = [
  { id: 'c-bnf', label: 'ABC E-Ticaret' },
  { id: 'c-modanisa', label: 'Modanisa' },
  { id: 'c-trendyol', label: 'Trendyol' },
  { id: 'c-hb', label: 'Hepsiburada' },
  { id: 'c-vivense', label: 'Vivense' },
  { id: 'c-getir', label: 'Getir' },
  { id: 'c-mm', label: 'MediaMarkt' },
  { id: 'c-amz', label: 'Amazon TR' },
  { id: 'c-xrest', label: 'X Restoranı' },
  { id: 'c-migros', label: 'Migros' },
]

export const mockFacilities: FacilityOption[] = [
  {
    id: 'f-a101-merkez',
    customerId: 'c-bnf',
    label: 'A101 Merkez Depo',
    address: 'Yenisahra Mah. Osmanlı Cad. No:18, Ataşehir / İstanbul',
    contactName: 'Selim Kara',
    contactPhone: '+90 532 100 20 30',
  },
  {
    id: 'f-umraniye',
    customerId: 'c-modanisa',
    label: 'Ümraniye Aktarma',
    address: 'İnkılap Mah. Küçüksu Cad. No:42, Ümraniye / İstanbul',
    contactName: 'Ayşe Demir',
    contactPhone: '+90 533 220 30 40',
  },
  {
    id: 'f-tuzla',
    customerId: 'c-vivense',
    label: 'Tuzla Merkez Depo',
    address: 'Aydınlı OSB Mah. 2. Cad. No:7, Tuzla / İstanbul',
    contactName: 'Can Yıldız',
    contactPhone: '+90 534 330 40 50',
  },
  {
    id: 'f-sisli',
    customerId: 'c-trendyol',
    label: 'Şişli A101 Depo',
    address: 'Halaskargazi Cad. No:126, Şişli / İstanbul',
    contactName: 'Elif Şahin',
    contactPhone: '+90 535 440 50 60',
  },
  {
    id: 'f-kadikoy',
    customerId: 'c-hb',
    label: 'Kadıköy Şube',
    address: 'Caferağa Mah. Moda Cad. No:55, Kadıköy / İstanbul',
    contactName: 'Burak Özkan',
    contactPhone: '+90 536 550 60 70',
  },
  {
    id: 'f-maslak',
    customerId: 'c-mm',
    label: 'Maslak Depo',
    address: 'Maslak Mah. Büyükdere Cad. No:255, Sarıyer / İstanbul',
    contactName: 'Deniz Acar',
    contactPhone: '+90 537 660 70 80',
  },
  {
    id: 'f-levent',
    customerId: 'c-getir',
    label: 'Levent Soğuk Depo',
    address: 'Levent Mah. Nispetiye Cad. No:12, Beşiktaş / İstanbul',
    contactName: 'Gökhan Arslan',
    contactPhone: '+90 538 770 80 90',
  },
]

/** Gel-Al noktaları — BE kaynak yapısı netleşince gerçek API’ye bağlanacak */
export const mockGelAlPoints: GelAlOption[] = [
  {
    id: 'ga-moda',
    label: 'Moda Mh. Gel-Al Noktası',
    address: 'Caferağa Mah. Moda Cad. No:12, Kadıköy / İstanbul',
    contactName: 'Moda Gel-Al Yetkilisi',
    contactPhone: '+90 555 101 20 30',
  },
  {
    id: 'ga-bostanci',
    label: 'Bostancı Gel-Al',
    address: 'Bostancı Mah. İskele Sok. No:8, Kadıköy / İstanbul',
    contactName: 'Bostancı Gel-Al Yetkilisi',
    contactPhone: '+90 555 202 30 40',
  },
  {
    id: 'ga-kadikoy',
    label: 'Kadıköy Anlaşmalı Bakkal',
    address: 'Caferağa Mah. Mühürdar Cad. No:35, Kadıköy / İstanbul',
    contactName: 'Ahmet Kaya',
    contactPhone: '+90 555 303 40 50',
  },
  {
    id: 'ga-besiktas',
    label: 'Beşiktaş Gel-Al Noktası',
    address: 'Sinanpaşa Mah. Ortabahçe Cad. No:18, Beşiktaş / İstanbul',
    contactName: 'Beşiktaş Gel-Al Yetkilisi',
    contactPhone: '+90 555 404 50 60',
  },
]

export const mockAddressSuggestions: AddressSuggestion[] = [
  {
    id: 'addr-seyda',
    primary: 'Şeyda Sokak',
    secondary: 'Mehmet Akif, Selçuklu/Konya, Türkiye',
  },
  {
    id: 'addr-mehmet-akif',
    primary: 'Mehmet Akif Mahallesi',
    secondary: 'Selçuklu/Konya, Türkiye',
  },
  {
    id: 'addr-caddebostan',
    primary: 'Bağdat Caddesi',
    secondary: 'Caddebostan, Kadıköy/İstanbul, Türkiye',
  },
  {
    id: 'addr-moda',
    primary: 'Moda Caddesi',
    secondary: 'Moda, Kadıköy/İstanbul, Türkiye',
  },
  {
    id: 'addr-nisantasi',
    primary: 'Teşvikiye Caddesi',
    secondary: 'Teşvikiye, Şişli/İstanbul, Türkiye',
  },
  {
    id: 'addr-besiktas',
    primary: 'Barbaros Bulvarı',
    secondary: 'Beşiktaş, Beşiktaş/İstanbul, Türkiye',
  },
  {
    id: 'addr-levent',
    primary: 'Büyükdere Caddesi',
    secondary: 'Levent, Beşiktaş/İstanbul, Türkiye',
  },
  {
    id: 'addr-atasehir',
    primary: 'Atatürk Mahallesi',
    secondary: 'Ataşehir/İstanbul, Türkiye',
  },
  {
    id: 'addr-cekmekoy',
    primary: 'Mimar Sinan Caddesi',
    secondary: 'Çekmeköy/İstanbul, Türkiye',
  },
  {
    id: 'addr-uskudar',
    primary: 'İcadiye Caddesi',
    secondary: 'İcadiye, Üsküdar/İstanbul, Türkiye',
  },
  {
    id: 'addr-cankaya',
    primary: 'Tunalı Hilmi Caddesi',
    secondary: 'Kavaklıdere, Çankaya/Ankara, Türkiye',
  },
  {
    id: 'addr-alsancak',
    primary: 'Kıbrıs Şehitleri Caddesi',
    secondary: 'Alsancak, Konak/İzmir, Türkiye',
  },
]

export const mockActiveRoutes: ActiveRouteOption[] = [
  {
    id: 'r-4092',
    label: '4092',
    courier: 'Mehmet Can',
    distanceKm: 1.2,
    costMinutes: 25,
  },
  {
    id: 'r-4088',
    label: '4088',
    courier: 'Ali Veli',
    distanceKm: 3.5,
    costMinutes: 15,
  },
  {
    id: 'r-4101',
    label: '4101',
    courier: 'Zeynep Arslan',
    distanceKm: 0.8,
    costMinutes: 12,
  },
]

export function createInitialOrderForm(): OrderCreateFormState {
  return {
    musteriId: '',
    referans_no: '',
    siparis_tipi: '',
    rota_tipi: '',
    teslimat_hizi: 'express',
    alim_tarih: '',
    alim_baslangic: '',
    alim_bitis: '',
    teslim_tarih: '',
    teslim_baslangic: '',
    teslim_bitis: '',
    gorev_suresi_dk: '',
    oncelik_puani: '',
    gereksinimler: [],
    etiketler: [],
    kurye_notu: '',
    alis_tesis_id: '',
    alis_adres: '',
    alis_full_address: '',
    alis_lat: null,
    alis_lon: null,
    alis_place_id: '',
    alis_bina_no: '',
    alis_kat: '',
    alis_daire_no: '',
    alis_contact_tipi: '',
    alis_firma_adi: '',
    alis_vkn: '',
    alis_vergi_dairesi: '',
    alis_tckn: '',
    alis_muhatabi: '',
    alis_telefon: '',
    alis_adres_baslik: '',
    varis_tesis_id: '',
    varis_gel_al_id: '',
    varis_adres: '',
    varis_full_address: '',
    varis_lat: null,
    varis_lon: null,
    varis_place_id: '',
    varis_bina_no: '',
    varis_kat: '',
    varis_daire_no: '',
    varis_contact_tipi: '',
    varis_firma_adi: '',
    varis_vkn: '',
    varis_vergi_dairesi: '',
    varis_tckn: '',
    varis_muhatabi: '',
    varis_telefon: '',
    varis_adres_baslik: '',
    paketler: [
      {
        id: 'package-1',
        hacim_sinifi: 'M',
        adet: '1',
        hacim: '',
        agirlik_kg: '',
        desi: '',
      },
    ],
    ucret_origin_city_id: '34',
    ucret_origin_district_id: '34-atasehir',
    ucret_dest_city_id: '34',
    ucret_dest_district_id: '34-tuzla',
    ucret_distance_km: '',
    ucret_settlement_type: 'pesin',
    ucret_credit_days: '0',
    ucret_include_kdv: true,
    ucret_manual_override: false,
    ucret_manual_subtotal: '',
    teslimat_kaniti_zorunlu: true,
    bildirim_sms: true,
    bildirim_email: true,
    guvenli_teslimat_otp: false,
    yakin_kuryelere_dagit: false,
    aninda_sahaya_ilet: false,
    aktif_rota_id: '',
    meta_fields: [],
  }
}
