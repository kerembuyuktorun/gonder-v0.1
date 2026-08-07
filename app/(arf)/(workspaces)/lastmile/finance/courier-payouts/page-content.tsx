'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { createCourierPayout, listCourierPayouts } from '../_api/courier-cost-api'
import { formatCurrency, formatNumber, todayIso } from '../_lib/format'
import type {
  CourierPayoutLedger,
  CourierPayoutsKpi,
  PayoutEntry,
  PayoutMethod,
  PayoutStatus,
} from '../_types'
import { PAYOUT_METHOD_LABELS, PAYOUT_STATUS_LABELS } from '../_types'

const EMPTY_KPI: CourierPayoutsKpi = {
  toPay: 0,
  paid: 0,
  overdue: 0,
  openLedgerCount: 0,
}

const KPI_ITEMS: Array<{
  key: keyof CourierPayoutsKpi
  label: string
  money?: boolean
  icon: LucideIcon
}> = [
  { key: 'toPay', label: 'Ödenecek', money: true, icon: Wallet },
  { key: 'paid', label: 'Ödenen', money: true, icon: CheckCircle2 },
  { key: 'overdue', label: 'Geciken', money: true, icon: AlertTriangle },
  { key: 'openLedgerCount', label: 'Açık Hakediş', icon: Wallet },
]

