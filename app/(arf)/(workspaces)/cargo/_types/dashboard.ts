export interface DashboardKpi {
  title: string
  value: string
  suffix?: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  description: string
}

export interface CargoStatusDistribution {
  name: string
  value: number
  color: string
}

export interface MonthlyRevenue {
  month: string
  ciro: number
}

export interface RecentCargo {
  id: string
  customer: string
  destination: string
  status: "beklemede" | "teslim_alindi" | "transfer" | "dagitimda" | "teslim_edildi" | "iptal"
  time: string
}

export interface SystemStatus {
  name: string
  status: "active" | "warning" | "error"
}

export interface DashboardData {
  kpiCards: DashboardKpi[]
  cargoDistribution: CargoStatusDistribution[]
  monthlyRevenue: MonthlyRevenue[]
  recentCargos: RecentCargo[]
  systemStatuses: SystemStatus[]
}
