'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { AlertTriangle, CheckCircle2, Plus, RefreshCw, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { createCollection, listCollections } from '../_api/pricing-api'
import { formatCurrency, todayIso } from '../_lib/format'
import type {
  CollectionEntry,
  CollectionStatus,
  OrderPayment,
  PaymentMethod,
} from '../_types'
import {
  COLLECTION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SETTLEMENT_TYPE_LABELS,
} from '../_types'

const ALL = '__all__'

export default function CollectionsPageContent() {
  const searchParams = useSearchParams()
  const customerFilterParam = searchParams.get('customer') ?? ''

  const [payments, setPayments] = useState<OrderPayment[]>([])
  const [entries, setEntries] = useState<CollectionEntry[]>([])
  const [statusFilter, setStatusFilter] = useState<string>(ALL)
  const [customerFilter, setCustomerFilter] = useState(customerFilterParam)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formOrderId, setFormOrderId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formMethod, setFormMethod] = useState<PaymentMethod>('havale')
  const [formNote, setFormNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listCollections({
        customerId: customerFilter || undefined,
        status:
          statusFilter === ALL ? undefined : (statusFilter as CollectionStatus),
      })
      setPayments(data.payments)
      setEntries(data.entries)
    } catch {
      toast.error('Tahsilatlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [customerFilter, statusFilter])

  useEffect(() => {
    setCustomerFilter(customerFilterParam)
  }, [customerFilterParam])

  useEffect(() => {
    void load()
  }, [load])

  const kpi = useMemo(() => {
    const toCollect = payments
      .filter((p) => p.collectionStatus !== 'tahsil_edildi')
      .reduce((s, p) => s + Math.max(0, p.amountDue - p.amountPaid), 0)
    const collected = entries.reduce((s, e) => s + e.amount, 0)
    const overdue = payments
      .filter((p) => p.collectionStatus === 'gecikti')
      .reduce((s, p) => s + Math.max(0, p.amountDue - p.amountPaid), 0)
    const openOrderCount = payments.filter((p) => p.collectionStatus !== 'tahsil_edildi').length
    return { toCollect, collected, overdue, openOrderCount }
  }, [payments, entries])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans', href: ARF_ROUTES.lastmile.finance.root },
          { label: 'Tahsilatlar' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Tahsilatlar</h1>
            <p className='mt-1 text-sm text-slate-500'>
              Sipariş bazlı peşin/vadeli tahsilat takibi (yerel mock).
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button
              size='sm'
              className='bg-lime-400 text-black hover:bg-lime-300'
              onClick={() => {
                setFormCustomerId(customerFilter)
                setFormOrderId('')
                setFormAmount('')
                setFormNote('')
                setDialogOpen(true)
              }}
            >
              <Plus className='mr-1.5 size-3.5' />
              Tahsilat Ekle
            </Button>
          </div>
        </div>

        <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
          <div className='grid min-w-[720px] grid-cols-4 divide-x divide-slate-100'>
            {[
              { label: 'Tahsil edilecek', value: formatCurrency(kpi.toCollect), icon: Wallet },
              { label: 'Tahsil edilen', value: formatCurrency(kpi.collected), icon: CheckCircle2 },
              { label: 'Geciken', value: formatCurrency(kpi.overdue), icon: AlertTriangle },
              { label: 'Açık sipariş', value: String(kpi.openOrderCount), icon: Wallet },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className='px-3 py-3.5'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <p className='text-[10px] font-medium tracking-wide text-slate-400'>
                        {item.label}
                      </p>
                      <p className='mt-1.5 text-lg font-semibold tabular-nums'>{item.value}</p>
                    </div>
                    <span className='flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                      <Icon className='size-3.5' />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className='flex flex-wrap gap-3'>
          <div className='w-56 space-y-1'>
            <Label className='text-xs'>Durum</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tümü</SelectItem>
                {(Object.keys(COLLECTION_STATUS_LABELS) as CollectionStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {COLLECTION_STATUS_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='w-64 space-y-1'>
            <Label className='text-xs'>Müşteri ID</Label>
            <Input
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder='Filtrele…'
            />
          </div>
        </div>

        <Card className='rounded-2xl shadow-none'>
          <CardHeader>
            <CardTitle className='text-base'>Açık / bekleyen siparişler</CardTitle>
          </CardHeader>
          <CardContent className='overflow-x-auto p-0'>
            <table className='w-full min-w-[800px] text-left text-sm'>
              <thead className='border-b bg-slate-50 text-[11px] uppercase text-slate-500'>
                <tr>
                  <th className='px-4 py-2'>Sipariş</th>
                  <th className='px-4 py-2'>Müşteri</th>
                  <th className='px-4 py-2'>Çalışma</th>
                  <th className='px-4 py-2'>Vade</th>
                  <th className='px-4 py-2'>Borç</th>
                  <th className='px-4 py-2'>Ödenen</th>
                  <th className='px-4 py-2'>Durum</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='px-4 py-10 text-center text-slate-500'>
                      Kayıt yok
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.orderId} className='hover:bg-slate-50/60'>
                      <td className='px-4 py-2'>
                        <Link
                          href={ARF_ROUTES.lastmile.orders.detail(p.orderId)}
                          className='font-medium hover:underline'
                        >
                          {p.orderId}
                        </Link>
                      </td>
                      <td className='px-4 py-2'>
                        <div>{p.customerName || p.customerId}</div>
                        <div className='text-xs text-slate-400'>{p.customerId}</div>
                      </td>
                      <td className='px-4 py-2'>{SETTLEMENT_TYPE_LABELS[p.settlementType]}</td>
                      <td className='px-4 py-2'>{p.dueDate || '—'}</td>
                      <td className='px-4 py-2 tabular-nums'>{formatCurrency(p.amountDue)}</td>
                      <td className='px-4 py-2 tabular-nums'>{formatCurrency(p.amountPaid)}</td>
                      <td className='px-4 py-2'>
                        <Badge>{COLLECTION_STATUS_LABELS[p.collectionStatus]}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className='rounded-2xl shadow-none'>
          <CardHeader>
            <CardTitle className='text-base'>Tahsilat hareketleri</CardTitle>
          </CardHeader>
          <CardContent className='overflow-x-auto p-0'>
            <table className='w-full min-w-[720px] text-left text-sm'>
              <thead className='border-b bg-slate-50 text-[11px] uppercase text-slate-500'>
                <tr>
                  <th className='px-4 py-2'>Tarih</th>
                  <th className='px-4 py-2'>Müşteri</th>
                  <th className='px-4 py-2'>Sipariş</th>
                  <th className='px-4 py-2'>Tutar</th>
                  <th className='px-4 py-2'>Yöntem</th>
                  <th className='px-4 py-2'>Not</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-4 py-10 text-center text-slate-500'>
                      Hareket yok
                    </td>
                  </tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id}>
                      <td className='px-4 py-2'>{e.paidAt}</td>
                      <td className='px-4 py-2'>{e.customerName || e.customerId}</td>
                      <td className='px-4 py-2'>
                        {e.orderId ? (
                          <Link
                            href={ARF_ROUTES.lastmile.orders.detail(e.orderId)}
                            className='hover:underline'
                          >
                            {e.orderId}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className='px-4 py-2 tabular-nums'>{formatCurrency(e.amount)}</td>
                      <td className='px-4 py-2'>{PAYMENT_METHOD_LABELS[e.method]}</td>
                      <td className='px-4 py-2 text-slate-500'>{e.note || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tahsilat ekle</DialogTitle>
          </DialogHeader>
          <div className='space-y-3 py-2'>
            <div className='space-y-1.5'>
              <Label>Müşteri ID *</Label>
              <Input
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Müşteri adı</Label>
              <Input
                value={formCustomerName}
                onChange={(e) => setFormCustomerName(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Sipariş ID</Label>
              <Input value={formOrderId} onChange={(e) => setFormOrderId(e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>Tutar *</Label>
              <Input
                type='number'
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Yöntem</Label>
              <Select value={formMethod} onValueChange={(v) => setFormMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {PAYMENT_METHOD_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Not</Label>
              <Textarea rows={2} value={formNote} onChange={(e) => setFormNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button
              className='bg-lime-400 text-black hover:bg-lime-300'
              disabled={saving}
              onClick={async () => {
                if (!formCustomerId.trim() || !formAmount) {
                  toast.error('Müşteri ve tutar zorunlu')
                  return
                }
                setSaving(true)
                try {
                  await createCollection({
                    customerId: formCustomerId.trim(),
                    customerName: formCustomerName || undefined,
                    orderId: formOrderId || undefined,
                    amount: Number(formAmount) || 0,
                    method: formMethod,
                    paidAt: todayIso(),
                    note: formNote || undefined,
                  })
                  toast.success('Tahsilat eklendi')
                  setDialogOpen(false)
                  void load()
                } finally {
                  setSaving(false)
                }
              }}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
