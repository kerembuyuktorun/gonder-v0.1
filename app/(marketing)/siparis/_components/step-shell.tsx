'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useWizard } from './wizard-context'

export function StepHeader({ title, description }: { title: string; description?: string }) {
  const { hideStepChrome } = useWizard()
  if (hideStepChrome) return null

  return (
    <div className='mb-6'>
      <h2 className='text-xl font-bold text-[var(--gl-ink)] sm:text-2xl'>{title}</h2>
      {description ? <p className='mt-1.5 text-sm text-[var(--gl-muted)]'>{description}</p> : null}
    </div>
  )
}

export function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <p className='gl-eyebrow'>{label}</p>
      {hint ? <p className='mt-1 text-xs text-[var(--gl-muted)]'>{hint}</p> : null}
      <div className='mt-3'>{children}</div>
    </div>
  )
}

export function StepNav({
  onBack,
  onNext,
  nextLabel = 'Devam Et',
  nextDisabled,
  hideBack,
  helper,
}: {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  hideBack?: boolean
  helper?: ReactNode
}) {
  const { hideStepChrome } = useWizard()
  if (hideStepChrome) return null

  return (
    <div className='sticky bottom-0 z-10 mt-8 flex flex-col-reverse gap-3 border-t border-[var(--gl-border)] bg-white/95 pt-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between'>
      {hideBack ? (
        <span className='hidden sm:block' />
      ) : (
        <button
          type='button'
          onClick={onBack}
          className='inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[var(--gl-muted)] transition-colors hover:text-[var(--gl-ink)]'
        >
          <ArrowLeft className='size-4' aria-hidden />
          Geri
        </button>
      )}

      <div className='flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4'>
        {helper ? <span className='text-xs text-[var(--gl-muted)] sm:text-right'>{helper}</span> : null}
        {onNext ? (
          <button
            type='button'
            onClick={onNext}
            disabled={nextDisabled}
            className='inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gl-accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--gl-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--gl-border-strong)] disabled:text-white'
          >
            {nextLabel}
            <ArrowRight className='size-4' aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  )
}
