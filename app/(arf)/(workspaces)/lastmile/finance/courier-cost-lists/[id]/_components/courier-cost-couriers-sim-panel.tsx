'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../../_shared/routes'
import {
  listCourierCostAssignments,
  setCourierCostAssignment,
} from '../../../_api/courier-cost-api'
import { CourierCostQuoteSimulator } from '../../../_components/courier-cost-quote-simulator'
import type { CourierCostAssignment } from '../../../_types'

type Props = {
  costListId: string
}

const NONE = '__none__'

/** Seed / mock kurye adları — gerçek API gelince listeden gelir */
const SEED_COURIERS: Array<{ id: string; name: string }> = [
  { id: 'seed-courier-1', name: 'Ahmet Kurye (Seed)' },
  { id: 'seed-courier-2', name: 'Ayşe Şirket (Seed)' },
  { id: 'c3', name: 'Mehmet Kaya' },
  { id: 'c4', name: 'Zeynep Arslan' },
  { id: 'c5', name: 'Can Öztürk' },
]

export function CourierCostCouriersSimPanel({ costListId }: Props) {
  const [assignments, setAssignments] = useState<CourierCostAssignment[]>([])
  const [selectedCourierId, setSelectedCourierId] = useState(NONE)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  const courierNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of SEED_COURIERS) map[c.id] = c.name
    return map
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await listCourierCostAssignments()
      setAssignments(all.filter((a) => a.costListId === costListId))
    } catch {
      toast.error('Kurye atamaları yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [costListId])

  useEffect(() => {
    void load()
  }, [load])

  const assignedIds = useMemo(
    () => new Set(assignments.map((a) => a.courierId)),
    [assignments]
  )

  const availableOptions = useMemo(
    () => SEED_COURIERS.filter((c) => !assignedIds.has(c.id)),
    [assignedIds]
  )

  const assign = async () => {
    if (selectedCourierId === NONE) {
      toast.error('Kurye seçin')
      return
    }
    setAssigning(true)
    try {
      await setCourierCostAssignment(selectedCourierId, costListId)
      toast.success('Kurye bu ücret listesine atandı')
      setSelectedCourierId(NONE)
      void load()
    } catch {
      toast.error('Atama başarısız')
    } finally {
      setAssigning(false)
    }
  }

  const unassign = async (courierId: string) => {
    try {
      await setCourierCostAssignment(courierId, null)
      toast.success('Atama kaldırıldı')
      void load()
    } catch {
      toast.error('Atama kaldırılamadı')
    }
  }

  return (
    <div className='space-y-6'>
      <section className='space-y-3 rounded-2xl border border-slate-200 bg-white p-4'>
        <div>
          <h3 className='text-sm font-semibold text-slate-900'>Atanan kuryeler</h3>
          <p className='text-xs text-slate-500'>
            Bu maliyet tarifesini kullanan kuryeleri yönetin.
          </p>
        </div>

        <div className='flex flex-wrap items-end gap-2'>
          <div className='min-w-[220px] flex-1 space-y-1.5'>
            <Label>Kurye ekle</Label>
            <Select value={selectedCourierId} onValueChange={setSelectedCourierId}>
              <SelectTrigger>
                <SelectValue placeholder='Kurye seçin' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Seçin…</SelectItem>
                {availableOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type='button'
            className='bg-lime-400 text-black hover:bg-lime-300'
            disabled={assigning || selectedCourierId === NONE}
            onClick={() => void assign()}
          >
            {assigning ? 'Atanıyor…' : 'Ata'}
          </Button>
        </div>

        {loading ? (
          <p className='py-6 text-sm text-slate-500'>Yükleniyor…</p>
        ) : assignments.length === 0 ? (
          <div className='rounded-xl border border-dashed px-4 py-8 text-center text-sm text-slate-500'>
            Bu listeye atanmış kurye yok.
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border'>
            <table className='w-full min-w-[480px] text-left text-sm'>
              <thead className='border-b bg-slate-50 text-xs text-slate-500'>
                <tr>
                  <th className='px-3 py-2'>Kurye</th>
                  <th className='px-3 py-2'>Güncelleme</th>
                  <th className='px-3 py-2 text-right'>Aksiyon</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {assignments.map((a) => (
                  <tr key={a.courierId}>
                    <td className='px-3 py-2'>
                      <Link
                        href={ARF_ROUTES.lastmile.resources.couriers.detail(a.courierId)}
                        className='font-medium text-slate-900 hover:underline'
                      >
                        {courierNames[a.courierId] || a.courierId}
                      </Link>
                      <p className='font-mono text-[11px] text-slate-400'>{a.courierId}</p>
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-500'>
                      {a.updatedAt?.slice(0, 10) || '—'}
                    </td>
                    <td className='px-3 py-2 text-right'>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => void unassign(a.courierId)}
                      >
                        Kaldır
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CourierCostQuoteSimulator costListId={costListId} />
    </div>
  )
}
