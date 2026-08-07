"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

type DeliveryInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  heading: string
  firstName: string
  lastName: string
  deliveryTime: string
  phone: string
  imageUrl?: string
  imageAlt?: string
}

export function DeliveryInfoModal({
  open,
  onOpenChange,
  heading,
  firstName,
  lastName,
  deliveryTime,
  phone,
  imageUrl,
  imageAlt = "Teslimat resmi",
}: DeliveryInfoModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{heading}</h3>
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Ad</p>
              <Input value={firstName || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Soyad</p>
              <Input value={lastName || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-slate-500">Teslimat Zamanı</p>
              <Input value={deliveryTime || "-"} readOnly className="h-9" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-slate-500">Telefon Numarası</p>
              <Input value={phone || "-"} readOnly className="h-9" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Resim</p>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
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
