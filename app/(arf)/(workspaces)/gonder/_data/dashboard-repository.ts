import { ARF_ROUTES } from '../../../_shared/routes'
import type {
  DashboardInsights,
  DashboardInsightsRange,
  DashboardQuickAction,
  DashboardSnapshot,
  PerformanceMetricKey,
  PerformanceSummary,
  PerformanceSummaryPoint,
  PerformanceSummaryRange,
} from '../_types/dashboard'

const R = ARF_ROUTES.gonder

const CONNECT_CHANNEL_ACTION: DashboardQuickAction = {
  id: 'connect-channel',
  titleKey: 'quick.connectChannel.title',
  descriptionKey: 'quick.connectChannel.description',
  href: R.integrations.root,
  icon: 'link',
  tone: 'success',
}

const EXCEL_BULK_ACTION: DashboardQuickAction = {
  id: 'excel-bulk',
  titleKey: 'quick.excelBulk.title',
  descriptionKey: 'quick.excelBulk.description',
  href: R.bulkCreate.root,
  icon: 'fileSpreadsheet',
  tone: 'success',
}

function buildQuickActions(integrations: DashboardSnapshot['integrations']): DashboardQuickAction[] {
  const hasConnectedIntegration = integrations.some((item) => item.status === 'connected')

  return [
    {
      id: 'create-shipment',
      titleKey: 'quick.createShipment.title',
      descriptionKey: 'quick.createShipment.description',
      href: R.shipments.create,
      icon: 'plus',
      tone: 'brand',
    },
    hasConnectedIntegration ? EXCEL_BULK_ACTION : CONNECT_CHANNEL_ACTION,
  ]
}

const MOCK_SNAPSHOT: DashboardSnapshot = {
  greetingName: 'Dev User',
  kpis: [
    {
      id: 'active-shipments',
      labelKey: 'kpi.activeShipments',
      value: 12,
      href: R.shipments.active,
      icon: 'truck',
      tone: 'info',
    },
    {
      id: 'delivered',
      labelKey: 'kpi.delivered',
      value: 48,
      href: R.shipments.delivered,
      icon: 'check',
      tone: 'success',
    },
    {
      id: 'open-quotes',
      labelKey: 'kpi.openQuotes',
      value: 3,
      href: R.quotes.open,
      icon: 'quote',
      tone: 'default',
    },
  ],
  quickActions: [],
  performance: {
    period: '7d',
    reportsHref: R.reports.overview,
    metrics: [
      {
        id: 'shipments',
        labelKey: 'perf.shipments',
        valueLabel: '128',
        deltaLabel: '+12%',
        deltaTone: 'up',
      },
      {
        id: 'revenue',
        labelKey: 'perf.revenue',
        valueLabel: '₺84.250',
        deltaLabel: '+8%',
        deltaTone: 'up',
      },
      {
        id: 'deliveryRate',
        labelKey: 'perf.deliveryRate',
        valueLabel: '%96,4',
        deltaLabel: '+1,2%',
        deltaTone: 'up',
      },
      {
        id: 'avgCost',
        labelKey: 'perf.avgCost',
        valueLabel: '₺658',
        deltaLabel: '-3%',
        deltaTone: 'down',
      },
    ],
    series: [
      { label: 'Pzt', shipments: 14, revenueTry: 9200 },
      { label: 'Sal', shipments: 18, revenueTry: 11800 },
      { label: 'Çar', shipments: 16, revenueTry: 10400 },
      { label: 'Per', shipments: 22, revenueTry: 14100 },
      { label: 'Cum', shipments: 25, revenueTry: 16800 },
      { label: 'Cmt', shipments: 19, revenueTry: 12100 },
      { label: 'Paz', shipments: 14, revenueTry: 9850 },
    ],
  },
  activeShipments: [
    {
      id: 'sh-1001',
      reference: 'GND-1001',
      origin: 'İstanbul',
      destination: 'Ankara',
      serviceType: 'Express',
      status: 'in_transit',
      updatedAt: '12 dk önce',
      href: R.shipments.detail('sh-1001'),
    },
    {
      id: 'sh-1002',
      reference: 'GND-1002',
      origin: 'İzmir',
      destination: 'Bursa',
      serviceType: 'Standart',
      status: 'pending',
      updatedAt: '34 dk önce',
      href: R.shipments.detail('sh-1002'),
    },
    {
      id: 'sh-1003',
      reference: 'GND-1003',
      origin: 'Ankara',
      destination: 'Antalya',
      serviceType: 'Aynı Gün',
      status: 'in_transit',
      updatedAt: '1 sa önce',
      href: R.shipments.detail('sh-1003'),
    },
    {
      id: 'sh-1004',
      reference: 'GND-1004',
      origin: 'İstanbul',
      destination: 'Gaziantep',
      serviceType: 'Ekonomik',
      status: 'issue',
      updatedAt: '2 sa önce',
      href: R.shipments.detail('sh-1004'),
    },
    {
      id: 'sh-1005',
      reference: 'GND-1005',
      origin: 'Kocaeli',
      destination: 'İstanbul',
      serviceType: 'Express',
      status: 'delivered',
      updatedAt: '3 sa önce',
      href: R.shipments.detail('sh-1005'),
    },
    {
      id: 'sh-1006',
      reference: 'GND-1006',
      origin: 'Adana',
      destination: 'Mersin',
      serviceType: 'Standart',
      status: 'in_transit',
      updatedAt: '4 sa önce',
      href: R.shipments.detail('sh-1006'),
    },
  ],
  statusSummary: [
    { status: 'pending', count: 4 },
    { status: 'in_transit', count: 12 },
    { status: 'delivered', count: 48 },
    { status: 'issue', count: 2 },
  ],
  pendingOrders: [
    {
      id: 'ord-501',
      reference: 'SIP-501',
      source: 'Web',
      href: R.orders.detail('ord-501'),
    },
    {
      id: 'ord-502',
      reference: 'SIP-502',
      source: 'Excel',
      href: R.orders.detail('ord-502'),
    },
    {
      id: 'ord-503',
      reference: 'SIP-503',
      source: 'API',
      href: R.orders.detail('ord-503'),
    },
  ],
  integrations: [
    { id: 'excel', name: 'Excel İçe Aktarım', status: 'connected' },
    { id: 'erp', name: 'ERP Bağlantısı', status: 'warning' },
    { id: 'marketplace', name: 'Pazaryeri', status: 'disconnected' },
  ],
  recentUpdates: [
    {
      id: 'upd-1',
      textKey: 'updates.shipmentDelivered',
      at: '15 dk önce',
    },
    {
      id: 'upd-2',
      textKey: 'updates.quoteWaiting',
      at: '42 dk önce',
    },
    {
      id: 'upd-3',
      textKey: 'updates.integrationWarning',
      at: '1 sa önce',
    },
  ],
}

