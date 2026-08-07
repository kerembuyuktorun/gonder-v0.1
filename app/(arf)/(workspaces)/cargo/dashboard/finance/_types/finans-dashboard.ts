// Dashboard-Finans Types

export interface FinansDashboardKpi {
  label: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
}

export interface GelirGiderTrend {
  month: string
  gelir: number
  gider: number
}

export interface FaturaDurumDistribution {
  status: string
  label: string
  amount: number
  count: number
  color: string
}

export interface GiderKategoriDistribution {
  category: string
  label: string
  amount: number
  color: string
}

export interface BankaHesapOzet {
  id: string
  bankName: string
  accountType: "collection" | "expense"
  iban: string
  balance: number
  currency: "TRY" | "USD" | "EUR"
  status: "active" | "closed"
}

export interface RecentFinansRow {
  id: string
  type: "fatura" | "gider" | "hakedis" | "transfer"
  description: string
  amount: number
  status: string
  statusLabel: string
  statusColor: string
  date: string
}

export interface FinansDashboardData {
  kpiCards: FinansDashboardKpi[]
  gelirGiderTrend: GelirGiderTrend[]
  faturaDurumDistribution: FaturaDurumDistribution[]
  giderKategoriDistribution: GiderKategoriDistribution[]
  bankaHesaplari: BankaHesapOzet[]
  recentTransactions: RecentFinansRow[]
}