export default function CourierPayoutsPageContent() {
  const searchParams = useSearchParams()
  const courierFilter = searchParams.get('courier') ?? undefined

  const [ledgers, setLedgers] = useState<CourierPayoutLedger[]>([])
  const [entries, setEntries] = useState<PayoutEntry[]>([])
  const [kpi, setKpi] = useState<CourierPayoutsKpi>(EMPTY_KPI)
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLedger, setSelectedLedger] = useState<CourierPayoutLedger | null>(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PayoutMethod>('havale')
  const [paidAt, setPaidAt] = useState(todayIso())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listCourierPayouts({
        courierId: courierFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setLedgers(data.ledgers)
      setEntries(data.entries)
      setKpi(data.kpi)
    } catch {
      toast.error('Hakedişler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [courierFilter, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const openPayDialog = (ledger: CourierPayoutLedger) => {
    setSelectedLedger(ledger)
    setAmount(String(Math.max(0, ledger.amountDue - ledger.amountPaid)))
    setMethod('havale')
    setPaidAt(todayIso())
    setNote('')
    setDialogOpen(true)
  }

  const submitPayout = async () => {
    if (!selectedLedger) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Geçerli bir tutar girin')
      return
    }
    setSaving(true)
    try {
      await createCourierPayout({
        courierId: selectedLedger.courierId,
        courierName: selectedLedger.courierName,
        ledgerId: selectedLedger.id,
        amount: value,
        method,
        paidAt,
        note: note.trim() || undefined,
      })
      toast.success('Ödeme kaydedildi')
      setDialogOpen(false)
      void load()
    } catch {
      toast.error('Ödeme kaydı başarısız')
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = useMemo(
    () => (status: PayoutStatus) => {
      const variant =
        status === 'odendi'
          ? 'default'
          : status === 'gecikti'
            ? 'destructive'
            : status === 'kismi'
              ? 'secondary'
              : 'outline'
      return <Badge variant={variant}>{PAYOUT_STATUS_LABELS[status]}</Badge>
    },
    []
  )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans', href: ARF_ROUTES.lastmile.finance.courierPayouts.list },
          { label: 'Kurye Ödemeleri / Hakediş' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>
              Kurye Ödemeleri / Hakediş
            </h1>
            <p className='mt-1 text-sm text-slate-500'>
              Kurye hakedişlerini takip edin ve ödeme kaydı oluşturun.
            </p>
          </div>
          <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
          <div className='grid min-w-[720px] grid-cols-4 divide-x divide-slate-100'>
            {KPI_ITEMS.map((item) => {
              const Icon = item.icon
              const raw = kpi[item.key]
              const display = item.money
                ? formatCurrency(Number(raw))
                : formatNumber(Number(raw))
              return (
                <div key={item.key} className='min-w-0 px-3 py-3.5'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='truncate text-[10px] font-medium tracking-wide text-slate-400'>
                        {item.label}
                      </p>
                      <p className='mt-1.5 truncate text-lg font-semibold tabular-nums leading-none tracking-tight text-slate-900'>
                        {display}
                      </p>
                    </div>
                    <span className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                      <Icon className='size-3.5' />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as PayoutStatus | 'all')}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Durum' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tüm durumlar</SelectItem>
              {(Object.keys(PAYOUT_STATUS_LABELS) as PayoutStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {PAYOUT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {courierFilter ? (
            <Badge variant='secondary'>Kurye filtresi: {courierFilter}</Badge>
          ) : null}
        </div>

        {loading && ledgers.length === 0 ? (
          <div className='rounded-2xl border bg-white px-6 py-16 text-center text-sm text-slate-500'>
            Yükleniyor…
          </div>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white'>
            <table className='w-full min-w-[900px] text-left text-sm'>
              <thead className='border-b bg-slate-50/80 text-[11px] font-medium uppercase tracking-wide text-slate-500'>
                <tr>
                  <th className='px-4 py-3'>Kurye</th>
                  <th className='px-4 py-3'>Vade</th>
                  <th className='px-4 py-3'>Durum</th>
                  <th className='px-4 py-3'>Tutar</th>
                  <th className='px-4 py-3'>Ödenen</th>
                  <th className='px-4 py-3'>Kalan</th>
                  <th className='px-4 py-3 text-right'>Aksiyon</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {ledgers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='px-4 py-12 text-center text-slate-500'>
                      Hakediş kaydı yok
                    </td>
                  </tr>
                ) : (
                  ledgers.map((ledger) => {
                    const remaining = Math.max(0, ledger.amountDue - ledger.amountPaid)
                    return (
                      <tr key={ledger.id} className='hover:bg-slate-50/60'>
                        <td className='px-4 py-3'>
                          <p className='font-medium text-slate-900'>
                            {ledger.courierName || ledger.courierId}
                          </p>
                          {ledger.note ? (
                            <p className='text-xs text-slate-500'>{ledger.note}</p>
                          ) : null}
                        </td>
                        <td className='px-4 py-3 text-xs text-slate-600'>
                          {ledger.dueDate || '—'}
                        </td>
                        <td className='px-4 py-3'>{statusBadge(ledger.payoutStatus)}</td>
                        <td className='px-4 py-3 tabular-nums'>
                          {formatCurrency(ledger.amountDue)}
                        </td>
                        <td className='px-4 py-3 tabular-nums'>
                          {formatCurrency(ledger.amountPaid)}
                        </td>
                        <td className='px-4 py-3 tabular-nums font-medium'>
                          {formatCurrency(remaining)}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {remaining > 0 ? (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => openPayDialog(ledger)}
                            >
                              Ödeme kaydet
                            </Button>
                          ) : (
                            <span className='text-xs text-slate-400'>Tamam</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {entries.length > 0 ? (
          <div className='space-y-2'>
            <h2 className='text-sm font-semibold text-slate-800'>Son ödemeler</h2>
            <div className='overflow-hidden rounded-2xl border bg-white'>
              <table className='w-full min-w-[640px] text-left text-sm'>
                <thead className='border-b bg-slate-50 text-xs text-slate-500'>
                  <tr>
                    <th className='px-4 py-2'>Tarih</th>
                    <th className='px-4 py-2'>Kurye</th>
                    <th className='px-4 py-2'>Yöntem</th>
                    <th className='px-4 py-2'>Tutar</th>
                    <th className='px-4 py-2'>Not</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {entries.slice(0, 10).map((e) => (
                    <tr key={e.id}>
                      <td className='px-4 py-2 text-xs'>{e.paidAt}</td>
                      <td className='px-4 py-2'>{e.courierName || e.courierId}</td>
                      <td className='px-4 py-2'>{PAYOUT_METHOD_LABELS[e.method]}</td>
                      <td className='px-4 py-2 tabular-nums'>{formatCurrency(e.amount)}</td>
                      <td className='px-4 py-2 text-xs text-slate-500'>{e.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme kaydet</DialogTitle>
          </DialogHeader>
          <div className='grid gap-3'>
            <p className='text-sm text-slate-600'>
              {selectedLedger?.courierName || selectedLedger?.courierId}
            </p>
            <div className='space-y-1.5'>
              <Label>Tutar (₺)</Label>
              <Input
                type='number'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Yöntem</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PayoutMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAYOUT_METHOD_LABELS) as PayoutMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {PAYOUT_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Ödeme tarihi</Label>
              <Input type='date' value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
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
              onClick={() => void submitPayout()}
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
