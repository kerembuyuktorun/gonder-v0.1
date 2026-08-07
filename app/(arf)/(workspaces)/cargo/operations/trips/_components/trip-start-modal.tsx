"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { isWarehouseSupplier, validateTripStartForm } from "../_lib/trip-start-validator"
import { LINE_TYPE_LABELS, SUPPLIER_TYPE_LABELS } from "../_lib/trip-status-helpers"
import type { DriverOption, SupplierOption, TripLineOption, TripStartFormState, VehicleOption } from "../_types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lines: TripLineOption[]
  suppliers: SupplierOption[]
  vehicles: VehicleOption[]
  drivers: DriverOption[]
  onSubmit: (payload: TripStartFormState) => Promise<void>
}

type StepId = "route" | "supplier" | "summary"

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "route", title: "Rota Seçimi" },
  { id: "supplier", title: "Tedarikçi / Araç / Sürücü" },
  { id: "summary", title: "Onay" },
]

const INITIAL_FORM: TripStartFormState = {
  lineType: "",
  lineId: "",
  supplierType: "",
  supplierId: "",
  vehicleId: "",
  driverId: "",
}

export function TripStartModal({ open, onOpenChange, lines, suppliers, vehicles, drivers, onSubmit }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<TripStartFormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStep = STEPS[stepIndex]
  const filteredLines = useMemo(() => lines.filter((item) => item.type === form.lineType), [lines, form.lineType])
  const filteredSuppliers = useMemo(() => suppliers.filter((item) => item.type === form.supplierType), [suppliers, form.supplierType])
  const filteredVehicles = useMemo(() => vehicles.filter((item) => item.supplierId === form.supplierId), [vehicles, form.supplierId])
  const filteredDrivers = useMemo(() => drivers.filter((item) => item.vehicleId === form.vehicleId), [drivers, form.vehicleId])
  const companySupplier = useMemo(() => suppliers.find((item) => item.type === "company"), [suppliers])

  const isWarehouse = isWarehouseSupplier(form.supplierType)

  function resetForm() {
    setForm(INITIAL_FORM)
    setStepIndex(0)
    setErrors([])
    setIsSubmitting(false)
  }

  function closeModal(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) resetForm()
  }

  function handleContinue() {
    if (currentStep.id === "route") {
      if (!form.lineType || !form.lineId) {
        setErrors(["Hat türü ve hat seçimi zorunludur."])
        return
      }
    }

    if (currentStep.id === "supplier") {
      const parsed = validateTripStartForm(form)
      if (!parsed.success) {
        const messages = Array.from(new Set(parsed.error.issues.map((issue) => issue.message)))
        setErrors(messages)
        return
      }
    }

    setErrors([])
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  async function handleStartTrip() {
    const parsed = validateTripStartForm(form)
    if (!parsed.success) {
      const messages = Array.from(new Set(parsed.error.issues.map((issue) => issue.message)))
      setErrors(messages)
      return
    }

    setErrors([])
    setIsSubmitting(true)
    try {
      await onSubmit(form)
      closeModal(false)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Sefer başlatılamadı."])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-200 p-0 shadow-2xl sm:max-w-[1120px]">
        <DialogHeader>
          <div className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-slate-900">Yeni Sefer Başlat</DialogTitle>
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
            <h3 className="mb-4 text-lg font-semibold text-slate-900">{currentStep.title}</h3>

            {currentStep.id === "route" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hat Türü</Label>
                  <Select
                    value={form.lineType}
                    onValueChange={(value: string) => setForm((prev) => ({ ...prev, lineType: value as TripStartFormState["lineType"], lineId: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hat türü seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Ana Hat</SelectItem>
                      <SelectItem value="hub">Merkez Hat</SelectItem>
                      <SelectItem value="feeder">Ara Hat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hat Seçiniz</Label>
                  <Select
                    value={form.lineId}
                    onValueChange={(value: string) => setForm((prev) => ({ ...prev, lineId: value }))}
                    disabled={!form.lineType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.lineType ? "Hat seçiniz" : "Önce hat türü seçiniz"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredLines.map((line) => (
                        <SelectItem key={line.id} value={line.id}>
                          {line.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep.id === "supplier" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tedarikçi Tipi</Label>
                  <Select
                    value={form.supplierType}
                    onValueChange={(value: string) =>
                      setForm((prev) => {
                        const nextType = value as TripStartFormState["supplierType"]
                        return {
                          ...prev,
                          supplierType: nextType,
                          supplierId: nextType === "company" ? companySupplier?.id ?? "" : "",
                          vehicleId: "",
                          driverId: "",
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tedarikçi tipi seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Şirket</SelectItem>
                      <SelectItem value="warehouse">Ambar</SelectItem>
                      <SelectItem value="truck_owner">Kamyon Sahibi</SelectItem>
                      <SelectItem value="logistics">Lojistik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tedarikçi İsmi</Label>
                  <Select
                    value={form.supplierId}
                    onValueChange={(value: string) => setForm((prev) => ({ ...prev, supplierId: value, vehicleId: "", driverId: "" }))}
                    disabled={!form.supplierType || form.supplierType === "company"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.supplierType ? (form.supplierType === "company" ? "Şirket" : "Tedarikçi seçiniz") : "Önce tedarikçi tipi seçiniz"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isWarehouse ? "Araç Seçiniz (Opsiyonel)" : "Araç Seçiniz"}</Label>
                  <Select
                    value={form.vehicleId}
                    onValueChange={(value: string) => setForm((prev) => ({ ...prev, vehicleId: value, driverId: "" }))}
                    disabled={!form.supplierId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.supplierId ? "Plaka seçiniz" : "Önce tedarikçi seçiniz"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isWarehouse ? "Sürücü Seçiniz (Opsiyonel)" : "Sürücü Seçiniz"}</Label>
                  <Select
                    value={form.driverId}
                    onValueChange={(value: string) => setForm((prev) => ({ ...prev, driverId: value }))}
                    disabled={!form.vehicleId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.vehicleId ? "Sürücü seçiniz" : "Önce araç seçiniz"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isWarehouse && (
                  <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Ambar firmaları için araç ve sürücü bilgisi boş geçilebilir. TTİ çıktısında bu alanlar boş bırakılır.
                  </div>
                )}
              </div>
            )}

            {currentStep.id === "summary" && (
              <div className="space-y-3 text-sm text-slate-700">
                <SummaryRow
                  label="Hat"
                  value={
                    form.lineId
                      ? `${LINE_TYPE_LABELS[form.lineType as keyof typeof LINE_TYPE_LABELS]} / ${lines.find((item) => item.id === form.lineId)?.name ?? "-"}`
                      : "-"
                  }
                />
                <SummaryRow
                  label="Tedarikçi"
                  value={
                    form.supplierId
                      ? `${SUPPLIER_TYPE_LABELS[form.supplierType as keyof typeof SUPPLIER_TYPE_LABELS]} / ${suppliers.find((item) => item.id === form.supplierId)?.name ?? "-"}`
                      : "-"
                  }
                />
                <SummaryRow label="Araç" value={vehicles.find((item) => item.id === form.vehicleId)?.plate ?? "Plakasız"} />
                <SummaryRow label="Sürücü" value={drivers.find((item) => item.id === form.driverId)?.name ?? "Sürücüsüz"} />
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => closeModal(false)}>
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
              <Button type="button" onClick={handleContinue} disabled={isSubmitting}>
                Devam
              </Button>
            ) : (
              <Button type="button" onClick={handleStartTrip} disabled={isSubmitting}>
                {isSubmitting ? "Başlatılıyor..." : "Sefer Başlat"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  )
}
