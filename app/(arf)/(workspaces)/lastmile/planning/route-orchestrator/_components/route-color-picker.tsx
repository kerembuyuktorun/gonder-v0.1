'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  ROUTE_COLORS,
  isRouteColorTaken,
  normalizeRouteColor,
} from '../_lib/route-colors'

type Props = {
  color: string
  usedColors: string[]
  onChange: (color: string) => void
  className?: string
}

export function RouteColorPicker({
  color,
  usedColors,
  onChange,
  className,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className={cn(
            'size-5 shrink-0 rounded-full ring-2 ring-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
            className
          )}
          style={{ backgroundColor: color }}
          title='Rota rengi'
          aria-label='Rota rengini değiştir'
          onClick={(event) => event.stopPropagation()}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={6}
        className='min-w-0 border-border/70 p-1.5 shadow-md'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='grid grid-cols-5 gap-1'>
          {ROUTE_COLORS.map((swatch) => {
            const selected =
              normalizeRouteColor(swatch) === normalizeRouteColor(color)
            const taken = isRouteColorTaken(swatch, usedColors, color)
            return (
              <button
                key={swatch}
                type='button'
                disabled={taken}
                onClick={() => {
                  if (!taken) onChange(swatch)
                }}
                title={taken ? 'Kullanımda' : selected ? 'Seçili' : 'Uygula'}
                aria-label={
                  taken
                    ? 'Kullanımda olan renk'
                    : selected
                      ? 'Seçili rota rengi'
                      : `Rengi ${swatch} yap`
                }
                aria-pressed={selected}
                className={cn(
                  'relative size-5 rounded-full transition-[transform,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40',
                  selected && 'ring-2 ring-slate-900 ring-offset-1',
                  taken && 'cursor-not-allowed opacity-25',
                  !taken && !selected && 'hover:scale-110'
                )}
                style={{ backgroundColor: swatch }}
              >
                {taken ? (
                  <span
                    className='absolute inset-x-0.5 top-1/2 h-px -translate-y-1/2 rotate-[-32deg] bg-white/95'
                    aria-hidden
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
