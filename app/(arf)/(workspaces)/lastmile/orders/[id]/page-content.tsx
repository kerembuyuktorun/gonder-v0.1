'use client'

import Link from 'next/link'
import { use, useCallback, useEffect, useRef, useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, ChevronDown, Loader2, PackageSearch, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  cancelOrder,
  fetchOrderDetail,
  fetchOrderMovements,
  handoverOrder,
} from './_api/order-detail'
import type { OrderAuditLogItem, OrderDetail, OrderTimelineStep } from './_types/order-detail'
import { DetailHeader } from './_components/detail-header'
import { CustomerCard } from './_components/customer-card'
import { LocationSlaCard } from './_components/location-sla-card'
import { RouteCard } from './_components/route-card'
import { NotesSection } from './_components/notes-section'
import { PackagesSection } from './_components/packages-section'
import { ConstraintsSection } from './_components/constraints-section'
import { MetadataSection } from './_components/metadata-section'
import { LiveMapPanel } from './_components/live-map-panel'
import { TimelineSection } from './_components/timeline-section'
import { AuditLogSection } from './_components/audit-log-section'
import { OrderFinanceSection } from './_components/order-finance-section'
import { enrichTimelineActors } from './_lib/order-detail-helpers'

type PageContentProps = {
  params: Promise<{ id: string }>
}

type LoadState = 'loading' | 'ready' | 'error' | 'not_found'

