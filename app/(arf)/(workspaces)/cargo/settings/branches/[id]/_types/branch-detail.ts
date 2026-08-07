import type { BranchCommissionRecord } from "./branch-commission"
import type { BranchDocument } from "./branch-document"
import type { BranchNote } from "./branch-note"
import type { BranchUser } from "./branch-user"

export type BranchStatus = "active" | "passive"

export interface BranchDetail {
  id: string
  kod: string
  ad: string
  il: string
  ilce: string
  mahalle?: string
  acikAdres?: string
  telefon: string
  eposta?: string
  calismaSaatleri?: string
  vergiDairesi?: string
  vkn?: string
  acenteSahibi?: string
  acenteSahibiTelefon?: string
  acenteSahibiEposta?: string
  acenteYoneticisi?: string
  acenteYoneticisiTelefon?: string
  managerUserId?: string
  alimHakedisOrani?: number
  dagitimHakedisOrani?: number
  bankAdi?: string
  iban?: string
  hesapSahibi?: string
  latitude?: number
  longitude?: number
  status: BranchStatus
  createdAt: string
  bagliMerkezId?: string
  bagliMerkezAdi?: string
  bagliMerkezKodu?: string
  bagliMerkezSehir?: string
  documents: BranchDocument[]
  users: BranchUser[]
  notes: BranchNote[]
  commissionRecords: BranchCommissionRecord[]
}
