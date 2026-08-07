export type GonderShipmentStatus =
  | 'pending'
  | 'in_transit'
  | 'delivered'
  | 'issue'

export type GonderIntegrationStatus = 'connected' | 'warning' | 'disconnected'

export type DashboardKpiItem = {
  id: string
  labelKey: string
  value: number
  href: string
  icon?: string
  tone?: 'default' | 'warning' | 'success' | 'info'
}

export type QuickActionTone = 'brand' | 'success' | 'warning' | 'info' | 'neutral'

export type DashboardQuickAction = {
  id: string
  titleKey: string
  descriptionKey?: string
  href: string
  icon: string
  tone: QuickActionTone
  disabled?: boolean
  badgeKey?: string
}

export type DashboardActiveShipment = {
  id: string
  reference: string
  origin: string
  destination: string
  serviceType: string
  status: GonderShipmentStatus
  updatedAt: string
  href: string
}

export type DashboardStatusSummaryItem = {
  status: GonderShipmentStatus
  count: number
}

export type DashboardPendingOrder = {
  id: string
  reference: string
  source?: string
  href: string
}

export type DashboardIntegration = {
  id: string
  name: string
  status: GonderIntegrationStatus
}

export type DashboardRecentUpdate = {
  id: string
  textKey: string
  at: string
}

export type PerformanceMetricKey = 'shipments' | 'revenue' | 'deliveryRate' | 'avgCost'

export type PerformanceSummaryRange = '7d' | '30d' | '3m'

export type PerformanceSummaryMetric = {
  key: PerformanceMetricKey
  value: number
  formatted: string
  change: number
}

export type PerformanceSummaryPoint = {
  date: string
  label: string
  shipments: number
  revenue: number
  deliveryRate: number
  avgCost: number
}

export type PerformanceSummary = {
  range: PerformanceSummaryRange
  metrics: PerformanceSummaryMetric[]
  series: PerformanceSummaryPoint[]
  reportsHref: string
}

/** @deprecated Prefer PerformanceSummary via getPerformanceSummary */
export type DashboardPerformancePeriod = '7d' | '30d'

/** @deprecated Prefer PerformanceSummaryMetric */
export type DashboardPerformanceMetric = {
  id: string
  labelKey: string
  valueLabel: string
  deltaLabel?: string
  deltaTone?: 'up' | 'down' | 'neutral'
}

/** @deprecated Prefer PerformanceSummaryPoint */
export type DashboardPerformancePoint = {
  label: string
  shipments: number
  revenueTry: number
}

/** @deprecated Prefer PerformanceSummary */
export type DashboardPerformanceStrip = {
  period: DashboardPerformancePeriod
  metrics: DashboardPerformanceMetric[]
  series: DashboardPerformancePoint[]
  reportsHref: string
}

export type DashboardInsightsRange = '7d' | '30d' | '3m'

export type DashboardInsights = {
  range: DashboardInsightsRange
  shipmentSeries: Array<{ date: string; label: string; count: number }>
  statusBreakdown: Array<{ status: string; label: string; count: number }>
  newOrdersCount: number
  newQuotesCount: number
  reportsHref: string
  ordersHref: string
  quotesHref: string
}

export type DashboardSnapshot = {
  greetingName: string
  kpis: DashboardKpiItem[]
  quickActions: DashboardQuickAction[]
  performance: DashboardPerformanceStrip
  activeShipments: DashboardActiveShipment[]
  statusSummary: DashboardStatusSummaryItem[]
  pendingOrders: DashboardPendingOrder[]
  integrations: DashboardIntegration[]
  recentUpdates?: DashboardRecentUpdate[]
}
