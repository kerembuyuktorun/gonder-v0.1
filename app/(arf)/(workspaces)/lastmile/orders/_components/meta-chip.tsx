import { cn } from '@/lib/utils'

type MetaChipProps = {
  children: string
  variant: 'tag' | 'requirement'
}

/**
 * Etiket / Gereksinim chip'leri.
 * Sipariş Tipi–Rota–Durum badge dilinden bilerek ayrılır:
 * ikonsuz, nötr, yumuşak veya kesikli çerçeve.
 */
export function MetaChip({ children, variant }: MetaChipProps) {
  if (variant === 'tag') {
    return (
      <span
        className={cn(
          'inline-flex max-w-full items-center gap-1 truncate rounded-full',
          'bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-slate-700'
        )}
        title={children}
      >
        <span className='size-1 shrink-0 rounded-full bg-slate-400' aria-hidden />
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 truncate rounded-sm',
        'border border-dashed border-slate-300 bg-white px-2 py-0.5',
        'text-[11px] font-medium text-slate-700'
      )}
      title={children}
    >
      <span className='size-1.5 shrink-0 rounded-[2px] bg-slate-400/80' aria-hidden />
      {children}
    </span>
  )
}
