import { mockOrderList } from '../../_mock/orders-mock-data'
import type { LastmileOrder } from '../../_types/order'
import { buildDefaultTimeline } from '../_lib/order-detail-helpers'
import type {
  OrderAssignmentSettings,
  OrderAuditLogItem,
  OrderCustomerDetail,
  OrderDetail,
  OrderLocationPoint,
  OrderPackageLine,
  OrderRouteDetail,
} from '../_types/order-detail'

type Enrichment = Partial<
  Pick<
    OrderDetail,
    | 'musteri_detay'
    | 'alis'
    | 'varis'
    | 'rota'
    | 'paketler'
    | 'atama_guvenlik'
    | 'meta'
    | 'kurye_notu'
    | 'ic_not'
    | 'teslim_zamani'
    | 'timeline'
    | 'audit_log'
  >
>

const ISTANBUL = {
  depo: { lat: 40.9901, lng: 29.029 },
  besiktas: { lat: 41.0422, lng: 29.0067 },
  kadikoy: { lat: 40.9905, lng: 29.0292 },
  atashehir: { lat: 40.9833, lng: 29.1167 },
  maltepe: { lat: 40.9357, lng: 29.151 },
  kartal: { lat: 40.888, lng: 29.189 },
}

const enrichments: Record<string, Enrichment> = {
  'lm-1001': {
    musteri_detay: customer(
      'ABC E-Ticaret',
      'Burak Şen',
      '6123456789',
      'Kadıköy',
      'ops@abc.com',
      '+90 216 000 1122'
    ),
    alis: point(
      'A101 Merkez Depo',
      'Caferağa Mh. Moda Cd. No:12, Kadıköy',
      'Ahmet Yılmaz',
      '+90 532 234 2211',
      '22.07.2026 10:00 – 12:00',
      ISTANBUL.depo
    ),
    varis: point(
      'Ev',
      'Sinanpaşa Mh. Beşiktaş Cd. No:8',
      'Ayşe Demir',
      '+90 555 123 4433',
      '22.07.2026 14:00 – 16:00',
      ISTANBUL.besiktas,
      {
        contact_tipi: 'bireysel',
        tckn: '12345678901',
      }
    ),
    rota: unassignedRoute(),
    paketler: [
      pkg('p1', 'standart', 'M', 8, 4.5, 'PKG-9921-01', 'olusturuldu'),
      pkg('p2', 'standart', 'M', 8, 4.5, 'PKG-9921-02', 'olusturuldu'),
    ],
    meta: { kanal: 'API', kaynak: 'BNF', siparis_kanali: 'Marketplace' },
    kurye_notu: 'Kapı kodu: 1423. Zile basmayın.',
    ic_not: 'VIP müşteri — SLA ihlali riski yüksek.',
    audit_log: [
      audit('a1', '22.07.2026 10:15', 'API (BNF)', 'Sipariş oluşturuldu', '185.92.14.10'),
      audit('a2', '22.07.2026 10:16', 'Sistem', 'Atama kuyruğuna eklendi', '10.0.0.1'),
    ],
  },
  'lm-1002': {
    musteri_detay: customer(
      'Modanisa',
      'Elif Kara',
      '9988776655',
      'Ümraniye',
      'lojistik@modanisa.com',
      '+90 216 444 5566',
      true,
      true
    ),
    alis: point(
      'Ümraniye Aktarma',
      'Yamanevler Mh. Alemdağ Cd. No:40',
      'Depo Görevlisi',
      '+90 216 111 2233',
      '22.07.2026 08:00 – 10:00',
      { lat: 41.025, lng: 29.1 }
    ),
    varis: point(
      'Moda Mh. Gel-Al Noktası',
      'Moda Cd. No:55, Kadıköy',
      'Gel-Al Operatörü',
      '+90 216 555 6677',
      '22.07.2026 10:00 – 18:00',
      ISTANBUL.kadikoy
    ),
    rota: assignedRoute({
      rota_id: '4092',
      kurye_id: 'kur-12',
      kurye_adi: 'Ali Veli',
      arac: '34 ABC 123',
      eta: '14:25',
      mesafe_m: 800,
      mevcut_durak_sirasi: 2,
      durak_sirasi: 3,
      toplam_durak: 12,
      kurye: { lat: 40.997, lng: 29.04 },
      polyline: [
        { lat: 41.025, lng: 29.1 },
        { lat: 41.01, lng: 29.07 },
        { lat: 40.997, lng: 29.04 },
        { lat: 40.9905, lng: 29.0292 },
      ],
      ara: [
        { id: 'w1', label: 'D2', lat: 41.01, lng: 29.07, passive: true },
        { id: 'w2', label: 'D4', lat: 41.002, lng: 29.05, passive: true },
      ],
    }),
    paketler: [pkg('p1', 'standart', 'S', 2.5, 1.2, 'PKG-9922-01', 'yolda')],
    meta: { kanal: 'Manuel', gel_al_kodu: 'KD-MODA-01' },
    kurye_notu: 'Gel-Al dolabı A-12.',
    ic_not: '',
    audit_log: [
      audit('a1', '22.07.2026 08:40', 'Ayşe Demir', 'Sipariş oluşturuldu', '176.240.112.44'),
      audit('a2', '22.07.2026 09:10', 'Ayşe Demir', 'Rota #4092 atandı', '176.240.112.44'),
      audit('a3', '22.07.2026 10:05', 'Ali Veli', 'Paket alındı', '10.8.0.21'),
      audit('a4', '22.07.2026 13:40', 'Sistem', 'ETA güncellendi: 14:25', '10.0.0.1'),
    ],
  },
  'lm-1007': {
    musteri_detay: customer(
      'Migros',
      'Selin Ak',
      '1234567890',
      'Kartal',
      'lastmile@migros.com',
      '+90 216 700 0000'
    ),
    alis: point(
      'Kartal Depo',
      'Soğanlık Mh. Depo Cd. No:1',
      'Depo Görevlisi',
      '+90 216 700 8899',
      '22.07.2026 12:00 – 14:00',
      ISTANBUL.kartal
    ),
    varis: point(
      'Ofis',
      'Bağlarbaşı Mh. No:22',
      'Hakan Öz',
      '+90 533 222 1100',
      '22.07.2026 14:00 – 16:00',
      ISTANBUL.maltepe,
      {
        contact_tipi: 'kurumsal',
        firma_adi: 'Öz Ticaret Ltd.',
        vkn: '9876543210',
        vergi_dairesi: 'Maltepe',
      }
    ),
    rota: assignedRoute({
      rota_id: '4105',
      kurye_id: 'kur-44',
      kurye_adi: 'Ozan Er',
      arac: '34 SWP 220',
      eta: '14:55',
      mesafe_m: 2800,
      mevcut_durak_sirasi: 3,
      durak_sirasi: 5,
      toplam_durak: 18,
      kurye: { lat: 40.91, lng: 29.17 },
      polyline: [ISTANBUL.kartal, { lat: 40.91, lng: 29.17 }, ISTANBUL.maltepe],
      ara: [{ id: 'w1', label: 'D3', lat: 40.92, lng: 29.16, passive: true }],
    }),
    paketler: [
      pkg('p-out', 'giden', 'M', 8, 4.5, 'PKG-SWP-OUT', 'yolda'),
      {
        ...pkg('p-in', 'donen', 'M', 8, 4.5, 'PKG-SWP-IN', 'olusturuldu'),
        kanit: null,
      },
    ],
    meta: { degisim_kodu: 'SWAP-441', soğuk_zincir: 'evet' },
    kurye_notu: 'Soğuk çanta zorunlu. Kimlik kontrolü yapın.',
    ic_not: 'Değişim onayı SMS ile alındı.',
    audit_log: [
      audit(
        'a1',
        '22.07.2026 11:05',
        'Ayşe Demir',
        'Değişim siparişi oluşturuldu',
        '176.240.112.44'
      ),
      audit('a2', '22.07.2026 11:40', 'Sistem', 'Rota #4105 atandı', '10.0.0.1'),
      audit('a3', '22.07.2026 12:30', 'Ozan Er', 'Giden paket alındı', '10.8.0.33'),
    ],
  },
  'lm-1009': {
    musteri_detay: customer(
      'Hepsiburada',
      'Canan Yurt',
      '5544332211',
      'Pendik',
      'lm@hepsiburada.com',
      '+90 216 200 0000'
    ),
    alis: point(
      'Pendik Depo',
      'Yenişehir Mh. No:100',
      'Depo Operasyon',
      '+90 216 200 3344',
      '21.07.2026 14:00 – 16:00',
      { lat: 40.878, lng: 29.233 }
    ),
    varis: point(
      'Kartal Mh.',
      'Çavuşoğlu Mh. No:7',
      'İrem Polat',
      '+90 505 888 7766',
      '21.07.2026 16:00 – 18:00',
      ISTANBUL.kartal
    ),
    rota: assignedRoute({
      rota_id: '4011',
      kurye_id: 'kur-08',
      kurye_adi: 'Mert Ak',
      arac: '34 HBB 901',
      eta: '17:12',
      mesafe_m: 4200,
      mevcut_durak_sirasi: 9,
      durak_sirasi: 9,
      toplam_durak: 9,
      kurye: null,
      polyline: [{ lat: 40.878, lng: 29.233 }, ISTANBUL.kartal],
      ara: [],
    }),
    paketler: [
      {
        ...pkg('p1', 'standart', 'L', 18, 12, 'PKG-9929-01', 'teslim_edildi'),
        kanit: {
          tc_son_4: '4821',
          alici_ad_soyad: 'İrem Polat',
          foto_urls: ['/placeholder-pod-1.jpg', '/placeholder-pod-2.jpg'],
          kurye_gorev_notu: 'Kapıda teslim. İmza alındı.',
        },
      },
      {
        ...pkg('p2', 'standart', 'L', 18, 12, 'PKG-9929-02', 'teslim_edildi'),
        kanit: {
          tc_son_4: '4821',
          alici_ad_soyad: 'İrem Polat',
          foto_urls: ['/placeholder-pod-3.jpg'],
          kurye_gorev_notu: null,
        },
      },
    ],
    meta: { kanal: 'API', kaynak: 'Hepsiburada' },
    kurye_notu: '',
    ic_not: 'Teslim tamam — fatura kesildi.',
    teslim_zamani: '17:08',
    audit_log: [
      audit('a1', '21.07.2026 12:00', 'API (Hepsiburada)', 'Sipariş oluşturuldu', '52.28.110.91'),
      audit('a2', '21.07.2026 13:10', 'Sistem', 'Rota #4011 atandı', '10.0.0.1'),
      audit('a3', '21.07.2026 15:40', 'Mert Ak', 'Paketler alındı', '10.8.0.18'),
      audit('a4', '21.07.2026 17:12', 'Mert Ak', 'Teslim edildi + POD yüklendi', '10.8.0.18'),
    ],
  },
}

