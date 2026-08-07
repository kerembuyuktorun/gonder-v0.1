'use client'

import { cn } from '@/lib/utils'
import {
  CREATE_SHIPMENT_STEPS,
  type CreateShipmentStep,
} from '../../../_types/create-shipment'

type Props = {
  currentStep: CreateShipmentStep
  onStepClick: (step: CreateShipmentStep) => void
}

export function CreateShipmentStepper({ currentStep, onStepClick }: Props) {
  const progressPercent =
    ((currentStep - 1) / (CREATE_SHIPMENT_STEPS.length - 1)) * 100

  return (
    <div className='space-y-2.5'>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='h-full rounded-full bg-primary transition-all duration-500 ease-out'
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className='grid grid-cols-5 gap-2'>
        {CREATE_SHIPMENT_STEPS.map((step) => (
          <button
            key={step.id}
            type='button'
            onClick={() => onStepClick(step.id)}
            className={cn(
              'flex min-w-0 items-center gap-2 text-left text-sm transition-colors',
              step.id === currentStep
                ? 'font-semibold text-foreground'
                : step.id < currentStep
                  ? 'font-medium text-primary hover:text-primary/80'
                  : 'font-medium text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                step.id === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.id < currentStep
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
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
