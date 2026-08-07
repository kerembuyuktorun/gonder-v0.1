import type { GelirKalemi, GiderKalemi } from "../../../transport/[tasimaNo]/_types/transport-detail"

export type CustomerType = 'corporate' | 'individual'
export type CustomerStatus = 'active' | 'passive'
export type ShipmentStatus = 'hazirlaniyor' | 'transferde' | 'dagitimda' | 'teslim_edildi' | 'devredildi' | 'iptal'
export type FinancialMovementType = 'fatura' | 'tahsilat' | 'odeme' | 'iade'
export type ContractStatus = 'active' | 'expired' | 'draft'
export type TransportDurum = 'planlanmis' | 'yukleniyor' | 'yolda' | 'teslim_edildi' | 'iptal'

export interface CustomerAddressRecord {
  id: string
  label: string
  line1: string
  city: string
  district: string
  neighborhood: string
  phone: string
  contactName: string
  branch: string
  isDefault?: boolean
}

export interface CustomerShipmentRecord {
  id: string
  trackingNo: string
  date: string
  route: string
  status: ShipmentStatus
  senderCustomerId?: string
  receiverCustomerId?: string
  pieceCount: number
  amount: number
  // Extended – kargo listesiyle eşleşen alanlar
  senderCustomer?: string
  senderBranch?: string
  receiverBranch?: string
  receiverCustomer?: string
  receiverPhone?: string
  paymentType?: string
  invoiceType?: string
  baseAmount?: number
  vat?: number
  volumetricWeight?: number
  pieceList?: string
  dispatchNo?: string
  atfNo?: string
  arrivalAt?: string
  deliveryAt?: string
  lastActionAt?: string
  pieceStatus?: string
  invoiceStatus?: 'kesildi' | 'kesilmedi'
  collectionStatus?: 'tahsil_edildi' | 'beklemede' | 'iptal' | 'musteri_tahsil_edildi' | 'gm_gonderildi'
  createdBy?: string
}

export interface CustomerFinancialMovementRecord {
  id: string
  date: string
  type: FinancialMovementType
  documentNo: string
  description: string
  debit: number
  credit: number
  balance: number
  status: 'on_time' | 'delayed' | 'closed'
}

export interface CustomerContractRecord {
  id: string
  contractNo: string
  documentNo?: string
  type: 'standart' | 'kurumsal' | 'ozel_fiyat'
  startDate: string
  endDate: string
  pricingModel: string
  status: ContractStatus
  note?: string
  attachmentName?: string
}

export interface CustomerTransportYukSatir {
  yukTipi: string
  adet: number
  agirlik: number
}

export interface CustomerTransportRecord {
  id: string
  tasimaNo: string
  yuklemeTarihi: string
  gonderiTipi: 'FTL' | 'LTL'
  gondericiMusteri: string
  aliciMusteri: string
  cikisAdres: string
  varisAdres: string
  tasimaciFirma: string
  aracPlaka: string
  surucu: string
  yukler: CustomerTransportYukSatir[]
  yukTipleri: string
  toplamAdet: number
  toplamAgirlik: number
  toplamHacim: number
  toplamDesi: number
  alisFiyat: number
  satisFiyat: number
  kar: number
  durum: TransportDurum
  olusturmaTarihi: string
  olusturan: string
  giderKalemleriSayisi: number
  giderEslesmemisSayisi: number
  gelirler: GelirKalemi[]
  giderler: GiderKalemi[]
}

export interface CustomerDetailRecord {
  id: string
  customerType: CustomerType
  status: CustomerStatus
  tradeName: string
  customerName: string
  taxNumber: string
  taxOffice: string
  tcIdentityNumber?: string
  firstName: string
  lastName: string
  email: string
  contactName: string
  phone: string
  city: string
  district: string
  neighborhood: string
  branch: string
  createdAt: string
  lastShipmentAt?: string
  tags?: string[]
  addresses: CustomerAddressRecord[]
  shipments: CustomerShipmentRecord[]
  transports: CustomerTransportRecord[]
  financialMovements: CustomerFinancialMovementRecord[]
  contracts: CustomerContractRecord[]
}