export function getOrderDetailMock(id: string): OrderDetail | null {
  const base = mockOrderList.find((order) => order.id === id)
  if (!base) return null

  const extra = enrichments[id]
  return mergeDetail(base, extra)
}

function mergeDetail(base: LastmileOrder, extra?: Enrichment): OrderDetail {
  const alis = extra?.alis ?? defaultAlis(base)
  const varis = extra?.varis ?? defaultVaris(base)
  const rota = extra?.rota ?? defaultRoute(base, alis, varis)
  const paketler = extra?.paketler ?? defaultPackages(base)
  const timeline = extra?.timeline ?? buildDefaultTimeline(base, base.olusturulma_zamani)
  const audit_log = extra?.audit_log ?? defaultAudit(base)
  const customer = extra?.musteri_detay ?? defaultCustomer(base)

  return {
    ...base,
    musteri_detay: customer,
    alis,
    varis,
    rota,
    paketler,
    atama_guvenlik: extra?.atama_guvenlik ?? defaultAssignment(customer),
    meta: extra?.meta ?? { kanal: base.olusturan.startsWith('API') ? 'API' : 'Manuel' },
    kurye_notu: extra?.kurye_notu ?? '',
    ic_not: extra?.ic_not ?? '',
    teslim_zamani:
      extra?.teslim_zamani ??
      (base.durum === 'teslim_edildi' && base.eta !== '—' ? base.eta : null),
    timeline,
    audit_log,
  }
}

