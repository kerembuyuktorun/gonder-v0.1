'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ExternalLink,
  Info,
  PackagePlus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { getOrderChannelById } from '../../_data/order-channels'
import { startCargoQuoteFromOrderIds } from '../../_lib/start-cargo-from-orders'
import { ordersRepository } from '../../_data/orders-repository'
import { ORDERS_KEY, useOrder } from '../../_hooks/use-orders'
import { tRowAction } from '../../_i18n/row-actions'
import {
  ORDER_CHANNEL_LABELS,
  ORDER_DETAIL_TAB_LABELS,
  ORDER_DETAIL_TABS,
  ORDER_PAYMENT_METHOD_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_QUALITY_SEVERITY_LABELS,
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABELS,
  type GonderOrderDetail,
  type OrderAddress,
  type OrderDetailTab,
  type OrderStatus,
} from '../../_types/orders'

type Props = {
  orderId: string
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function parseTab(value: string | null): OrderDetailTab {
  if (value && (ORDER_DETAIL_TABS as string[]).includes(value)) {
    return value as OrderDetailTab
  }
  return 'overview'
}

function canApproveOrder(status: OrderStatus) {
  return status === 'pending_review'
}

function canCreateShipment(status: OrderStatus) {
  return (
    status === 'approved' || status === 'ready_for_shipment' || status === 'payment_pending'
  )
}

function shipmentReadiness(order: GonderOrderDetail) {
  const blockingErrors = order.dataQualityIssues.filter((issue) => issue.severity === 'error')
  if (order.shipmentId) {
    return {
      label: 'Gönderiye dönüştürüldü',
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
      detail: `Bağlı gönderi: ${order.shipmentId}`,
    }
  }
  if (blockingErrors.length > 0) {
    return {
      label: 'Gönderiye hazır değil',
      tone: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
      detail: `${blockingErrors.length} engelleyici veri kalitesi sorunu var`,
    }
  }
  if (canCreateShipment(order.status)) {
    return {
      label: 'Gönderiye hazır',
      tone: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
      detail: 'Sipariş gönderiye dönüştürülebilir',
    }
  }
  if (order.status === 'pending_review') {
    return {
      label: 'Onay bekliyor',
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
      detail: 'Onaylandıktan sonra gönderi oluşturulabilir',
    }
  }
  if (order.status === 'needs_information' || order.status === 'integration_error') {
    return {
      label: 'Eksik / hatalı veri',
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
      detail: 'Entegrasyon veya müşteri bilgileri tamamlanmalı',
    }
  }
  return {
    label: 'Gönderi oluşturulamaz',
    tone: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
    detail: `Mevcut durum: ${ORDER_STATUS_LABELS[order.status]}`,
  }
}

function formatAddress(address: OrderAddress) {
  return [
    address.line1,
    address.line2,
    [address.district, address.city].filter(Boolean).join(' / '),
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ')
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='text-sm font-medium sm:text-right'>{value}</dd>
    </div>
  )
}

function AddressCard({ title, address }: { title: string; address: OrderAddress }) {
  return (
    <Card className='gap-0 py-0 shadow-sm'>
      <CardHeader className='px-3 pt-3 pb-2'>
        <CardTitle className='text-sm'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-1 px-3 pb-3 text-sm'>
        <p className='font-medium'>{address.fullName}</p>
        {address.phone ? <p className='text-muted-foreground'>{address.phone}</p> : null}
        <p className='text-muted-foreground'>{formatAddress(address)}</p>
      </CardContent>
    </Card>
  )
}

export function OrderDetailContent({ orderId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useOrder(orderId)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const tab = parseTab(searchParams.get('tab'))
  const channel = data ? getOrderChannelById(data.channelId) : null
  const readiness = data ? shipmentReadiness(data) : null

  const setTab = useCallback(
    (next: string) => {
      const value = parseTab(next)
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'overview') params.delete('tab')
      else params.set('tab', value)
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  async function invalidateOrders() {
    await queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
  }

  async function updateStatus(status: OrderStatus, message: string) {
    if (!data || pending) return
    setPending(true)
    try {
      await ordersRepository.updateStatus(data.id, status)
      toast.success(message)
      await invalidateOrders()
    } catch {
      toast.error('Sipariş güncellenemedi')
    } finally {
      setPending(false)
    }
  }

  async function createShipment() {
    if (!data) return
    const started = await startCargoQuoteFromOrderIds([data.id], (href) => router.push(href))
    if (started) await invalidateOrders()
  }

  const lineTotal = useMemo(
    () => data?.lineItems.reduce((sum, item) => sum + item.totalTry, 0) ?? 0,
    [data]
  )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Siparişler', href: ARF_ROUTES.gonder.orders.list },
          { label: data?.orderNumber ?? 'Detay' },
        ]}
        searchPlaceholder='Gönder ara...'
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.gonder.orders.list} className='gap-1.5'>
              <ArrowLeft className='size-4' />
              Listeye dön
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className='text-sm text-muted-foreground'>Yükleniyor…</p>
        ) : isError || !data || !readiness ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='p-4 text-sm text-muted-foreground'>
              Sipariş bulunamadı.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className='gap-0 py-0 shadow-sm'>
              <CardHeader className='space-y-3 px-3 pt-3 pb-3'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0 space-y-1.5'>
                    <CardTitle className='truncate text-lg'>{data.orderNumber}</CardTitle>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='secondary' className='max-w-full truncate'>
                        {ORDER_CHANNEL_LABELS[data.channel]}
                        {channel?.storeName ? ` · ${channel.storeName}` : ''}
                      </Badge>
                      <Badge variant='outline' className={ORDER_STATUS_BADGE[data.status]}>
                        {ORDER_STATUS_LABELS[data.status]}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      <span className='break-words'>
                        {data.customerName} · {data.originCity} → {data.destinationCity}
                      </span>
                    </p>
                  </div>

                  <div className='flex w-full flex-wrap gap-1.5 sm:w-auto sm:justify-end'>
                    {canApproveOrder(data.status) ? (
                      <>
                        <Button
                          size='sm'
                          className='gap-1'
                          disabled={pending}
                          onClick={() => void updateStatus('approved', 'Sipariş onaylandı')}
                        >
                          <Check className='size-3.5' />
                          {tRowAction('orders.approve')}
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='gap-1 text-rose-700'
                          disabled={pending}
                          onClick={() => setRejectOpen(true)}
                        >
                          <X className='size-3.5' />
                          {tRowAction('orders.reject')}
                        </Button>
                      </>
                    ) : null}
                    {canCreateShipment(data.status) ? (
                      <Button
                        size='sm'
                        className='gap-1'
                        disabled={pending}
                        onClick={createShipment}
                      >
                        <PackagePlus className='size-3.5' />
                        <span className='sm:hidden'>
                          {tRowAction('orders.createShipmentShort')}
                        </span>
                        <span className='hidden sm:inline'>
                          {tRowAction('orders.createShipment')}
                        </span>
                      </Button>
                    ) : null}
                    {data.shipmentId ? (
                      <Button size='sm' variant='outline' className='gap-1' asChild>
                        <Link href={ARF_ROUTES.gonder.shipments.detail(data.shipmentId)}>
                          <ExternalLink className='size-3.5' />
                          {tRowAction('orders.openShipment')}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs value={tab} onValueChange={setTab} className='gap-3'>
              <div className='-mx-1 overflow-x-auto overscroll-x-contain'>
                <TabsList className='inline-flex h-auto w-max min-w-full justify-start gap-1 rounded-xl border border-border bg-muted/60 p-1'>
                  {ORDER_DETAIL_TABS.map((id) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className='shrink-0 rounded-lg px-3 py-1.5 text-xs sm:text-sm'
                    >
                      {ORDER_DETAIL_TAB_LABELS[id]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value='overview' className='space-y-3'>
                <div className='grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4'>
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardContent className='space-y-1 p-3'>
                      <p className='text-xs text-muted-foreground'>Tutar</p>
                      <p className='text-lg font-semibold tabular-nums'>
                        {formatMoney(data.amountTry)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardContent className='space-y-1 p-3'>
                      <p className='text-xs text-muted-foreground'>Parça</p>
                      <p className='text-lg font-semibold tabular-nums'>{data.pieceCount}</p>
                    </CardContent>
                  </Card>
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardContent className='space-y-1 p-3'>
                      <p className='text-xs text-muted-foreground'>Rota</p>
                      <p className='text-sm font-semibold'>
                        {data.originCity} → {data.destinationCity}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardContent className='space-y-1 p-3'>
                      <p className='text-xs text-muted-foreground'>Ödeme</p>
                      <p className='text-sm font-semibold'>
                        {ORDER_PAYMENT_STATUS_LABELS[data.paymentStatus]}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {ORDER_PAYMENT_METHOD_LABELS[data.paymentMethod]}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className='grid gap-2.5 lg:grid-cols-2'>
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardHeader className='px-3 pt-3 pb-2'>
                      <CardTitle className='text-sm'>Gönderiye hazırlık</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2 px-3 pb-3'>
                      <Badge variant='outline' className={readiness.tone}>
                        {readiness.label}
                      </Badge>
                      <p className='text-sm text-muted-foreground'>{readiness.detail}</p>
                      {canCreateShipment(data.status) && !data.shipmentId ? (
                        <Button size='sm' className='gap-1' onClick={createShipment}>
                          <PackagePlus className='size-3.5' />
                          {tRowAction('orders.createShipment')}
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardHeader className='px-3 pt-3 pb-2'>
                      <CardTitle className='text-sm'>Bağlı gönderi</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2 px-3 pb-3'>
                      {data.shipmentId ? (
                        <>
                          <p className='text-sm'>
                            Bu sipariş gönderiye dönüştürüldü:{' '}
                            <span className='font-medium'>{data.shipmentId}</span>
                          </p>
                          <Button size='sm' variant='outline' className='gap-1' asChild>
                            <Link href={ARF_ROUTES.gonder.shipments.detail(data.shipmentId)}>
                              <ExternalLink className='size-3.5' />
                              Gönderiyi aç
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <p className='text-sm text-muted-foreground'>
                          Henüz bağlı bir gönderi yok. Bu ekran ticari sipariş odaklıdır; kargo
                          takibi gönderi detayında yer alır.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {data.dataQualityIssues.length > 0 ? (
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardHeader className='px-3 pt-3 pb-2'>
                      <CardTitle className='text-sm'>Veri kalitesi</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2 px-3 pb-3'>
                      {data.dataQualityIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className='flex items-start gap-2 rounded-md border px-2.5 py-2 text-sm'
                        >
                          {issue.severity === 'error' ? (
                            <AlertTriangle className='mt-0.5 size-4 shrink-0 text-rose-600' />
                          ) : (
                            <Info className='mt-0.5 size-4 shrink-0 text-amber-600' />
                          )}
                          <div className='min-w-0'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <Badge variant='outline'>
                                {ORDER_QUALITY_SEVERITY_LABELS[issue.severity]}
                              </Badge>
                              {issue.field ? (
                                <span className='text-xs text-muted-foreground'>{issue.field}</span>
                              ) : null}
                            </div>
                            <p className='mt-1'>{issue.message}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}

                <Card className='gap-0 py-0 shadow-sm'>
                  <CardHeader className='px-3 pt-3 pb-2'>
                    <CardTitle className='text-sm'>Sipariş özeti</CardTitle>
                  </CardHeader>
                  <CardContent className='px-3 pb-3'>
                    <dl className='space-y-2'>
                      <MetaRow label='Oluşturulma' value={formatDateTime(data.createdAt)} />
                      <MetaRow label='Dış sipariş no' value={data.externalOrderId} />
                      <MetaRow
                        label='Kalem sayısı'
                        value={`${data.lineItems.length} kalem · ${formatMoney(lineTotal)}`}
                      />
                      {data.notes ? <MetaRow label='Not' value={data.notes} /> : null}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='items'>
                <Card className='gap-0 py-0 shadow-sm'>
                  <CardHeader className='px-3 pt-3 pb-2'>
                    <CardTitle className='text-sm'>Sipariş kalemleri</CardTitle>
                  </CardHeader>
                  <CardContent className='px-0 pb-0'>
                    <div className='overflow-x-auto'>
                      <table className='w-full min-w-[560px] text-sm'>
                        <thead className='border-y bg-muted/40 text-left text-xs text-muted-foreground'>
                          <tr>
                            <th className='px-3 py-2 font-medium'>SKU</th>
                            <th className='px-3 py-2 font-medium'>Ürün</th>
                            <th className='px-3 py-2 font-medium'>Adet</th>
                            <th className='px-3 py-2 font-medium'>Birim</th>
                            <th className='px-3 py-2 font-medium'>Toplam</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.lineItems.map((item) => (
                            <tr key={item.id} className='border-b last:border-b-0'>
                              <td className='px-3 py-2 font-mono text-xs'>{item.sku}</td>
                              <td className='px-3 py-2'>{item.name}</td>
                              <td className='px-3 py-2 tabular-nums'>{item.quantity}</td>
                              <td className='px-3 py-2 tabular-nums'>
                                {formatMoney(item.unitPriceTry)}
                              </td>
                              <td className='px-3 py-2 font-medium tabular-nums'>
                                {formatMoney(item.totalTry)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className='border-t bg-muted/20'>
                            <td className='px-3 py-2' colSpan={4}>
                              Kalem toplamı
                            </td>
                            <td className='px-3 py-2 font-semibold tabular-nums'>
                              {formatMoney(lineTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='customer' className='space-y-3'>
                <Card className='gap-0 py-0 shadow-sm'>
                  <CardHeader className='px-3 pt-3 pb-2'>
                    <CardTitle className='text-sm'>Müşteri</CardTitle>
                  </CardHeader>
                  <CardContent className='px-3 pb-3'>
                    <dl className='space-y-2'>
                      <MetaRow label='Ad soyad' value={data.customerName} />
                      <MetaRow label='E-posta' value={data.customerEmail ?? '—'} />
                      <MetaRow label='Telefon' value={data.customerPhone ?? '—'} />
                    </dl>
                  </CardContent>
                </Card>
                <div className='grid gap-2.5 lg:grid-cols-2'>
                  <AddressCard title='Teslimat adresi' address={data.shippingAddress} />
                  <AddressCard title='Fatura adresi' address={data.billingAddress} />
                </div>
              </TabsContent>

              <TabsContent value='integration' className='space-y-3'>
                <Card className='gap-0 py-0 shadow-sm'>
                  <CardHeader className='px-3 pt-3 pb-2'>
                    <CardTitle className='text-sm'>Kanal bağlantısı</CardTitle>
                  </CardHeader>
                  <CardContent className='px-3 pb-3'>
                    <dl className='space-y-2'>
                      <MetaRow
                        label='Kanal'
                        value={ORDER_CHANNEL_LABELS[data.channel]}
                      />
                      <MetaRow
                        label='Bağlantı'
                        value={
                          channel
                            ? `${channel.name}${channel.storeName ? ` · ${channel.storeName}` : ''}`
                            : data.channelId
                        }
                      />
                      <MetaRow
                        label='Bağlantı durumu'
                        value={
                          channel ? (
                            <Badge variant={channel.isActive ? 'secondary' : 'outline'}>
                              {channel.isActive ? 'Aktif' : 'Pasif'}
                            </Badge>
                          ) : (
                            '—'
                          )
                        }
                      />
                      <MetaRow label='Dış sipariş no' value={data.externalOrderId} />
                      <MetaRow
                        label='Son senkron'
                        value={data.lastSyncedAt ? formatDateTime(data.lastSyncedAt) : '—'}
                      />
                    </dl>
                  </CardContent>
                </Card>

                {Object.keys(data.channelMetadata).length > 0 ? (
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardHeader className='px-3 pt-3 pb-2'>
                      <CardTitle className='text-sm'>Kanal meta verisi</CardTitle>
                    </CardHeader>
                    <CardContent className='px-3 pb-3'>
                      <dl className='space-y-2'>
                        {Object.entries(data.channelMetadata).map(([key, value]) => (
                          <MetaRow key={key} label={key} value={value} />
                        ))}
                      </dl>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className='gap-0 py-0 shadow-sm'>
                  <CardHeader className='px-3 pt-3 pb-2'>
                    <CardTitle className='text-sm'>Senkron / kalite sorunları</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2 px-3 pb-3'>
                    {data.dataQualityIssues.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>
                        Bilinen bir veri kalitesi sorunu yok.
                      </p>
                    ) : (
                      data.dataQualityIssues.map((issue) => (
                        <div key={issue.id} className='rounded-md border px-2.5 py-2 text-sm'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <Badge variant='outline'>
                              {ORDER_QUALITY_SEVERITY_LABELS[issue.severity]}
                            </Badge>
                            {issue.field ? (
                              <span className='font-mono text-xs text-muted-foreground'>
                                {issue.field}
                              </span>
                            ) : null}
                          </div>
                          <p className='mt-1'>{issue.message}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='history'>
                <Card className='gap-0 py-0 shadow-sm'>
                  <CardHeader className='px-3 pt-3 pb-2'>
                    <CardTitle className='text-sm'>Durum geçmişi</CardTitle>
                  </CardHeader>
                  <CardContent className='px-3 pb-3'>
                    <ol className='space-y-3'>
                      {data.history.map((item, index) => (
                        <li key={item.id} className='relative flex gap-3'>
                          <div className='flex flex-col items-center'>
                            <span className='mt-1 size-2.5 rounded-full bg-primary' />
                            {index < data.history.length - 1 ? (
                              <span className='mt-1 w-px flex-1 bg-border' />
                            ) : null}
                          </div>
                          <div className='min-w-0 pb-2'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <p className='text-sm font-medium'>{item.title}</p>
                              <span className='text-xs text-muted-foreground'>
                                {formatDateTime(item.at)}
                              </span>
                            </div>
                            {item.description ? (
                              <p className='mt-0.5 text-sm text-muted-foreground'>
                                {item.description}
                              </p>
                            ) : null}
                            {item.actor ? (
                              <p className='mt-0.5 text-xs text-muted-foreground'>
                                Aktör: {item.actor}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tRowAction('orders.rejectConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tRowAction('orders.rejectConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tRowAction('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRejectOpen(false)
                void updateStatus('rejected', 'Sipariş reddedildi')
              }}
            >
              {tRowAction('orders.rejectConfirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
