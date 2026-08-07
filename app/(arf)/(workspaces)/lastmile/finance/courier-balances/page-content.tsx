'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Banknote, RefreshCw, Search, Users, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  getCourierCashBalancesKpi,
  listCourierCashBalances,
} from '../_api/courier-cash-api'
import { formatCurrency, formatNumber } from '../_lib/format'
import type { CourierCashBalance, CourierCashBalancesKpi } from '../_types/courier-cash'

const EMPTY_KPI: CourierCashBalancesKpi = {
  totalNet: 0,
  couriersWithBalance: 0,
  remittedToday: 0,
}

export default function CourierBalancesPageContent() {
  const router = useRouter()
  const [rows, setRows] = useState<CourierCashBalance[]>([])
  const [kpi, setKpi] = useState<CourierCashBalancesKpi>(EMPTY_KPI)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [balances, nextKpi] = await Promise.all([
        Promise.resolve(listCourierCashBalances()),
        Promise.resolve(getCourierCashBalancesKpi()),
      ])
      setRows(balances)
      setKpi(nextKpi)
    } catch {
      toast.error('Kurye bakiyeleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return `${row.courierName} ${row.courierId}`.toLowerCase().includes(q)
  })

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Kurye Bakiyeleri' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>
              Kurye Bakiyeleri
            </h1>
            <p className='mt-1 text-sm text-slate-500'>
              Kuryelerin elindeki nakit (kapıda tahsilat) bakiyesini ve tenant tahsilatlarını takip
              edin.
            </p>
          </div>
          <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
          <div className='grid min-w-[640px] grid-cols-3 divide-x divide-slate-100'>
            <div className='min-w-0 px-3 py-3.5'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='text-[10px] font-medium tracking-wide text-slate-400'>
                    Toplam net zimmet
                  </p>
                  <p className='mt-1.5 text-lg font-semibold tabular-nums text-slate-900'>
                    {formatCurrency(kpi.totalNet)}
                  </p>
                </div>
                <span className='flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                  <Wallet className='size-3.5' />
                </span>
              </div>
            </div>
            <div className='min-w-0 px-3 py-3.5'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='text-[10px] font-medium tracking-wide text-slate-400'>
                    Bakiyesi olan kurye
                  </p>
                  <p className='mt-1.5 text-lg font-semibold tabular-nums text-slate-900'>
                    {formatNumber(kpi.couriersWithBalance)}
                  </p>
                </div>
                <span className='flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                  <Users className='size-3.5' />
                </span>
              </div>
            </div>
            <div className='min-w-0 px-3 py-3.5'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='text-[10px] font-medium tracking-wide text-slate-400'>
                    Bugün tahsil edilen
                  </p>
                  <p className='mt-1.5 text-lg font-semibold tabular-nums text-slate-900'>
                    {formatCurrency(kpi.remittedToday)}
                  </p>
                </div>
                <span className='flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                  <Banknote className='size-3.5' />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='relative max-w-md'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
          <Input
            className='pl-9'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Kurye ara…'
          />
        </div>

        <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white'>
          <table className='w-full min-w-[800px] text-left text-sm'>
            <thead className='border-b bg-slate-50/80 text-[11px] font-medium uppercase tracking-wide text-slate-500'>
              <tr>
                <th className='px-4 py-3'>Kurye</th>
                <th className='px-4 py-3'>Net bakiye</th>
                <th className='px-4 py-3'>Toplanan</th>
                <th className='px-4 py-3'>Teslim edilen</th>
                <th className='px-4 py-3'>Son hareket</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading ? (
                <tr>
                  <td colSpan={5} className='px-4 py-12 text-center text-slate-500'>
                    Yükleniyor…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-4 py-12 text-center text-slate-500'>
                    Kurye bakiyesi bulunamadı
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.courierId}
                    className='cursor-pointer hover:bg-slate-50/60'
                    onClick={() =>
                      router.push(ARF_ROUTES.lastmile.finance.courierBalances.detail(row.courierId))
                    }
                  >
                    <td className='px-4 py-3 font-medium text-slate-900'>{row.courierName}</td>
                    <td className='px-4 py-3 tabular-nums font-semibold'>
                      {formatCurrency(row.netBalance)}
                    </td>
                    <td className='px-4 py-3 tabular-nums text-slate-600'>
                      {formatCurrency(row.collectedTotal)}
                    </td>
                    <td className='px-4 py-3 tabular-nums text-slate-600'>
                      {formatCurrency(row.remittedTotal)}
                    </td>
                    <td className='px-4 py-3 text-xs text-slate-500'>
                      {row.lastMovementAt
                        ? new Date(row.lastMovementAt).toLocaleString('tr-TR')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
