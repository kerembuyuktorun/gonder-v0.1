"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Inbox } from "lucide-react"
import type { PriceSurcharge } from "../../_types"

interface Props {
  surcharges: PriceSurcharge
}

function money(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function DetailSurchargesSection({ surcharges }: Props) {
  const customServices = surcharges.customServices ?? []

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Ek Hizmetler</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {customServices.length === 0 ? (
          <div className="md:col-span-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-slate-500">
            <Inbox className="mb-2 size-7" />
            <p className="text-sm font-medium">Henüz ek hizmet eklenmemiş</p>
          </div>
        ) : (
          customServices.map((service) => (
            <div key={service.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{service.name}</p>
              <p className="font-medium text-slate-900">{money(service.fee)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
