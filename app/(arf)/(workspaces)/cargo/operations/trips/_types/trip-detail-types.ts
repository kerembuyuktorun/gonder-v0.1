import type { TripRecord } from "./trip-types"

export type TripLegStatus = "pending" | "in_progress" | "done"

export type PlannedOperation = "pickup_only" | "dropoff_only" | "pickup_dropoff"

export interface TripLegRecord {
  id: string
  order: number
  locationName: string
  plannedOperation: PlannedOperation
  actualTimestamp?: string
  status: TripLegStatus
}

/* ─── Finans & Muhasebe ─── */

export type GelirGiderDurum = "tahsil_edildi" | "odendi" | "bekliyor" | "gecikti"
export type GiderFaturaDurumu = "eslestirildi" | "eslestirilmedi"
export type FaturaTipi = "satis" | "alis" | "tedarikci"
export type FaturaDurum = "bekliyor" | "kismi" | "odendi" | "gecikti" | "iptal"

export interface TripGiderKalemi {
  id: string
  aciklama: string
  tedarikci: string
  tarih: string
  birimFiyat: number
  tevkifat: string
  tevfikatTutar: number
  kdvOran: number
  kdvTutar: number
  toplamTutar: number
  faturaDurumu: GiderFaturaDurumu
  odemeDurumu: GelirGiderDurum
}

export interface TripFatura {
  id: string
  faturaTipi: FaturaTipi
  faturaIsmi: string
  faturaNo: string
  kesimTarihi: string
  vadeTarihi: string
  mulesteri: string
  matrah: number
  tevkifat: number
  kdvTutar: number
  toplamTutar: number
  odenenTutar: number
  kalanTutar: number
  kategori: string
  etiketler: string[]
  durum: FaturaDurum
}

export interface TripDetailRecord {
  trip: TripRecord
  routeSummary: string
  supplierDisplay: string
  vehicleDisplay: string
  totalWeightKg: number
  legs: TripLegRecord[]
  giderler: TripGiderKalemi[]
  faturalar: TripFatura[]
}