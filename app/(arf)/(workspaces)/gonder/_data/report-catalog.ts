import { ARF_ROUTES } from '../../../_shared/routes'
import type { ReportCatalogItem } from '../_types/reports'

const R = ARF_ROUTES.gonder.reports

/** Rapor kataloğu — MVP + planned mimari tanımı */
export const REPORT_CATALOG: ReportCatalogItem[] = [
  {
    slug: 'overview',
    title: 'Genel bakış',
    description: 'Hacim, maliyet, OTD ve istisna özeti',
    maturity: 'mvp',
    href: R.overview,
    group: 'core',
  },
  {
    slug: 'shipment-volume',
    title: 'Gönderi hacmi',
    description: 'Rota ve hizmet bazında hacim dağılımı',
    maturity: 'mvp',
    href: R.shipmentVolume,
    group: 'core',
  },
  {
    slug: 'cost-revenue',
    title: 'Maliyet & ciro',
    description: 'Gönderi başına maliyet ve kargo/ciro oranı',
    maturity: 'mvp',
    href: R.costRevenue,
    group: 'core',
  },
  {
    slug: 'carrier-performance',
    title: 'Taşıyıcı performansı',
    description: 'SLA, OTIF ve harcama karşılaştırması',
    maturity: 'mvp',
    href: R.carrierPerformance,
    group: 'core',
  },
  {
    slug: 'delivery-performance',
    title: 'Teslim performansı',
    description: 'On-time delivery ve transit P50/P85/P95',
    maturity: 'mvp',
    href: R.deliveryPerformance,
    group: 'ops',
  },
  {
    slug: 'returns',
    title: 'İadeler',
    description: 'İade oranı, nedenler ve maliyet',
    maturity: 'mvp',
    href: R.returns,
    group: 'ops',
  },
  {
    slug: 'desi-adjustments',
    title: 'Desi farkları',
    description: 'Billed weight gap ve ek ücret audit',
    maturity: 'mvp',
    href: R.desiAdjustments,
    group: 'ops',
  },
  {
    slug: 'quotes',
    title: 'Teklifler',
    description: 'Teklif hunisi ve kazanılan fiyat',
    maturity: 'mvp',
    href: R.quotes,
    group: 'ops',
  },
  {
    slug: 'integration-channels',
    title: 'Entegrasyon kanalları',
    description: 'Kanal bazında sipariş → gönderi dönüşümü',
    maturity: 'planned',
    href: R.integrationChannels,
    group: 'ops',
  },
  {
    slug: 'finance',
    title: 'Finans',
    description: 'Fatura, ödeme ve kargo fatura audit',
    maturity: 'planned',
    href: R.finance,
    group: 'finance',
  },
  {
    slug: 'saved',
    title: 'Kayıtlı görünümler',
    description: 'Kaydedilmiş filtre ve rapor kısayolları',
    maturity: 'planned',
    href: R.saved,
    group: 'workspace',
  },
]

export const REPORT_GROUP_LABELS: Record<ReportCatalogItem['group'], string> = {
  core: 'Temel analitik',
  ops: 'Operasyon',
  finance: 'Finans',
  workspace: 'Çalışma alanı',
}
