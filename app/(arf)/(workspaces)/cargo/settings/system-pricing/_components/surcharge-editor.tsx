"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PriceSurcharge } from "../_types"
import { Plus, Trash2 } from "lucide-react"

interface Props {
  value: PriceSurcharge
  onChange: <K extends keyof PriceSurcharge>(key: K, value: PriceSurcharge[K]) => void
}

export function SurchargeEditor({ value, onChange }: Props) {
  const [draftName, setDraftName] = useState("")
  const [draftFee, setDraftFee] = useState("")

  const addService = () => {
    const name = draftName.trim()
    const fee = Number(draftFee)

    if (!name || Number.isNaN(fee) || fee < 0) {
      return
    }

    onChange("customServices", [
      ...(value.customServices ?? []),
      {
        id: `svc-${Date.now()}`,
        name,
        fee,
      },
    ])

    setDraftName("")
    setDraftFee("")
  }

  const removeService = (id: string) => {
    onChange(
      "customServices",
      (value.customServices ?? []).filter((service) => service.id !== id),
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <div className="space-y-1.5">
            <Label>Ek Hizmet Adı</Label>
            <Input
              value={draftName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDraftName(event.target.value)}
              placeholder="Örn: Sigorta Bedeli"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tutar (TL)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={draftFee}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDraftFee(event.target.value)}
              placeholder="45"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addService} className="w-full md:w-auto">
              <Plus className="mr-1.5 size-4" />
              Ek Hizmet Oluştur
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {(value.customServices ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            Henüz ek hizmet oluşturulmadı.
          </div>
        ) : (
          (value.customServices ?? []).map((service) => (
            <div key={service.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{service.name}</p>
                <p className="text-sm text-slate-600">
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(service.fee)}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => removeService(service.id)}>
                <Trash2 className="mr-1.5 size-4" />
                Sil
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
