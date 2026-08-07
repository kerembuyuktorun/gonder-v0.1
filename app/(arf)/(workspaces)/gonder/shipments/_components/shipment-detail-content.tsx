'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Printer,
  Truck,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { shipmentsListRepository } from '../../_data/shipments-list-repository'
import {
  LOGISTICS_MODE_LABELS,
  SHIPMENT_DETAIL_TAB_LABELS,
  SHIPMENT_DETAIL_TABS,
  SHIPMENT_DOCUMENT_TYPE_LABELS,
  SHIPMENT_OPERATION_BADGE,
  SHIPMENT_OPERATION_LABELS,
  SHIPMENT_PACKAGE_STATUS_LABELS,
  SHIPMENT_PAYMENT_STATUS_BADGE,
  SHIPMENT_PAYMENT_STATUS_LABELS,
  SHIPMENT_SERVICE_TYPE_LABELS,
  SHIPMENT_STATUS_BADGE,
  SHIPMENT_STATUS_LABELS,
  type GonderShipmentDetail,
  type ShipmentDetailTab,
  type ShipmentDocument,
  type ShipmentTrackingEvent,
} from '../../_types/shipments'

const SHIPMENTS_KEY = ['gonder', 'shipments-list'] as const
const SHIPMENT_DETAIL_KEY = ['gonder', 'shipment-detail'] as const

function formatMoney(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function resolveTab(raw: string | null): ShipmentDetailTab {
  if (raw && (SHIPMENT_DETAIL_TABS as readonly string[]).includes(raw)) {
    return raw as ShipmentDetailTab
  }
  return 'overview'
}

function trackingDotClass(status: ShipmentTrackingEvent['status']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-500 bg-emerald-500'
    case 'active':
      return 'border-sky-500 bg-sky-500'
    case 'exception':
      return 'border-rose-500 bg-rose-500'
    default:
      return 'border-slate-300 bg-white'
  }
}

function documentStatusLabel(status: ShipmentDocument['status']) {
  if (status === 'ready') return 'Hazır'
  if (status === 'pending') return 'Beklemede'
  return 'Eksik'
}

function MetaCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <div className='mt-1 text-sm font-semibold text-foreground'>{value}</div>
    </div>
  )
}

