// TODO: Remove mock when backend API is ready
import type {
  CourierActivityEvent,
  CourierVehicleAssignment,
} from '../[id]/_types/courier-detail'
import type { CourierListKpi, LastmileCourier } from '../_types/courier'

const now = '07.08.2026 09:30'

export const mockCourierList: LastmileCourier[] = [
  {
    id: 'seed-courier-1',
    ad_soyad: 'Ahmet Yılmaz',
    telefon: '+90 532 111 2233',
    tckn: '12345678901',
    kan_grubu: 'A Rh+',
    eposta: 'ahmet.yilmaz@demo.arf',
    davet_kabul_edildi: true,
    durum: 'yolda',
    istihdam: 'esnaf',
    zimmetli_arac_id: 'veh-001',
    zimmetli_arac_plaka: '34 ABC 123',
    vardiya_baslangic: '08:00',
    vardiya_bitis: '18:00',
    aktif_rota_id: '4120',
    aktif_rota_durak_sayisi: 8,
    aktif_rota_siparis_sayisi: 6,
    yetenekler: ['motosiklet', 'hizli_teslimat'],
    evrak_uyarilari: [{ kind: 'src', label: 'SRC belgesi', daysRemaining: 18 }],
    ehliyet_bitis: '2028-04-12',
    src_bitis: '2026-08-26',
    saglik_bitis: '2027-01-10',
    evraklar: [
      {
        id: 'doc-1',
        name: 'ehliyet.pdf',
        size: 240_000,
        mimeType: 'application/pdf',
        type: 'ehliyet',
        uploadedAt: '2026-01-12T10:00:00.000Z',
        uploadedBy: 'sistem',
      },
    ],
    olusturan: 'Sistem',
    olusturulma_zamani: '12.01.2026 10:00',
  },
  {
    id: 'seed-courier-2',
    ad_soyad: 'Ayşe Demir',
    telefon: '+90 533 222 3344',
    tckn: '10987654321',
    kan_grubu: '0 Rh+',
    eposta: 'ayse.demir@demo.arf',
    davet_kabul_edildi: true,
    durum: 'yolda',
    istihdam: 'sirket',
    zimmetli_arac_id: 'veh-002',
    zimmetli_arac_plaka: '34 DEF 456',
    vardiya_baslangic: '09:00',
    vardiya_bitis: '19:00',
    aktif_rota_id: '4121',
    aktif_rota_durak_sayisi: 5,
    aktif_rota_siparis_sayisi: 4,
    yetenekler: ['panelvan', 'soguk_zincir'],
    evrak_uyarilari: [],
    ehliyet_bitis: '2029-11-01',
    src_bitis: '2027-06-15',
    saglik_bitis: '2026-12-01',
    evraklar: [],
    olusturan: 'Sistem',
    olusturulma_zamani: '03.03.2026 11:20',
  },
  {
    id: 'c3',
    ad_soyad: 'Mehmet Kaya',
    telefon: '+90 534 333 4455',
    tckn: '11223344556',
    kan_grubu: 'B Rh+',
    eposta: 'mehmet.kaya@demo.arf',
    davet_kabul_edildi: true,
    durum: 'bos_ta',
    istihdam: 'esnaf',
    zimmetli_arac_id: 'veh-003',
    zimmetli_arac_plaka: '34 GHI 789',
    vardiya_baslangic: '08:00',
    vardiya_bitis: '17:00',
    aktif_rota_id: null,
    aktif_rota_durak_sayisi: null,
    aktif_rota_siparis_sayisi: null,
    yetenekler: ['motosiklet'],
    evrak_uyarilari: [{ kind: 'saglik', label: 'Sağlık raporu', daysRemaining: -2 }],
    ehliyet_bitis: '2027-02-20',
    src_bitis: '2026-10-01',
    saglik_bitis: '2026-08-01',
    evraklar: [],
    olusturan: 'Sistem',
    olusturulma_zamani: '18.04.2026 14:00',
  },
  {
    id: 'c4',
    ad_soyad: 'Zeynep Arslan',
    telefon: '+90 535 444 5566',
    tckn: '22334455667',
    kan_grubu: 'AB Rh-',
    eposta: null,
    davet_kabul_edildi: true,
    durum: 'yolda',
    istihdam: 'esnaf',
    zimmetli_arac_id: 'veh-006',
    zimmetli_arac_plaka: '34 PQR 678',
    vardiya_baslangic: '10:00',
    vardiya_bitis: '20:00',
    aktif_rota_id: '4118',
    aktif_rota_durak_sayisi: 7,
    aktif_rota_siparis_sayisi: 5,
    yetenekler: ['hizli_teslimat', 'motosiklet'],
    evrak_uyarilari: [],
    ehliyet_bitis: '2030-01-01',
    src_bitis: '2028-03-03',
    saglik_bitis: '2027-05-05',
    evraklar: [],
    olusturan: 'Operasyon',
    olusturulma_zamani: '22.05.2026 09:10',
  },
  {
    id: 'c5',
    ad_soyad: 'Can Öztürk',
    telefon: '+90 536 555 6677',
    tckn: null,
    kan_grubu: 'A Rh-',
    eposta: 'can.ozturk@demo.arf',
    davet_kabul_edildi: false,
    durum: 'bos_ta',
    istihdam: 'esnaf',
    zimmetli_arac_id: null,
    zimmetli_arac_plaka: null,
    vardiya_baslangic: '08:00',
    vardiya_bitis: '16:00',
    aktif_rota_id: null,
    aktif_rota_durak_sayisi: null,
    aktif_rota_siparis_sayisi: null,
    yetenekler: ['panelvan'],
    evrak_uyarilari: [{ kind: 'ehliyet', label: 'Ehliyet', daysRemaining: 9 }],
    ehliyet_bitis: '2026-08-17',
    src_bitis: null,
    saglik_bitis: null,
    evraklar: [],
    olusturan: 'Sistem',
    olusturulma_zamani: now,
  },
]

