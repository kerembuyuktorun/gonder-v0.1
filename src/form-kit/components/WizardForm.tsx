'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { FieldRenderer } from './FieldRenderer'
import type { WizardFormProps, WizardStepConfig } from '../context/types'

function mapStepErrorsToForm(
  step: WizardStepConfig,
  values: Record<string, unknown>,
  setError: (name: string, error: { type: string; message: string }) => void
): boolean {
  const result = step.schema.safeParse(values)
  if (result.success) {
    return true
  }

  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!path) continue
    setError(path, { type: 'manual', message: issue.message })
  }

  return false
}

export function WizardForm<TValues extends Record<string, unknown> = Record<string, unknown>>({
  config,
  showDescriptions = true,
  showRequired = true,
}: WizardFormProps<TValues>) {
  const {
    steps,
    defaultValues,
    onSubmit,
    onStepChange,
    className,
    nextLabel = 'Ileri',
    prevLabel = 'Geri',
    submitLabel = 'Tamamla',
  } = config

  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TValues>({
    defaultValues,
    mode: 'onChange',
  })

  const watchedValues = useWatch({ control: form.control }) as Record<string, unknown>
  const currentStep = steps[stepIndex]
  const canGoBack = stepIndex > 0
  const isLastStep = stepIndex === steps.length - 1
  const progressValue = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex, steps.length])

  const goToStep = (nextIndex: number) => {
    setStepIndex(nextIndex)
    onStepChange?.(nextIndex)
  }

  const handleNext = async () => {
    form.clearErrors()
    const valid = mapStepErrorsToForm(
      currentStep,
      form.getValues() as Record<string, unknown>,
      (name, error) => form.setError(name as never, error),
    )
    if (!valid) return
    if (!isLastStep) {
      goToStep(stepIndex + 1)
    }
  }

  const handleBack = () => {
    if (!canGoBack) return
    goToStep(stepIndex - 1)
  }

  const handleFinalSubmit = async () => {
    form.clearErrors()
    const valid = mapStepErrorsToForm(
      currentStep,
      form.getValues() as Record<string, unknown>,
      (name, error) => form.setError(name as never, error),
    )
    if (!valid) return

    try {
      setIsSubmitting(true)
      await onSubmit(form.getValues())
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleFields = currentStep.fields.filter((field) => !field.condition || field.condition(watchedValues || {}))

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Adim {stepIndex + 1} / {steps.length}</span>
          <span>%{Math.round(progressValue)}</span>
        </div>
        <Progress value={progressValue} />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{currentStep.title}</h3>
        {currentStep.description && (
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleFields.map((field) => (
          <FieldRenderer
            key={field.name}
            config={field}
            control={form.control}
            watchValues={watchedValues}
            showDescription={showDescriptions}
            showRequired={showRequired}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={handleBack} disabled={!canGoBack || isSubmitting}>
          {prevLabel}
        </Button>

        {!isLastStep ? (
          <Button type="button" onClick={handleNext} disabled={isSubmitting}>
            {nextLabel}
          </Button>
        ) : (
          <Button type="button" onClick={handleFinalSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor...' : submitLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
