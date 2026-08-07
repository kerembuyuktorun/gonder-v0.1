"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightLeft, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const shipmentHandoverSchema = z.object({
  reason: z.enum(["musteri_adreste_degil", "musteriye_ulasilamiyor", "diger_sebep"]),
  note: z.string().trim().optional().default(""),
})

type ShipmentHandoverValues = z.infer<typeof shipmentHandoverSchema>

type ShipmentHandoverModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trackingNo: string
  receiverBranch: string
  initialValues?: Partial<ShipmentHandoverValues>
  onConfirm: (values: ShipmentHandoverValues) => void
}

export function ShipmentHandoverModal({
  open,
  onOpenChange,
  trackingNo,
  receiverBranch,
  initialValues,
  onConfirm,
}: ShipmentHandoverModalProps) {
  const form = useForm<ShipmentHandoverValues>({
    resolver: zodResolver(shipmentHandoverSchema),
    defaultValues: {
      reason: initialValues?.reason ?? "musteri_adreste_degil",
      note: initialValues?.note ?? "",
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      reason: initialValues?.reason ?? "musteri_adreste_degil",
      note: initialValues?.note ?? "",
    })
  }, [form, initialValues?.note, initialValues?.reason, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Kargoyu Devret</h3>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <form className="space-y-4 p-5" onSubmit={form.handleSubmit(onConfirm)}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Takip No</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{trackingNo || "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Devredilecek Şube</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{receiverBranch || "-"}</p>
            <p className="mt-1 text-xs text-slate-500">Devir işlemi kurye tarafından alıcı şubeye yapılır.</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Devir Nedeni</p>
            <Controller
              control={form.control}
              name="reason"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Sebep seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="musteri_adreste_degil">Müşteri adreste değil</SelectItem>
                    <SelectItem value="musteriye_ulasilamiyor">Müşteriye ulaşılamıyor</SelectItem>
                    <SelectItem value="diger_sebep">Diğer sebep</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Açıklama (Opsiyonel)</p>
            <Textarea
              {...form.register("note")}
              placeholder="Devretme ile ilgili kısa not ekleyin..."
              className="min-h-24 rounded-xl border-slate-200 bg-white text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button type="submit">
              <ArrowRightLeft className="size-4" />
              Devret
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
