'use client'

import { Loader2 } from 'lucide-react'
import { formatTryRange } from '../_lib/order-types'
import { useDelayedEstimate } from './use-delayed-estimate'

export function EstimateCard({
  total,
  signature,
  label = 'Tahmini aralık (KDV dahil)',
  hint,
}: {
  total: number | null
  signature?: string
  label?: string
  hint?: string
}) {
  const { calculating, range } = useDelayedEstimate(total, signature)

  if (total == null || total <= 0) return null

  return (
    <div className='mt-4 rounded-xl bg-white p-4'>
      <p className='text-xs text-[var(--gl-muted)]'>{label}</p>

      {calculating || !range ? (
        <div className='mt-2' aria-live='polite'>
          <div className='flex items-center gap-2 text-sm font-medium text-[var(--gl-petrol)]'>
            <Loader2 className='size-4 animate-spin' aria-hidden />
            Hesaplanıyor…
          </div>
          <div className='mt-3 space-y-2' aria-hidden>
            <span className='block h-7 w-4/5 animate-pulse rounded-md bg-[var(--gl-subtle)]' />
            <span className='block h-3 w-2/5 animate-pulse rounded-md bg-[var(--gl-subtle)]' />
          </div>
        </div>
      ) : (
        <div className='gl-fade-in' aria-live='polite'>
          <p className='mt-1 text-xl font-bold leading-snug text-[var(--gl-ink)] sm:text-2xl'>
            {formatTryRange(range.min, range.max)}
          </p>
          {hint ? <p className='mt-1 text-xs text-[var(--gl-muted)]'>{hint}</p> : null}
        </div>
      )}
    </div>
  )
}
