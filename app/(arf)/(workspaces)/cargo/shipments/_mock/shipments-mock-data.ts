type PieceListStatus = "beklemede" | "transfer" | "dagitimda" | "teslim_edildi"
type PieceListType = "koli" | "palet" | "cuval"

type PieceListRow = {
  id: string
  parca_no: string
  takip_no: string
  kargo_id: string
  odeme_turu: "Gönderici Ödemeli" | "Alıcı Ödemeli"
  kargo_durumu: PieceListStatus
  parca_tipi: PieceListType
  desi: number
  agirlik: number
  toplam_fiyat: number
  olusturulma_zamani: string
  guncellenme_zamani: string
  varis_zamani: string
  teslimat_zamani: string
  teslim_alan_adi: string
  teslim_alan_telefonu: string
  teslimat_resmi_var: boolean
  teslimat_resmi_url: string
}

type PieceSeed = {
  kargoId: string
  takipNo: string
  odemeTuru: PieceListRow["odeme_turu"]
  kargoDurumu: PieceListStatus
  createdAt: string
  updatedAt: string
  arrivalAt: string
  deliveredAt: string
  recipientName: string
  recipientPhone: string
  hasProofPhoto: boolean
  specs: Array<{ type: PieceListType; count: number; desi: number; agirlik: number; fiyat: number }>
}

