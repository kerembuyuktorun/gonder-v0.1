"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { cn } from "@/lib/utils"
import { generateLineName } from "../_lib/line-name-generator"
import { validateLineRules } from "../_lib/line-rules-validator"
import type { LineFormState, LineRecord, LineRuleError, LocationOption } from "../_types"
import { LineWizardStepBasicInfo } from "./line-wizard-step-basic-info"
import { LineWizardStepStops } from "./line-wizard-step-stops"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  locations: LocationOption[]
  initial?: LineRecord | null
  onSubmit: (payload: LineFormState) => Promise<void>
}

type StepId = "info" | "stops"

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "info", title: "Hat Bilgileri" },
  { id: "stops", title: "Durak Dizilimi" },
]

const initialForm: LineFormState = {
  type: "main",
  name: "",
  workDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  plannedDepartureTime: "08:00",
  plannedArrivalTime: "12:00",
  stops: [
    {
      id: "stop-1",
      locationId: "",
      locationName: "",
      locationType: "transfer_center",
      operationType: "",
    },
    {
      id: "stop-2",
      locationId: "",
      locationName: "",
      locationType: "transfer_center",
      operationType: "",
    },
  ],
}

export function LineCreateEditModal({ open, onOpenChange, mode, locations, initial, onSubmit }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<LineRuleError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<LineFormState>(initialForm)

  useEffect(() => {
    if (!open) return
    if (!initial) {
      setForm(initialForm)
      setStepIndex(0)
      setErrors([])
      return
    }

    setForm({
      id: initial.id,
      type: initial.type,
      name: initial.name,
      workDays: initial.schedule.workDays,
      plannedDepartureTime: initial.schedule.plannedDepartureTime,
      plannedArrivalTime: initial.schedule.plannedArrivalTime,
      stops: initial.stops.map((stop) => ({
        id: stop.id,
        locationId: stop.locationId,
        locationName: stop.locationName,
        locationType: stop.locationType,
        operationType: stop.operationType,
      })),
    })
    setStepIndex(0)
    setErrors([])
  }, [initial, open])

  const derivedName = useMemo(() => generateLineName(form.stops), [form.stops])
  const currentStep = STEPS[stepIndex]

  const mergedForm = { ...form, name: derivedName || form.name }

  const handleNext = () => {
    if (!mergedForm.plannedDepartureTime || !mergedForm.plannedArrivalTime || mergedForm.workDays.length === 0) {
      setErrors([{ path: "schedule", message: "Çalışma günleri ve planlanan saatler zorunludur." }])
      return
    }
    setErrors([])
    setStepIndex(1)
  }

  const handleSave = async () => {
    const ruleErrors = validateLineRules(mergedForm.type, mergedForm.stops)
    if (ruleErrors.length > 0) {
      setErrors(ruleErrors)
      return
    }

    setErrors([])
    setIsSubmitting(true)
    try {
      await onSubmit(mergedForm)
      onOpenChange(false)
    } catch (error) {
      setErrors([
        {
          path: "form",
          message: error instanceof Error ? error.message : "Hat kaydedilemedi.",
        },
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl sm:max-w-[1200px] xl:max-w-[1320px]">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {mode === "create" ? "Hat Ekle" : "Hat Düzenle"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid gap-5 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {STEPS.map((step, index) => {
              const isActive = index === stepIndex
              const isCompleted = index < stepIndex

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setStepIndex(index)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : isCompleted
                        ? "border-lime-200 bg-lime-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                        isActive
                          ? "bg-white/15 text-white"
                          : isCompleted
                            ? "bg-lime-200 text-slate-900"
                            : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="text-sm font-medium leading-snug">{step.title}</div>
                  </div>
                </button>
              )
            })}
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{currentStep.title}</h3>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                {stepIndex + 1} / {STEPS.length}
              </Badge>
            </div>

            {currentStep.id === "info" ? (
              <LineWizardStepBasicInfo form={mergedForm} setForm={setForm} />
            ) : (
              <LineWizardStepStops form={mergedForm} setForm={setForm} locations={locations} errors={errors} />
            )}

            {currentStep.id === "info" && errors.length > 0 && (
              <p className="mt-3 text-sm text-rose-600">{errors[0]?.message}</p>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
              disabled={stepIndex === 0 || isSubmitting}
            >
              Geri
            </Button>
            {stepIndex < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                İleri
              </Button>
            ) : (
              <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Hattı Ekle" : "Güncellemeleri Kaydet"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