export function ShipmentDetailContent() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const id = params.id
  const tab = resolveTab(searchParams.get('tab'))

  const setTab = useCallback(
    (next: string) => {
      const resolved = resolveTab(next)
      const qs = new URLSearchParams(searchParams.toString())
      if (resolved === 'overview') qs.delete('tab')
      else qs.set('tab', resolved)
      const query = qs.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: [...SHIPMENT_DETAIL_KEY, id],
    queryFn: () => shipmentsListRepository.getDetail(id),
    enabled: Boolean(id),
  })

  const canPickup = data?.status === 'label_ready'

  async function handleMarkPickedUp() {
    if (!data || !canPickup) return
    try {
      await shipmentsListRepository.updateStatus(data.id, 'picked_up')
      toast.success('Gönderi alındı olarak işaretlendi')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SHIPMENTS_KEY }),
        queryClient.invalidateQueries({ queryKey: [...SHIPMENT_DETAIL_KEY, id] }),
      ])
    } catch {
      toast.error('Durum güncellenemedi')
    }
  }

  function handlePrintLabel() {
    toast.success('Etiket yazdırma kuyruğa alındı')
  }

  const openIssues = useMemo(
    () => data?.issues.filter((issue) => issue.status === 'open') ?? [],
    [data?.issues]
  )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder', href: ARF_ROUTES.gonder.root },
          { label: 'Gönderiler', href: ARF_ROUTES.gonder.shipments.list },
          { label: data?.reference ?? 'Detay' },
        ]}
        searchPlaceholder='Gönder ara...'
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.gonder.shipments.list} className='gap-1.5'>
              <ArrowLeft className='size-4' />
              Listeye dön
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className='text-sm text-muted-foreground'>Yükleniyor…</p>
        ) : isError || !data ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='p-4 text-sm text-muted-foreground'>
              Gönderi bulunamadı.
            </CardContent>
          </Card>
        ) : (
          <>
            <DetailHeader
              data={data}
              canPickup={canPickup}
              onPrintLabel={handlePrintLabel}
              onMarkPickedUp={() => void handleMarkPickedUp()}
            />

            {openIssues.length > 0 ? (
              <Card className='gap-0 border-rose-200/80 bg-rose-50/40 py-0 shadow-sm'>
                <CardContent className='space-y-2 p-3'>
                  {openIssues.map((issue) => (
                    <div key={issue.id} className='flex gap-2'>
                      <AlertTriangle className='mt-0.5 size-4 shrink-0 text-rose-600' />
                      <div className='min-w-0'>
                        <p className='text-sm font-semibold text-rose-800'>{issue.title}</p>
                        <p className='text-xs text-rose-700/90'>{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <Tabs value={tab} onValueChange={setTab} className='space-y-3'>
              <TabsList className='flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border bg-muted/60 p-1'>
                {SHIPMENT_DETAIL_TABS.map((key) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className='rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm'
                  >
                    {SHIPMENT_DETAIL_TAB_LABELS[key]}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value='overview' className='mt-0 space-y-3'>
                <OverviewTab data={data} />
              </TabsContent>
              <TabsContent value='tracking' className='mt-0'>
                <TrackingTab events={data.trackingEvents} routeLabel={`${data.originCity} → ${data.destinationCity}`} />
              </TabsContent>
              <TabsContent value='packages' className='mt-0'>
                <PackagesTab data={data} />
              </TabsContent>
              <TabsContent value='documents' className='mt-0'>
                <DocumentsTab documents={data.documents} onPrintLabel={handlePrintLabel} />
              </TabsContent>
              <TabsContent value='finance' className='mt-0'>
                <FinanceTab data={data} />
              </TabsContent>
              <TabsContent value='history' className='mt-0'>
                <HistoryTab data={data} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  )
}

function DetailHeader({
  data,
  canPickup,
  onPrintLabel,
  onMarkPickedUp,
}: {
  data: GonderShipmentDetail
  canPickup: boolean
  onPrintLabel: () => void
  onMarkPickedUp: () => void
}) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='space-y-3 px-3 pt-3 pb-3'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0'>
            <CardTitle className='text-lg'>{data.reference}</CardTitle>
            <p className='mt-1 text-sm text-muted-foreground'>
              {data.originCity} → {data.destinationCity}
              <span className='mx-1.5 text-border'>·</span>
              Takip: {data.trackingNumber}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className={SHIPMENT_STATUS_BADGE[data.status]}>
              {SHIPMENT_STATUS_LABELS[data.status]}
            </Badge>
            <Badge variant='outline' className={SHIPMENT_OPERATION_BADGE[data.operationType]}>
              {SHIPMENT_OPERATION_LABELS[data.operationType]}
            </Badge>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button size='sm' variant='outline' className='gap-1.5' onClick={onPrintLabel}>
            <Printer className='size-3.5' />
            Etiket yazdır
          </Button>
          {canPickup ? (
            <Button size='sm' className='gap-1.5' onClick={onMarkPickedUp}>
              <Truck className='size-3.5' />
              Teslim al
            </Button>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  )
}

function OverviewTab({ data }: { data: GonderShipmentDetail }) {
  return (
    <div className='space-y-3'>
      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
        <MetaCell label='Taşıyıcı' value={data.carrier} />
        <MetaCell
          label='Hizmet'
          value={
            <span>
              {data.serviceLabel}
              <span className='ml-1 text-xs font-normal text-muted-foreground'>
                ({SHIPMENT_SERVICE_TYPE_LABELS[data.serviceType]})
              </span>
            </span>
          }
        />
        <MetaCell label='Rota' value={`${data.originCity} → ${data.destinationCity}`} />
        <MetaCell
          label='Operasyon'
          value={
            <span>
              {SHIPMENT_OPERATION_LABELS[data.operationType]}
              {data.logisticsMode ? (
                <span className='ml-1 text-xs font-normal text-muted-foreground'>
                  · {LOGISTICS_MODE_LABELS[data.logisticsMode]}
                </span>
              ) : null}
            </span>
          }
        />
        <MetaCell label='Parça / Desi / Kg' value={`${data.pieceCount} · ${data.desi} · ${data.weightKg}`} />
        <MetaCell label='ETA' value={data.etaLabel ?? '—'} />
        <MetaCell label='Alınma' value={formatDateTime(data.pickupAt)} />
        <MetaCell label='Teslim' value={formatDateTime(data.deliveredAt)} />
      </div>

      <Card className='gap-0 py-0 shadow-sm'>
        <CardContent className='p-3'>
          <p className='text-xs font-medium text-muted-foreground'>Operasyon özeti</p>
          <p className='mt-1 text-sm text-foreground'>{data.readinessSummary}</p>
        </CardContent>
      </Card>

      <div className='grid gap-3 lg:grid-cols-2'>
        <PartyCard title='Gönderici' party={data.sender} />
        <PartyCard title='Alıcı' party={data.receiver} />
      </div>

      <div className='grid gap-3 lg:grid-cols-2'>
        <Card className='gap-0 py-0 shadow-sm'>
          <CardHeader className='px-3 pt-3 pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <UserRound className='size-4 text-muted-foreground' />
              Sürücü
            </CardTitle>
          </CardHeader>
          <CardContent className='px-3 pb-3 text-sm'>
            {data.driver ? (
              <dl className='space-y-1.5'>
                <div className='flex justify-between gap-2'>
                  <dt className='text-muted-foreground'>Ad</dt>
                  <dd className='font-medium'>{data.driver.name}</dd>
                </div>
                <div className='flex justify-between gap-2'>
                  <dt className='text-muted-foreground'>Telefon</dt>
                  <dd className='font-medium'>{data.driver.phone ?? '—'}</dd>
                </div>
                <div className='flex justify-between gap-2'>
                  <dt className='text-muted-foreground'>Taşıyıcı kodu</dt>
                  <dd className='font-medium'>{data.driver.carrierCode ?? '—'}</dd>
                </div>
              </dl>
            ) : (
              <p className='text-muted-foreground'>Henüz sürücü atanmadı.</p>
            )}
          </CardContent>
        </Card>

        <Card className='gap-0 py-0 shadow-sm'>
          <CardHeader className='px-3 pt-3 pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Truck className='size-4 text-muted-foreground' />
              Araç
            </CardTitle>
          </CardHeader>
          <CardContent className='px-3 pb-3 text-sm'>
            {data.vehicle ? (
              <dl className='space-y-1.5'>
                <div className='flex justify-between gap-2'>
                  <dt className='text-muted-foreground'>Plaka</dt>
                  <dd className='font-medium'>{data.vehicle.plate}</dd>
                </div>
                <div className='flex justify-between gap-2'>
                  <dt className='text-muted-foreground'>Tip</dt>
                  <dd className='font-medium'>{data.vehicle.typeLabel}</dd>
                </div>
                <div className='flex justify-between gap-2'>
                  <dt className='text-muted-foreground'>Kapasite</dt>
                  <dd className='font-medium'>{data.vehicle.capacityLabel ?? '—'}</dd>
                </div>
              </dl>
            ) : (
              <p className='text-muted-foreground'>Henüz araç atanmadı.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-3 lg:grid-cols-2'>
        <Card className='gap-0 py-0 shadow-sm'>
          <CardHeader className='px-3 pt-3 pb-2'>
            <CardTitle className='text-base'>Bağlı sipariş</CardTitle>
          </CardHeader>
          <CardContent className='px-3 pb-3 text-sm'>
            {data.linkedOrder ? (
              <div className='space-y-2'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div>
                    <p className='font-semibold'>{data.linkedOrder.orderNumber}</p>
                    <p className='text-xs text-muted-foreground'>
                      {data.linkedOrder.customerName ?? '—'}
                      {data.linkedOrder.statusLabel
                        ? ` · ${data.linkedOrder.statusLabel}`
                        : null}
                    </p>
                  </div>
                  <Button size='sm' variant='outline' asChild>
                    <Link
                      href={ARF_ROUTES.gonder.orders.detail(data.linkedOrder.id)}
                      className='gap-1.5'
                    >
                      Siparişe git
                      <ExternalLink className='size-3.5' />
                    </Link>
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Ticari / entegrasyon yönetimi sipariş detayında yer alır.
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground'>Bağlı sipariş yok.</p>
            )}
          </CardContent>
        </Card>

        <Card className='gap-0 py-0 shadow-sm'>
          <CardHeader className='px-3 pt-3 pb-2'>
            <CardTitle className='text-base'>Bağlı teklif</CardTitle>
          </CardHeader>
          <CardContent className='px-3 pb-3 text-sm'>
            {data.linkedQuote ? (
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div>
                  <p className='font-semibold'>{data.linkedQuote.reference}</p>
                  <p className='text-xs text-muted-foreground'>
                    {data.linkedQuote.providerName ?? '—'}
                  </p>
                </div>
                <Button size='sm' variant='outline' asChild>
                  <Link
                    href={ARF_ROUTES.gonder.quotes.detail(data.linkedQuote.id)}
                    className='gap-1.5'
                  >
                    Teklife git
                    <ExternalLink className='size-3.5' />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className='text-muted-foreground'>Bağlı teklif yok.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PartyCard({
  title,
  party,
}: {
  title: string
  party: GonderShipmentDetail['sender']
}) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='px-3 pt-3 pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <MapPin className='size-4 text-muted-foreground' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-1 px-3 pb-3 text-sm'>
        <p className='font-semibold'>{party.name}</p>
        <p className='text-muted-foreground'>
          {party.city}
          {party.district ? `, ${party.district}` : ''}
        </p>
        {party.addressLine ? <p className='text-muted-foreground'>{party.addressLine}</p> : null}
        {party.phone ? <p className='text-muted-foreground'>{party.phone}</p> : null}
      </CardContent>
    </Card>
  )
}

function TrackingTab({
  events,
  routeLabel,
}: {
  events: ShipmentTrackingEvent[]
  routeLabel: string
}) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='px-3 pt-3 pb-2'>
        <CardTitle className='text-base'>Hareketler</CardTitle>
        <p className='text-sm text-muted-foreground'>{routeLabel}</p>
      </CardHeader>
      <CardContent className='px-3 pb-3'>
        {events.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>Takip kaydı yok</p>
        ) : (
          <ol className='relative space-y-0'>
            {events.map((event, index) => {
              const isLast = index === events.length - 1
              return (
                <li key={event.id} className='relative flex gap-4'>
                  <div className='flex w-5 flex-col items-center'>
                    <span
                      className={cn(
                        'mt-1 size-3.5 shrink-0 rounded-full border-2',
                        trackingDotClass(event.status)
                      )}
                    />
                    {!isLast ? (
                      <span
                        className={cn(
                          'mt-1 w-px flex-1',
                          event.status === 'completed' || event.status === 'active'
                            ? 'bg-border'
                            : 'bg-border/60'
                        )}
                      />
                    ) : null}
                  </div>
                  <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-5')}>
                    <div className='flex flex-wrap items-start justify-between gap-x-3 gap-y-1'>
                      <div className='min-w-0'>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            event.status === 'pending' && 'text-muted-foreground',
                            event.status === 'exception' && 'text-rose-700'
                          )}
                        >
                          {event.title}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>{event.description}</p>
                        {event.location ? (
                          <p className='mt-1 text-xs text-muted-foreground'>{event.location}</p>
                        ) : null}
                      </div>
                      <time className='shrink-0 text-[11px] tabular-nums text-muted-foreground'>
                        {formatDateTime(event.occurredAt)}
                      </time>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

function PackagesTab({ data }: { data: GonderShipmentDetail }) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='px-3 pt-3 pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Package className='size-4 text-muted-foreground' />
          Paketler
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          {data.pieceCount} parça · {data.desi} desi · {data.weightKg} kg
        </p>
      </CardHeader>
      <CardContent className='px-3 pb-3'>
        <div className='overflow-x-auto rounded-xl border border-border'>
          <table className='w-full min-w-[640px] text-left text-sm'>
            <thead className='bg-muted/50 text-xs text-muted-foreground'>
              <tr>
                <th className='px-3 py-2 font-medium'>Parça</th>
                <th className='px-3 py-2 font-medium'>Barkod</th>
                <th className='px-3 py-2 font-medium'>Desi</th>
                <th className='px-3 py-2 font-medium'>Kg</th>
                <th className='px-3 py-2 font-medium'>Ölçü (cm)</th>
                <th className='px-3 py-2 font-medium'>Durum</th>
              </tr>
            </thead>
            <tbody>
              {data.packages.map((row) => (
                <tr key={row.id} className='border-t border-border'>
                  <td className='px-3 py-2.5 font-medium'>{row.label}</td>
                  <td className='px-3 py-2.5 font-mono text-xs'>{row.barcode}</td>
                  <td className='px-3 py-2.5 tabular-nums'>{row.desi}</td>
                  <td className='px-3 py-2.5 tabular-nums'>{row.weightKg}</td>
                  <td className='px-3 py-2.5 tabular-nums text-muted-foreground'>
                    {row.lengthCm != null && row.widthCm != null && row.heightCm != null
                      ? `${row.lengthCm}×${row.widthCm}×${row.heightCm}`
                      : '—'}
                  </td>
                  <td className='px-3 py-2.5'>
                    <Badge variant='outline'>{SHIPMENT_PACKAGE_STATUS_LABELS[row.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentsTab({
  documents,
  onPrintLabel,
}: {
  documents: ShipmentDocument[]
  onPrintLabel: () => void
}) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2 px-3 pt-3 pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <FileText className='size-4 text-muted-foreground' />
          Belgeler
        </CardTitle>
        <Button size='sm' variant='outline' className='gap-1.5' onClick={onPrintLabel}>
          <Printer className='size-3.5' />
          Etiket yazdır
        </Button>
      </CardHeader>
      <CardContent className='space-y-2 px-3 pb-3'>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5'
          >
            <div className='min-w-0'>
              <p className='text-sm font-semibold'>{doc.name}</p>
              <p className='text-xs text-muted-foreground'>
                {SHIPMENT_DOCUMENT_TYPE_LABELS[doc.type]}
                {doc.createdAt ? ` · ${formatDate(doc.createdAt)}` : ''}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className={
                  doc.status === 'ready'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                    : doc.status === 'missing'
                      ? 'border-rose-500/20 bg-rose-500/10 text-rose-700'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-700'
                }
              >
                {documentStatusLabel(doc.status)}
              </Badge>
              <Button
                size='sm'
                variant='outline'
                disabled={doc.status !== 'ready'}
                onClick={() =>
                  toast.message(
                    doc.status === 'ready' ? `${doc.name} indirilecek` : 'Belge henüz hazır değil'
                  )
                }
              >
                İndir
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function FinanceTab({ data }: { data: GonderShipmentDetail }) {
  const { finance } = data
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='px-3 pt-3 pb-2'>
        <CardTitle className='text-base'>Ödeme / fatura özeti</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 px-3 pb-3'>
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          <MetaCell label='Tutar' value={formatMoney(finance.amountTry)} />
          <MetaCell
            label='Ödeme durumu'
            value={
              <Badge variant='outline' className={SHIPMENT_PAYMENT_STATUS_BADGE[finance.paymentStatus]}>
                {SHIPMENT_PAYMENT_STATUS_LABELS[finance.paymentStatus]}
              </Badge>
            }
          />
          <MetaCell label='Fatura no' value={finance.invoiceNumber ?? '—'} />
          <MetaCell label='Ödeme yöntemi' value={finance.paymentMethod ?? '—'} />
          <MetaCell label='Tahsilat' value={formatDateTime(finance.chargedAt)} />
          <MetaCell label='Güncelleme' value={formatDateTime(data.updatedAt)} />
        </div>
        {finance.note ? (
          <p className='rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground'>
            {finance.note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function HistoryTab({ data }: { data: GonderShipmentDetail }) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='px-3 pt-3 pb-2'>
        <CardTitle className='text-base'>Geçmiş</CardTitle>
      </CardHeader>
      <CardContent className='px-3 pb-3'>
        {data.history.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>Kayıt yok</p>
        ) : (
          <div className='overflow-x-auto rounded-xl border border-border'>
            <table className='w-full min-w-[560px] text-left text-sm'>
              <thead className='bg-muted/50 text-xs text-muted-foreground'>
                <tr>
                  <th className='px-3 py-2 font-medium'>İşlem</th>
                  <th className='px-3 py-2 font-medium'>Kullanıcı</th>
                  <th className='px-3 py-2 font-medium'>Detay</th>
                  <th className='px-3 py-2 font-medium'>Zaman</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((row) => (
                  <tr key={row.id} className='border-t border-border'>
                    <td className='px-3 py-2.5 font-medium'>{row.action}</td>
                    <td className='px-3 py-2.5 text-muted-foreground'>{row.actor}</td>
                    <td className='px-3 py-2.5 text-muted-foreground'>{row.detail ?? '—'}</td>
                    <td className='px-3 py-2.5 whitespace-nowrap tabular-nums text-muted-foreground'>
                      {formatDateTime(row.occurredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