export class DashboardRepository {
  async getSnapshot(options?: { greetingName?: string }): Promise<DashboardSnapshot> {
    // Simulate network latency for realistic loading UX in local/dev.
    await new Promise((resolve) => setTimeout(resolve, 120))

    return {
      ...MOCK_SNAPSHOT,
      greetingName: options?.greetingName?.trim() || MOCK_SNAPSHOT.greetingName,
      quickActions: buildQuickActions(MOCK_SNAPSHOT.integrations),
    }
  }

  async getInsights(range: DashboardInsightsRange = '30d'): Promise<DashboardInsights> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return buildInsights(range)
  }

  async getPerformanceSummary(
    range: PerformanceSummaryRange = '30d'
  ): Promise<PerformanceSummary> {
    await new Promise((resolve) => setTimeout(resolve, 90))
    return buildPerformanceSummary(range)
  }
}

export const dashboardRepository = new DashboardRepository()

function hash01(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10_000) / 10_000
}

function dayCount(range: DashboardInsightsRange) {
  if (range === '7d') return 7
  if (range === '3m') return 12 // monthly buckets
  return 30
}

function buildInsights(range: DashboardInsightsRange): DashboardInsights {
  const points = dayCount(range)
  const isMonthly = range === '3m'
  const shipmentSeries = Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index / Math.max(1, points - 1)) * Math.PI * 2) * 0.5 + 0.5
    const noise = hash01(`${range}:${index}:s`)
    const count = Math.round((isMonthly ? 90 : 14) + wave * (isMonthly ? 40 : 12) + noise * (isMonthly ? 25 : 8))
    const label = isMonthly
      ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][index]!
      : range === '7d'
        ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][index]!
        : `${index + 1}`
    return {
      date: isMonthly ? `2026-${String(index + 1).padStart(2, '0')}-01` : `2026-08-${String(Math.max(1, 7 - index)).padStart(2, '0')}`,
      label,
      count,
    }
  })

  const total = shipmentSeries.reduce((sum, point) => sum + point.count, 0)
  const statusBreakdown = [
    { status: 'delivered', label: 'Teslim', count: Math.round(total * 0.62) },
    { status: 'in_transit', label: 'Yolda', count: Math.round(total * 0.22) },
    { status: 'pending', label: 'Bekliyor', count: Math.round(total * 0.11) },
    { status: 'issue', label: 'Sorunlu', count: Math.max(1, Math.round(total * 0.05)) },
  ]

  return {
    range,
    shipmentSeries,
    statusBreakdown,
    newOrdersCount: range === '7d' ? 7 : range === '30d' ? 18 : 41,
    newQuotesCount: range === '7d' ? 3 : range === '30d' ? 8 : 19,
    reportsHref: R.reports.overview,
    ordersHref: `${R.orders.list}?view=pending`,
    quotesHref: `${R.quotes.list}?view=ready`,
  }
}