function defaultCustomer(base: LastmileOrder): OrderCustomerDetail {
  return customer(base.musteri, base.alis_muhatabi, '0000000000', '—', '—', base.alis_telefon)
}

function defaultAssignment(customer: OrderCustomerDetail): OrderAssignmentSettings {
  return {
    teslimat_kaniti_zorunlu: true,
    bildirim_sms: customer.bildirim_sms,
    bildirim_email: customer.bildirim_email,
    guvenli_teslimat_otp: false,
    yakin_kuryelere_dagit: false,
    aninda_sahaya_ilet: false,
    aktif_rota_id: null,
    aktif_rota_label: null,
  }
}

function defaultAlis(base: LastmileOrder): OrderLocationPoint {
  const isAddressStyle =
    base.siparis_tipi === 'toplama' ||
    base.siparis_tipi === 'iade' ||
    base.siparis_tipi === 'transfer'

  return point(
    base.alis_noktasi,
    `${base.alis_noktasi}, İstanbul`,
    base.alis_muhatabi,
    base.alis_telefon,
    base.alim_zaman_penceresi,
    ISTANBUL.depo,
    isAddressStyle
      ? {
          contact_tipi: 'kurumsal',
          firma_adi: base.musteri,
          vkn: '1234567890',
          vergi_dairesi: 'Kadıköy',
        }
      : undefined
  )
}