export function getCourierDetailMock(id: string): LastmileCourier | null {
  return mockCourierList.find((c) => c.id === id) ?? null
}

export function getCourierListKpiMock(rows: LastmileCourier[] = mockCourierList): CourierListKpi {
  return {
    total: rows.length,
    onRoad: rows.filter((c) => c.durum === 'yolda').length,
    idle: rows.filter((c) => c.durum === 'bos_ta').length,
    passive: rows.filter((c) => c.durum === 'pasif').length,
    unassigned: rows.filter((c) => !c.zimmetli_arac_id).length,
    docWarnings: rows.reduce((sum, c) => sum + c.evrak_uyarilari.length, 0),
  }
}

export function getCourierAssignmentsMock(courierId: string): CourierVehicleAssignment[] {
  const courier = getCourierDetailMock(courierId)
  if (!courier?.zimmetli_arac_id) return []
  return [
    {
      id: `asg-${courierId}-1`,
      vehicleId: courier.zimmetli_arac_id,
      vehiclePlate: courier.zimmetli_arac_plaka ?? '—',
      startedAt: '2026-03-01T08:00:00.000Z',
      endedAt: null,
      note: 'Demo zimmet',
    },
  ]
}

export function getCourierActivityMock(courierId: string): CourierActivityEvent[] {
  const courier = getCourierDetailMock(courierId)
  if (!courier) return []
  return [
    {
      id: `act-${courierId}-1`,
      kind: 'status_change',
      title: 'Vardiya başladı',
      detail: courier.aktif_rota_id ? `Rota #${courier.aktif_rota_id}` : undefined,
      at: '2026-08-07T08:12:00.000Z',
      actor: 'Sistem',
    },
    {
      id: `act-${courierId}-2`,
      kind: 'updated',
      title: 'Teslimat tamamlandı',
      detail: 'Demo POD',
      at: '2026-08-06T16:40:00.000Z',
      actor: courier.ad_soyad,
    },
  ]
}
