"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

type PieceReportInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pieceNo: string
  reportTime: string
  reason: string
  description: string
  evidenceImageUrl?: string
}

export function PieceReportInfoModal({
  open,
  onOpenChange,
  pieceNo,
  reportTime,
  reason,
  description,
  evidenceImageUrl,
}: PieceReportInfoModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">İhbar Bilgisi</h3>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Parça No</p>
              <Input value={pieceNo || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">İhbar Zamanı</p>
              <Input value={reportTime || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-slate-500">İhbar Nedeni</p>
              <Input value={reason || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-slate-500">Açıklama</p>
              <Textarea value={description || "-"} readOnly className="min-h-24 rounded-xl border-slate-200 bg-white text-sm" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Kanıt Görseli</p>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {evidenceImageUrl ? (
                <Image
                  src={evidenceImageUrl}
                  alt="İhbar kanıt görseli"
                  width={960}
                  height={560}
                  unoptimized
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-slate-500">-</div>
              )}
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
