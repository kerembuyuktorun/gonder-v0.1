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

export type DashboardPerformancePeriod = '7d' | '30d'

export type DashboardPerformanceMetric = {
  id: string
  labelKey: string
  valueLabel: string
  deltaLabel?: string
  deltaTone?: 'up' | 'down' | 'neutral'
}

export type DashboardPerformancePoint = {
  label: string
  shipments: number
  revenueTry: number
}

export type DashboardPerformanceStrip = {
  period: DashboardPerformancePeriod
  metrics: DashboardPerformanceMetric[]
  series: DashboardPerformancePoint[]
  reportsHref: string
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
