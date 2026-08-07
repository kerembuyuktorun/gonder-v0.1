'use client'

import { Columns3, Table2 } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { OrdersLayout } from '../../_types/orders'

type Props = {
  value: OrdersLayout
  onChange: (value: OrdersLayout) => void
}

export function OrdersLayoutToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup
      type='single'
      variant='outline'
      size='sm'
      value={value}
      onValueChange={(next) => {
        if (next === 'table' || next === 'board') onChange(next)
      }}
      aria-label='Görünüm'
    >
      <ToggleGroupItem value='table' aria-label='Tablo görünümü' className='gap-1.5 px-2.5'>
        <Table2 className='size-3.5' />
        <span className='hidden sm:inline'>Tablo</span>
      </ToggleGroupItem>
      <ToggleGroupItem value='board' aria-label='Kanban görünümü' className='gap-1.5 px-2.5'>
        <Columns3 className='size-3.5' />
        <span className='hidden sm:inline'>Kanban</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
