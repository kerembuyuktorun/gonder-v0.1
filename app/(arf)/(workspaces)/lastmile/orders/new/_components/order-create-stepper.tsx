'use client'

import { cn } from '@/lib/utils'
import type { OrderCreateStep } from '../_types/order-create'
import { ORDER_CREATE_STEP_META } from '../_lib/order-create-helpers'

type Props = {
  currentStep: OrderCreateStep
  onStepClick: (step: OrderCreateStep) => void
}

export function OrderCreateStepper({ currentStep, onStepClick }: Props) {
  const progressPercent = ((currentStep - 1) / (ORDER_CREATE_STEP_META.length - 1)) * 100

  return (
    <div className='space-y-2.5'>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-200'>
        <div
          className='h-full rounded-full bg-primary transition-all duration-500 ease-out'
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className='grid grid-cols-5 gap-2'>
        {ORDER_CREATE_STEP_META.map((step) => (
          <button
            key={step.id}
            type='button'
            onClick={() => onStepClick(step.id)}
            className={cn(
              'flex min-w-0 items-center gap-2.5 text-left text-sm transition-colors',
              step.id === currentStep
                ? 'font-semibold text-slate-900'
                : step.id < currentStep
                  ? 'font-medium text-primary hover:text-primary/80'
                  : 'font-medium text-slate-400'
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                step.id === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.id < currentStep
                    ? 'bg-primary/15 text-primary'
                    : 'bg-slate-100 text-slate-400'
              )}
            >
              {step.id}
            </span>
            <span className='hidden truncate sm:inline'>{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
