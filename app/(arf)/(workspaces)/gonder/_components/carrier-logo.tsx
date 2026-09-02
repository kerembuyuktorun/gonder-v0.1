import { cn } from '@/lib/utils'
import { resolveCarrier } from '../_lib/carriers'

type Props = {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = {
  sm: 'size-9 text-[11px]',
  md: 'size-11 text-xs',
  lg: 'size-12 text-sm',
} as const

export function CarrierLogo({ name, size = 'md', className }: Props) {
  const carrier = resolveCarrier(name)

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-bold tracking-tight shadow-sm ring-1 ring-black/5',
        SIZE[size],
        className
      )}
      style={{ background: carrier.bg, color: carrier.fg }}
      aria-hidden
    >
      <span className='absolute inset-x-0 top-0 h-1/3 bg-white/15' />
      <span className='relative z-10'>{carrier.initials}</span>
    </span>
  )
}
