'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, Loader2, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { withLastmileDemo } from '../../_lib/lastmile-demo-mode'
import {
  decideCancelRequest,
  listCancelRequests,
} from '../_mock/order-ops-store'
import type { CancelRequest, CancelRequestStatus } from '../_types/order-ops'

const STATUS_LABEL: Record<CancelRequestStatus, string> = {
  pending: 'Bekleyen',
  approved: 'Onaylanan',
  rejected: 'Reddedilen',
}

const STATUS_CLASS: Record<CancelRequestStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
}

type Filter = 'all' | CancelRequestStatus

function formatWhen(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CancelRequestsPageContent() {
  const [rows, setRows] = useState<CancelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const items = await listCancelRequests()
      setRows(items)
    } catch {
      toast.error('İptal talepleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  )

  const decide = async (id: string, decision: 'approved' | 'rejected') => {
    setBusyId(id)
    try {
      const updated = await decideCancelRequest(id, decision)
      if (!updated) {
        toast.error('Talep bulunamadı')
        return
      }
      toast.success(decision === 'approved' ? 'İptal onaylandı' : 'Talep reddedildi')
      await load()
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Sipariş Yönetimi', href: ARF_ROUTES.lastmile.orders.list },
          { label: 'İptal Talepleri' },
        ]}
      />

      <div className='flex min-w-0 flex-1 flex-col gap-4 bg-slate-50 p-4 pt-3 lg:px-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-xl font-semibold tracking-tight text-slate-900'>
              İptal Talepleri
            </h1>
            <p className='mt-1 text-sm text-slate-500'>
              Planlandı / yolda siparişler için admin onay kuyruğu (mock).
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <SelectTrigger className='w-[160px] bg-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pending'>Bekleyen</SelectItem>
                <SelectItem value='approved'>Onaylanan</SelectItem>
                <SelectItem value='rejected'>Reddedilen</SelectItem>
                <SelectItem value='all'>Tümü</SelectItem>
              </SelectContent>
            </Select>
            <Button type='button' variant='outline' size='sm' onClick={() => void load()}>
              <RefreshCw className='mr-1.5 size-3.5' />
              Yenile
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          {loading ? (
            <div className='flex items-center justify-center gap-2 py-16 text-sm text-slate-500'>
              <Loader2 className='size-4 animate-spin' />
              Yükleniyor…
            </div>
          ) : visible.length === 0 ? (
            <p className='py-16 text-center text-sm text-slate-500'>Kayıt yok</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[720px] text-left text-sm'>
                <thead className='border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th className='px-4 py-3 font-semibold'>Sipariş</th>
                    <th className='px-4 py-3 font-semibold'>Müşteri</th>
                    <th className='px-4 py-3 font-semibold'>Neden</th>
                    <th className='px-4 py-3 font-semibold'>Talep</th>
                    <th className='px-4 py-3 font-semibold'>Durum</th>
                    <th className='px-4 py-3 font-semibold'>İşlem</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {visible.map((row) => (
                    <tr key={row.id} className='hover:bg-slate-50/80'>
                      <td className='px-4 py-3'>
                        <Link
                          href={withLastmileDemo(
                            ARF_ROUTES.lastmile.orders.detail(row.orderId),
                            true
                          )}
                          className='font-mono font-medium text-sky-700 hover:underline'
                        >
                          {row.orderTakipNo ?? row.orderId}
                        </Link>
                      </td>
                      <td className='px-4 py-3 text-slate-700'>{row.customerName ?? '—'}</td>
                      <td className='px-4 py-3'>
                        <p className='text-slate-800'>{row.reasonLabel}</p>
                        {row.note ? (
                          <p className='text-xs text-slate-500'>{row.note}</p>
                        ) : null}
                      </td>
                      <td className='px-4 py-3 text-slate-600'>
                        <p>{row.requestedBy}</p>
                        <p className='text-xs'>{formatWhen(row.requestedAt)}</p>
                      </td>
                      <td className='px-4 py-3'>
                        <Badge variant='outline' className={STATUS_CLASS[row.status]}>
                          {STATUS_LABEL[row.status]}
                        </Badge>
                        {row.decidedBy ? (
                          <p className='mt-1 text-xs text-slate-500'>
                            {row.decidedBy}
                            {row.decidedAt ? ` · ${formatWhen(row.decidedAt)}` : ''}
                          </p>
                        ) : null}
                      </td>
                      <td className='px-4 py-3'>
                        {row.status === 'pending' ? (
                          <div className='flex flex-wrap gap-1.5'>
                            <Button
                              type='button'
                              size='sm'
                              className='bg-emerald-600 text-white hover:bg-emerald-700'
                              disabled={busyId === row.id}
                              onClick={() => void decide(row.id, 'approved')}
                            >
                              <Check className='mr-1 size-3.5' />
                              Onayla
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              className='text-rose-700'
                              disabled={busyId === row.id}
                              onClick={() => void decide(row.id, 'rejected')}
                            >
                              <X className='mr-1 size-3.5' />
                              Reddet
                            </Button>
                          </div>
                        ) : (
                          <span className='text-xs text-slate-400'>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
