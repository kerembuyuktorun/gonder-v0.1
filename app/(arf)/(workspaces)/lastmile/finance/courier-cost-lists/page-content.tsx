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
  cloneCourierCostList,
  listCourierCostAssignments,
  listCourierCostLists,
  setCourierCostListStatus,
  setDefaultCourierCostList,
} from '../_api/courier-cost-api'
import type { CourierCostList } from '../_types'
import {
  CourierCostListsKpiCards,
  type CourierCostListsKpi,
} from './_components/courier-cost-lists-kpi-cards'
import { CourierCostListsTable } from './_components/courier-cost-lists-table'

const EMPTY_KPI: CourierCostListsKpi = {
  activeCount: 0,
  salaryCount: 0,
  tariffCount: 0,
  assignedCourierCount: 0,
}

export default function CourierCostListsPageContent() {
  const router = useRouter()
  const [lists, setLists] = useState<CourierCostList[]>([])
  const [assignmentCounts, setAssignmentCounts] = useState<Record<string, number>>({})
  const [kpi, setKpi] = useState<CourierCostListsKpi>(EMPTY_KPI)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rows, assignments] = await Promise.all([
        listCourierCostLists(),
        listCourierCostAssignments(),
      ])
      setLists(rows)
      const counts: Record<string, number> = {}
      for (const a of assignments) {
        counts[a.costListId] = (counts[a.costListId] ?? 0) + 1
      }
      setAssignmentCounts(counts)
      const active = rows.filter((r) => r.status === 'active')
      setKpi({
        activeCount: active.length,
        tariffCount: active.filter((r) => r.compensationModel === 'tariff').length,
        salaryCount: active.filter(
          (r) =>
            r.compensationModel === 'salary_plus_bonus' || r.compensationModel === 'hybrid'
        ).length,
        assignedCourierCount: assignments.length,
      })
    } catch {
      toast.error('Kurye ücret listeleri yüklenemedi')
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
          { label: 'Kurye Ücret Listeleri' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>
              Kurye Ücret Listeleri
            </h1>
            <p className='mt-1 text-sm text-slate-500'>
              Tedarikçi / kurye çalışma maliyetlerini tarife, maaş ve prim ile yönetin.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button size='sm' className='bg-lime-400 text-black hover:bg-lime-300' asChild>
              <Link href={ARF_ROUTES.lastmile.finance.courierCostLists.create}>
                <Plus className='mr-1.5 size-3.5' />
                Yeni Ücret Listesi
              </Link>
            </Button>
          </div>
        </div>

        <CourierCostListsKpiCards kpi={kpi} />

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
          <CourierCostListsTable
            lists={filtered}
            assignmentCounts={assignmentCounts}
            onClone={async (id) => {
              const cloned = await cloneCourierCostList(id)
              if (cloned) {
                toast.success('Liste klonlandı')
                router.push(ARF_ROUTES.lastmile.finance.courierCostLists.detail(cloned.id))
              }
            }}
            onSetDefault={async (id) => {
              await setDefaultCourierCostList(id)
              toast.success('Varsayılan liste güncellendi')
              void load()
            }}
            onToggleStatus={async (id, status) => {
              await setCourierCostListStatus(id, status)
              toast.success(status === 'active' ? 'Liste aktifleştirildi' : 'Liste pasifleştirildi')
              void load()
            }}
          />
        )}
      </div>
    </>
  )
}
