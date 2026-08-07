/**
 * Gönder Raporlar — aggregate analytics kontratı.
 * Production’da backend aggregate sorgularına map edilir; frontend rastgele metrik üretmez.
 */

export type ReportPeriodPreset = '7d' | '30d' | '90d' | 'custom'

export type ReportDateRange = {
  from: string // ISO date yyyy-MM-dd
  to: string
  preset: ReportPeriodPreset
}

export type ReportMaturity = 'mvp' | 'planned'

export type ReportSlug =
  | 'overview'
  | 'shipment-volume'
  | 'cost-revenue'
  | 'carrier-performance'
  | 'delivery-performance'
  | 'integration-channels'
  | 'quotes'
  | 'returns'
  | 'desi-adjustments'
  | 'finance'
  | 'saved'

export type ReportCatalogItem = {
  slug: ReportSlug
  title: string
  description: string
  maturity: ReportMaturity
  href: string
  group: 'core' | 'ops' | 'finance' | 'workspace'
}

export type ReportKpiTone = 'default' | 'success' | 'warning' | 'danger' | 'info'

export type ReportKpi = {
  id: string
  label: string
  valueLabel: string
  deltaLabel?: string
  deltaTone?: 'up' | 'down' | 'neutral'
  tone?: ReportKpiTone
  /** Drill-down hedefi */
  href?: string
  hint?: string
}

export type ReportSeriesPoint = {
  label: string
  date: string
  shipments: number
  delivered: number
  costTry: number
  revenueTry: number
  returns: number
}

export type CarrierPerformanceRow = {
  carrier: string
  shipments: number
  onTimeRate: number
  otifRate: number
  avgCostTry: number
  p50TransitHours: number
  p85TransitHours: number
  p95TransitHours: number
  exceptionRate: number
  spendTry: number
}

export type RouteVolumeRow = {
  originCity: string
  destinationCity: string
  shipments: number
  spendTry: number
  avgCostTry: number
  onTimeRate: number
}

export type ServiceMixRow = {
  serviceType: string
  shipments: number
  spendTry: number
  sharePct: number
}

export type ChannelVolumeRow = {
  channel: string
  orders: number
  shipments: number
  revenueTry: number
  conversionRate: number
}

export type QuoteFunnelRow = {
  stage: string
  count: number
  sharePct: number
}

export type ReturnReasonRow = {
  reason: string
  count: number
  costTry: number
  sharePct: number
}

export type DesiAuditRow = {
  carrier: string
  adjustments: number
  avgDeltaDesi: number
  billedWeightGapKg: number
  surchargeTry: number
  disputeRate: number
}

export type DrilldownShipmentRef = {
  id: string
  reference: string
  carrier: string
  originCity: string
  destinationCity: string
  status: string
  costTry: number | null
  deliveredOnTime: boolean | null
  transitHours: number | null
  href: string
}

/** Overview aggregate */
export type ReportsOverviewSnapshot = {
  range: ReportDateRange
  kpis: ReportKpi[]
  series: ReportSeriesPoint[]
  topCarriers: CarrierPerformanceRow[]
  recentExceptions: DrilldownShipmentRef[]
}

export type ShipmentVolumeReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  series: ReportSeriesPoint[]
  byRoute: RouteVolumeRow[]
  byService: ServiceMixRow[]
}

export type CostRevenueReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  series: ReportSeriesPoint[]
  byCarrier: Array<{ carrier: string; costTry: number; revenueTry: number; costToRevenuePct: number }>
  costPerShipmentTry: number
}

export type CarrierPerformanceReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  carriers: CarrierPerformanceRow[]
}

export type DeliveryPerformanceReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  /** Transit hour buckets for histogram-like bar chart */
  transitBuckets: Array<{ label: string; count: number }>
  percentiles: { p50: number; p85: number; p95: number }
  onTimeByCarrier: Array<{ carrier: string; onTimeRate: number; lateCount: number }>
  lateShipments: DrilldownShipmentRef[]
}

export type IntegrationChannelsReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  channels: ChannelVolumeRow[]
}

export type QuotesReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  funnel: QuoteFunnelRow[]
  avgWinningPriceTry: number
}

export type ReturnsReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  reasons: ReturnReasonRow[]
  series: Array<{ label: string; date: string; returns: number; costTry: number }>
}

export type DesiAdjustmentsReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  byCarrier: DesiAuditRow[]
}

export type FinanceReport = {
  range: ReportDateRange
  kpis: ReportKpi[]
  /** Planned — invoice/payment ledger aggregates */
  planned: true
}

export type SavedReportItem = {
  id: string
  title: string
  reportSlug: ReportSlug
  createdAt: string
  href: string
}

export type AnalyticsQuery = {
  from: string
  to: string
  carrier?: string | null
  channel?: string | null
}
