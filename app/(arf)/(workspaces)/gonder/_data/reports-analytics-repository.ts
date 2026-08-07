import { ARF_ROUTES } from '../../../_shared/routes'
import type {
  AnalyticsQuery,
  CarrierPerformanceReport,
  CarrierPerformanceRow,
  CostRevenueReport,
  DeliveryPerformanceReport,
  DesiAdjustmentsReport,
  DrilldownShipmentRef,
  IntegrationChannelsReport,
  QuotesReport,
  ReportDateRange,
  ReportKpi,
  ReportPeriodPreset,
  ReportSeriesPoint,
  ReportsOverviewSnapshot,
  ReturnsReport,
  SavedReportItem,
  ShipmentVolumeReport,
} from '../_types/reports'

const R = ARF_ROUTES.gonder

export interface ReportsAnalyticsRepository {
  getOverview(query: AnalyticsQuery): Promise<ReportsOverviewSnapshot>
  getShipmentVolume(query: AnalyticsQuery): Promise<ShipmentVolumeReport>
  getCostRevenue(query: AnalyticsQuery): Promise<CostRevenueReport>
  getCarrierPerformance(query: AnalyticsQuery): Promise<CarrierPerformanceReport>
  getDeliveryPerformance(query: AnalyticsQuery): Promise<DeliveryPerformanceReport>
  getReturns(query: AnalyticsQuery): Promise<ReturnsReport>
  getDesiAdjustments(query: AnalyticsQuery): Promise<DesiAdjustmentsReport>
  getQuotes(query: AnalyticsQuery): Promise<QuotesReport>
  getIntegrationChannels(query: AnalyticsQuery): Promise<IntegrationChannelsReport>
  listSavedViews(): Promise<SavedReportItem[]>
}

function delay(ms = 140) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseDay(iso: string) {
  return new Date(`${iso}T12:00:00.000Z`).getTime()
}

function daysBetween(from: string, to: string) {
  const ms = Math.max(0, parseDay(to) - parseDay(from))
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

function inferPreset(from: string, to: string): ReportPeriodPreset {
  const days = daysBetween(from, to)
  if (days <= 7) return '7d'
  if (days <= 31) return '30d'
  if (days <= 92) return '90d'
  return 'custom'
}

function toRange(query: AnalyticsQuery): ReportDateRange {
  return {
    from: query.from,
    to: query.to,
    preset: inferPreset(query.from, query.to),
  }
}

/** Deterministik pseudo-random 0..1 from seed string */
function hash01(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10_000) / 10_000
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
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

function eachDay(from: string, to: string): string[] {
  const out: string[] = []
  const start = parseDay(from)
  const end = parseDay(to)
  for (let t = start; t <= end; t += 86_400_000) {
    out.push(new Date(t).toISOString().slice(0, 10))
  }
  return out
}

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(
    new Date(`${iso}T12:00:00.000Z`)
  )
}

const CARRIERS = ['ARF Parcel', 'Hızlı Kurye', 'Express Lojistik', 'CityGo'] as const

function buildSeries(query: AnalyticsQuery): ReportSeriesPoint[] {
  const days = eachDay(query.from, query.to)
  const span = days.length
  return days.map((date, index) => {
    const wave = Math.sin((index / Math.max(1, span - 1)) * Math.PI * 2) * 0.5 + 0.5
    const noise = hash01(`${date}:ship`)
    const base = lerp(12, 28, wave) + noise * 8
    const carrierBoost =
      query.carrier != null ? 0.72 + hash01(`${query.carrier}:${date}`) * 0.2 : 1
    const shipments = Math.round(base * carrierBoost)
    const delivered = Math.round(shipments * (0.78 + hash01(`${date}:del`) * 0.16))
    const costTry = Math.round(shipments * lerp(520, 780, hash01(`${date}:cost`)))
    const revenueTry = Math.round(costTry * lerp(1.18, 1.42, hash01(`${date}:rev`)))
    const returns = Math.max(0, Math.round(shipments * (0.02 + hash01(`${date}:ret`) * 0.04)))
    return {
      label: dayLabel(date),
      date,
      shipments,
      delivered,
      costTry,
      revenueTry,
      returns,
    }
  })
}

