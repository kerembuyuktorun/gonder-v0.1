'use client'

import { cn } from '@/lib/utils'

export type BulkCreateStepId = 1 | 2 | 3 | 4

export const BULK_CREATE_STEPS: Array<{ id: BulkCreateStepId; label: string }> = [
  { id: 1, label: 'Yükleme' },
  { id: 2, label: 'Eşleştirme' },
  { id: 3, label: 'Doğrulama' },
  { id: 4, label: 'Onay' },
]

type Props = {
  currentStep: BulkCreateStepId
  onStepClick?: (step: BulkCreateStepId) => void
}

export function BulkCreateStepper({ currentStep, onStepClick }: Props) {
  const progressPercent =
    ((currentStep - 1) / (BULK_CREATE_STEPS.length - 1)) * 100

  return (
    <div className='space-y-2.5'>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='h-full rounded-full bg-primary transition-all duration-500 ease-out'
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className='grid grid-cols-4 gap-2'>
        {BULK_CREATE_STEPS.map((step) => (
          <button
            key={step.id}
            type='button'
            disabled={!onStepClick || step.id > currentStep}
            onClick={() => onStepClick?.(step.id)}
            className={cn(
              'flex min-w-0 items-center gap-2 text-left text-sm transition-colors',
              step.id === currentStep
                ? 'font-semibold text-foreground'
                : step.id < currentStep
                  ? 'font-medium text-primary hover:text-primary/80'
                  : 'font-medium text-muted-foreground',
              (!onStepClick || step.id > currentStep) && 'cursor-default'
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

export function jobStatusToStep(
  status: string
): BulkCreateStepId {
  switch (status) {
    case 'uploading':
    case 'parsing':
      return 1
    case 'mapping':
      return 2
    case 'validating':
    case 'ready':
      return 3
    case 'approving':
    case 'completed':
      return 4
    default:
      return 1
  }
}
