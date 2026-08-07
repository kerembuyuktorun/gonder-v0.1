'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { UninvoicedOrderRow } from '../_types/invoice'
import { formatTry } from '../_lib/invoice-from-orders'

type Props = {
  rows: UninvoicedOrderRow[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  search?: string
  onSearchChange?: (value: string) => void
  showCustomerColumn?: boolean
  emptyMessage?: string
}

export function UninvoicedOrdersTable({
  rows,
  selectedIds,
  onSelectedIdsChange,
  search,
  onSearchChange,
  showCustomerColumn = true,
  emptyMessage = 'Faturalanacak sipariş yok',
}: Props) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const allSelected = rows.length > 0 && rows.every((row) => selectedSet.has(row.orderId))
  const someSelected = rows.some((row) => selectedSet.has(row.orderId)) && !allSelected

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(rows.map((row) => row.orderId))
      return
    }
    onSelectedIdsChange([])
  }

  const toggleOne = (orderId: string, checked: boolean) => {
    if (checked) {
      onSelectedIdsChange([...selectedIds, orderId])
      return
    }
    onSelectedIdsChange(selectedIds.filter((id) => id !== orderId))
  }

  return (
    <div className='space-y-3'>
      {onSearchChange ? (
        <Input
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder='Takip no, referans veya müşteri ara…'
          className='max-w-md'
        />
      ) : null}

      <div className='overflow-hidden rounded-lg border bg-white'>
        <table className='w-full text-sm'>
          <thead className='bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500'>
            <tr>
              <th className='w-10 px-3 py-2'>
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={(value) => toggleAll(value === true)}
                  aria-label='Tümünü seç'
                />
              </th>
              <th className='px-3 py-2'>Takip no</th>
              {showCustomerColumn ? <th className='px-3 py-2'>Müşteri</th> : null}
              <th className='px-3 py-2'>Durum</th>
              <th className='px-3 py-2'>Tarih</th>
              <th className='px-3 py-2 text-right'>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={showCustomerColumn ? 6 : 5}
                  className='px-3 py-10 text-center text-slate-500'
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.orderId} className='border-t'>
                  <td className='px-3 py-2'>
                    <Checkbox
                      checked={selectedSet.has(row.orderId)}
                      onCheckedChange={(value) => toggleOne(row.orderId, value === true)}
                      aria-label={`${row.takipNo} seç`}
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <div className='font-medium'>{row.takipNo}</div>
                    {row.referansNo ? (
                      <div className='text-xs text-slate-500'>{row.referansNo}</div>
                    ) : null}
                  </td>
                  {showCustomerColumn ? (
                    <td className='px-3 py-2'>{row.customerName}</td>
                  ) : null}
                  <td className='px-3 py-2'>
                    <Badge variant='secondary'>{row.durum}</Badge>
                  </td>
                  <td className='px-3 py-2 text-slate-600'>
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td className='px-3 py-2 text-right'>
                    <div className='font-medium'>{formatTry(row.amount)}</div>
                    {!row.hasPricing ? (
                      <div className='text-xs text-amber-600'>Fiyat yok</div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
