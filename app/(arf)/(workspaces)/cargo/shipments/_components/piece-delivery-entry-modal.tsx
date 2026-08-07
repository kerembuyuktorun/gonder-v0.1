"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

const pieceDeliveryEntrySchema = z.object({
  firstName: z.string().trim().min(1, "Ad zorunludur."),
  lastName: z.string().trim().min(1, "Soyad zorunludur."),
  phone: z.string().trim().min(10, "Telefon numarası en az 10 karakter olmalıdır."),
})

type PieceDeliveryEntryValues = z.infer<typeof pieceDeliveryEntrySchema>

type PieceDeliveryEntryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pieceNos: string[]
  initialValues?: Partial<PieceDeliveryEntryValues>
  onConfirm: (values: PieceDeliveryEntryValues) => void
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

export function PieceDeliveryEntryModal({
  open,
  onOpenChange,
  pieceNos,
  initialValues,
  onConfirm,
  confirmLabel = "Kaydet",
}: PieceDeliveryEntryModalProps) {
  const form = useForm<PieceDeliveryEntryValues>({
    resolver: zodResolver(pieceDeliveryEntrySchema),
    defaultValues: {
      firstName: initialValues?.firstName ?? "",
      lastName: initialValues?.lastName ?? "",
      phone: initialValues?.phone ?? "",
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      firstName: initialValues?.firstName ?? "",
      lastName: initialValues?.lastName ?? "",
      phone: initialValues?.phone ?? "",
    })
  }, [form, initialValues?.firstName, initialValues?.lastName, initialValues?.phone, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Teslimat Bilgisi Al</h3>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <form className="space-y-4 p-5" onSubmit={form.handleSubmit(onConfirm)}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Seçili Parça Adedi</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{pieceNos.length || 0}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Parça Noları</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{getPiecePreview(pieceNos)}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Ad</p>
              <Input {...form.register("firstName")} placeholder="Ad" className="h-9" />
              {form.formState.errors.firstName?.message ? (
                <p className="text-xs text-rose-600">{form.formState.errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Soyad</p>
              <Input {...form.register("lastName")} placeholder="Soyad" className="h-9" />
              {form.formState.errors.lastName?.message ? (
                <p className="text-xs text-rose-600">{form.formState.errors.lastName.message}</p>
              ) : null}
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-slate-500">Telefon Numarası</p>
              <Input {...form.register("phone")} placeholder="05xx xxx xx xx" className="h-9" />
              {form.formState.errors.phone?.message ? (
                <p className="text-xs text-rose-600">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Resim</p>
            <div className="mt-2 max-w-sm">
              <Input type="file" accept="image/*" className="h-9 bg-white" />
            </div>
          </div>

          <p className="text-xs text-slate-500">Kaydet ile girilen teslimat bilgileri seçili parçaların tamamına uygulanır.</p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button type="submit">{confirmLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
