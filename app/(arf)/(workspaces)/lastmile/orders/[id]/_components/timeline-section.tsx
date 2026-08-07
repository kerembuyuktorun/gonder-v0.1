'use client'

import { UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderTimelineStep } from '../_types/order-detail'
import { timelineStatusClass } from '../_lib/order-detail-helpers'

export function TimelineSection({ steps }: { steps: OrderTimelineStep[] }) {
  if (steps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        Çizelge bilgisi yok
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          return (
            <li key={`${step.id}-${index}`} className="relative flex gap-4">
              <div className="flex w-5 flex-col items-center">
                <span
                  className={cn(
                    'mt-1 size-3.5 shrink-0 rounded-full border-2',
                    timelineStatusClass(step.status)
                  )}
                />
                {!isLast ? (
                  <span
                    className={cn(
                      'mt-1 w-px flex-1',
                      step.status === 'done' || step.status === 'current'
                        ? 'bg-slate-300'
                        : 'bg-slate-200'
                    )}
                  />
                ) : null}
              </div>

              <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-6')}>
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-sm font-semibold tracking-tight',
                        step.status === 'upcoming' && 'text-slate-400',
                        step.status === 'done' && 'text-slate-800',
                        step.status === 'current' && 'text-slate-900',
                        step.status === 'cancelled' && 'text-rose-600'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.actor ? (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <UserRound className="size-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{step.actor}</span>
                      </p>
                    ) : step.status === 'done' || step.status === 'current' ? (
                      <p className="mt-1 text-xs text-slate-400">İşlemi yapan bilgisi yok</p>
                    ) : null}
                    {step.description ? (
                      <p className="mt-1.5 text-sm leading-5 text-slate-500">{step.description}</p>
                    ) : null}
                  </div>
                  <time
                    className={cn(
                      'shrink-0 text-[11px] tabular-nums',
                      step.timestamp ? 'text-slate-500' : 'text-slate-300'
                    )}
                  >
                    {step.timestamp ?? '—'}
                  </time>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
