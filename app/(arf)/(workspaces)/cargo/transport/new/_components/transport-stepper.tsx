'use client'

import { cn } from '@/lib/utils'
import type { TransportStep } from '../_types/transport'

interface StepperProps {
  currentStep: TransportStep
  onStepClick: (step: TransportStep) => void
}

const steps = [
  { id: 1 as TransportStep, label: 'Operasyon Bilgileri' },
  { id: 2 as TransportStep, label: 'Sevk Bilgileri' },
  { id: 3 as TransportStep, label: 'Taşıma Bilgileri' },
  { id: 4 as TransportStep, label: 'Fiyatlandırma' },
]

export function TransportStepper({ currentStep, onStepClick }: StepperProps) {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick(step.id)}
            className={cn(
              'flex items-center gap-2 text-left text-sm transition-colors',
              step.id === currentStep
                ? 'font-semibold text-slate-900'
                : step.id < currentStep
                  ? 'font-medium text-primary hover:text-primary/80'
                  : 'font-medium text-slate-400',
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                step.id === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.id < currentStep
                    ? 'bg-primary/15 text-primary'
                    : 'bg-slate-100 text-slate-400',
              )}
            >
              {step.id}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
