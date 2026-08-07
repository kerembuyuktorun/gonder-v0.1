"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

type ShipmentCancelInfo = {
  canceledAt: string
  canceledBy: string
  category: string
  reason: string
  note: string
}

type ShipmentCancelInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trackingNo: string
  info: ShipmentCancelInfo | null
}

export function ShipmentCancelInfoModal({ open, onOpenChange, trackingNo, info }: ShipmentCancelInfoModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">İptal Bilgisi</h3>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Takip No</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{trackingNo || "-"}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">İptal Tarihi</p>
              <Input value={info?.canceledAt || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">İşlemi Yapan</p>
              <Input value={info?.canceledBy || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Kategori</p>
              <Input value={info?.category || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">İptal Nedeni</p>
              <Input value={info?.reason || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-slate-500">Açıklama</p>
              <Textarea value={info?.note || "-"} readOnly className="min-h-24 rounded-xl border-slate-200 bg-white text-sm" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