function defaultVaris(base: LastmileOrder): OrderLocationPoint {
  const isAddressStyle =
    base.siparis_tipi === 'dagitim' ||
    base.siparis_tipi === 'degisim' ||
    base.siparis_tipi === 'kurulumlu_teslimat' ||
    base.siparis_tipi === 'transfer'

  return point(
    base.varis_noktasi,
    `${base.varis_noktasi}, İstanbul`,
    base.varis_muhatabi,
    base.varis_telefon,
    base.teslim_zaman_penceresi,
    ISTANBUL.kadikoy,
    isAddressStyle
      ? {
          contact_tipi: 'bireysel',
          tckn: '12345678901',
        }
      : undefined
  )
}

function defaultRoute(
  base: LastmileOrder,
  alis: OrderLocationPoint,
  varis: OrderLocationPoint
): OrderRouteDetail {
  if (!base.atanan_kurye) return unassignedRoute(base.mesafe_m)

  return assignedRoute({
    rota_id: `R-${base.id.slice(-4)}`,
    kurye_id: `kur-${base.id.slice(-3)}`,
    kurye_adi: base.atanan_kurye,
    arac: base.atanan_arac,
    eta: base.eta,
    mesafe_m: base.mesafe_m,
    mevcut_durak_sirasi: base.durum === 'teslim_edildi' ? 4 : 2,
    durak_sirasi: 4,
    toplam_durak: 10,
    kurye: base.durum === 'yolda' ? midpoint(alis, varis) : null,
    polyline: [
      { lat: alis.lat, lng: alis.lng },
      midpoint(alis, varis),
      { lat: varis.lat, lng: varis.lng },
    ],
    ara: [],
  })
}

function defaultPackages(base: LastmileOrder): OrderPackageLine[] {
  if (base.siparis_tipi === 'degisim') {
    return [
      pkg(
        `${base.id}-out`,
        'giden',
        base.hacim_sinifi,
        (base.toplam_hacim ?? 0) / 2,
        (base.agirlik_kg ?? 0) / 2,
        `${base.takip_no}-OUT`,
        statusFromOrder(base)
      ),
      pkg(
        `${base.id}-in`,
        'donen',
        base.hacim_sinifi,
        (base.toplam_hacim ?? 0) / 2,
        (base.agirlik_kg ?? 0) / 2,
        `${base.takip_no}-IN`,
        base.durum === 'teslim_edildi' ? 'teslim_alindi' : 'olusturuldu'
      ),
    ]
  }

  const count = Math.max(1, base.paket_sayisi)
  const hacim = base.toplam_hacim / count
  const weight = base.agirlik_kg / count
  return Array.from({ length: count }, (_, index) =>
    pkg(
      `${base.id}-p${index + 1}`,
      'standart',
      base.hacim_sinifi,
      hacim,
      weight,
      `${base.takip_no}-${String(index + 1).padStart(2, '0')}`,
      statusFromOrder(base)
    )
  )
}

