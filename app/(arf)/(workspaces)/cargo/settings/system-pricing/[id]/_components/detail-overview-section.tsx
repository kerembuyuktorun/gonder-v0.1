"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PriceDefinitionDetail } from "../../_types"

interface Props {
  detail: PriceDefinitionDetail
}

export function DetailOverviewSection({ detail }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Fiyatlandırma Kimliği</CardTitle>
          <CardDescription>Bu fiyat tanımının ana metadata alanları.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Tarife Adı</p>
            <p className="font-medium text-slate-900">{detail.name}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Tarife Kodu</p>
            <p className="font-mono font-medium text-slate-900">{detail.code}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Geçerlilik</p>
            <p className="font-medium text-slate-900">
              {new Date(detail.validFrom).toLocaleDateString("tr-TR")} - {new Date(detail.validTo).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Hesaplama Özeti</CardTitle>
          <CardDescription>Fiyat motorunun bu tarifeyi nasıl kullandığına dair referans.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            1. Özel sözleşme fiyatı varsa override edilir.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            2. Özel kural yoksa varsayılan aktif tarife matrisi uygulanır.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            3. Taban + dinamik artış sonrası ek hizmet kalemleri eklenerek toplam oluşur.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            4. Hesap sonucu shipment satırına snapshot olarak mühürlenir.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