function sumSeries(series: ReportSeriesPoint[]) {
  return series.reduce(
    (acc, point) => {
      acc.shipments += point.shipments
      acc.delivered += point.delivered
      acc.costTry += point.costTry
      acc.revenueTry += point.revenueTry
      acc.returns += point.returns
      return acc
    },
    { shipments: 0, delivered: 0, costTry: 0, revenueTry: 0, returns: 0 }
  )
}

function buildCarriers(query: AnalyticsQuery, totalShipments: number): CarrierPerformanceRow[] {
  const weights = CARRIERS.map((carrier) => 0.15 + hash01(`${query.from}:${carrier}:w`) * 0.35)
  const weightSum = weights.reduce((a, b) => a + b, 0)

  return CARRIERS.map((carrier, index) => {
    const share = weights[index]! / weightSum
    const shipments = Math.max(1, Math.round(totalShipments * share))
    const onTimeRate = lerp(86, 97, hash01(`${carrier}:otd:${query.to}`))
    const otifRate = onTimeRate - lerp(1.5, 4.2, hash01(`${carrier}:otif`))
    const avgCostTry = lerp(480, 820, hash01(`${carrier}:avg`))
    const p50 = lerp(18, 36, hash01(`${carrier}:p50`))
    const p85 = p50 + lerp(8, 18, hash01(`${carrier}:p85`))
    const p95 = p85 + lerp(6, 16, hash01(`${carrier}:p95`))
    return {
      carrier,
      shipments,
      onTimeRate: Number(onTimeRate.toFixed(1)),
      otifRate: Number(otifRate.toFixed(1)),
      avgCostTry: Math.round(avgCostTry),
      p50TransitHours: Number(p50.toFixed(1)),
      p85TransitHours: Number(p85.toFixed(1)),
      p95TransitHours: Number(p95.toFixed(1)),
      exceptionRate: Number(lerp(1.2, 5.5, hash01(`${carrier}:exc`)).toFixed(1)),
      spendTry: Math.round(shipments * avgCostTry),
    }
  }).sort((a, b) => b.shipments - a.shipments)
}

function buildExceptions(query: AnalyticsQuery): DrilldownShipmentRef[] {
  return [0, 1, 2, 3, 4].map((index) => {
    const carrier = CARRIERS[index % CARRIERS.length]!
    const id = `sh-rep-${hash01(`${query.from}:exc:${index}`).toString(16).slice(2, 8)}`
    return {
      id,
      reference: `GND-${1800 + index}`,
      carrier,
      originCity: ['İstanbul', 'Ankara', 'İzmir'][index % 3]!,
      destinationCity: ['Antalya', 'Bursa', 'Gaziantep', 'Adana', 'Konya'][index]!,
      status: index % 2 === 0 ? 'exception' : 'in_transit',
      costTry: Math.round(lerp(420, 980, hash01(`${id}:c`))),
      deliveredOnTime: false,
      transitHours: Math.round(lerp(40, 96, hash01(`${id}:t`))),
      href: R.shipments.detail(id),
    }
  })
}

function overviewKpis(totals: ReturnType<typeof sumSeries>, carriers: CarrierPerformanceRow[]): ReportKpi[] {
  const otd =
    carriers.reduce((sum, row) => sum + row.onTimeRate * row.shipments, 0) /
    Math.max(1, carriers.reduce((sum, row) => sum + row.shipments, 0))
  const costPer = totals.costTry / Math.max(1, totals.shipments)
  const costToRev = (totals.costTry / Math.max(1, totals.revenueTry)) * 100
  const returnRate = (totals.returns / Math.max(1, totals.shipments)) * 100

  return [
    {
      id: 'shipments',
      label: 'Gönderi',
      valueLabel: formatNum(totals.shipments),
      deltaLabel: '+8,4%',
      deltaTone: 'up',
      href: R.reports.shipmentVolume,
      tone: 'info',
    },
    {
      id: 'otd',
      label: 'On-time delivery',
      valueLabel: formatPct(otd),
      deltaLabel: '+1,1%',
      deltaTone: 'up',
      href: R.reports.deliveryPerformance,
      tone: 'success',
      hint: 'Taahhüt edilen SLA içinde teslim',
    },
    {
      id: 'cost-per',
      label: 'Gönderi başına maliyet',
      valueLabel: formatTry(costPer),
      deltaLabel: '-2,3%',
      deltaTone: 'down',
      href: R.reports.costRevenue,
      tone: 'default',
    },
    {
      id: 'cost-rev',
      label: 'Kargo / ciro',
      valueLabel: formatPct(costToRev),
      deltaLabel: '-0,6%',
      deltaTone: 'down',
      href: R.reports.costRevenue,
      tone: 'warning',
    },
    {
      id: 'returns',
      label: 'İade oranı',
      valueLabel: formatPct(returnRate),
      deltaLabel: '+0,4%',
      deltaTone: 'up',
      href: R.reports.returns,
      tone: 'danger',
    },
  ]
}

