import type {
  CancelRequest,
  DeliveryDeferral,
  OrderOpsOverlay,
  ReturnSuborderLink,
} from '../_types/order-ops'
import type { LastmileOrder } from '../_types/order'

const now = '2026-08-07T10:00:00.000Z'

export function buildSeedCancelRequests(): CancelRequest[] {
  return [
    {
      id: 'cr_1',
      orderId: 'lm-1007',
      orderTakipNo: 'ARF-9927',
      customerName: 'Trendyol Express',
      reasonCode: 'r-5',
      reasonLabel: 'Müşteri iptal etti',
      note: 'Müşteri çağrı merkezinden iletti',
      status: 'pending',
      requestedBy: 'Operasyon',
      requestedAt: now,
    },
  ]
}

export function buildSeedReturns(): ReturnSuborderLink[] {
  return [
    {
      id: 'ret_1',
      parentOrderId: 'lm-1009',
      returnOrderId: 'lm-ret-1009',
      returnTakipNo: 'ARF-RET-1009',
      returnFee: 57,
      returnFeePercent: 50,
      packageIds: [],
      reasonLabel: 'Müşteri iade talebi',
      createdAt: now,
      createdBy: 'sistem',
    },
  ]
}

export function buildSeedDeferrals(): DeliveryDeferral[] {
  return [
    {
      id: 'def_1',
      orderId: 'lm-1002',
      reasonCode: 'r-1',
      reasonLabel: 'Müşteri adreste bulunamadı',
      note: 'Kapı kodu yanlış; yarın tekrar',
      deferredToDate: '2026-08-08',
      attemptNo: 1,
      createdAt: now,
      createdBy: 'Ali Veli',
    },
  ]
}

export function buildSeedOverlay(): OrderOpsOverlay {
  return {
    statusByOrderId: {},
    metaByOrderId: {
      'lm-ret-1009': {
        parent_order_id: 'lm-1009',
      },
    },
  }
}

/** Demo iade alt-siparişi — listeye eklenir */
export function buildSeedReturnOrder(): LastmileOrder {
  return {
    id: 'lm-ret-1009',
    takip_no: 'ARF-RET-1009',
    referans_no: 'RET-LM-1009',
    siparis_tipi: 'iade',
    durum: 'atama_bekliyor',
    durum_etiketi: 'Atama Bekliyor',
    rota_atandi: false,
    rota_kodu: null,
    zaman_penceresi: 'Alım: 08.08.2026 - 09:00 - 12:00 · Teslim: 08.08.2026 - 14:00 - 18:00',
    alim_zaman_penceresi: '08.08.2026 - 09:00 - 12:00',
    teslim_zaman_penceresi: '08.08.2026 - 14:00 - 18:00',
    eta: '—',
    eta_kalan_dk: null,
    eta_alim_yapildi: false,
    gorev_suresi_dk: 5,
    oncelik_puani: 70,
    gereksinimler: [],
    musteri: 'ABC E-Ticaret',
    musteri_id: 'c-bnf',
    alis_noktasi: 'Ev',
    alis_acik_adres: 'Sinanpaşa Mh. Beşiktaş Cd. No:8',
    alis_muhatabi: 'Ayşe Demir',
    alis_telefon: '+90 555 123 4433',
    varis_noktasi: 'A101 Merkez Depo',
    varis_acik_adres: 'Caferağa Mh. Moda Cd. No:12, Kadıköy',
    varis_muhatabi: 'Ahmet Yılmaz',
    varis_telefon: '+90 532 234 2211',
    mesafe_m: 2400,
    hacim_sinifi: 'M',
    paket_sayisi: 1,
    toplam_hacim: 0.048,
    agirlik_kg: 4.5,
    giden_paket: null,
    donen_paket: 1,
    rota_tipi: 'Ekspres Rota',
    atanan_arac: null,
    atanan_kurye: null,
    etiketler: ['İade'],
    olusturulma_zamani: '07.08.2026 11:00',
    olusturan: 'Sistem',
    bolge: 'Kadıköy',
  }
}
