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
import { fetchCustomersList } from '../../../../customers/_api/customers'
import {
  listCustomerPricingAssignments,
  setCustomerPricingAssignment,
} from '../../../_api/pricing-api'
import { PriceQuoteSimulator } from '../../../_components/price-quote-simulator'
import type { CustomerPricingAssignment } from '../../../_types'

type Props = {
  priceListId: string
}

const NONE = '__none__'

export function PriceListCustomersSimPanel({ priceListId }: Props) {
  const [assignments, setAssignments] = useState<CustomerPricingAssignment[]>([])
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({})
  const [customerOptions, setCustomerOptions] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState(NONE)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [allAssignments, customersResult] = await Promise.all([
        listCustomerPricingAssignments(),
        fetchCustomersList({ page: 1, pageSize: 200, statusScope: 'aktif' }),
      ])

      const forList = allAssignments.filter((a) => a.priceListId === priceListId)
      setAssignments(forList)

      const nameMap: Record<string, string> = {}
      const options: Array<{ id: string; name: string }> = []
      if (customersResult.success) {
        for (const c of customersResult.data.items) {
          const name =
            c.firma_unvani || c.marka_kisa_ad || c.musteri_kodu || c.id
          nameMap[c.id] = name
          options.push({ id: c.id, name })
        }
      }
      // Seed assignment id'leri gerçek listede yoksa da göster
      for (const a of forList) {
        if (!nameMap[a.customerId]) {
          nameMap[a.customerId] = a.customerId
          options.push({ id: a.customerId, name: a.customerId })
        }
      }
      setCustomerNames(nameMap)
      setCustomerOptions(options.sort((a, b) => a.name.localeCompare(b.name, 'tr')))
    } catch {
      toast.error('Müşteri atamaları yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [priceListId])

  useEffect(() => {
    void load()
  }, [load])

  const assignedIds = useMemo(
    () => new Set(assignments.map((a) => a.customerId)),
    [assignments]
  )

  const availableOptions = useMemo(
    () => customerOptions.filter((c) => !assignedIds.has(c.id)),
    [customerOptions, assignedIds]
  )

  const assign = async () => {
    if (selectedCustomerId === NONE) {
      toast.error('Müşteri seçin')
      return
    }
    setAssigning(true)
    try {
      await setCustomerPricingAssignment(selectedCustomerId, priceListId)
      toast.success('Müşteri bu fiyat listesine atandı')
      setSelectedCustomerId(NONE)
      void load()
    } catch {
      toast.error('Atama başarısız')
    } finally {
      setAssigning(false)
    }
  }

  const unassign = async (customerId: string) => {
    try {
      await setCustomerPricingAssignment(customerId, null)
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
          <h3 className='text-sm font-semibold text-slate-900'>Atanan müşteriler</h3>
          <p className='text-xs text-slate-500'>
            Bu fiyatlandırmayı kullanan müşterileri yönetin.
          </p>
        </div>

        <div className='flex flex-wrap items-end gap-2'>
          <div className='min-w-[220px] flex-1 space-y-1.5'>
            <Label>Müşteri ekle</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder='Müşteri seçin' />
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
            disabled={assigning || selectedCustomerId === NONE}
            onClick={() => void assign()}
          >
            {assigning ? 'Atanıyor…' : 'Ata'}
          </Button>
        </div>

        {loading ? (
          <p className='py-6 text-sm text-slate-500'>Yükleniyor…</p>
        ) : assignments.length === 0 ? (
          <div className='rounded-xl border border-dashed px-4 py-8 text-center text-sm text-slate-500'>
            Bu listeye atanmış müşteri yok.
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border'>
            <table className='w-full min-w-[480px] text-left text-sm'>
              <thead className='border-b bg-slate-50 text-xs text-slate-500'>
                <tr>
                  <th className='px-3 py-2'>Müşteri</th>
                  <th className='px-3 py-2'>Güncelleme</th>
                  <th className='px-3 py-2 text-right'>Aksiyon</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {assignments.map((a) => (
                  <tr key={a.customerId}>
                    <td className='px-3 py-2'>
                      <Link
                        href={ARF_ROUTES.lastmile.customers.detail(a.customerId)}
                        className='font-medium text-slate-900 hover:underline'
                      >
                        {customerNames[a.customerId] || a.customerId}
                      </Link>
                      <p className='font-mono text-[11px] text-slate-400'>{a.customerId}</p>
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-500'>
                      {a.updatedAt?.slice(0, 10) || '—'}
                    </td>
                    <td className='px-3 py-2 text-right'>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => void unassign(a.customerId)}
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

      <PriceQuoteSimulator priceListId={priceListId} />
    </div>
  )
}