export const customerDetails: CustomerDetailRecord[] = [
  {
    id: 'cust-ahmet-karan',
    customerType: 'corporate',
    status: 'active',
    tradeName: 'AHMET KARAN',
    customerName: 'AHMET KARAN',
    taxNumber: '11111111111',
    taxOffice: 'Seyhan Vergi Dairesi',
    firstName: 'Ahmet',
    lastName: 'Karan',
    email: 'ahmet@karan.com.tr',
    contactName: 'Ahmet Karan',
    phone: '0538 691 55 11',
    city: 'Adana',
    district: 'Seyhan',
    neighborhood: 'Alidede',
    branch: 'Adana Şube',
    createdAt: '2025-11-02 09:20',
    lastShipmentAt: '2026-03-15 14:10',
    tags: ['VIP', 'Tahsilat Düzenli'],
    addresses: [
      {
        id: 'addr-ahmet-merkez',
        label: 'Gönderici Merkez Adres',
        line1: 'Alidede Mah. 1185 Sok. No:12 Seyhan/Adana',
        city: 'Adana',
        district: 'Seyhan',
        neighborhood: 'Alidede',
        phone: '0538 691 55 11',
        contactName: 'Ahmet Karan',
        branch: 'Adana Şube',
        isDefault: true,
      },
      {
        id: 'addr-ahmet-depo',
        label: 'Merkez Depo',
        line1: 'Yeşiloba Mah. 1206 Sok. No:3 Seyhan/Adana',
        city: 'Adana',
        district: 'Seyhan',
        neighborhood: 'Yeşiloba',
        phone: '0538 691 55 11',
        contactName: 'Ahmet Karan',
        branch: 'Adana Şube',
      },
    ],
    shipments: [
      {
        id: '100021',
        trackingNo: 'ARF-100021',
        date: '2026-03-15 14:10',
        route: 'Adana -> Ankara',
        status: 'dagitimda',
        pieceCount: 4,
        amount: 2480,
        senderCustomerId: 'cust-ahmet-karan',
        senderCustomer: 'AHMET KARAN',
        senderBranch: 'Adana Şube',
        receiverBranch: 'Ankara Şube',
        receiverCustomer: 'Ankara Merkez Ltd.',
        receiverPhone: '0312 441 22 11',
        paymentType: 'Gönderici Ödemeli',
        invoiceType: 'Gönderici',
        baseAmount: 2066.67,
        vat: 413.33,
        volumetricWeight: 12,
        pieceList: 'Koli',
        dispatchNo: 'IRS-2026-02145',
        atfNo: '',
        arrivalAt: '',
        deliveryAt: '',
        lastActionAt: '2026-03-15 14:10',
        invoiceStatus: 'kesildi',
        collectionStatus: 'beklemede',
        createdBy: 'Mehmet Şahin',
      },
      {
        id: '100019',
        trackingNo: 'ARF-100019',
        date: '2026-03-13 10:42',
        route: 'Adana -> İzmir',
        status: 'teslim_edildi',
        pieceCount: 2,
        amount: 1640,
        senderCustomerId: 'cust-ahmet-karan',
        senderCustomer: 'AHMET KARAN',
        senderBranch: 'Adana Şube',
        receiverBranch: 'İzmir Şube',
        receiverCustomer: 'İzmir Dağıtım A.Ş.',
        receiverPhone: '0232 333 55 66',
        paymentType: 'Gönderici Ödemeli',
        invoiceType: 'Gönderici',
        baseAmount: 1366.67,
        vat: 273.33,
        volumetricWeight: 6,
        pieceList: 'Koli',
        dispatchNo: 'IRS-2026-02033',
        atfNo: '',
        arrivalAt: '2026-03-14 08:30',
        deliveryAt: '2026-03-14 15:45',
        lastActionAt: '2026-03-14 15:45',
        invoiceStatus: 'kesildi',
        collectionStatus: 'tahsil_edildi',
        createdBy: 'Ayşe Demir',
      },
      {
        id: 'shipment-100012',
        trackingNo: 'ARF-100012',
        date: '2026-03-08 16:25',
        route: 'Adana -> İstanbul',
        status: 'teslim_edildi',
        pieceCount: 6,
        amount: 3350,
        senderCustomerId: 'cust-ahmet-karan',
        senderCustomer: 'AHMET KARAN',
        senderBranch: 'Adana Şube',
        receiverBranch: 'İstanbul Şube',
        receiverCustomer: 'İstanbul Lojistik Ltd.',
        receiverPhone: '0212 555 78 90',
        paymentType: 'Gönderici Ödemeli',
        invoiceType: 'Gönderici',
        baseAmount: 2791.67,
        vat: 558.33,
        volumetricWeight: 18,
        pieceList: 'Koli / Palet',
        dispatchNo: 'IRS-2026-01812',
        atfNo: 'ATF-2026-00211',
        arrivalAt: '2026-03-10 09:15',
        deliveryAt: '2026-03-10 16:30',
        lastActionAt: '2026-03-10 16:30',
        invoiceStatus: 'kesildi',
        collectionStatus: 'tahsil_edildi',
        createdBy: 'Mehmet Şahin',
      },
    ],
    transports: [
      {
        id: 'trn-ahmet-1',
        tasimaNo: 'TSM-20000001',
        yuklemeTarihi: '2025-01-15 08:00',
        gonderiTipi: 'FTL',
        gondericiMusteri: 'AHMET KARAN',
        aliciMusteri: 'DELTA TİCARET LTD.',
        cikisAdres: 'Adana / Seyhan',
        varisAdres: 'Kocaeli / Gebze',
        tasimaciFirma: 'DELTA TEDARİK',
        aracPlaka: '34 ABC 123',
        surucu: 'Ahmet Yılmaz',
        yukler: [{ yukTipi: 'Palet', adet: 12, agirlik: 8400 }],
        yukTipleri: 'Palet',
        toplamAdet: 12,
        toplamAgirlik: 8400,
        toplamHacim: 28.8,
        toplamDesi: 4800,
        alisFiyat: 35000,
        satisFiyat: 42000,
        kar: 7000,
        durum: 'teslim_edildi',
        olusturmaTarihi: '2025-01-14 10:00',
        olusturan: 'Mehmet Şahin',
        giderKalemleriSayisi: 1,
        giderEslesmemisSayisi: 0,
        gelirler: [
          { id: 'g-ahmet-1-1', aciklama: 'Taşıma Ücreti (Satış)', musteri: 'AHMET KARAN', tarih: '15.01.2025', birimFiyat: 42000, tevkifat: '2/10', tevfikatTutar: 1680, kdvOran: 20, kdvTutar: 8400, toplamTutar: 48720, faturaDurumu: 'olusturuldu', tahsilatDurumu: 'tahsil_edildi' },
        ],
        giderler: [
          { id: 'gd-ahmet-1-1', aciklama: 'Nakliye Bedeli', tedarikci: 'HIZLI NAKLİYAT A.Ş.', tarih: '15.01.2025', birimFiyat: 35000, tevkifat: 'yok', tevfikatTutar: 0, kdvOran: 20, kdvTutar: 7000, toplamTutar: 42000, faturaDurumu: 'eslestirildi', odemeDurumu: 'tahsil_edildi' },
        ],
      },
      {
        id: 'trn-ahmet-2',
        tasimaNo: 'TSM-20000003',
        yuklemeTarihi: '2025-01-20 07:00',
        gonderiTipi: 'FTL',
        gondericiMusteri: 'DELTA TİCARET LTD.',
        aliciMusteri: 'AHMET KARAN',
        cikisAdres: 'Kocaeli / Gebze',
        varisAdres: 'Adana / Seyhan',
        tasimaciFirma: 'STAR TAŞIMACILIK',
        aracPlaka: '35 MNO 345',
        surucu: 'Emre Koç',
        yukler: [{ yukTipi: 'Koli', adet: 20, agirlik: 3200 }],
        yukTipleri: 'Koli',
        toplamAdet: 20,
        toplamAgirlik: 3200,
        toplamHacim: 12.0,
        toplamDesi: 2400,
        alisFiyat: 40000,
        satisFiyat: 48000,
        kar: 8000,
        durum: 'yukleniyor',
        olusturmaTarihi: '2025-01-19 09:30',
        olusturan: 'Mehmet Şahin',
        giderKalemleriSayisi: 2,
        giderEslesmemisSayisi: 2,
        gelirler: [
          { id: 'g-ahmet-2-1', aciklama: 'Taşıma Ücreti (Satış)', musteri: 'DELTA TİCARET LTD.', tarih: '20.01.2025', birimFiyat: 48000, tevkifat: '2/10', tevfikatTutar: 1920, kdvOran: 20, kdvTutar: 9600, toplamTutar: 55680, faturaDurumu: 'olusturulmadi', tahsilatDurumu: 'bekliyor' },
          { id: 'g-ahmet-2-2', aciklama: 'Köprü Geçiş Ücreti', musteri: 'DELTA TİCARET LTD.', tarih: '20.01.2025', birimFiyat: 2500, tevkifat: 'yok', tevfikatTutar: 0, kdvOran: 20, kdvTutar: 500, toplamTutar: 3000, faturaDurumu: 'olusturulmadi', tahsilatDurumu: 'bekliyor' },
        ],
        giderler: [
          { id: 'gd-ahmet-2-1', aciklama: 'Nakliye Bedeli', tedarikci: 'STAR TAŞIMACILIK', tarih: '20.01.2025', birimFiyat: 40000, tevkifat: '2/10', tevfikatTutar: 1600, kdvOran: 20, kdvTutar: 8000, toplamTutar: 46400, faturaDurumu: 'eslestirilmedi', odemeDurumu: 'bekliyor' },
          { id: 'gd-ahmet-2-2', aciklama: 'Köprü Geçiş Bedeli', tedarikci: 'STAR TAŞIMACILIK', tarih: '20.01.2025', birimFiyat: 2000, tevkifat: 'yok', tevfikatTutar: 0, kdvOran: 20, kdvTutar: 400, toplamTutar: 2400, faturaDurumu: 'eslestirilmedi', odemeDurumu: 'bekliyor' },
        ],
      },
    ],
    financialMovements: [
      {
        id: 'fin-ahmet-1',
        date: '2026-03-16',
        type: 'tahsilat',
        documentNo: 'THS-2026-00841',
        description: 'Kısmi tahsilat',
        debit: 0,
        credit: 1500,
        balance: 980,
        status: 'on_time',
      },
      {
        id: 'fin-ahmet-3',
        date: '2026-03-17',
        type: 'fatura',
        documentNo: 'FTR-2026-01599',
        description: 'Ek teslimat faturası',
        debit: 930,
        credit: 0,
        balance: 1910,
        status: 'delayed',
      },
    ],
    contracts: [
      {
        id: 'ctr-ahmet-1',
        contractNo: 'CTR-2026-0007',
        documentNo: 'BLG-2026-0412',
        type: 'kurumsal',
        startDate: '2026-01-01',
        endDate: '2026-12-31 23:59',
        pricingModel: 'Bölgesel desi + kg hibrit',
        status: 'active',
        note: 'Ankara ve İzmir hatlarında özel indirim uygulanır.',
        attachmentName: 'ahmet-karan-sozlesme-2026.pdf',
      },
    ],
  },
  {
    id: 'cust-toprak',
    customerType: 'corporate',
    status: 'active',
    tradeName: 'TPRK SU PLASTİK ',
    customerName: 'TPRK SU PLASTİK ',
    taxNumber: '12345678901',
    taxOffice: 'Onikişubat Vergi Dairesi',
    firstName: 'Mehmet',
    lastName: 'Toprak',
    email: 'operasyon@tprksu.com',
    contactName: 'Mehmet Toprak',
    phone: '0532 456 78 90',
    city: 'Kahramanmaraş',
    district: 'Onikişubat',
    neighborhood: 'Afşar',
    branch: 'Kahramanmaraş Şube',
    createdAt: '2025-08-11 13:12',
    lastShipmentAt: '2026-03-14 09:18',
    tags: ['Kurumsal'],
    addresses: [
      {
        id: 'addr-toprak-fabrika',
        label: 'Alıcı Fabrika Adres',
        line1: 'Afşar Mah. 4032 Sok. No:18 Onikişubat/Kahramanmaraş',
        city: 'Kahramanmaraş',
        district: 'Onikişubat',
        neighborhood: 'Afşar',
        phone: '0532 456 78 90',
        contactName: 'Mehmet Toprak',
        branch: 'Kahramanmaraş Şube',
        isDefault: true,
      },
    ],
    shipments: [
      {
        id: 'shipment-100033',
        trackingNo: 'ARF-100033',
        date: '2026-03-14 09:18',
        route: 'Kahramanmaraş -> Adana',
        status: 'hazirlaniyor',
        pieceCount: 3,
        amount: 1210,
        senderCustomerId: 'cust-toprak',
        senderCustomer: 'TPRK SU PLASTİK',
        senderBranch: 'Kahramanmaraş Şube',
        receiverBranch: 'Adana Şube',
        receiverCustomer: 'Adana Toptan Ltd.',
        receiverPhone: '0322 412 33 10',
        paymentType: 'Gönderici Ödemeli',
        invoiceType: 'Gönderici',
        baseAmount: 1008.33,
        vat: 201.67,
        volumetricWeight: 9,
        pieceList: 'Koli',
        dispatchNo: 'IRS-2026-02288',
        atfNo: '',
        arrivalAt: '',
        deliveryAt: '',
        lastActionAt: '2026-03-14 09:18',
        invoiceStatus: 'kesilmedi',
        collectionStatus: 'beklemede',
        createdBy: 'Ali Kaya',
      },
      {
        id: 'shipment-100020',
        trackingNo: 'ARF-100020',
        date: '2026-03-12 18:05',
        route: 'Kahramanmaraş -> Mersin',
        status: 'transferde',
        pieceCount: 5,
        amount: 2175,
        senderCustomerId: 'cust-toprak',
        senderCustomer: 'TPRK SU PLASTİK',
        senderBranch: 'Kahramanmaraş Şube',
        receiverBranch: 'Mersin Şube',
        receiverCustomer: 'Mersin Gıda A.Ş.',
        receiverPhone: '0324 361 88 44',
        paymentType: 'Gönderici Ödemeli',
        invoiceType: 'Gönderici',
        baseAmount: 1812.50,
        vat: 362.50,
        volumetricWeight: 15,
        pieceList: 'Koli / Çuval',
        dispatchNo: 'IRS-2026-02067',
        atfNo: '',
        arrivalAt: '',
        deliveryAt: '',
        lastActionAt: '2026-03-12 18:05',
        invoiceStatus: 'kesildi',
        collectionStatus: 'beklemede',
        createdBy: 'Ali Kaya',
      },
    ],
    transports: [],
    financialMovements: [
      {
        id: 'fin-toprak-1',
        date: '2026-03-12',
        type: 'fatura',
        documentNo: 'FTR-2026-01492',
        description: 'Haftalık sevkiyat faturası',
        debit: 2175,
        credit: 0,
        balance: 2175,
        status: 'on_time',
      },
      {
        id: 'fin-toprak-2',
        date: '2026-03-13',
        type: 'tahsilat',
        documentNo: 'THS-2026-00803',
        description: 'Banka transferi',
        debit: 0,
        credit: 2175,
        balance: 0,
        status: 'closed',
      },
    ],
    contracts: [
      {
        id: 'ctr-toprak-1',
        contractNo: 'CTR-2025-0124',
        documentNo: 'BLG-2025-1881',
        type: 'ozel_fiyat',
        startDate: '2025-10-01',
        endDate: '2026-09-30 23:59',
        pricingModel: 'Hat bazlı sabit fiyat',
        status: 'active',
        note: 'Mersin hattında sabit fiyat uygulanır.',
      },
    ],
  },
  {
    id: 'cust-arf-tekstil',
    customerType: 'individual',
    status: 'passive',
    tradeName: 'ARF TEKSTİL SANAYİ',
    customerName: 'Zeynep Öztürk',
    taxNumber: '98765432109',
    taxOffice: '',
    tcIdentityNumber: '38472910562',
    firstName: 'Zeynep',
    lastName: 'Öztürk',
    email: 'zeynep.ozturk@example.com',
    contactName: 'Zeynep Öztürk',
    phone: '0534 555 34 12',
    city: 'İzmir',
    district: 'Bornova',
    neighborhood: 'Merkez Mahallesi',
    branch: 'İzmir Şube',
    createdAt: '2024-12-21 17:40',
    lastShipmentAt: '2025-10-08 11:22',
    tags: ['Bireysel', 'Pasif'],
    addresses: [
      {
        id: 'addr-zeynep-1',
        label: 'Sevkiyat Noktası',
        line1: 'Merkez Mah. 1234 Sok. No:5 Bornova/İzmir',
        city: 'İzmir',
        district: 'Bornova',
        neighborhood: 'Merkez Mahallesi',
        phone: '0534 555 34 12',
        contactName: 'Zeynep Öztürk',
        branch: 'İzmir Şube',
        isDefault: true,
      },
    ],
    shipments: [
      {
        id: 'shipment-09012',
        trackingNo: 'ARF-09012',
        date: '2025-10-08 11:22',
        route: 'İzmir -> Bursa',
        status: 'teslim_edildi',
        pieceCount: 1,
        amount: 540,
        senderCustomerId: 'cust-arf-tekstil',
        senderCustomer: 'Zeynep Öztürk',
        senderBranch: 'İzmir Şube',
        receiverBranch: 'Bursa Şube',
        receiverCustomer: 'Bursa Tekstil Ltd.',
        receiverPhone: '0224 244 77 88',
        paymentType: 'Gönderici Ödemeli',
        invoiceType: 'Gönderici',
        baseAmount: 450,
        vat: 90,
        volumetricWeight: 3,
        pieceList: 'Koli',
        dispatchNo: 'IRS-2025-09871',
        atfNo: '',
        arrivalAt: '2025-10-09 09:45',
        deliveryAt: '2025-10-09 14:20',
        lastActionAt: '2025-10-09 14:20',
        invoiceStatus: 'kesildi',
        collectionStatus: 'tahsil_edildi',
        createdBy: 'Fatma Yıldız',
      },
    ],
    transports: [],
    financialMovements: [
      {
        id: 'fin-zeynep-1',
        date: '2025-10-08',
        type: 'fatura',
        documentNo: 'FTR-2025-10812',
        description: 'Tekil gönderi faturası',
        debit: 540,
        credit: 0,
        balance: 540,
        status: 'closed',
      },
      {
        id: 'fin-zeynep-2',
        date: '2025-10-09',
        type: 'tahsilat',
        documentNo: 'THS-2025-09331',
        description: 'Nakit tahsilat',
        debit: 0,
        credit: 540,
        balance: 0,
        status: 'closed',
      },
    ],
    contracts: [],
  },
  /* ── Senaryo 2: Kargo ✅ + Taşıma ✅ + Sözleşme ❌ ── */
  {
    id: 'cust-yildiz-gida',
    customerType: 'corporate',
    status: 'active',
    tradeName: 'YILDIZ GIDA SAN.',
    customerName: 'YILDIZ GIDA SAN.',
    taxNumber: '22334455667',
    taxOffice: 'Sincan Vergi Dairesi',
    firstName: 'Murat',
    lastName: 'Yıldız',
    email: 'operasyon@yildizgida.com',
    contactName: 'Murat Yıldız',
    phone: '0541 222 33 44',
    city: 'Ankara',
    district: 'Sincan',
    neighborhood: 'Pınarbaşı',
    branch: 'Ankara Şube',
    createdAt: '2025-06-10 11:00',
    lastShipmentAt: '2026-03-18 09:30',
    tags: ['Kurumsal'],
    addresses: [
      {
        id: 'addr-yildiz-1',
        label: 'Fabrika',
        line1: 'Pınarbaşı Mah. 3045 Sok. No:7 Sincan/Ankara',
        city: 'Ankara',
        district: 'Sincan',
        neighborhood: 'Pınarbaşı',
        phone: '0541 222 33 44',
        contactName: 'Murat Yıldız',
        branch: 'Ankara Şube',
        isDefault: true,
      },
    ],
    shipments: [
      {
        id: 'shipment-200001',
        trackingNo: 'ARF-200001',
        date: '2026-03-18 09:30',
        route: 'Ankara -> İzmir',
        status: 'dagitimda',
        pieceCount: 8,
        amount: 3100,
        senderCustomerId: 'cust-yildiz-gida',
        senderCustomer: 'YILDIZ GIDA SAN.',
        senderBranch: 'Ankara Şube',
        receiverBranch: 'İzmir Şube',
        receiverCustomer: 'MEGA DEPOLAMA A.Ş.',
        receiverPhone: '0232 444 55 66',
        paymentType: 'Gönderici Ödemeli',
        invoiceType: 'Gönderici',
        baseAmount: 2583.33,
        vat: 516.67,
        volumetricWeight: 24,
        pieceList: 'Koli',
        dispatchNo: 'IRS-2026-03001',
        atfNo: '',
        arrivalAt: '',
        deliveryAt: '',
        lastActionAt: '2026-03-18 09:30',
        invoiceStatus: 'kesilmedi',
        collectionStatus: 'beklemede',
        createdBy: 'Ali Kaya',
      },
    ],
    transports: [
      {
        id: 'trn-yildiz-1',
        tasimaNo: 'TSM-20000002',
        yuklemeTarihi: '2025-01-18 09:30',
        gonderiTipi: 'LTL',
        gondericiMusteri: 'YILDIZ GIDA SAN.',
        aliciMusteri: 'MEGA DEPOLAMA A.Ş.',
        cikisAdres: 'Ankara / Sincan',
        varisAdres: 'İzmir / Kemalpaşa',
        tasimaciFirma: 'MARS LOJİSTİK',
        aracPlaka: '06 GHI 789',
        surucu: 'Ali Kaya',
        yukler: [{ yukTipi: 'Palet', adet: 8, agirlik: 5600 }],
        yukTipleri: 'Palet',
        toplamAdet: 8,
        toplamAgirlik: 5600,
        toplamHacim: 19.2,
        toplamDesi: 3200,
        alisFiyat: 12000,
        satisFiyat: 15500,
        kar: 3500,
        durum: 'yolda',
        olusturmaTarihi: '2025-01-17 14:00',
        olusturan: 'Ali Kaya',
        giderKalemleriSayisi: 1,
        giderEslesmemisSayisi: 0,
        gelirler: [
          { id: 'g-yildiz-1-1', aciklama: 'Taşıma Ücreti (Satış)', musteri: 'YILDIZ GIDA SAN.', tarih: '18.01.2025', birimFiyat: 15500, tevkifat: '2/10', tevfikatTutar: 620, kdvOran: 20, kdvTutar: 3100, toplamTutar: 17980, faturaDurumu: 'olusturuldu', tahsilatDurumu: 'tahsil_edildi' },
        ],
        giderler: [
          { id: 'gd-yildiz-1-1', aciklama: 'Nakliye Bedeli', tedarikci: 'MERKEZ LOJİSTİK', tarih: '18.01.2025', birimFiyat: 12000, tevkifat: 'yok', tevfikatTutar: 0, kdvOran: 20, kdvTutar: 2400, toplamTutar: 14400, faturaDurumu: 'eslestirildi', odemeDurumu: 'tahsil_edildi' },
        ],
      },
    ],
    financialMovements: [
      {
        id: 'fin-yildiz-1',
        date: '2026-03-18',
        type: 'fatura',
        documentNo: 'FTR-2026-02100',
        description: 'Sevkiyat faturası',
        debit: 3100,
        credit: 0,
        balance: 3100,
        status: 'on_time',
      },
    ],
    contracts: [],
  },
  /* ── Senaryo 5: Kargo ❌ + Taşıma ✅ + Sözleşme ❌ ── */
  {
    id: 'cust-delta-ticaret',
    customerType: 'corporate',
    status: 'active',
    tradeName: 'DELTA TİCARET LTD.',
    customerName: 'DELTA TİCARET LTD.',
    taxNumber: '55667788990',
    taxOffice: 'Gebze Vergi Dairesi',
    firstName: 'Hakan',
    lastName: 'Demir',
    email: 'hakan@deltaticaret.com',
    contactName: 'Hakan Demir',
    phone: '0533 666 77 88',
    city: 'Kocaeli',
    district: 'Gebze',
    neighborhood: 'Güzeller',
    branch: 'Kocaeli Şube',
    createdAt: '2025-03-15 14:00',
    lastShipmentAt: undefined,
    tags: ['Sadece Taşıma'],
    addresses: [
      {
        id: 'addr-delta-1',
        label: 'Merkez Depo',
        line1: 'Güzeller Mah. 2150 Sok. No:22 Gebze/Kocaeli',
        city: 'Kocaeli',
        district: 'Gebze',
        neighborhood: 'Güzeller',
        phone: '0533 666 77 88',
        contactName: 'Hakan Demir',
        branch: 'Kocaeli Şube',
        isDefault: true,
      },
    ],
    shipments: [],
    transports: [
      {
        id: 'trn-delta-1',
        tasimaNo: 'TSM-20000001',
        yuklemeTarihi: '2025-01-15 08:00',
        gonderiTipi: 'FTL',
        gondericiMusteri: 'AHMET KARAN',
        aliciMusteri: 'DELTA TİCARET LTD.',
        cikisAdres: 'Adana / Seyhan',
        varisAdres: 'Kocaeli / Gebze',
        tasimaciFirma: 'DELTA TEDARİK',
        aracPlaka: '34 ABC 123',
        surucu: 'Ahmet Yılmaz',
        yukler: [{ yukTipi: 'Palet', adet: 12, agirlik: 8400 }],
        yukTipleri: 'Palet',
        toplamAdet: 12,
        toplamAgirlik: 8400,
        toplamHacim: 28.8,
        toplamDesi: 4800,
        alisFiyat: 35000,
        satisFiyat: 42000,
        kar: 7000,
        durum: 'teslim_edildi',
        olusturmaTarihi: '2025-01-14 10:00',
        olusturan: 'Mehmet Şahin',
        giderKalemleriSayisi: 1,
        giderEslesmemisSayisi: 0,
        gelirler: [
          { id: 'g-delta-1-1', aciklama: 'Taşıma Ücreti (Satış)', musteri: 'AHMET KARAN', tarih: '15.01.2025', birimFiyat: 42000, tevkifat: '2/10', tevfikatTutar: 1680, kdvOran: 20, kdvTutar: 8400, toplamTutar: 48720, faturaDurumu: 'olusturuldu', tahsilatDurumu: 'tahsil_edildi' },
        ],
        giderler: [
          { id: 'gd-delta-1-1', aciklama: 'Nakliye Bedeli', tedarikci: 'HIZLI NAKLİYAT A.Ş.', tarih: '15.01.2025', birimFiyat: 35000, tevkifat: 'yok', tevfikatTutar: 0, kdvOran: 20, kdvTutar: 7000, toplamTutar: 42000, faturaDurumu: 'eslestirildi', odemeDurumu: 'tahsil_edildi' },
        ],
      },
      {
        id: 'trn-delta-2',
        tasimaNo: 'TSM-20000003',
        yuklemeTarihi: '2025-01-20 07:00',
        gonderiTipi: 'FTL',
        gondericiMusteri: 'DELTA TİCARET LTD.',
        aliciMusteri: 'AHMET KARAN',
        cikisAdres: 'Kocaeli / Gebze',
        varisAdres: 'Adana / Seyhan',
        tasimaciFirma: 'STAR TAŞIMACILIK',
        aracPlaka: '35 MNO 345',
        surucu: 'Emre Koç',
        yukler: [{ yukTipi: 'Koli', adet: 20, agirlik: 3200 }],
        yukTipleri: 'Koli',
        toplamAdet: 20,
        toplamAgirlik: 3200,
        toplamHacim: 12.0,
        toplamDesi: 2400,
        alisFiyat: 40000,
        satisFiyat: 48000,
        kar: 8000,
        durum: 'yukleniyor',
        olusturmaTarihi: '2025-01-19 09:30',
        olusturan: 'Mehmet Şahin',
        giderKalemleriSayisi: 2,
        giderEslesmemisSayisi: 1,
        gelirler: [
          { id: 'g-delta-2-1', aciklama: 'Taşıma Ücreti (Satış)', musteri: 'DELTA TİCARET LTD.', tarih: '20.01.2025', birimFiyat: 48000, tevkifat: '2/10', tevfikatTutar: 1920, kdvOran: 20, kdvTutar: 9600, toplamTutar: 55680, faturaDurumu: 'olusturulmadi', tahsilatDurumu: 'bekliyor' },
          { id: 'g-delta-2-2', aciklama: 'Köprü Geçiş Ücreti', musteri: 'DELTA TİCARET LTD.', tarih: '20.01.2025', birimFiyat: 2500, tevkifat: 'yok', tevfikatTutar: 0, kdvOran: 20, kdvTutar: 500, toplamTutar: 3000, faturaDurumu: 'olusturulmadi', tahsilatDurumu: 'bekliyor' },
        ],
        giderler: [
          { id: 'gd-delta-2-1', aciklama: 'Nakliye Bedeli', tedarikci: 'STAR TAŞIMACILIK', tarih: '20.01.2025', birimFiyat: 40000, tevkifat: '2/10', tevfikatTutar: 1600, kdvOran: 20, kdvTutar: 8000, toplamTutar: 46400, faturaDurumu: 'eslestirilmedi', odemeDurumu: 'bekliyor' },
          { id: 'gd-delta-2-2', aciklama: 'Köprü Geçiş Bedeli', tedarikci: 'STAR TAŞIMACILIK', tarih: '20.01.2025', birimFiyat: 2000, tevkifat: 'yok', tevfikatTutar: 0, kdvOran: 20, kdvTutar: 400, toplamTutar: 2400, faturaDurumu: 'eslestirildi', odemeDurumu: 'bekliyor' },
        ],
      },
    ],
    financialMovements: [
      {
        id: 'fin-delta-1',
        date: '2025-01-20',
        type: 'fatura',
        documentNo: 'FTR-2025-00321',
        description: 'Taşıma faturası',
        debit: 48000,
        credit: 0,
        balance: 48000,
        status: 'on_time',
      },
    ],
    contracts: [],
  },
  /* ── Senaryo 6: Kargo ❌ + Taşıma ❌ + Sözleşme ❌ + Fatura ❌ → Finansal kapalı ── */
  {
    id: 'cust-elif-sahin',
    customerType: 'individual' as const,
    status: 'active' as const,
    tradeName: '',
    customerName: 'Elif Şahin',
    taxNumber: '',
    taxOffice: '',
    tcIdentityNumber: '15927384061',
    firstName: 'Elif',
    lastName: 'Şahin',
    email: 'elif.sahin@example.com',
    contactName: 'Elif Şahin',
    phone: '0541 888 12 34',
    city: 'Eskişehir',
    district: 'Odunpazarı',
    neighborhood: 'Büyükdere Mahallesi',
    branch: 'Eskişehir Şube',
    createdAt: '2026-04-10 09:15',
    lastShipmentAt: '',
    tags: ['Bireysel', 'Aktif'],
    addresses: [
      {
        id: 'addr-elif-1',
        label: 'Ev Adresi',
        line1: 'Büyükdere Mah. Atatürk Blv. No:42 Odunpazarı/Eskişehir',
        city: 'Eskişehir',
        district: 'Odunpazarı',
        neighborhood: 'Büyükdere Mahallesi',
        phone: '0541 888 12 34',
        contactName: 'Elif Şahin',
        branch: 'Eskişehir Şube',
        isDefault: true,
      },
    ],
    shipments: [],
    transports: [],
    financialMovements: [],
    contracts: [],
  },
]

export const customerListRows = customerDetails.map((customer) => ({
  id: customer.id,
  ad: customer.customerType === 'corporate' ? customer.tradeName : `${customer.firstName} ${customer.lastName}`,
  tip: customer.customerType,
  kimlik_no: customer.customerType === 'corporate' ? customer.taxNumber : customer.tcIdentityNumber || '-',
  telefon: customer.phone,
  email: customer.email,
  durum: customer.status,
  aktif_sozlesme_sayisi: customer.contracts.filter((contract) => contract.status === 'active').length,
  kayit_tarihi: customer.createdAt,
  son_kargo_tarihi: customer.lastShipmentAt || '-',
  kargo_sayisi: customer.shipments.length,
  tasima_sayisi: customer.transports.length,
  teslim_edilen_sayisi: customer.shipments.filter((shipment) => shipment.status === 'teslim_edildi').length,
  devir_edilen_sayisi: customer.shipments.filter((shipment) => shipment.status === 'devredildi').length,
  iptal_edilen_sayisi: customer.shipments.filter((shipment) => shipment.status === 'iptal').length,
}))

export type CustomerListRow = (typeof customerListRows)[number]

export const getCustomerById = (customerId: string) =>
  customerDetails.find((customer) => customer.id === customerId)