class MockReportsAnalyticsRepository implements ReportsAnalyticsRepository {
  async getOverview(query: AnalyticsQuery): Promise<ReportsOverviewSnapshot> {
    await delay()
    const series = buildSeries(query)
    const totals = sumSeries(series)
    const topCarriers = buildCarriers(query, totals.shipments)
    return {
      range: toRange(query),
      kpis: overviewKpis(totals, topCarriers),
      series,
      topCarriers: topCarriers.slice(0, 4),
      recentExceptions: buildExceptions(query),
    }
  }

  async getShipmentVolume(query: AnalyticsQuery): Promise<ShipmentVolumeReport> {
    await delay()
    const series = buildSeries(query)
    const totals = sumSeries(series)
    const routes = [
      ['İstanbul', 'Ankara'],
      ['İstanbul', 'İzmir'],
      ['Ankara', 'Antalya'],
      ['İzmir', 'Bursa'],
      ['İstanbul', 'Gaziantep'],
      ['Kocaeli', 'İstanbul'],
    ] as const

    const byRoute = routes.map(([originCity, destinationCity], index) => {
      const shipments = Math.round(
        totals.shipments * (0.22 - index * 0.025 + hash01(`${originCity}${destinationCity}`) * 0.04)
      )
      const spendTry = Math.round(shipments * lerp(500, 900, hash01(`${originCity}:spend`)))
      return {
        originCity,
        destinationCity,
        shipments,
        spendTry,
        avgCostTry: Math.round(spendTry / Math.max(1, shipments)),
        onTimeRate: Number(lerp(88, 97, hash01(`${destinationCity}:ot`)).toFixed(1)),
      }
    })

    const services = ['Express', 'Standart', 'Ekonomik', 'Aynı Gün'] as const
    const byService = services.map((serviceType, index) => {
      const shipments = Math.round(totals.shipments * (0.38 - index * 0.08))
      const spendTry = Math.round(shipments * lerp(450, 950, index / 3))
      return {
        serviceType,
        shipments,
        spendTry,
        sharePct: Number(((shipments / Math.max(1, totals.shipments)) * 100).toFixed(1)),
      }
    })

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'volume',
          label: 'Toplam gönderi',
          valueLabel: formatNum(totals.shipments),
          href: R.shipments.list,
        },
        {
          id: 'delivered',
          label: 'Teslim',
          valueLabel: formatNum(totals.delivered),
          href: R.shipments.delivered,
        },
        {
          id: 'routes',
          label: 'Aktif rota',
          valueLabel: formatNum(byRoute.length),
        },
        {
          id: 'peak',
          label: 'Günlük tepe',
          valueLabel: formatNum(Math.max(...series.map((p) => p.shipments))),
        },
      ],
      series,
      byRoute,
      byService,
    }
  }

  async getCostRevenue(query: AnalyticsQuery): Promise<CostRevenueReport> {
    await delay()
    const series = buildSeries(query)
    const totals = sumSeries(series)
    const carriers = buildCarriers(query, totals.shipments)
    const byCarrier = carriers.map((row) => {
      const revenueTry = Math.round(row.spendTry * lerp(1.15, 1.4, hash01(`${row.carrier}:rev`)))
      return {
        carrier: row.carrier,
        costTry: row.spendTry,
        revenueTry,
        costToRevenuePct: Number(((row.spendTry / Math.max(1, revenueTry)) * 100).toFixed(1)),
      }
    })

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'cost',
          label: 'Toplam kargo maliyeti',
          valueLabel: formatTry(totals.costTry),
          tone: 'warning',
        },
        {
          id: 'revenue',
          label: 'İlişkili sipariş cirosu',
          valueLabel: formatTry(totals.revenueTry),
          tone: 'success',
        },
        {
          id: 'ratio',
          label: 'Kargo / ciro',
          valueLabel: formatPct((totals.costTry / Math.max(1, totals.revenueTry)) * 100),
        },
        {
          id: 'cps',
          label: 'Gönderi başına maliyet',
          valueLabel: formatTry(totals.costTry / Math.max(1, totals.shipments)),
        },
      ],
      series,
      byCarrier,
      costPerShipmentTry: Math.round(totals.costTry / Math.max(1, totals.shipments)),
    }
  }

  async getCarrierPerformance(query: AnalyticsQuery): Promise<CarrierPerformanceReport> {
    await delay()
    const series = buildSeries(query)
    const totals = sumSeries(series)
    const carriers = buildCarriers(query, totals.shipments)
    const best = carriers[0]!

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'carriers',
          label: 'Taşıyıcı',
          valueLabel: formatNum(carriers.length),
        },
        {
          id: 'best-otd',
          label: 'En yüksek OTD',
          valueLabel: `${best.carrier} · ${formatPct(Math.max(...carriers.map((c) => c.onTimeRate)))}`,
          tone: 'success',
        },
        {
          id: 'spend',
          label: 'Toplam harcama',
          valueLabel: formatTry(carriers.reduce((s, c) => s + c.spendTry, 0)),
        },
        {
          id: 'exc',
          label: 'Ort. istisna',
          valueLabel: formatPct(
            carriers.reduce((s, c) => s + c.exceptionRate, 0) / Math.max(1, carriers.length)
          ),
          tone: 'danger',
        },
      ],
      carriers,
    }
  }

  async getDeliveryPerformance(query: AnalyticsQuery): Promise<DeliveryPerformanceReport> {
    await delay()
    const series = buildSeries(query)
    const totals = sumSeries(series)
    const carriers = buildCarriers(query, totals.shipments)
    const p50 =
      carriers.reduce((s, c) => s + c.p50TransitHours * c.shipments, 0) /
      Math.max(1, totals.shipments)
    const p85 =
      carriers.reduce((s, c) => s + c.p85TransitHours * c.shipments, 0) /
      Math.max(1, totals.shipments)
    const p95 =
      carriers.reduce((s, c) => s + c.p95TransitHours * c.shipments, 0) /
      Math.max(1, totals.shipments)
    const otd =
      carriers.reduce((s, c) => s + c.onTimeRate * c.shipments, 0) / Math.max(1, totals.shipments)

    const transitBuckets = [
      { label: '0–12s', count: Math.round(totals.delivered * 0.08) },
      { label: '12–24s', count: Math.round(totals.delivered * 0.22) },
      { label: '24–36s', count: Math.round(totals.delivered * 0.31) },
      { label: '36–48s', count: Math.round(totals.delivered * 0.21) },
      { label: '48–72s', count: Math.round(totals.delivered * 0.12) },
      { label: '72s+', count: Math.round(totals.delivered * 0.06) },
    ]

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'otd',
          label: 'On-time delivery',
          valueLabel: formatPct(otd),
          tone: 'success',
          hint: 'DHL OTIF benzeri: zamanında + eksiksiz teslim için OTIF ayrı izlenir',
        },
        {
          id: 'p50',
          label: 'Transit P50',
          valueLabel: `${p50.toFixed(1).replace('.', ',')} sa`,
        },
        {
          id: 'p85',
          label: 'Transit P85',
          valueLabel: `${p85.toFixed(1).replace('.', ',')} sa`,
        },
        {
          id: 'p95',
          label: 'Transit P95',
          valueLabel: `${p95.toFixed(1).replace('.', ',')} sa`,
          tone: 'warning',
        },
      ],
      transitBuckets,
      percentiles: {
        p50: Number(p50.toFixed(1)),
        p85: Number(p85.toFixed(1)),
        p95: Number(p95.toFixed(1)),
      },
      onTimeByCarrier: carriers.map((c) => ({
        carrier: c.carrier,
        onTimeRate: c.onTimeRate,
        lateCount: Math.round(c.shipments * ((100 - c.onTimeRate) / 100)),
      })),
      lateShipments: buildExceptions(query),
    }
  }

  async getReturns(query: AnalyticsQuery): Promise<ReturnsReport> {
    await delay()
    const seriesBase = buildSeries(query)
    const totals = sumSeries(seriesBase)
    const reasonsSeed = [
      'Yanlış ürün',
      'Hasarlı teslim',
      'Müşteri vazgeçti',
      'Eksik parça',
      'Adres sorunu',
    ] as const
    const reasons = reasonsSeed.map((reason, index) => {
      const count = Math.round(totals.returns * (0.32 - index * 0.05))
      const costTry = Math.round(count * lerp(90, 220, hash01(reason)))
      return {
        reason,
        count,
        costTry,
        sharePct: Number(((count / Math.max(1, totals.returns)) * 100).toFixed(1)),
      }
    })

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'returns',
          label: 'İade adedi',
          valueLabel: formatNum(totals.returns),
          href: R.returns.list,
        },
        {
          id: 'rate',
          label: 'İade oranı',
          valueLabel: formatPct((totals.returns / Math.max(1, totals.shipments)) * 100),
          tone: 'danger',
        },
        {
          id: 'cost',
          label: 'İade maliyeti',
          valueLabel: formatTry(reasons.reduce((s, r) => s + r.costTry, 0)),
        },
        {
          id: 'cpr',
          label: 'İade başına maliyet',
          valueLabel: formatTry(
            reasons.reduce((s, r) => s + r.costTry, 0) / Math.max(1, totals.returns)
          ),
        },
      ],
      reasons,
      series: seriesBase.map((p) => ({
        label: p.label,
        date: p.date,
        returns: p.returns,
        costTry: Math.round(p.returns * 140),
      })),
    }
  }

  async getDesiAdjustments(query: AnalyticsQuery): Promise<DesiAdjustmentsReport> {
    await delay()
    const byCarrier = CARRIERS.map((carrier) => {
      const adjustments = Math.round(8 + hash01(`${carrier}:desi:${query.from}`) * 24)
      return {
        carrier,
        adjustments,
        avgDeltaDesi: Number(lerp(0.8, 4.2, hash01(`${carrier}:dd`)).toFixed(1)),
        billedWeightGapKg: Number(lerp(0.4, 3.6, hash01(`${carrier}:bw`)).toFixed(1)),
        surchargeTry: Math.round(adjustments * lerp(35, 120, hash01(`${carrier}:sc`))),
        disputeRate: Number(lerp(8, 28, hash01(`${carrier}:dp`)).toFixed(1)),
      }
    })

    const surcharge = byCarrier.reduce((s, r) => s + r.surchargeTry, 0)
    const adjustments = byCarrier.reduce((s, r) => s + r.adjustments, 0)

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'adj',
          label: 'Desi düzeltmesi',
          valueLabel: formatNum(adjustments),
          href: R.desiControl.list,
        },
        {
          id: 'surcharge',
          label: 'Ek ücret',
          valueLabel: formatTry(surcharge),
          tone: 'warning',
        },
        {
          id: 'gap',
          label: 'Ort. billed gap',
          valueLabel: `${(
            byCarrier.reduce((s, r) => s + r.billedWeightGapKg, 0) / byCarrier.length
          )
            .toFixed(1)
            .replace('.', ',')} kg`,
        },
        {
          id: 'dispute',
          label: 'İtiraz oranı',
          valueLabel: formatPct(
            byCarrier.reduce((s, r) => s + r.disputeRate, 0) / byCarrier.length
          ),
        },
      ],
      byCarrier,
    }
  }

  async getQuotes(query: AnalyticsQuery): Promise<QuotesReport> {
    await delay()
    const open = Math.round(18 + hash01(`${query.from}:qopen`) * 20)
    const won = Math.round(open * 0.42)
    const lost = Math.round(open * 0.28)
    const expired = Math.max(0, open - won - lost)
    const total = open + won + lost + expired
    const funnel = [
      { stage: 'Açık', count: open, sharePct: 0 },
      { stage: 'Kazanılan', count: won, sharePct: 0 },
      { stage: 'Kaybedilen', count: lost, sharePct: 0 },
      { stage: 'Süresi dolan', count: expired, sharePct: 0 },
    ].map((row) => ({
      ...row,
      sharePct: Number(((row.count / Math.max(1, total)) * 100).toFixed(1)),
    }))

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'open',
          label: 'Açık teklif',
          valueLabel: formatNum(open),
          href: R.quotes.open,
        },
        {
          id: 'win',
          label: 'Kazanma oranı',
          valueLabel: formatPct((won / Math.max(1, won + lost)) * 100),
          tone: 'success',
        },
        {
          id: 'avg',
          label: 'Ort. kazanılan fiyat',
          valueLabel: formatTry(lerp(180, 420, hash01(`${query.to}:qprice`))),
        },
        {
          id: 'action',
          label: 'Aksiyon bekleyen',
          valueLabel: formatNum(Math.round(open * 0.35)),
          href: R.quotes.list,
          tone: 'warning',
        },
      ],
      funnel,
      avgWinningPriceTry: Math.round(lerp(180, 420, hash01(`${query.to}:qprice`))),
    }
  }

  async getIntegrationChannels(query: AnalyticsQuery): Promise<IntegrationChannelsReport> {
    await delay()
    const channels = [
      { channel: 'Shopify', orders: 120, shipments: 98, revenueTry: 186_000, conversionRate: 81.7 },
      { channel: 'Trendyol', orders: 86, shipments: 74, revenueTry: 142_500, conversionRate: 86.0 },
      { channel: 'Excel', orders: 64, shipments: 61, revenueTry: 78_200, conversionRate: 95.3 },
      { channel: 'API', orders: 40, shipments: 38, revenueTry: 61_400, conversionRate: 95.0 },
      { channel: 'Manuel', orders: 22, shipments: 18, revenueTry: 24_800, conversionRate: 81.8 },
    ].map((row) => ({
      ...row,
      orders: Math.round(row.orders * (0.85 + hash01(`${query.from}:${row.channel}`) * 0.4)),
      shipments: Math.round(row.shipments * (0.85 + hash01(`${query.to}:${row.channel}`) * 0.4)),
    }))

    return {
      range: toRange(query),
      kpis: [
        {
          id: 'channels',
          label: 'Aktif kanal',
          valueLabel: formatNum(channels.length),
          href: R.integrations.root,
        },
        {
          id: 'orders',
          label: 'Kanal siparişi',
          valueLabel: formatNum(channels.reduce((s, c) => s + c.orders, 0)),
        },
        {
          id: 'conv',
          label: 'Ort. dönüşüm',
          valueLabel: formatPct(
            channels.reduce((s, c) => s + c.conversionRate, 0) / channels.length
          ),
        },
        {
          id: 'rev',
          label: 'Kanal cirosu',
          valueLabel: formatTry(channels.reduce((s, c) => s + c.revenueTry, 0)),
        },
      ],
      channels,
    }
  }

  async listSavedViews(): Promise<SavedReportItem[]> {
    await delay(60)
    return [
      {
        id: 'saved-1',
        title: 'Son 30 gün OTD',
        reportSlug: 'delivery-performance',
        createdAt: '2026-08-01T10:00:00.000Z',
        href: `${R.reports.deliveryPerformance}?preset=30d`,
      },
      {
        id: 'saved-2',
        title: 'Taşıyıcı maliyet karşılaştırması',
        reportSlug: 'carrier-performance',
        createdAt: '2026-07-22T08:30:00.000Z',
        href: R.reports.carrierPerformance,
      },
    ]
  }
}

export const reportsAnalyticsRepository: ReportsAnalyticsRepository =
  new MockReportsAnalyticsRepository()

export function defaultAnalyticsRange(preset: ReportPeriodPreset = '30d'): AnalyticsQuery {
  const to = new Date('2026-08-07T12:00:00.000Z')
  const from = new Date(to)
  const days = preset === '7d' ? 6 : preset === '90d' ? 89 : 29
  from.setUTCDate(from.getUTCDate() - days)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}
