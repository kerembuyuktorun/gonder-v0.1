// Dashboard-Operasyon Types

export interface OperasyonDashboardKpi {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
}

export interface TripStatusDistribution {
  status: string
  label: string
  count: number
  color: string
}

export interface DailyTripTrend {
  date: string
  aktifSefer: number
  tamamlanan: number
}

export interface LineTypeDistribution {
  type: string
  label: string
  count: number
  color: string
}

export interface SupplierTypeDistribution {
  type: string
  label: string
  count: number
  color: string
}

export interface RecentTripRow {
  id: string
  tripNo: string
  lineName: string
  lineType: "main" | "hub" | "feeder"
  supplierName: string
  vehiclePlate: string
  totalPackageCount: number
  totalDesi: number
  status: "created" | "on_road" | "completed" | "cancelled"
  createdAt: string
}

export interface OperasyonDashboardData {
  kpiCards: OperasyonDashboardKpi[]
  tripStatusDistribution: TripStatusDistribution[]
  dailyTripTrend: DailyTripTrend[]
  lineTypeDistribution: LineTypeDistribution[]
  supplierTypeDistribution: SupplierTypeDistribution[]
  recentTrips: RecentTripRow[]
}
