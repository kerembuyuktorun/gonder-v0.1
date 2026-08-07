'use client'

import Link from 'next/link'
import { PackageMinus } from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { withLastmileDemo } from '../../../_lib/lastmile-demo-mode'
import { formatCurrency } from '../../../finance/_lib/format'
import type { ReturnSuborderLink } from '../../_types/order-ops'

type Props = {
  returns: ReturnSuborderLink[]
  demo?: boolean
}

export function OrderReturnsPanel({ returns, demo }: Props) {
  if (returns.length === 0) return null

  return (
    <div className='rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3'>
      <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800'>
        <PackageMinus className='size-4 text-slate-500' />
        İade siparişleri
      </div>
      <ul className='space-y-2'>
        {returns.map((row) => (
          <li
            key={row.id}
            className='flex flex-wrap items-center justify-between gap-2 text-sm'
          >
            <Link
              href={withLastmileDemo(
                ARF_ROUTES.lastmile.orders.detail(row.returnOrderId),
                Boolean(demo)
              )}
              className='font-mono font-medium text-sky-700 hover:underline'
            >
              {row.returnTakipNo ?? row.returnOrderId}
            </Link>
            <span className='text-slate-600'>
              {formatCurrency(row.returnFee)}
              <span className='ml-1 text-xs text-slate-400'>(%{row.returnFeePercent})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
