'use client'

import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

export function SelectionCard({
  selected,
  onSelect,
  title,
  hint,
  art,
  disabled,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  hint?: string
  art?: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`group relative flex h-full flex-col rounded-2xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)] shadow-[0_16px_36px_-24px_rgb(25_91_85_/_0.5)]'
          : 'border-[var(--gl-border)] bg-white hover:border-[var(--gl-border-strong)]'
      }`}
    >
      {selected ? (
        <span className='absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[var(--gl-petrol)] text-white'>
          <Check className='size-3' strokeWidth={3} aria-hidden />
        </span>
      ) : null}

      {art ? <div className='mb-3 flex h-20 items-center justify-center'>{art}</div> : null}

      <p className='text-sm font-semibold text-[var(--gl-ink)]'>{title}</p>
      {hint ? <p className='mt-1 text-xs leading-relaxed text-[var(--gl-muted)]'>{hint}</p> : null}
    </button>
  )
}
