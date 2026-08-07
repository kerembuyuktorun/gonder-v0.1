'use client'

import { cn } from '@/lib/utils'

function occupancyTone(pct: number): 'ok' | 'warn' | 'critical' {
  if (pct >= 80) return 'critical'
  if (pct >= 60) return 'warn'
  return 'ok'
}

function Meter({ label, pct }: { label: string; pct: number }) {
  const safe = Math.min(100, Math.max(0, Math.round(pct)))
  const tone = occupancyTone(safe)

  return (
    <div className='min-w-0 space-y-1'>
      <div className='min-w-0 truncate text-xs leading-tight'>
        <span className='font-medium text-slate-700'>{label}</span>
        <span className='mx-1 text-slate-300'>·</span>
        <span className='tabular-nums font-semibold text-foreground'>%{safe}</span>
      </div>
      <div className='h-1.5 w-24 overflow-hidden rounded-full bg-slate-100'>
        <div
          className={cn(
            'h-full rounded-full transition-[width]',
            tone === 'critical' && 'bg-rose-500',
            tone === 'warn' && 'bg-amber-400',
            tone === 'ok' && 'bg-emerald-500'
          )}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  )
}

export function RouteCapacity({
  volumePct,
  weightPct,
}: {
  volumePct: number
  weightPct: number
}) {
  return (
    <div className='flex w-[112px] flex-col gap-1.5 py-0.5'>
      <Meter label='Hacim' pct={volumePct} />
      <Meter label='Ağırlık' pct={weightPct} />
    </div>
  )
}
