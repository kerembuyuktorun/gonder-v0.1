import { cn } from '@/lib/utils'
import type { PlanningRouteDateChip } from '../_types/planning-route'

const labels: Record<PlanningRouteDateChip, string> = {
  bugun: 'Bugün',
  gecmis: 'Geçmiş',
  ileri: 'İleri',
}

const styles: Record<
  PlanningRouteDateChip,
  { wrap: string; dot: string }
> = {
  bugun: {
    wrap: 'bg-sky-500/10 text-sky-700',
    dot: 'bg-sky-500',
  },
  gecmis: {
    wrap: 'bg-amber-500/10 text-amber-800',
    dot: 'bg-amber-500',
  },
  ileri: {
    wrap: 'bg-slate-500/10 text-slate-600',
    dot: 'bg-slate-400',
  },
}

/**
 * Planlanan tarih göreli etiketi — sipariş MetaChip diline yakın:
 * ikonsuz, yumuşak zemin, renkli nokta.
 */
export function RouteDateChip({ chip }: { chip: PlanningRouteDateChip }) {
  const style = styles[chip]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
        'text-[11px] font-medium tracking-wide',
        style.wrap
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} aria-hidden />
      {labels[chip]}
    </span>
  )
}

export const routeDateFilterOptions = (
  Object.entries(labels) as [PlanningRouteDateChip, string][]
).map(([value, label]) => ({ label, value }))
