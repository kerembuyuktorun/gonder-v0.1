import { ARF_ROUTES } from '../../../_shared/routes'
import type { DashboardQuickAction, DashboardSnapshot } from '../_types/dashboard'

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
    {
      id: 'price-calculation',
      titleKey: 'quick.priceCalculation.title',
      descriptionKey: 'quick.priceCalculation.description',
      href: R.priceCalculation,
      icon: 'calculator',
      tone: 'warning',
    },
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
}

export const dashboardRepository = new DashboardRepository()
