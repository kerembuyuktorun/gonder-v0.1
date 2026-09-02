'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { financeEntityHref } from '../../_lib/finance-links'
import type { FinanceEntityRef } from '../../_types/finance'

type Props = {
  order?: FinanceEntityRef | null
  shipment?: FinanceEntityRef | null
  invoice?: FinanceEntityRef | null
  quote?: FinanceEntityRef | null
  className?: string
}

function EntityChip({ entity }: { entity: FinanceEntityRef }) {
  const href = financeEntityHref(entity)
  const label = entity.label ?? entity.id
  if (!href) {
    return (
      <Badge variant='outline' className='font-normal'>
        {label}
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className='font-normal' asChild>
      <Link href={href}>{label}</Link>
    </Badge>
  )
}

export function FinanceEntityLinks({ order, shipment, invoice, quote, className }: Props) {
  const refs = [shipment, order, invoice, quote].filter(Boolean) as FinanceEntityRef[]
  if (!refs.length) return <span className='text-muted-foreground'>—</span>
  return (
    <div className={className ?? 'flex flex-wrap items-center gap-1.5'}>
      {refs.map((entity) => (
        <EntityChip key={`${entity.type}-${entity.id}`} entity={entity} />
      ))}
    </div>
  )
}