export default function OrderDetailPageContent({ params }: PageContentProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('packages')
  const [movements, setMovements] = useState<OrderAuditLogItem[]>([])
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [movementsLoaded, setMovementsLoaded] = useState(false)
  const [actionPending, setActionPending] = useState(false)
  const movementsRequestRef = useRef<string | null>(null)

  const loadDetail = useCallback(async () => {
    setLoadState('loading')
    setErrorMessage(null)
    setMovementsLoaded(false)
    setMovements([])
    movementsRequestRef.current = null

    const result = await fetchOrderDetail(id)
    if (!result.success) {
      const notFound =
        /bulunamadı|not found|404/i.test(result.error) || result.error.includes('404')
      setOrder(null)
      setErrorMessage(result.error)
      setLoadState(notFound ? 'not_found' : 'error')
      return
    }

    setOrder(result.data)
    setLoadState('ready')
  }, [id])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const refreshDetailQuiet = useCallback(async () => {
    const result = await fetchOrderDetail(id)
    if (result.success) setOrder(result.data)
  }, [id])

  const orderId = order?.id ?? null

  useEffect(() => {
    if ((activeTab !== 'audit' && activeTab !== 'timeline') || !orderId) return
    if (movementsRequestRef.current === orderId) return

    movementsRequestRef.current = orderId
    setMovementsLoading(true)

    void fetchOrderMovements(orderId).then((result) => {
      setMovementsLoading(false)
      setMovementsLoaded(true)
      if (!result.success) {
        movementsRequestRef.current = null
        toast.error(result.error || 'Hareketler yüklenemedi')
        return
      }
      setMovements(result.data.items)
    })
  }, [activeTab, orderId])

  const timelineSteps: OrderTimelineStep[] = order
    ? enrichTimelineActors(order.timeline, {
        olusturan: order.olusturan,
        kuryeAdi: order.rota.kurye_adi || order.atanan_kurye,
        movements,
      })
    : []

  const handleCancel = async () => {
    if (!order || actionPending) return
    setActionPending(true)
    const result = await cancelOrder(order.id)
    setActionPending(false)

    if (!result.success) {
      toast.error(result.error || 'İptal başarısız')
      return
    }

    toast.success('Sipariş iptal edildi')
    await loadDetail()
  }

  const handleHandover = async () => {
    if (!order || actionPending) return
    setActionPending(true)
    const result = await handoverOrder(order.id)
    setActionPending(false)

    if (!result.success) {
      if (result.code === 'HANDOVER_NOT_ALLOWED') {
        toast.error('Devretme yalnızca transfer siparişlerinde mümkün.')
      } else {
        toast.error(result.error || 'Devretme başarısız')
      }
      return
    }

    toast.success('Devretme tamamlandı')
    await loadDetail()
  }

  if (loadState === 'loading') {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Sipariş Yönetimi', href: ARF_ROUTES.lastmile.orders.list },
            { label: 'Yükleniyor…' },
          ]}
        />
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-slate-50 p-8">
          <Loader2 className="size-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Sipariş detayı yükleniyor…</p>
        </div>
      </>
    )
  }

  if (loadState === 'error' || loadState === 'not_found' || !order) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Sipariş Yönetimi', href: ARF_ROUTES.lastmile.orders.list },
            { label: loadState === 'not_found' ? 'Bulunamadı' : 'Hata' },
          ]}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4 bg-slate-50 p-4 pt-3 lg:px-6">
          <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <PackageSearch className="size-10 text-slate-400" />
              <h1 className="text-xl font-semibold tracking-tight">
                {loadState === 'not_found' ? 'Sipariş bulunamadı' : 'Detay yüklenemedi'}
              </h1>
              <p className="max-w-md text-sm text-slate-500">
                {errorMessage || (
                  <>
                    <span className="font-medium text-slate-700">{id}</span> için kayıt yok veya
                    erişim dışı.
                  </>
                )}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <Button type="button" variant="outline" className="gap-1.5" onClick={() => void loadDetail()}>
                  <RefreshCw className="size-3.5" />
                  Yeniden dene
                </Button>
                <Button asChild className="gap-1.5">
                  <Link href={ARF_ROUTES.lastmile.orders.list}>
                    <ArrowLeft className="size-3.5" />
                    Listeye dön
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Sipariş Yönetimi', href: ARF_ROUTES.lastmile.orders.list },
          { label: order.takip_no },
        ]}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-5 bg-slate-50/80 p-4 pb-10 pt-3 lg:px-6">
        <DetailHeader
          order={order}
          onCancel={() => void handleCancel()}
          onHandover={() => void handleHandover()}
          actionPending={actionPending}
        />

        <Card className="overflow-hidden rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between px-5 py-4 lg:px-6">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Sipariş Özeti
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-600"
              onClick={() => setSummaryOpen((open) => !open)}
              aria-expanded={summaryOpen}
              aria-controls="order-summary-panel"
            >
              {summaryOpen ? 'Gizle' : 'Göster'}
              <ChevronDown
                className={`size-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          {summaryOpen ? (
            <CardContent id="order-summary-panel" className="border-t border-slate-100 p-0">
              <div className="grid divide-y divide-slate-100 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                <CustomerCard customer={order.musteri_detay} />
                <LocationSlaCard alis={order.alis} varis={order.varis} />
                <RouteCard order={order} />
              </div>
              <ConstraintsSection order={order} />
            </CardContent>
          ) : null}
        </Card>

        <Card className="rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_32px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5 lg:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-5 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200/70 bg-slate-100/70 p-1">
                <TabsTrigger value="packages">Paket Bilgileri</TabsTrigger>
                <TabsTrigger value="finance">Ücret & Tahsilat</TabsTrigger>
                <TabsTrigger value="map">Harita Bilgisi</TabsTrigger>
                <TabsTrigger value="timeline">Çizelge</TabsTrigger>
                <TabsTrigger value="notes">Notlar</TabsTrigger>
                <TabsTrigger value="audit">Hareketler</TabsTrigger>
                <TabsTrigger value="metadata">Diğer</TabsTrigger>
              </TabsList>

              <TabsContent value="packages" className="mt-0">
                <PackagesSection paketler={order.paketler} />
              </TabsContent>

              <TabsContent value="finance" className="mt-0">
                <OrderFinanceSection
                  orderId={order.id}
                  customerId={order.musteri_id ?? undefined}
                  customerName={order.musteri_detay?.unvan || order.musteri}
                />
              </TabsContent>

              <TabsContent value="map" className="mt-0">
                <LiveMapPanel
                  order={order}
                  active={activeTab === 'map'}
                  onOrderPatch={(updater) => {
                    setOrder((prev) => (prev ? updater(prev) : prev))
                  }}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                {activeTab === 'timeline' && movementsLoading && !movementsLoaded ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                    <Loader2 className="size-4 animate-spin" />
                    Çizelge yükleniyor…
                  </div>
                ) : (
                  <TimelineSection steps={timelineSteps} />
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <NotesSection
                  orderId={order.id}
                  kuryeNotu={order.kurye_notu}
                  legacyInternalNote={order.ic_not}
                  onCourierNoteCreated={() => void refreshDetailQuiet()}
                />
              </TabsContent>

              <TabsContent value="audit" className="mt-0">
                {movementsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                    <Loader2 className="size-4 animate-spin" />
                    Hareketler yükleniyor…
                  </div>
                ) : (
                  <AuditLogSection items={movements} />
                )}
              </TabsContent>

              <TabsContent value="metadata" className="mt-0">
                <MetadataSection order={order} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