function formatTry(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPct(value: number) {
  return `%${value.toFixed(1).replace('.', ',')}`
}

function formatNum(value: number) {
  return new Intl.NumberFormat('tr-TR').format(Math.round(value))
}

function buildPerformanceSeries(range: PerformanceSummaryRange): PerformanceSummaryPoint[] {
  const points = dayCount(range)
  const isMonthly = range === '3m'
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index / Math.max(1, points - 1)) * Math.PI * 2) * 0.5 + 0.5
    const shipments = Math.round(
      (isMonthly ? 88 : 13) +
        wave * (isMonthly ? 36 : 11) +
        hash01(`${range}:perf:${index}:s`) * (isMonthly ? 22 : 7)
    )
    const revenue = Math.round(shipments * (540 + hash01(`${range}:perf:${index}:r`) * 260))
    const deliveryRate = Number(
      (92 + wave * 4 + hash01(`${range}:perf:${index}:d`) * 3).toFixed(1)
    )
    const avgCost = Math.round(480 + (1 - wave) * 120 + hash01(`${range}:perf:${index}:a`) * 80)
    const label = isMonthly
      ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][index]!
      : range === '7d'
        ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][index]!
        : `${index + 1}`
    return {
      date: isMonthly
        ? `2026-${String(index + 1).padStart(2, '0')}-01`
        : `2026-07-${String(Math.min(31, index + 1)).padStart(2, '0')}`,
      label,
      shipments,
      revenue,
      deliveryRate: Math.min(99.5, deliveryRate),
      avgCost,
    }
  })
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function buildPerformanceSummary(range: PerformanceSummaryRange): PerformanceSummary {
  const series = buildPerformanceSeries(range)
  const shipments = series.reduce((sum, point) => sum + point.shipments, 0)
  const revenue = series.reduce((sum, point) => sum + point.revenue, 0)
  const deliveryRate = average(series.map((point) => point.deliveryRate))
  const avgCost = average(series.map((point) => point.avgCost))

  const changeByRange: Record<PerformanceSummaryRange, Record<PerformanceMetricKey, number>> = {
    '7d': { shipments: 8.4, revenue: 6.2, deliveryRate: 0.8, avgCost: -2.1 },
    '30d': { shipments: 12.1, revenue: 9.4, deliveryRate: 1.2, avgCost: -3.0 },
    '3m': { shipments: 18.6, revenue: 14.2, deliveryRate: 2.1, avgCost: -4.5 },
  }

  const changes = changeByRange[range]

  return {
    range,
    reportsHref: R.reports.overview,
    metrics: [
      {
        key: 'shipments',
        value: shipments,
        formatted: formatNum(shipments),
        change: changes.shipments,
      },
      {
        key: 'revenue',
        value: revenue,
        formatted: formatTry(revenue),
        change: changes.revenue,
      },
      {
        key: 'deliveryRate',
        value: deliveryRate,
        formatted: formatPct(deliveryRate),
        change: changes.deliveryRate,
      },
      {
        key: 'avgCost',
        value: avgCost,
        formatted: formatTry(avgCost),
        change: changes.avgCost,
      },
    ],
    series,
  }
}
