'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Banknote, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import {
  getCourierCashBalance,
  listCourierCashMovements,
  recordRemittance,
} from '../../_api/courier-cash-api'
import { formatCurrency, todayIso } from '../../_lib/format'
import type { CourierCashBalance, CourierCashMovement } from '../../_types/courier-cash'
import {
  COURIER_CASH_MOVEMENT_TYPE_LABELS,
  COURIER_CASH_SOURCE_LABELS,
} from '../../_types/courier-cash'

export default function CourierBalanceDetailPageContent() {
  const params = useParams<{ courierId: string }>()
  const courierId = decodeURIComponent(params.courierId)

  const [balance, setBalance] = useState<CourierCashBalance | null>(null)
  const [movements, setMovements] = useState<CourierCashMovement[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [occurredAt, setOccurredAt] = useState(todayIso())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [nextBalance, nextMovements] = await Promise.all([
        Promise.resolve(getCourierCashBalance(courierId)),
        Promise.resolve(listCourierCashMovements(courierId)),
      ])
      setBalance(nextBalance)
      setMovements(nextMovements)
    } catch {
      toast.error('Kurye bakiyesi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [courierId])

  useEffect(() => {
    void load()
  }, [load])

  const openRemittance = () => {
    setAmount(String(Math.max(0, balance?.netBalance ?? 0)))
    setOccurredAt(todayIso())
    setNote('')
    setDialogOpen(true)
  }

  const submitRemittance = async () => {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Geçerli bir tutar girin')
      return
    }
    if (balance && value > balance.netBalance + 0.001) {
      toast.error('Tutar net bakiyeden büyük olamaz')
      return
    }
    setSaving(true)
    try {
      recordRemittance({
        courierId,
        courierName: balance?.courierName,
        amount: value,
        occurredAt,
        note: note.trim() || null,
      })
      toast.success('Tahsilat kaydedildi')
      setDialogOpen(false)
      void load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tahsilat kaydı başarısız')
    } finally {
      setSaving(false)
    }
  }

  const title = balance?.courierName ?? courierId

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Kurye Bakiyeleri', href: ARF_ROUTES.lastmile.finance.courierBalances.list },
          { label: title },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6 pb-24'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>{title}</h1>
            <p className='mt-1 text-sm text-slate-500'>
              Nakit hareketleri ve tenant tahsilat kayıtları.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button
              size='sm'
              onClick={openRemittance}
              disabled={!balance || balance.netBalance <= 0}
            >
              <Banknote className='mr-1.5 size-3.5' />
              Tahsilat kaydet
            </Button>
          </div>
        </div>

        {loading && !balance ? (
          <p className='text-sm text-slate-500'>Yükleniyor…</p>
        ) : !balance ? (
          <div className='space-y-3'>
            <p className='text-sm text-slate-500'>Bu kurye için bakiye kaydı bulunamadı.</p>
            <Button asChild variant='outline'>
              <Link href={ARF_ROUTES.lastmile.finance.courierBalances.list}>Listeye dön</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='rounded-2xl border bg-white p-4'>
                <p className='text-xs text-slate-500'>Net bakiye</p>
                <p className='mt-1 text-xl font-semibold tabular-nums'>
                  {formatCurrency(balance.netBalance)}
                </p>
              </div>
              <div className='rounded-2xl border bg-white p-4'>
                <p className='text-xs text-slate-500'>Toplanan</p>
                <p className='mt-1 text-xl font-semibold tabular-nums'>
                  {formatCurrency(balance.collectedTotal)}
                </p>
              </div>
              <div className='rounded-2xl border bg-white p-4'>
                <p className='text-xs text-slate-500'>Teslim edilen</p>
                <p className='mt-1 text-xl font-semibold tabular-nums'>
                  {formatCurrency(balance.remittedTotal)}
                </p>
              </div>
            </div>

            <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white'>
              <table className='w-full min-w-[900px] text-left text-sm'>
                <thead className='border-b bg-slate-50/80 text-[11px] font-medium uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th className='px-4 py-3'>Tarih</th>
                    <th className='px-4 py-3'>Tip</th>
                    <th className='px-4 py-3'>Kaynak</th>
                    <th className='px-4 py-3'>Sipariş</th>
                    <th className='px-4 py-3'>Not</th>
                    <th className='px-4 py-3 text-right'>Etki</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='px-4 py-12 text-center text-slate-500'>
                        Henüz hareket yok
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                      const signed = m.type === 'collection' ? m.amount : -m.amount
                      return (
                        <tr key={m.id}>
                          <td className='px-4 py-3 text-xs text-slate-600'>
                            {new Date(m.occurredAt).toLocaleString('tr-TR')}
                          </td>
                          <td className='px-4 py-3'>
                            <Badge variant={m.type === 'collection' ? 'secondary' : 'outline'}>
                              {COURIER_CASH_MOVEMENT_TYPE_LABELS[m.type]}
                            </Badge>
                          </td>
                          <td className='px-4 py-3 text-slate-600'>
                            {COURIER_CASH_SOURCE_LABELS[m.source]}
                          </td>
                          <td className='px-4 py-3'>
                            {m.orderId ? (
                              <Link
                                className='text-sm font-medium text-slate-900 underline-offset-2 hover:underline'
                                href={ARF_ROUTES.lastmile.orders.detail(m.orderId)}
                              >
                                {m.takipNo || m.orderId}
                              </Link>
                            ) : m.takipNo ? (
                              <span className='text-slate-700'>{m.takipNo}</span>
                            ) : (
                              <span className='text-slate-400'>—</span>
                            )}
                          </td>
                          <td className='px-4 py-3 text-slate-500'>{m.note || '—'}</td>
                          <td
                            className={`px-4 py-3 text-right tabular-nums font-medium ${
                              signed >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {signed >= 0 ? '+' : ''}
                            {formatCurrency(signed)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tenant tahsilatı kaydet</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label>Tutar</Label>
              <Input
                type='number'
                min={0}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {balance ? (
                <p className='text-xs text-slate-500'>
                  Maksimum: {formatCurrency(balance.netBalance)}
                </p>
              ) : null}
            </div>
            <div className='space-y-2'>
              <Label>Tarih</Label>
              <Input
                type='date'
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>Not</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder='Opsiyonel'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)} disabled={saving}>
              Vazgeç
            </Button>
            <Button onClick={() => void submitRemittance()} disabled={saving}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
