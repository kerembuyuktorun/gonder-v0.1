export type ContractType = "sozlesmeli" | "spot"
export type CashregisterRiskLevel = "normal" | "warning" | "critical"
export type CashregisterCurrency = "TRY" | "USD" | "EUR"

export interface CustomerCashregisterRecord {
  customerId: string
  customerName: string
  vkn?: string
  contractType: ContractType
  vadeGunu: number
  currency: CashregisterCurrency
  toplamAlacak: number
  faturalanmisTutar: number
  aciktaTutar: number
  tahsilEdilen: number
  kalanBakiye: number
  gecikmisBakiye: number
  gecikenGunSayisi: number
  riskLevel: CashregisterRiskLevel
  lastActionAt: string
  accountOwner?: string
}

export interface CustomerCashregisterSummary {
  toplamAlacak: number
  toplamFaturalanmis: number
  toplamAcikta: number
  toplamGecikmis: number
  tahsilatPerformansi: number
}
