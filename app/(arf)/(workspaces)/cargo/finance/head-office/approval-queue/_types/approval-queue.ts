export type ApprovalQueueStatus = "beklemede" | "onaylandi" | "reddedildi" | "yarida_birakildi" | "dogrulama_hatasi"
export type ApprovalValidationStatus = "ok" | "hata" | "yok"

export interface ApprovalQueueRecord {
  id: string
  branchId: string
  transferNo: string
  branchName: string
  iban: string
  sorguNo: string
  transferTutari: number
  durum: ApprovalQueueStatus
  l1: ApprovalValidationStatus
  l2: ApprovalValidationStatus
  l3: ApprovalValidationStatus
  talepTarihi: string
  onayTarihi?: string
  manuelOnaylayanKullanici?: string
  aciklama?: string
  matchedBankTransactionId?: string
  matchedBankAccountId?: string
  matchedBankAccountLabel?: string
  olusturanKullanici: string
}

export interface ApprovalQueueSummary {
  toplamTalepAdet: number
  bekleyenAdet: number
  bekleyenToplam: number
  son30GunOnaylananToplam: number
}