const toDateTimeString = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  const hours = String(value.getHours()).padStart(2, "0")
  const minutes = String(value.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const addMinutes = (base: string, minutes: number) => {
  const date = new Date(base)
  date.setMinutes(date.getMinutes() + minutes)
  return toDateTimeString(date)
}

const createPiecesFromSeed = (seed: PieceSeed): PieceListRow[] => {
  let index = 1

  return seed.specs.flatMap((spec) =>
    Array.from({ length: spec.count }, () => {
      const suffix = String(index).padStart(2, "0")
      const pieceNo = `${seed.takipNo}${suffix}`
      const currentIndex = index
      index += 1

      const delivered = seed.kargoDurumu === "teslim_edildi"

      return {
        id: `${seed.kargoId}-${suffix}`,
        parca_no: pieceNo,
        takip_no: seed.takipNo,
        kargo_id: seed.kargoId,
        odeme_turu: seed.odemeTuru,
        kargo_durumu: seed.kargoDurumu,
        parca_tipi: spec.type,
        desi: spec.desi,
        agirlik: spec.agirlik,
        toplam_fiyat: spec.fiyat,
        olusturulma_zamani: addMinutes(seed.createdAt, currentIndex * 2),
        guncellenme_zamani: addMinutes(seed.updatedAt, currentIndex),
        varis_zamani: seed.arrivalAt,
        teslimat_zamani: delivered ? addMinutes(seed.deliveredAt, currentIndex) : "",
        teslim_alan_adi: delivered ? seed.recipientName : "—",
        teslim_alan_telefonu: delivered ? seed.recipientPhone : "—",
        teslimat_resmi_var: delivered ? seed.hasProofPhoto : false,
        teslimat_resmi_url: delivered && seed.hasProofPhoto ? `/mock/piece-proof-${((currentIndex - 1) % 2) + 1}.svg` : "",
      }
    }),
  )
}

const pieceSeeds: PieceSeed[] = [
  {
    kargoId: "1",
    takipNo: "1000001",
    odemeTuru: "Gönderici Ödemeli",
    kargoDurumu: "dagitimda",
    createdAt: "2026-03-13 17:26",
    updatedAt: "2026-03-14 09:58",
    arrivalAt: "2026-03-14 09:04",
    deliveredAt: "",
    recipientName: "Ali Dalkılıç",
    recipientPhone: "0501 174 07 47",
    hasProofPhoto: false,
    specs: [
      { type: "koli", count: 3, desi: 8, agirlik: 11, fiyat: 73.5 },
      { type: "cuval", count: 1, desi: 18, agirlik: 22, fiyat: 119.4 },
      { type: "palet", count: 1, desi: 20, agirlik: 25, fiyat: 136.7 },
    ],
  },
  {
    kargoId: "2",
    takipNo: "1000002",
    odemeTuru: "Alıcı Ödemeli",
    kargoDurumu: "teslim_edildi",
    createdAt: "2026-03-12 09:10",
    updatedAt: "2026-03-13 16:20",
    arrivalAt: "2026-03-13 10:00",
    deliveredAt: "2026-03-13 16:20",
    recipientName: "Ayşe Korkmaz",
    recipientPhone: "0542 222 33 44",
    hasProofPhoto: true,
    specs: [
      { type: "koli", count: 4, desi: 5, agirlik: 4.1, fiyat: 62.4 },
    ],
  },
  {
    kargoId: "3",
    takipNo: "1000003",
    odemeTuru: "Gönderici Ödemeli",
    kargoDurumu: "transfer",
    createdAt: "2026-03-11 08:40",
    updatedAt: "2026-03-12 01:45",
    arrivalAt: "",
    deliveredAt: "",
    recipientName: "Selin Aydın",
    recipientPhone: "0501 444 55 66",
    hasProofPhoto: false,
    specs: [
      { type: "palet", count: 2, desi: 16, agirlik: 20.3, fiyat: 171.0 },
    ],
  },
  {
    kargoId: "4",
    takipNo: "1000004",
    odemeTuru: "Alıcı Ödemeli",
    kargoDurumu: "beklemede",
    createdAt: "2026-03-10 07:55",
    updatedAt: "2026-03-10 08:15",
    arrivalAt: "",
    deliveredAt: "",
    recipientName: "Burak Yıldız",
    recipientPhone: "0555 333 44 55",
    hasProofPhoto: false,
    specs: [
      { type: "koli", count: 2, desi: 4, agirlik: 3.1, fiyat: 49.9 },
    ],
  },
]

export const mockPieceListRows = pieceSeeds.flatMap(createPiecesFromSeed)

export const mockCargoList = [
  {
    id: "1",
    takip_no: "ARF-1000001",
    gonderen_musteri: "Demir Lojistik",
    gonderen_sube: "Mardin Nusaybin Şube",
    alici_sube: "Konya Meram Şube",
    alici_musteri: "Ali Dalkılıç",
    alici_telefon: "0501 174 07 47",
    odeme_turu: "Gönderici Ödemeli",
    fatura_turu: "Gönderici",
    matrah: 329.8,
    kdv: 65.96,
    toplam: 395.76,
    t_adet: 5,
    t_desi: 62,
    parca_listesi: "3 Koli + 1 Çuval + 1 Palet",
    irsaliye_no: "IRS-2026101",
    atf_no: "ATF-010001",
    olusturulma_zamani: "2026-03-13 17:26",
    varis_zamani: "2026-03-14 09:04",
    teslimat_zamani: "",
    kargo_durumu: "dagitimda",
    fatura_durumu: "kesildi",
    tahsilat_durumu: "tahsil_edildi",
    olusturan: "Operasyon-1",
  },
  {
    id: "2",
    takip_no: "ARF-1000002",
    gonderen_musteri: "Atlas Gıda",
    gonderen_sube: "İzmir Bornova Şube",
    alici_sube: "Manisa Yunusemre Şube",
    alici_musteri: "Rota Market",
    alici_telefon: "0543 120 55 44",
    odeme_turu: "Alıcı Ödemeli",
    fatura_turu: "Alıcı",
    matrah: 182.3,
    kdv: 36.46,
    toplam: 218.76,
    t_adet: 4,
    t_desi: 20,
    parca_listesi: "4 Koli",
    irsaliye_no: "IRS-2026102",
    atf_no: "ATF-010002",
    olusturulma_zamani: "2026-03-12 09:10",
    varis_zamani: "2026-03-13 10:00",
    teslimat_zamani: "2026-03-13 16:20",
    kargo_durumu: "teslim_edildi",
    fatura_durumu: "kesildi",
    tahsilat_durumu: "tahsil_edildi",
    olusturan: "Operasyon-2",
  },
  {
    id: "3",
    takip_no: "ARF-1000003",
    gonderen_musteri: "Kuzey Kimya",
    gonderen_sube: "Bursa Nilüfer Şube",
    alici_sube: "Kocaeli İzmit Şube",
    alici_musteri: "Atlas Endüstri",
    alici_telefon: "0532 887 11 44",
    odeme_turu: "Gönderici Ödemeli",
    fatura_turu: "Gönderici",
    matrah: 284.0,
    kdv: 56.8,
    toplam: 340.8,
    t_adet: 2,
    t_desi: 32,
    parca_listesi: "2 Palet",
    irsaliye_no: "IRS-2026103",
    atf_no: "ATF-010003",
    olusturulma_zamani: "2026-03-11 08:40",
    varis_zamani: "",
    teslimat_zamani: "",
    kargo_durumu: "transfer",
    fatura_durumu: "kesilmedi",
    tahsilat_durumu: "beklemede",
    olusturan: "Operasyon-3",
  },
  {
    id: "4",
    takip_no: "ARF-1000004",
    gonderen_musteri: "Yıldız Elektronik",
    gonderen_sube: "Ankara Çankaya Şube",
    alici_sube: "İstanbul Ümraniye Şube",
    alici_musteri: "Nova Store",
    alici_telefon: "0544 201 09 10",
    odeme_turu: "Alıcı Ödemeli",
    fatura_turu: "Alıcı",
    matrah: 112.0,
    kdv: 22.4,
    toplam: 134.4,
    t_adet: 2,
    t_desi: 8,
    parca_listesi: "2 Koli",
    irsaliye_no: "IRS-2026104",
    atf_no: "",
    olusturulma_zamani: "2026-03-10 07:55",
    varis_zamani: "",
    teslimat_zamani: "",
    kargo_durumu: "beklemede",
    fatura_durumu: "kesilmedi",
    tahsilat_durumu: "beklemede",
    olusturan: "Operasyon-4",
  },
  {
    id: "5",
    takip_no: "ARF-1000005",
    gonderen_musteri: "Mavi Tekstil",
    gonderen_sube: "Adana Seyhan Şube",
    alici_sube: "Mersin Akdeniz Şube",
    alici_musteri: "Renk Tekstil",
    alici_telefon: "0551 403 88 01",
    odeme_turu: "Gönderici Ödemeli",
    fatura_turu: "Gönderici",
    matrah: 146.5,
    kdv: 29.3,
    toplam: 175.8,
    t_adet: 3,
    t_desi: 15,
    parca_listesi: "2 Koli + 1 Çuval",
    irsaliye_no: "IRS-2026105",
    atf_no: "ATF-010005",
    olusturulma_zamani: "2026-03-14 08:05",
    varis_zamani: "",
    teslimat_zamani: "",
    kargo_durumu: "teslim_alindi",
    fatura_durumu: "kesilmedi",
    tahsilat_durumu: "beklemede",
    olusturan: "Operasyon-5",
  },
]

export const mockCanceledCargoList = [
  {
    id: "c-1",
    takip_no: "ARF-1000006",
    gonderen_musteri: "Delta Tekstil",
    gonderen_sube: "İzmir Şube",
    alici_musteri: "Seçkin Group",
    alici_sube: "Bursa Şube",
    odeme_turu: "Alıcı Ödemeli",
    toplam: 187.75,
    olusturulma_zamani: "2026-03-12 09:40",
    iptal_tarihi: "2026-03-12 11:10",
    iptal_nedeni: "Şube çıkışında araç arızası",
    iptal_nedeni_kategori: "operasyonel",
    iptal_eden: "Murat Demir",
    iade_durumu: "beklemede",
    iade_tutari: 0,
    tahsilat_durumu: "beklemede",
  },
  {
    id: "c-2",
    takip_no: "ARF-1000007",
    gonderen_musteri: "Anatolia Pharma",
    gonderen_sube: "Ankara Şube",
    alici_musteri: "Beta Ecza",
    alici_sube: "Antalya Şube",
    odeme_turu: "Gönderici Ödemeli",
    toplam: 451.2,
    olusturulma_zamani: "2026-03-11 15:50",
    iptal_tarihi: "2026-03-11 17:30",
    iptal_nedeni: "Alıcı adres bilgisi eksik",
    iptal_nedeni_kategori: "adres_hatasi",
    iptal_eden: "Ayşe Korkmaz",
    iade_durumu: "kismi_iade",
    iade_tutari: 220.6,
    tahsilat_durumu: "tahsil_edildi",
  },
  {
    id: "c-3",
    takip_no: "ARF-1000008",
    gonderen_musteri: "Ege Kimya",
    gonderen_sube: "Bursa Şube",
    alici_musteri: "İnci Medikal",
    alici_sube: "İstanbul Merkez Şube",
    odeme_turu: "Alıcı Ödemeli",
    toplam: 96.9,
    olusturulma_zamani: "2026-03-10 12:15",
    iptal_tarihi: "2026-03-10 13:00",
    iptal_nedeni: "Ödeme doğrulama tamamlanamadı",
    iptal_nedeni_kategori: "odeme_sorunu",
    iptal_eden: "Ali Veli",
    iade_durumu: "beklemede",
    iade_tutari: 0,
    tahsilat_durumu: "beklemede",
  },
  {
    id: "c-4",
    takip_no: "ARF-1000009",
    gonderen_musteri: "Yıldız Elektronik",
    gonderen_sube: "Antalya Şube",
    alici_musteri: "Nova Store",
    alici_sube: "İzmir Şube",
    odeme_turu: "Gönderici Ödemeli",
    toplam: 278.3,
    olusturulma_zamani: "2026-03-09 18:20",
    iptal_tarihi: "2026-03-09 19:45",
    iptal_nedeni: "Müşteri siparişi iptal etti",
    iptal_nedeni_kategori: "musteri_talebi",
    iptal_eden: "Zeynep Arslan",
    iade_durumu: "tamamlandi",
    iade_tutari: 278.3,
    tahsilat_durumu: "iade_edildi",
  },
]

export const mockTrackingRecords = [
  {
    trackingNo: "ARF-1000001",
    referenceNo: "REF-1000001",
    status: "dagitimda",
    eta: "Bugün 18:00 - 20:00",
    sender: {
      name: "Demir Lojistik",
      city: "Mardin",
      branch: "Mardin Nusaybin Şube",
    },
    receiver: {
      name: "Ali Dalkılıç",
      city: "Konya",
      branch: "Konya Meram Şube",
    },
    package: {
      piece: 5,
      desi: 62,
      weight: 76,
      service: "Standart Kurye",
      paymentType: "Gönderici Ödemeli",
    },
    events: [
      {
        id: "trk-1-1",
        time: "14 Mar 2026, 09:58",
        title: "Kurye Dağıtıma Çıktı",
        description: "Gönderi kurye teslimat rotasına dahil edildi.",
        location: "Konya Meram Şube",
        status: "dagitimda",
      },
      {
        id: "trk-1-2",
        time: "14 Mar 2026, 09:04",
        title: "Varış Şubesine Kabul",
        description: "Transfer hattından iniş tamamlandı.",
        location: "Konya Meram Şube",
        status: "subede",
      },
      {
        id: "trk-1-3",
        time: "13 Mar 2026, 23:42",
        title: "Transfer Hattı",
        description: "Mardin > Konya line-haul sevkiyatına alındı.",
        location: "Diyarbakır TM",
        status: "transfer",
      },
      {
        id: "trk-1-4",
        time: "13 Mar 2026, 17:26",
        title: "Kargo Kabul",
        description: "Gönderi kabul edilip ayrıştırmaya alındı.",
        location: "Mardin Nusaybin Şube",
        status: "hazirlaniyor",
      },
    ],
  },
  {
    trackingNo: "ARF-1000002",
    referenceNo: "REF-1000002",
    status: "teslim_edildi",
    eta: "Teslim edildi",
    sender: {
      name: "Atlas Gıda",
      city: "İzmir",
      branch: "İzmir Bornova Şube",
    },
    receiver: {
      name: "Ayşe Korkmaz",
      city: "Manisa",
      branch: "Manisa Yunusemre Şube",
    },
    package: {
      piece: 4,
      desi: 20,
      weight: 16,
      service: "Ekspres",
      paymentType: "Alıcı Ödemeli",
    },
    events: [
      {
        id: "trk-2-1",
        time: "13 Mar 2026, 16:20",
        title: "Alıcıya Teslim Edildi",
        description: "Teslim alan: Ayşe K.",
        location: "Manisa Yunusemre",
        status: "teslim_edildi",
      },
      {
        id: "trk-2-2",
        time: "13 Mar 2026, 10:30",
        title: "Dağıtıma Çıktı",
        description: "Teslimat rotasına atandı.",
        location: "Manisa Yunusemre Şube",
        status: "dagitimda",
      },
      {
        id: "trk-2-3",
        time: "12 Mar 2026, 22:04",
        title: "Transfer Aracında",
        description: "İzmir > Manisa transfer hattında.",
        location: "Ege Transfer Hattı",
        status: "transfer",
      },
    ],
  },
  {
    trackingNo: "ARF-1000003",
    referenceNo: "REF-1000003",
    status: "subede",
    eta: "Bugün 19:00 - 21:00",
    sender: {
      name: "Kuzey Kimya",
      city: "Bursa",
      branch: "Bursa Nilüfer Şube",
    },
    receiver: {
      name: "Atlas Endüstri",
      city: "Kocaeli",
      branch: "Kocaeli İzmit Şube",
    },
    package: {
      piece: 2,
      desi: 32,
      weight: 40,
      service: "Standart Kurye",
      paymentType: "Gönderici Ödemeli",
    },
    events: [
      {
        id: "trk-3-1",
        time: "14 Mar 2026, 09:58",
        title: "Varış Şubesine Kabul",
        description: "Transfer aracı boşaltıldı ve dağıtım planına alındı.",
        location: "Kocaeli İzmit Şube",
        status: "subede",
      },
      {
        id: "trk-3-2",
        time: "14 Mar 2026, 02:26",
        title: "Transfer Hattında",
        description: "Bursa > Kocaeli transfer hattında.",
        location: "Marmara Transfer",
        status: "transfer",
      },
    ],
  },
]

export const shipmentDetailMockData = {
  takipNo: "1000001",
  durum: "Dağıtımda",
  gonderen: "Demir Lojistik",
  alici: "ALI DALKILIÇ",
  gonderiTarihi: "13.03.2026 17:26",
  odemeTuru: "Gönderici Ödemeli",
  faturaTuru: "Gönderici",
  faturaDurumu: "Kesildi",
  toplamTutar: "395,76 ₺",
  parcaSayisi: "5",
  toplamDesi: "62",
  irsaliyeNo: "IRS-2026101",
  atfNo: "ATF-010001",
  olusturan: "Operasyon-1",
  rota: "Mardin Nusaybin Şube → Konya Meram Şube",
  transferHatti: "Mardin Nusaybin TM → Konya Transfer Merkezi",
  varisSubesi: "Konya Meram Şube",
  teslimatDeneyimi: ["Çok Kötü", "Kötü", "Orta", "İyi", "Çok İyi"],
  takipGecmisi: [
    {
      title: "Hazırlanıyor",
      description: "Gönderi kaydı alındı ve şube çıkışı için hazırlandı.",
      time: "13.03.2026 17:26",
      done: true,
      stage: "hazirlaniyor",
      status: "completed",
      subtitle: "Çıkış Şubesi: Mardin Nusaybin",
    },
    {
      title: "Transferde",
      description: "Gönderi transfer hattına alındı.",
      time: "13.03.2026 23:42",
      done: true,
      stage: "transferde",
      status: "completed",
      subtitle: "Hat: Mardin Nusaybin TM → Konya Transfer Merkezi",
    },
    {
      title: "Varış Şubede",
      description: "Gönderi varış şubesine ulaştı.",
      time: "14.03.2026 09:04",
      done: true,
      stage: "varis",
      status: "completed",
      subtitle: "Varış Şubesi: Konya Meram Şube",
    },
    {
      title: "Dağıtımda",
      description: "Kurye teslimat için dağıtıma çıktı.",
      time: "14.03.2026 09:58",
      done: true,
      stage: "dagitimda",
      status: "active",
    },
    {
      title: "Teslim Edildi",
      description: "Teslimat tamamlandığında bu adım aktif olur.",
      time: "-",
      stage: "teslim",
      status: "pending",
    },
  ],
  senderInfo: {
    customerId: "CUS-001",
    customerType: "corporate",
    displayName: "ETHEM DEMIR",
    companyName: "Demir Lojistik",
    taxNumber: "33224394904",
    taxOffice: "Mardin Vergi Dairesi",
    contactName: "Ethem Demir",
    phone: "5462661483",
    email: "operasyon@ethemdemir.com",
    branch: "Mardin Nusaybin Şube",
    city: "Mardin",
    district: "Nusaybin",
    neighborhood: "Abdulkadirpaşa",
    fullAddress: "TOKİ Lojmanları 3. Blok No:12 Nusaybin / Mardin",
  },
  receiverInfo: {
    customerId: "CUS-002",
    customerType: "individual",
    displayName: "ALI DALKILIÇ",
    tcIdentityNumber: "12345678901",
    contactName: "Ali Dalkılıç",
    phone: "5011740747",
    email: "",
    branch: "Konya Meram Şube",
    city: "Konya",
    district: "Meram",
    neighborhood: "Şehitler Mahallesi",
    fullAddress: "MEHMET AKİF ERSOY MAH TEMUZLAR ŞEHİTLER CAD ÖZEL APT NO13 DAİRE 1",
  },
  parcaDetaylari: [
    {
      id: "piece-1",
      parca_no: "100000101",
      parca_durumu: "teslim_edildi",
      ihbar_edildi: false,
      parca_tipi: "Koli",
      desi: 12,
      agirlik: 15,
      olusturulma_zamani: "13.03.2026 17:26",
      guncellenme_zamani: "14.03.2026 11:40",
      varis_zamani: "14.03.2026 09:04",
      teslimat_zamani: "14.03.2026 11:40",
      teslim_alan_ad: "Ali",
      teslim_alan_soyad: "Dalkılıç",
      teslim_alan_telefonu: "0501 174 07 47",
      teslimat_resmi_url: "https://picsum.photos/seed/teslimat-100000101/900/600",
    },
    {
      id: "piece-2",
      parca_no: "100000102",
      parca_durumu: "transferde",
      ihbar_edildi: false,
      parca_tipi: "Koli",
      desi: 10,
      agirlik: 12,
      olusturulma_zamani: "13.03.2026 17:27",
      guncellenme_zamani: "14.03.2026 08:12",
      varis_zamani: "14.03.2026 07:56",
      teslimat_zamani: "-",
      teslim_alan_ad: "",
      teslim_alan_soyad: "",
      teslim_alan_telefonu: "",
      teslimat_resmi_url: "",
    },
    {
      id: "piece-3",
      parca_no: "100000103",
      parca_durumu: "iptal_edildi",
      ihbar_edildi: false,
      parca_tipi: "Koli",
      desi: 8,
      agirlik: 11,
      olusturulma_zamani: "13.03.2026 17:28",
      guncellenme_zamani: "14.03.2026 10:18",
      varis_zamani: "14.03.2026 09:45",
      teslimat_zamani: "-",
      teslim_alan_ad: "",
      teslim_alan_soyad: "",
      teslim_alan_telefonu: "",
      teslimat_resmi_url: "",
    },
    {
      id: "piece-4",
      parca_no: "100000104",
      parca_durumu: "dagitimda",
      ihbar_edildi: true,
      ihbar_zamani: "14.03.2026 10:32",
      ihbar_sebebi: "Eksik Evrak",
      ihbar_aciklama: "Teslimat adresi için ek doğrulama isteniyor.",
      ihbar_kanit_url: "https://picsum.photos/seed/ihbar-100000104/900/600",
      parca_tipi: "Çuval",
      desi: 18,
      agirlik: 22,
      olusturulma_zamani: "13.03.2026 17:29",
      guncellenme_zamani: "14.03.2026 09:58",
      varis_zamani: "14.03.2026 09:04",
      teslimat_zamani: "-",
      teslim_alan_ad: "",
      teslim_alan_soyad: "",
      teslim_alan_telefonu: "",
      teslimat_resmi_url: "",
    },
    {
      id: "piece-5",
      parca_no: "100000105",
      parca_durumu: "olusturuldu",
      ihbar_edildi: false,
      parca_tipi: "Palet",
      desi: 14,
      agirlik: 16,
      olusturulma_zamani: "13.03.2026 17:31",
      guncellenme_zamani: "13.03.2026 17:44",
      varis_zamani: "-",
      teslimat_zamani: "-",
      teslim_alan_ad: "",
      teslim_alan_soyad: "",
      teslim_alan_telefonu: "",
      teslimat_resmi_url: "",
    },
  ],
}

export const shipmentNotesHistoryMock = [
  {
    source: "Operasyon Merkezi",
    note: "Şube çıkışı tamamlandı, transfer merkezine yönlendirildi.",
    date: "13.03.2026 18:05",
    tag: "Operasyon",
  },
  {
    source: "Destek Ekibi",
    note: "Alıcı teslimat saatini 14:00 sonrası olarak iletti.",
    date: "14.03.2026 09:20",
    tag: "Destek",
  },
]

export const mockPieceCancelInfoByPieceNo: Record<
  string,
  {
    canceledAt: string
    canceledBy: string
    category: string
    reason: string
    note: string
  }
> = {
  "100000103": {
    canceledAt: "14.03.2026 10:18",
    canceledBy: "Operasyon Merkezi",
    category: "Hasar",
    reason: "Parça hasarlı / kullanılamaz",
    note: "Transfer sırasında ambalaj yırtıldı, içerik güvenliği sağlanamadı.",
  },
}

type PieceDetailStatus = "beklemede" | "transferde" | "dagitimda" | "teslim_edildi" | "iptal_edildi"
type PieceMovementStatus = "kaydedildi" | "araca_yuklendi" | "aractan_indirildi" | "dagitimda" | "teslim_edildi" | "iptal_edildi"

type PieceDetailMovement = {
  id: string
  olusturulma_zamani: string
  islem_yapan: string
  islem_yapan_sube: string
  plaka: string
  durum: PieceMovementStatus
  aciklama: string
}

type PieceDetailMock = {
  id: string
  kargo_id: string
  parca_no: string
  takip_no: string
  kargo_kodu: string
  durum: PieceDetailStatus
  parca_tipi: PieceListType
  desi: number
  agirlik: number
  odeme_turu: PieceListRow["odeme_turu"]
  olusturulma_zamani: string
  guncellenme_zamani: string
  gonderici: string
  gonderici_telefon: string
  alici: string
  alici_telefon: string
  cikis_sube: string
  varis_sube: string
  hareketler: PieceDetailMovement[]
}

const pieceListStatusToDetailStatus: Record<PieceListStatus, PieceDetailStatus> = {
  beklemede: "beklemede",
  transfer: "transferde",
  dagitimda: "dagitimda",
  teslim_edildi: "teslim_edildi",
}

const cargoStatusToDetailStatus: Record<(typeof mockCargoList)[number]["kargo_durumu"], PieceDetailStatus> = {
  beklemede: "beklemede",
  teslim_alindi: "beklemede",
  transfer: "transferde",
  dagitimda: "dagitimda",
  teslim_edildi: "teslim_edildi",
}

const pieceTypeByIndex: PieceListType[] = ["koli", "palet", "cuval"]

const buildPieceMovements = (piece: PieceListRow, cargo: (typeof mockCargoList)[number] | undefined) => {
  const movements: PieceDetailMovement[] = [
    {
      id: `${piece.id}-m1`,
      olusturulma_zamani: piece.olusturulma_zamani,
      islem_yapan: "Operasyon",
      islem_yapan_sube: cargo?.gonderen_sube || "-",
      plaka: "-",
      durum: "kaydedildi",
      aciklama: "Parça oluşturuldu ve sisteme işlendi.",
    },
  ]

  if (piece.kargo_durumu !== "beklemede") {
    movements.push({
      id: `${piece.id}-m2`,
      olusturulma_zamani: piece.guncellenme_zamani,
      islem_yapan: "Transfer Operasyon",
      islem_yapan_sube: cargo?.gonderen_sube || "-",
      plaka: "34TR0001",
      durum: "araca_yuklendi",
      aciklama: "Parça transfer aracına yüklendi.",
    })
  }

  if (piece.kargo_durumu === "dagitimda" || piece.kargo_durumu === "teslim_edildi") {
    movements.push({
      id: `${piece.id}-m3`,
      olusturulma_zamani: piece.varis_zamani || piece.guncellenme_zamani,
      islem_yapan: "Kurye",
      islem_yapan_sube: cargo?.alici_sube || "-",
      plaka: "34KR0002",
      durum: "dagitimda",
      aciklama: "Parça dağıtıma çıkarıldı.",
    })
  }

  if (piece.kargo_durumu === "teslim_edildi") {
    movements.push({
      id: `${piece.id}-m4`,
      olusturulma_zamani: piece.teslimat_zamani || piece.guncellenme_zamani,
      islem_yapan: piece.teslim_alan_adi || "Kurye",
      islem_yapan_sube: cargo?.alici_sube || "-",
      plaka: "-",
      durum: "teslim_edildi",
      aciklama: "Parça alıcıya teslim edildi.",
    })
  }

  const cancelInfo = mockPieceCancelInfoByPieceNo[piece.parca_no]
  if (cancelInfo) {
    movements.unshift({
      id: `${piece.id}-cancel`,
      olusturulma_zamani: cancelInfo.canceledAt,
      islem_yapan: cancelInfo.canceledBy,
      islem_yapan_sube: cargo?.alici_sube || "-",
      plaka: "-",
      durum: "iptal_edildi",
      aciklama: `Parça iptal edildi. Neden: ${cancelInfo.reason}.`,
    })
  }

  return movements
}

const cargoById = Object.fromEntries(mockCargoList.map((cargo) => [cargo.id, cargo])) as Record<string, (typeof mockCargoList)[number]>

export const mockPieceDetailsById = mockPieceListRows.reduce<Record<string, PieceDetailMock>>((acc, piece, index) => {
  const cargo = cargoById[piece.kargo_id]
  const detailStatus = mockPieceCancelInfoByPieceNo[piece.parca_no]
    ? "iptal_edildi"
    : pieceListStatusToDetailStatus[piece.kargo_durumu]

  const detail: PieceDetailMock = {
    id: piece.id,
    kargo_id: piece.kargo_id,
    parca_no: piece.parca_no,
    takip_no: piece.takip_no,
    kargo_kodu: piece.parca_no,
    durum: detailStatus,
    parca_tipi: piece.parca_tipi,
    desi: piece.desi,
    agirlik: piece.agirlik,
    odeme_turu: piece.odeme_turu,
    olusturulma_zamani: piece.olusturulma_zamani,
    guncellenme_zamani: piece.guncellenme_zamani,
    gonderici: cargo?.gonderen_musteri || "-",
    gonderici_telefon: shipmentDetailMockData.senderInfo.phone || "-",
    alici: cargo?.alici_musteri || "-",
    alici_telefon: cargo?.alici_telefon || "-",
    cikis_sube: cargo?.gonderen_sube || "-",
    varis_sube: cargo?.alici_sube || "-",
    hareketler: buildPieceMovements(piece, cargo),
  }

  const [, rawPieceIndex] = piece.id.split("-")
  const parsedPieceIndex = Number(rawPieceIndex)
  const pieceIndex = Number.isFinite(parsedPieceIndex) && parsedPieceIndex > 0 ? parsedPieceIndex : index + 1

  acc[piece.id] = detail
  acc[`piece-${piece.kargo_id}-${pieceIndex}`] = detail
  acc[`piece-${index + 1}`] = detail
  acc[piece.parca_no] = detail

  return acc
}, {})

const representedCargoIds = new Set(mockPieceListRows.map((row) => row.kargo_id))

for (const cargo of mockCargoList) {
  if (representedCargoIds.has(cargo.id)) {
    continue
  }

  const takipNo = cargo.takip_no.replace("ARF-", "")
  const updateTime = cargo.teslimat_zamani || cargo.varis_zamani || cargo.olusturulma_zamani

  for (let index = 0; index < cargo.t_adet; index += 1) {
    const pieceIndex = index + 1
    const suffix = String(pieceIndex).padStart(2, "0")
    const pieceNo = `${takipNo}${suffix}`
    const pieceType = pieceTypeByIndex[index % pieceTypeByIndex.length] || "koli"
    const pieceStatus = cargoStatusToDetailStatus[cargo.kargo_durumu]

    const detail: PieceDetailMock = {
      id: `${cargo.id}-${suffix}`,
      kargo_id: cargo.id,
      parca_no: pieceNo,
      takip_no: takipNo,
      kargo_kodu: pieceNo,
      durum: pieceStatus,
      parca_tipi: pieceType,
      desi: Math.max(1, Math.round(cargo.t_desi / Math.max(1, cargo.t_adet))),
      agirlik: Math.max(1, Math.round((cargo.t_desi * 1.2) / Math.max(1, cargo.t_adet) * 10) / 10),
      odeme_turu: cargo.odeme_turu === "Gönderici Ödemeli" ? "Gönderici Ödemeli" : "Alıcı Ödemeli",
      olusturulma_zamani: cargo.olusturulma_zamani,
      guncellenme_zamani: updateTime,
      gonderici: cargo.gonderen_musteri,
      gonderici_telefon: shipmentDetailMockData.senderInfo.phone || "-",
      alici: cargo.alici_musteri,
      alici_telefon: cargo.alici_telefon,
      cikis_sube: cargo.gonderen_sube,
      varis_sube: cargo.alici_sube,
      hareketler: [
        {
          id: `${cargo.id}-${suffix}-m1`,
          olusturulma_zamani: cargo.olusturulma_zamani,
          islem_yapan: "Operasyon",
          islem_yapan_sube: cargo.gonderen_sube,
          plaka: "-",
          durum: "kaydedildi",
          aciklama: "Parça oluşturuldu ve sisteme işlendi.",
        },
        {
          id: `${cargo.id}-${suffix}-m2`,
          olusturulma_zamani: updateTime,
          islem_yapan: cargo.kargo_durumu === "teslim_edildi" ? "Kurye" : "Transfer Operasyon",
          islem_yapan_sube: cargo.alici_sube,
          plaka: cargo.kargo_durumu === "teslim_edildi" ? "-" : "34TR0003",
          durum:
            cargo.kargo_durumu === "teslim_edildi"
              ? "teslim_edildi"
              : cargo.kargo_durumu === "dagitimda"
                ? "dagitimda"
                : "araca_yuklendi",
          aciklama:
            cargo.kargo_durumu === "teslim_edildi"
              ? "Parça alıcıya teslim edildi."
              : cargo.kargo_durumu === "dagitimda"
                ? "Parça dağıtıma çıkarıldı."
                : "Parça transfer aracına yüklendi.",
        },
      ],
    }

    mockPieceDetailsById[detail.id] = detail
    mockPieceDetailsById[`piece-${cargo.id}-${pieceIndex}`] = detail
    mockPieceDetailsById[pieceNo] = detail
  }
}