function defaultAudit(base: LastmileOrder): OrderAuditLogItem[] {
  const items: OrderAuditLogItem[] = [
    audit(`${base.id}-a1`, base.olusturulma_zamani, base.olusturan, 'Sipariş oluşturuldu'),
  ]
  if (base.atanan_kurye) {
    items.push(
      audit(
        `${base.id}-a2`,
        base.olusturulma_zamani,
        'Sistem',
        `${base.atanan_kurye} rotaya atandı`
      )
    )
  }
  if (base.durum === 'teslim_edildi') {
    items.push(
      audit(
        `${base.id}-a3`,
        base.olusturulma_zamani,
        base.atanan_kurye ?? 'Sistem',
        'Teslim edildi'
      )
    )
  }
  if (base.durum === 'iptal_edildi') {
    items.push(audit(`${base.id}-a3`, base.olusturulma_zamani, 'Sistem', 'Sipariş iptal edildi'))
  }
  return items
}

function statusFromOrder(base: LastmileOrder): OrderPackageLine['durum'] {
  if (base.durum === 'iptal_edildi') return 'iptal'
  if (base.durum === 'teslim_edildi') return 'teslim_edildi'
  if (base.durum === 'yolda') return 'yolda'
  return 'olusturuldu'
}

function customer(
  unvan: string,
  yetkili: string,
  vkn: string,
  vergi_dairesi: string,
  email: string,
  telefon: string,
  bildirim_sms = true,
  bildirim_email = true
): OrderCustomerDetail {
  return { unvan, yetkili, vkn, vergi_dairesi, email, telefon, bildirim_sms, bildirim_email }
}

function point(
  baslik: string,
  adres: string,
  muhatap: string,
  telefon: string,
  zaman_penceresi: string,
  coords: { lat: number; lng: number },
  contact?: Partial<
    Pick<
      OrderLocationPoint,
      'contact_tipi' | 'firma_adi' | 'vkn' | 'vergi_dairesi' | 'tckn'
    >
  >
): OrderLocationPoint {
  return {
    baslik,
    adres,
    muhatap,
    telefon,
    zaman_penceresi,
    ...coords,
    contact_tipi: contact?.contact_tipi ?? 'tesis',
    firma_adi: contact?.firma_adi ?? null,
    vkn: contact?.vkn ?? null,
    vergi_dairesi: contact?.vergi_dairesi ?? null,
    tckn: contact?.tckn ?? null,
  }
}

function unassignedRoute(mesafe_m: number | null = null): OrderRouteDetail {
  return {
    rota_id: null,
    rota_adi: null,
    kurye_id: null,
    kurye_adi: null,
    arac: null,
    eta: '—',
    mesafe_m,
    mevcut_durak_sirasi: null,
    durak_sirasi: null,
    toplam_durak: null,
    kurye_lat: null,
    kurye_lng: null,
    polyline: [],
    ara_duraklar: [],
  }
}

function assignedRoute(input: {
  rota_id: string
  kurye_id: string
  kurye_adi: string
  arac: string | null
  eta: string
  mesafe_m: number | null
  mevcut_durak_sirasi: number
  durak_sirasi: number
  toplam_durak: number
  kurye: { lat: number; lng: number } | null
  polyline: Array<{ lat: number; lng: number }>
  ara: OrderRouteDetail['ara_duraklar']
}): OrderRouteDetail {
  return {
    rota_id: input.rota_id,
    rota_adi: `Rota #${input.rota_id}`,
    kurye_id: input.kurye_id,
    kurye_adi: input.kurye_adi,
    arac: input.arac,
    eta: input.eta,
    mesafe_m: input.mesafe_m,
    mevcut_durak_sirasi: input.mevcut_durak_sirasi,
    durak_sirasi: input.durak_sirasi,
    toplam_durak: input.toplam_durak,
    kurye_lat: input.kurye?.lat ?? null,
    kurye_lng: input.kurye?.lng ?? null,
    polyline: input.polyline,
    ara_duraklar: input.ara,
  }
}

function pkg(
  id: string,
  kind: OrderPackageLine['kind'],
  hacim_sinifi: OrderPackageLine['hacim_sinifi'],
  hacim: number,
  agirlik_kg: number,
  barkod: string,
  durum: OrderPackageLine['durum']
): OrderPackageLine {
  return { id, kind, hacim_sinifi, hacim, agirlik_kg, barkod, durum, kanit: null }
}

function audit(
  id: string,
  timestamp: string,
  actor: string,
  action: string,
  ip = '10.0.0.12'
): OrderAuditLogItem {
  return {
    id,
    timestamp,
    actor,
    action,
    actionType: '',
    sourceLabel: '',
    itemCode: '',
    location: '',
    ip,
  }
}

function midpoint(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): { lat: number; lng: number } {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 }
}
