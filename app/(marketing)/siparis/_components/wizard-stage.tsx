'use client'

import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { StepCargo } from './step-cargo'
import { StepFtl } from './step-ftl'
import { StepLtl } from './step-ltl'
import { StepMode } from './step-mode'
import { StepOffers } from './step-offers'
import { StepPayment } from './step-payment'
import { StepRoute } from './step-route'
import { StepService } from './step-service'
import { StepSuccess } from './step-success'
import { STEP_LABELS, useWizard, type StepId } from './wizard-context'

export function WizardStepper() {
  const { step, steps, goTo } = useWizard()
  const visible: StepId[] = steps.filter((id) => id !== 'success')
  const currentIndex = visible.indexOf(step)
  const isDone = step === 'success'

  return (
    <div>
      <ol className='hidden items-center gap-2 md:flex'>
        {visible.map((id, index) => {
          const done = isDone || index < currentIndex
          const active = !isDone && index === currentIndex

          return (
            <li key={id} className='flex flex-1 items-center gap-2 last:flex-none'>
              <button
                type='button'
                onClick={() => (done ? goTo(id) : undefined)}
                disabled={!done}
                className='flex items-center gap-2 disabled:cursor-default'
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done
                      ? 'bg-[var(--gl-petrol)] text-white'
                      : active
                        ? 'bg-[var(--gl-accent)] text-white'
                        : 'bg-[var(--gl-subtle)] text-[var(--gl-muted)]'
                  }`}
                >
                  {done ? <Check className='size-3.5' strokeWidth={3} aria-hidden /> : index + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-xs font-semibold ${
                    active ? 'text-[var(--gl-ink)]' : 'text-[var(--gl-muted)]'
                  }`}
                >
                  {STEP_LABELS[id]}
                </span>
              </button>

              {index < visible.length - 1 ? (
                <span
                  className={`h-px flex-1 ${done ? 'bg-[var(--gl-petrol)]' : 'bg-[var(--gl-border)]'}`}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className='md:hidden'>
        <div className='flex items-baseline justify-between'>
          <p className='text-sm font-semibold text-[var(--gl-ink)]'>
            {isDone ? 'Tamamlandı' : STEP_LABELS[step]}
          </p>
          <p className='text-xs text-[var(--gl-muted)]'>
            Adım {isDone ? visible.length : currentIndex + 1}/{visible.length}
          </p>
        </div>
        <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--gl-subtle)]'>
          <div
            className='h-full rounded-full bg-[var(--gl-accent)] transition-all duration-300'
            style={{ width: `${((isDone ? visible.length : currentIndex + 1) / visible.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function StepDetails() {
  const { draft } = useWizard()
  if (draft.service === 'kargo') return <StepCargo />
  if (draft.logisticsMode === 'ftl') return <StepFtl />
  if (draft.logisticsMode === 'ltl') return <StepLtl />
  return <StepMode />
}

export function WizardStage({
  payment,
  success,
}: {
  payment?: ReactNode
  success?: ReactNode
}) {
  const { step } = useWizard()

  switch (step) {
    case 'route':
      return <StepRoute />
    case 'service':
      return <StepService />
    case 'mode':
      return <StepMode />
    case 'details':
      return <StepDetails />
    case 'offers':
      return <StepOffers />
    case 'payment':
      return payment ?? <StepPayment />
    case 'success':
      return success ?? <StepSuccess />
    default:
      return null
  }
}
