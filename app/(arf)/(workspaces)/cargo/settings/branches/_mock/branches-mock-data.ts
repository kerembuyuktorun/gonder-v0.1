// TODO: Remove when API is ready — replace with real fetch from backend
export interface BranchRecord {
  id: string
  kod: string
  ad: string
  bagliTransferMerkezi: string
  il: string
  ilce: string
  mahalle: string
  telefon: string
  eposta: string
  subeYoneticisi: string
  toplamKargo: number
  aktif: boolean
}

export const mockBranches: BranchRecord[] = [
  {
    id: "1",
    kod: "IST-001",
    ad: "İstanbul Merkez",
    bagliTransferMerkezi: "İstanbul Anadolu Transfer Merkezi",
    il: "İstanbul",
    ilce: "Kadıköy",
    mahalle: "Moda",
    telefon: "0216 123 45 67",
    eposta: "istanbul.merkez@arf.com",
    subeYoneticisi: "Ali Yılmaz",
    toplamKargo: 126,
    aktif: true,
  },
  {
    id: "2",
    kod: "ANK-001",
    ad: "Ankara Merkez",
    bagliTransferMerkezi: "Ankara Transfer Merkezi",
    il: "Ankara",
    ilce: "Çankaya",
    mahalle: "Kavaklıdere",
    telefon: "0312 234 56 78",
    eposta: "ankara.merkez@arf.com",
    subeYoneticisi: "Veli Demir",
    toplamKargo: 94,
    aktif: true,
  },
  {
    id: "3",
    kod: "IZM-001",
    ad: "İzmir Merkez",
    bagliTransferMerkezi: "İzmir Transfer Merkezi",
    il: "İzmir",
    ilce: "Konak",
    mahalle: "Alsancak",
    telefon: "0232 345 67 89",
    eposta: "izmir.merkez@arf.com",
    subeYoneticisi: "Ayşe Kaya",
    toplamKargo: 81,
    aktif: true,
  },
  {
    id: "4",
    kod: "IST-002",
    ad: "İstanbul Anadolu",
    bagliTransferMerkezi: "İstanbul Transfer Merkezi",
    il: "İstanbul",
    ilce: "Üsküdar",
    mahalle: "Altunizade",
    telefon: "0216 456 78 90",
    eposta: "istanbul.anadolu@arf.com",
    subeYoneticisi: "Mehmet Can",
    toplamKargo: 43,
    aktif: false,
  },
]
