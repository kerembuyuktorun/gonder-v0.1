'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import {
  clonePriceList,
  listCustomerPricingAssignments,
  listPriceLists,
  setDefaultPriceList,
  setPriceListStatus,
} from '../_api/pricing-api'
import type { PriceList } from '../_types'
import { PriceListsKpiCards, type PriceListsKpi } from './_components/price-lists-kpi-cards'
import { PriceListsTable } from './_components/price-lists-table'

const EMPTY_KPI: PriceListsKpi = {
  activeCount: 0,
  defaultName: '—',
  ruleCount: 0,
  assignedCustomerCount: 0,
}

export default function PriceListsPageContent() {
  const router = useRouter()
  const [lists, setLists] = useState<PriceList[]>([])
  const [assignmentCounts, setAssignmentCounts] = useState<Record<string, number>>({})
  const [kpi, setKpi] = useState<PriceListsKpi>(EMPTY_KPI)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rows, assignments] = await Promise.all([
        listPriceLists(),
        listCustomerPricingAssignments(),
      ])
      setLists(rows)
      const counts: Record<string, number> = {}
      for (const a of assignments) {
        counts[a.priceListId] = (counts[a.priceListId] ?? 0) + 1
      }
      setAssignmentCounts(counts)
      const active = rows.filter((r) => r.status === 'active')
      const def = rows.find((r) => r.isDefault)
      setKpi({
        activeCount: active.length,
        defaultName: def?.name ?? '—',
        ruleCount: rows.reduce((s, r) => s + r.rules.length, 0),
        assignedCustomerCount: assignments.length,
      })
    } catch {
      toast.error('Fiyat listeleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR')
    if (!q) return lists
    return lists.filter(
      (l) =>
        l.name.toLocaleLowerCase('tr-TR').includes(q) ||
        l.code.toLocaleLowerCase('tr-TR').includes(q)
    )
  }, [lists, search])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans', href: ARF_ROUTES.lastmile.finance.root },
          { label: 'Fiyat Listeleri' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>Fiyat Listeleri</h1>
            <p className='mt-1 text-sm text-slate-500'>
              Mesafe kurgusu ve desi satırlarıyla last mile ücretlendirmelerini yönetin.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button
              size='sm'
              className='bg-lime-400 text-black hover:bg-lime-300'
              asChild
            >
              <Link href={ARF_ROUTES.lastmile.finance.priceLists.create}>
                <Plus className='mr-1.5 size-3.5' />
                Yeni Fiyat Listesi
              </Link>
            </Button>
          </div>
        </div>

        <PriceListsKpiCards kpi={kpi} />

        <div className='relative max-w-sm'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
          <Input
            className='pl-9'
            placeholder='Kod veya ad ara…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && lists.length === 0 ? (
          <div className='rounded-2xl border bg-white px-6 py-16 text-center text-sm text-slate-500'>
            Yükleniyor…
          </div>
        ) : (
          <PriceListsTable
            lists={filtered}
            assignmentCounts={assignmentCounts}
            onClone={async (id) => {
              const cloned = await clonePriceList(id)
              if (cloned) {
                toast.success('Liste klonlandı')
                router.push(ARF_ROUTES.lastmile.finance.priceLists.detail(cloned.id))
              }
            }}
            onSetDefault={async (id) => {
              await setDefaultPriceList(id)
              toast.success('Varsayılan liste güncellendi')
              void load()
            }}
            onToggleStatus={async (id, status) => {
              await setPriceListStatus(id, status)
              toast.success(status === 'active' ? 'Liste aktifleştirildi' : 'Liste pasifleştirildi')
              void load()
            }}
          />
        )}
      </div>
    </>
  )
}
