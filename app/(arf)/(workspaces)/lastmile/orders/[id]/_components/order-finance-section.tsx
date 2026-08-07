'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import {
  createCollection,
  getOrderPricing,
} from '../../../finance/_api/pricing-api'
import { formatCurrency, todayIso } from '../../../finance/_lib/format'
import type {
  OrderPayment,
  OrderPricingSnapshot,
  PaymentMethod,
} from '../../../finance/_types'
import {
  COLLECTION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PRICING_MODE_LABELS,
  SETTLEMENT_TYPE_LABELS,
} from '../../../finance/_types'

type Props = {
  orderId: string
  customerId?: string
  customerName?: string
}

export function OrderFinanceSection({ orderId, customerId, customerName }: Props) {
  const [snapshot, setSnapshot] = useState<OrderPricingSnapshot | undefined>()
  const [payment, setPayment] = useState<OrderPayment | undefined>()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('havale')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getOrderPricing(orderId)
      setSnapshot(data?.snapshot)
      setPayment(data?.payment)
      if (data?.payment) {
        const remaining = Math.max(0, data.payment.amountDue - data.payment.amountPaid)
        setAmount(String(remaining || data.payment.amountDue))
      }
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <p className='py-8 text-sm text-slate-500'>Ücret bilgisi yükleniyor…</p>
  }

  if (!snapshot && !payment) {
    return (
      <div className='rounded-xl border border-dashed px-4 py-10 text-center text-sm text-slate-500'>
        Bu sipariş için yerel ücret kaydı yok. Yeni sipariş oluştururken Ücret & Ödeme adımından
        hesaplanan tutarlar burada görünür.
      </div>
    )
  }

  const remaining = payment ? Math.max(0, payment.amountDue - payment.amountPaid) : 0

  return (
    <div className='space-y-4'>
      {snapshot ? (
        <div className='rounded-2xl border bg-slate-50/70 p-4 text-sm'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='font-semibold text-slate-900'>Ücret özeti</h3>
            {snapshot.manualOverride ? (
              <Badge variant='secondary'>Manuel</Badge>
            ) : null}
          </div>
          <p className='mt-2 text-slate-600'>
            {snapshot.priceListName} · {snapshot.matchedRuleLabel} (
            {PRICING_MODE_LABELS[snapshot.pricingMode]})
          </p>
          <div className='mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2'>
            <p>Başlangıç: {formatCurrency(snapshot.breakdown.baseFee)}</p>
            <p>Km: {formatCurrency(snapshot.breakdown.distanceFee)}</p>
            <p>Desi: {formatCurrency(snapshot.breakdown.desiFee)}</p>
            <p>Sabit: {formatCurrency(snapshot.breakdown.flatFee)}</p>
            <p>Ara toplam: {formatCurrency(snapshot.breakdown.subtotal)}</p>
            <p>KDV: {formatCurrency(snapshot.breakdown.kdvAmount ?? 0)}</p>
          </div>
          <p className='mt-3 text-lg font-semibold'>
            Toplam: {formatCurrency(snapshot.breakdown.total)}
          </p>
        </div>
      ) : null}

      {payment ? (
        <div className='rounded-2xl border p-4 text-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h3 className='font-semibold text-slate-900'>Ödeme / tahsilat</h3>
              <p className='mt-1 text-slate-600'>
                {SETTLEMENT_TYPE_LABELS[payment.settlementType]}
                {payment.settlementType === 'vadeli'
                  ? ` · ${payment.creditDays} gün · vade ${payment.dueDate ?? '—'}`
                  : null}
              </p>
            </div>
            <Badge>{COLLECTION_STATUS_LABELS[payment.collectionStatus]}</Badge>
          </div>
          <div className='mt-3 grid gap-2 sm:grid-cols-3'>
            <p>
              <span className='text-slate-500'>Borç:</span>{' '}
              {formatCurrency(payment.amountDue)}
            </p>
            <p>
              <span className='text-slate-500'>Ödenen:</span>{' '}
              {formatCurrency(payment.amountPaid)}
            </p>
            <p>
              <span className='text-slate-500'>Kalan:</span> {formatCurrency(remaining)}
            </p>
          </div>
          {remaining > 0 ? (
            <Button
              className='mt-4 bg-lime-400 text-black hover:bg-lime-300'
              size='sm'
              onClick={() => setDialogOpen(true)}
            >
              Tahsilat kaydet
            </Button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tahsilat kaydet</DialogTitle>
          </DialogHeader>
          <div className='space-y-3 py-2'>
            <div className='space-y-1.5'>
              <Label>Tutar</Label>
              <Input type='number' value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>Yöntem</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
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
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
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
                if (!customerId) {
                  toast.error('Müşteri bilgisi eksik')
                  return
                }
                setSaving(true)
                try {
                  await createCollection({
                    customerId,
                    customerName,
                    orderId,
                    amount: Number(amount) || 0,
                    method,
                    paidAt: todayIso(),
                    note: note || undefined,
                  })
                  toast.success('Tahsilat kaydedildi')
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
    </div>
  )
}
