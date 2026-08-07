'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bike, Building2, Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  createOtherSupplier,
  listSupplierAccounts,
} from '../_api/suppliers-api'
import {
  balanceLabelText,
  formatBalanceAmount,
} from '../_lib/cari-balances'
import type { SupplierAccount, SupplierKind } from '../_types/supplier'
import { SUPPLIER_KIND_LABELS } from '../_types/supplier'
import { formatCurrency } from '../_lib/format'
import { SupplierFormModal } from './_components/supplier-form-modal'

const ALL = 'all'

export default function FinanceSuppliersPageContent() {
  const router = useRouter()
  const [rows, setRows] = useState<SupplierAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<SupplierKind | typeof ALL>(ALL)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const items = await listSupplierAccounts({
        kind,
        search: search.trim() || undefined,
      })
      setRows(items)
    } catch {
      toast.error('Tedarikçi carileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [kind, search])

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => {
    let toCollect = 0
    let toPay = 0
    for (const row of rows) {
      if (row.balanceLabel === 'tahsil_edilecek') toCollect += row.balance
      if (row.balanceLabel === 'odenecek') toPay += row.balance
    }
    return { count: rows.length, toCollect, toPay }
  }, [rows])

  const openRow = (row: SupplierAccount) => {
    if (row.kind === 'kurye' && row.courierId) {
      router.push(ARF_ROUTES.lastmile.resources.couriers.detail(row.courierId))
      return
    }
    router.push(ARF_ROUTES.lastmile.finance.suppliers.detail(row.id))
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Tedarikçiler' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-4 p-6 pb-24'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Tedarikçiler</h1>
            <p className='mt-1 text-sm text-slate-500'>
              Kurye ve diğer tedarikçilerin birleşik cari listesi.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button
              size='sm'
              className='bg-slate-800 text-white hover:bg-slate-700'
              onClick={() => setCreateOpen(true)}
            >
              <Plus className='mr-1.5 size-3.5' />
              Yeni Tedarikçi Oluştur
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap gap-3'>
          <div className='w-44'>
            <Select
              value={kind}
              onValueChange={(v) => setKind(v as SupplierKind | typeof ALL)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Tür' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tüm türler</SelectItem>
                <SelectItem value='kurye'>{SUPPLIER_KIND_LABELS.kurye}</SelectItem>
                <SelectItem value='diger'>{SUPPLIER_KIND_LABELS.diger}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='relative min-w-[240px] flex-1 max-w-xl'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
            <Input
              className='pl-9'
              placeholder='Ara…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white'>
          <table className='w-full min-w-[720px] text-left text-sm'>
            <thead className='border-b bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
              <tr>
                <th className='w-12 px-4 py-3' />
                <th className='px-4 py-3'>Ünvanı</th>
                <th className='px-4 py-3'>VKN / TCKN</th>
                <th className='px-4 py-3 text-right'>Bakiye</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-4 py-16 text-center text-slate-500'>
                    Yükleniyor…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-4 py-16 text-center text-slate-500'>
                    Tedarikçi bulunamadı
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className='cursor-pointer hover:bg-lime-50/40'
                    onClick={() => openRow(row)}
                  >
                    <td className='px-4 py-3'>
                      <span className='flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                        {row.kind === 'kurye' ? (
                          <Bike className='size-4' />
                        ) : (
                          <Building2 className='size-4' />
                        )}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-slate-900'>{row.unvan}</p>
                      <p className='mt-0.5 text-xs text-slate-500'>
                        {[row.email, row.telefon].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <div className='mt-1.5 flex flex-wrap gap-1'>
                        <Badge
                          variant='secondary'
                          className={
                            row.kind === 'kurye'
                              ? 'rounded-sm bg-violet-100 text-[10px] font-semibold uppercase text-violet-800 hover:bg-violet-100'
                              : 'rounded-sm bg-emerald-100 text-[10px] font-semibold uppercase text-emerald-800 hover:bg-emerald-100'
                          }
                        >
                          {SUPPLIER_KIND_LABELS[row.kind]}
                        </Badge>
                        {row.tags
                          .filter((t) => t !== 'KURYE')
                          .map((tag) => (
                            <Badge
                              key={tag}
                              variant='outline'
                              className='rounded-sm text-[10px] uppercase'
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </td>
                    <td className='px-4 py-3 font-mono text-xs text-slate-600'>
                      {row.vkn || '—'}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <p
                        className={
                          row.balanceLabel === 'odenecek'
                            ? 'font-semibold text-slate-900'
                            : row.balanceLabel === 'tahsil_edilecek'
                              ? 'font-semibold text-emerald-600'
                              : 'font-medium text-slate-400'
                        }
                      >
                        {formatBalanceAmount({
                          amount: row.balance,
                          label: row.balanceLabel,
                        })}
                      </p>
                      {row.balanceLabel !== 'sifir' ? (
                        <p className='mt-0.5 text-xs text-slate-500'>
                          {balanceLabelText(row.balanceLabel)}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className='fixed bottom-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur'>
        <div className='flex flex-wrap items-center justify-between gap-3 text-sm'>
          <Link
            href={ARF_ROUTES.lastmile.resources.couriers.list}
            className='text-slate-600 underline-offset-2 hover:underline'
          >
            Kurye kaynak listesi
          </Link>
          <div className='flex flex-wrap gap-4 tabular-nums text-slate-700'>
            <span>{summary.count} Kayıt</span>
            <span>
              Ödenecek <strong>{formatCurrency(summary.toPay)}</strong>
            </span>
            <span>
              Tahsil Edilecek{' '}
              <strong className='text-emerald-700'>{formatCurrency(summary.toCollect)}</strong>
            </span>
          </div>
        </div>
      </div>

      <SupplierFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (payload) => {
          await createOtherSupplier(payload)
          toast.success('Tedarikçi oluşturuldu')
          void load()
        }}
      />
    </>
  )
}
