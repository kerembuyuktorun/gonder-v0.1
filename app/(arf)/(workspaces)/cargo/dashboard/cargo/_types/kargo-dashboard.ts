export interface KargoDashboardKpi {
  title: string
  value: string
  suffix?: string
  change?: string
  changeType: "positive" | "negative" | "neutral"
  description: string
}

export interface KargoStatusDistribution {
  name: string
  value: number
  color: string
}

export interface DailyCargoTrend {
  date: string
  toplam: number
  teslim: number
}

export interface BranchPerformance {
  branchName: string
  kargoSayisi: number
  teslimSayisi: number
  teslimatOrani: number
}

export interface OdemeTuruDistribution {
  name: string
  value: number
  color: string
}

export interface RecentCargoRow {
  id: string
  takipNo: string
  gonderen: string
  alici: string
  gonderenSube: string
  aliciSube: string
  toplam: number
  parcaSayisi: number
  durum: "olusturuldu" | "transfer_surecinde" | "dagitimda" | "teslim_edildi" | "iptal_edildi"
  olusturulmaZamani: string
}

export interface KargoDashboardData {
  kpiCards: KargoDashboardKpi[]
  statusDistribution: KargoStatusDistribution[]
  dailyTrend: DailyCargoTrend[]
  branchPerformance: BranchPerformance[]
  odemeTuruDistribution: OdemeTuruDistribution[]
  recentCargos: RecentCargoRow[]
}
