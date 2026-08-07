/* ------------------------------------------------------------------ */
/*  Taşıma Sorgula – Mock Veri                                        */
/* ------------------------------------------------------------------ */

export type TransportTrackStatus = "planlanmis" | "yukleniyor" | "yolda" | "teslimatta" | "teslim_edildi"

export interface TransportTrackEvent {
  id: string
  time: string
  title: string
  description: string
  location: string
  status: TransportTrackStatus
}

export interface TransportTrackRecord {
  tasimaNo: string
  gonderiTipi: "FTL" | "LTL"
  status: TransportTrackStatus
  eta: string
  gonderici: {
    name: string
    city: string
    address: string
  }
  alici: {
    name: string
    city: string
    address: string
  }
  tasima: {
    firma: string
    plaka: string
    surucu: string
    kasaTipi: string
  }
  yuk: {
    toplamAdet: number
    toplamAgirlik: number
    toplamHacim: number
    toplamDesi: number
    yukTipleri: string
  }
  fiyat: {
    alisFiyat: number
    satisFiyat: number
    kar: number
  }
  events: TransportTrackEvent[]
}

export const mockTransportTrackRecords: TransportTrackRecord[] = [
  {
    tasimaNo: "TSM-20000001",
    gonderiTipi: "FTL",
    status: "teslim_edildi",
    eta: "Teslim edildi",
    gonderici: {
      name: "AHMET KARAN",
      city: "Adana",
      address: "Adana / Seyhan",
    },
    alici: {
      name: "DELTA TİCARET LTD.",
      city: "Kocaeli",
      address: "Kocaeli / Gebze",
    },
    tasima: {
      firma: "DELTA TEDARİK",
      plaka: "34 ABC 123",
      surucu: "Ahmet Yılmaz",
      kasaTipi: "Tenteli",
    },
    yuk: {
      toplamAdet: 20,
      toplamAgirlik: 18000,
      toplamHacim: 42.5,
      toplamDesi: 14166,
      yukTipleri: "Palet",
    },
    fiyat: {
      alisFiyat: 35000,
      satisFiyat: 42000,
      kar: 7000,
    },
    events: [
      {
        id: "te-1-1",
        time: "15 Oca 2025, 16:30",
        title: "Teslim Edildi",
        description: "Yükler alıcı depoya teslim edildi. Teslim alan: Mehmet Demir",
        location: "Kocaeli / Gebze",
        status: "teslim_edildi",
      },
      {
        id: "te-1-2",
        time: "15 Oca 2025, 09:00",
        title: "Teslimat Noktasında",
        description: "Araç varış adresine ulaştı, boşaltma başladı.",
        location: "Kocaeli / Gebze",
        status: "teslimatta",
      },
      {
        id: "te-1-3",
        time: "15 Oca 2025, 02:15",
        title: "Yolda",
        description: "Araç Adana'dan çıkış yaptı, tahmini varış 8 saat.",
        location: "Adana Çıkış",
        status: "yolda",
      },
      {
        id: "te-1-4",
        time: "15 Oca 2025, 00:30",
        title: "Yükleme Tamamlandı",
        description: "20 palet yükleme tamamlandı, araç çıkışa hazır.",
        location: "Adana / Seyhan",
        status: "yukleniyor",
      },
      {
        id: "te-1-5",
        time: "14 Oca 2025, 14:30",
        title: "Taşıma Planlandı",
        description: "Taşıma kaydı oluşturuldu, araç ve sürücü atandı.",
        location: "Operasyon Merkezi",
        status: "planlanmis",
      },
    ],
  },
  {
    tasimaNo: "TSM-20000002",
    gonderiTipi: "LTL",
    status: "yolda",
    eta: "19 Oca 2025, 14:00",
    gonderici: {
      name: "YILDIZ GIDA SAN.",
      city: "Ankara",
      address: "Ankara / Sincan",
    },
    alici: {
      name: "MEGA DEPOLAMA A.Ş.",
      city: "İzmir",
      address: "İzmir / Kemalpaşa",
    },
    tasima: {
      firma: "MARS LOJİSTİK",
      plaka: "06 GHI 789",
      surucu: "Ali Kaya",
      kasaTipi: "Tenteli",
    },
    yuk: {
      toplamAdet: 45,
      toplamAgirlik: 3200,
      toplamHacim: 18.4,
      toplamDesi: 6133,
      yukTipleri: "Koli, IBC",
    },
    fiyat: {
      alisFiyat: 12000,
      satisFiyat: 15500,
      kar: 3500,
    },
    events: [
      {
        id: "te-2-1",
        time: "18 Oca 2025, 22:10",
        title: "Yolda",
        description: "Araç Ankara'dan çıkış yaptı, İzmir'e doğru ilerliyor.",
        location: "Ankara Çıkış",
        status: "yolda",
      },
      {
        id: "te-2-2",
        time: "18 Oca 2025, 18:00",
        title: "Yükleme Tamamlandı",
        description: "45 parça (Koli + IBC) yükleme tamamlandı.",
        location: "Ankara / Sincan",
        status: "yukleniyor",
      },
      {
        id: "te-2-3",
        time: "17 Oca 2025, 10:00",
        title: "Taşıma Planlandı",
        description: "LTL parsiyel gönderi planlandı.",
        location: "Operasyon Merkezi",
        status: "planlanmis",
      },
    ],
  },
  {
    tasimaNo: "TSM-20000003",
    gonderiTipi: "FTL",
    status: "yukleniyor",
    eta: "21 Oca 2025, 18:00",
    gonderici: {
      name: "DELTA TİCARET LTD.",
      city: "Kocaeli",
      address: "Kocaeli / Gebze",
    },
    alici: {
      name: "AHMET KARAN",
      city: "Adana",
      address: "Adana / Seyhan",
    },
    tasima: {
      firma: "STAR TAŞIMACILIK",
      plaka: "35 MNO 345",
      surucu: "Emre Koç",
      kasaTipi: "Frigo",
    },
    yuk: {
      toplamAdet: 15,
      toplamAgirlik: 22000,
      toplamHacim: 55.0,
      toplamDesi: 18333,
      yukTipleri: "Palet, Bidon",
    },
    fiyat: {
      alisFiyat: 40000,
      satisFiyat: 48000,
      kar: 8000,
    },
    events: [
      {
        id: "te-3-1",
        time: "20 Oca 2025, 08:30",
        title: "Yükleme Başladı",
        description: "Araç yükleme noktasına yanaştı, palet ve bidon yükleniyor.",
        location: "Kocaeli / Gebze",
        status: "yukleniyor",
      },
      {
        id: "te-3-2",
        time: "19 Oca 2025, 16:45",
        title: "Taşıma Planlandı",
        description: "FTL komple gönderi oluşturuldu.",
        location: "Operasyon Merkezi",
        status: "planlanmis",
      },
    ],
  },
]
