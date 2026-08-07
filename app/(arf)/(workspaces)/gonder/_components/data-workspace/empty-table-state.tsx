'use client'

import type { ComponentType } from 'react'
import { PackageOpen } from 'lucide-react'

type Props = {
  icon?: ComponentType<{ className?: string }>
  title?: string
  description?: string
}

export function EmptyTableState({
  icon: Icon = PackageOpen,
  title = 'Kayıt bulunamadı',
  description = 'Bu görünüm için gösterilecek kayıt yok.',
}: Props) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 py-14 text-center'>
      <div className='flex size-14 items-center justify-center rounded-full bg-muted'>
        <Icon className='size-7 text-muted-foreground' />
      </div>
      <div className='max-w-sm space-y-1'>
        <h3 className='text-sm font-semibold'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}
