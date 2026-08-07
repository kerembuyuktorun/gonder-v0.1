export type BranchRiskLevel = "normal" | "uyari" | "kritik"

export interface GmBranchCashRow {
  branchId: string
  branchName: string
  city: string
  toplamAlacak: number
  gecikmisAlacak: number
  bekleyenTransferAdet: number
  bekleyenTransferToplami: number
  sonTransferTarihi?: string
  riskSeviyesi: BranchRiskLevel
}

export interface GmBranchCashSummary {
  toplamSubeAlacagi: number
  gecikmisToplam: number
  onayBekleyenTransferToplami: number
  onayBekleyenTransferAdet: number
  son30GunOnaylananToplam: number
}

export type GmTransferStatus = "beklemede" | "onaylandi" | "reddedildi" | "yarida_birakildi" | "dogrulama_hatasi"
export type GmValidationStatus = "ok" | "hata" | "yok"

export interface GmBranchCashDetail extends GmBranchCashRow {
  toplamKargoAdedi: number
  son7GunTahsilat: number
  sonMutabakatTarihi?: string
  hesapSorumlusu: string
}

export interface GmBranchCashTransferHistoryRow {
  id: string
  branchId: string
  transferNo: string
  branchName: string
  iban: string
  sorguNo: string
  transferTutari: number
  durum: GmTransferStatus
  l1: GmValidationStatus
  l2: GmValidationStatus
  l3: GmValidationStatus
  ekstreDurumu: "Bekliyor" | "Onaylandı" | "Reddedildi" | "Yarıda Bırakıldı" | "L1-L2-L3 Hatası"
  talepTarihi: string
  onayTarihi?: string
  aciklama?: string
  olusturanKullanici: string
}

export interface GmBranchCashNote {
  id: string
  branchId: string
  category: "genel" | "operasyon" | "finans" | "teknik" | "diger"
  visibility: "public" | "internal"
  content: string
  createdAt: string
  createdBy: string
  createdByName: string
  createdByRole: string
  sourceName: string
}
