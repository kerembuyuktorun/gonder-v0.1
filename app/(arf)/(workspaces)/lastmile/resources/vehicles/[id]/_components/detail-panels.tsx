'use client'

import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { Copy, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>
      {children}
    </p>
  )
}

export function PanelHeader({
  icon: Icon,
  title,
  meta,
}: {
  icon: LucideIcon
  title: string
  meta?: ReactNode
}) {
  return (
    <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5'>
      <div className='flex items-center gap-2.5'>
        <span className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
          <Icon className='size-4' />
        </span>
        <h3 className='text-sm font-semibold text-slate-900'>{title}</h3>
      </div>
      {meta}
    </div>
  )
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  copyable,
}: {
  icon: LucideIcon
  label: string
  value?: string | null
  mono?: boolean
  copyable?: boolean
}) {
  const trimmed = value?.trim() ?? ''
  const canCopy = Boolean(copyable && trimmed)

  return (
    <div className='flex items-start justify-between gap-4 py-2.5'>
      <span className='flex shrink-0 items-center gap-2.5 text-sm text-slate-500'>
        <Icon className='size-4 text-slate-400' />
        {label}
      </span>
      <span className='flex min-w-0 items-start gap-1'>
        <span
          className={cn(
            'wrap-break-word text-right text-sm font-medium text-slate-800',
            mono && 'font-mono text-[13px]'
          )}
        >
          {trimmed || '—'}
        </span>
        {canCopy ? (
          <button
            type='button'
            onClick={async () => {
              const ok = await copyText(trimmed)
              if (ok) toast.success(`${label} kopyalandı`)
              else toast.error('Kopyalanamadı')
            }}
            className='rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600'
            aria-label={`${label} kopyala`}
          >
            <Copy className='size-3.5' />
          </button>
        ) : null}
      </span>
    </div>
  )
}
