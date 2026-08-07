"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const pieceReportSchema = z.object({
  reason: z.enum(["hasarli_kargo", "yanlis_urun", "eksik_hatali_evrak", "saskin_kargo"]),
  description: z.string().trim().min(1, "Açıklama zorunludur."),
})

type PieceReportValues = z.infer<typeof pieceReportSchema>

type PieceReportModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pieceNos: string[]
  initialValues?: Partial<PieceReportValues>
  onConfirm: (values: PieceReportValues) => void
  confirmLabel?: string
}

const getPiecePreview = (pieceNos: string[]) => {
  if (pieceNos.length === 0) {
    return "-"
  }

  const firstFive = pieceNos.slice(0, 5).join(", ")

  if (pieceNos.length <= 5) {
    return firstFive
  }

  return `${firstFive} +${pieceNos.length - 5} daha`
}

export function PieceReportModal({
  open,
  onOpenChange,
  pieceNos,
  initialValues,
  onConfirm,
  confirmLabel = "İhbarı Kaydet",
}: PieceReportModalProps) {
  const form = useForm<PieceReportValues>({
    resolver: zodResolver(pieceReportSchema),
    defaultValues: {
      reason: initialValues?.reason ?? "hasarli_kargo",
      description: initialValues?.description ?? "",
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      reason: initialValues?.reason ?? "hasarli_kargo",
      description: initialValues?.description ?? "",
    })
  }, [form, initialValues?.description, initialValues?.reason, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Parça İhbar Et</h3>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <form className="space-y-4 p-5" onSubmit={form.handleSubmit(onConfirm)}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Seçili Parça Adeti</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{pieceNos.length || 0}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Parça Numaraları</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{getPiecePreview(pieceNos)}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">İhbar Nedeni</p>
              <Controller
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                      <SelectValue placeholder="Sebep seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hasarli_kargo">Hasarlı Kargo</SelectItem>
                      <SelectItem value="yanlis_urun">Yanlış Ürün</SelectItem>
                      <SelectItem value="eksik_hatali_evrak">Eksik/Hatalı Evrak</SelectItem>
                      <SelectItem value="saskin_kargo">Şaşkın Kargo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.reason?.message ? (
                <p className="text-xs text-rose-600">{form.formState.errors.reason.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">Kanıt Görseli</p>
              <Input type="file" accept="image/*" className="h-10 rounded-xl border-slate-200 bg-white" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Açıklama</p>
            <Textarea
              {...form.register("description")}
              placeholder="İhbar detayını yazın..."
              className="min-h-28 rounded-xl border-slate-200 bg-white text-sm"
            />
            {form.formState.errors.description?.message ? (
              <p className="text-xs text-rose-600">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">
              <AlertTriangle className="size-4" />
              {confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
