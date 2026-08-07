'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  createCustomer,
  fetchCustomersList,
} from '../../customers/_api/customers'
import {
  CreateCustomerModal,
  type CustomerCreateFormValues,
} from '../../customers/_components/create-customer-modal'
import { buildCustomerWritePayload } from '../../customers/_lib/map-customer'
import { mockCustomerList } from '../../customers/_mock/customers-mock-data'
import type { LastmileCustomer } from '../../customers/_types/customer'
import { toNationalPhoneDigits } from '../../orders/new/_lib/phone'
import { isLastmileDemoForced, withLastmileDemo } from '../../_lib/lastmile-demo-mode'
import {
  balanceLabelText,
  classifyBalance,
  formatBalanceAmount,
  getCustomerOpenBalances,
  type CariBalance,
} from '../_lib/cari-balances'

type Row = LastmileCustomer & { cari: CariBalance }

function demoBalance(customerId: string): number {
  const map: Record<string, number> = {
    'c-bnf': 222,
    'c-modanisa': 168,
    'c-trendyol': 0,
    'c-hb': 95,
    'c-getir': 410,
    'c-migros': 0,
    'c-vivense': 75,
    'c-xrest': 48,
    'c-mm': 0,
    'c-amz': 130,
  }
  return map[customerId] ?? 0
}

export default function FinanceCustomersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const balances = await getCustomerOpenBalances()
      let customers: LastmileCustomer[] = []

      if (forceDemo) {
        const needle = search.trim().toLocaleLowerCase('tr-TR')
        customers = mockCustomerList.filter((c) => {
          if (!needle) return true
          const hay = [c.marka_kisa_ad, c.firma_unvani, c.vkn, c.musteri_kodu]
            .join(' ')
            .toLocaleLowerCase('tr-TR')
          return hay.includes(needle)
        })
      } else {
        const listResult = await fetchCustomersList({
          page: 1,
          pageSize: 100,
          search: search.trim() || undefined,
        })
        if (!listResult.success) {
          toast.error(listResult.error)
          setRows([])
          return
        }
        customers = listResult.data.items
      }

      setRows(
        customers.map((customer) => ({
          ...customer,
          cari: classifyBalance(
            balances[customer.id] ?? (forceDemo ? demoBalance(customer.id) : 0)
          ),
        }))
      )
    } catch {
      toast.error('Müşteri carileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [forceDemo, search])

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => {
    let toCollect = 0
    let toPay = 0
    for (const row of rows) {
      if (row.cari.label === 'tahsil_edilecek') toCollect += row.cari.amount
      if (row.cari.label === 'odenecek') toPay += row.cari.amount
    }
    return { count: rows.length, toCollect, toPay }
  }, [rows])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Müşteriler' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-4 p-6 pb-24'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {forceDemo ? 'Müşteriler (Demo)' : 'Müşteriler'}
              </h1>
              {forceDemo ? (
                <Badge className='bg-amber-100 text-amber-900 hover:bg-amber-100'>Demo veri</Badge>
              ) : null}
            </div>
            <p className='mt-1 text-sm text-slate-500'>
              Cari bakiyeli müşteri listesi. Detay için satıra tıklayın.
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
              Yeni Müşteri Oluştur
            </Button>
          </div>
        </div>

        <div className='relative max-w-xl'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
          <Input
            className='pl-9'
            placeholder='Ara…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                    Müşteri bulunamadı
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className='cursor-pointer hover:bg-lime-50/40'
                    onClick={() =>
                      router.push(
                        withLastmileDemo(
                          ARF_ROUTES.lastmile.customers.detail(row.id),
                          forceDemo
                        )
                      )
                    }
                  >
                    <td className='px-4 py-3'>
                      <span className='flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                        <Building2 className='size-4' />
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-slate-900'>
                        {row.firma_unvani || row.marka_kisa_ad}
                      </p>
                      <p className='mt-0.5 text-xs text-slate-500'>
                        {[row.email, row.telefon].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <div className='mt-1.5 flex flex-wrap gap-1'>
                        <Badge
                          variant='secondary'
                          className='rounded-sm bg-sky-100 text-[10px] font-semibold uppercase text-sky-800 hover:bg-sky-100'
                        >
                          {row.sektor}
                        </Badge>
                        {row.durum === 'pasif' ? (
                          <Badge variant='outline' className='text-[10px] uppercase'>
                            Pasif
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className='px-4 py-3 font-mono text-xs text-slate-600'>
                      {row.vkn || '—'}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <p
                        className={
                          row.cari.label === 'tahsil_edilecek'
                            ? 'font-semibold text-emerald-600'
                            : row.cari.label === 'odenecek'
                              ? 'font-semibold text-rose-600'
                              : 'font-medium text-slate-400'
                        }
                      >
                        {formatBalanceAmount(row.cari)}
                      </p>
                      {row.cari.label !== 'sifir' ? (
                        <p className='mt-0.5 text-xs text-slate-500'>
                          {balanceLabelText(row.cari.label)}
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

      <div className='fixed bottom-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-white/90'>
        <div className='flex flex-wrap items-center justify-between gap-3 text-sm'>
          <Link
            href={withLastmileDemo(ARF_ROUTES.lastmile.customers.list, forceDemo)}
            className='text-slate-600 underline-offset-2 hover:underline'
          >
            Operasyon müşteri listesi
          </Link>
          <div className='flex flex-wrap gap-4 tabular-nums text-slate-700'>
            <span>{summary.count} Kayıt</span>
            <span>
              Ödenecek{' '}
              <strong>{formatBalanceAmount({ amount: summary.toPay, label: 'odenecek' })}</strong>
            </span>
            <span>
              Tahsil Edilecek{' '}
              <strong className='text-emerald-700'>
                {formatBalanceAmount({ amount: summary.toCollect, label: 'tahsil_edilecek' })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <CreateCustomerModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode='create'
        onSubmit={async (values: CustomerCreateFormValues) => {
          if (forceDemo) {
            toast.message('Demo modunda yeni müşteri API’ye yazılmaz')
            setCreateOpen(false)
            return
          }
          const national = toNationalPhoneDigits(values.telefon)
          const result = await createCustomer(
            buildCustomerWritePayload({
              ...values,
              phoneE164: national ? `+90${national}` : values.telefon.trim(),
            })
          )
          if (!result.success) {
            throw new Error(result.error)
          }
          toast.success(`${result.data.musteri_kodu} oluşturuldu`)
          void load()
        }}
      />
    </>
  )
}
