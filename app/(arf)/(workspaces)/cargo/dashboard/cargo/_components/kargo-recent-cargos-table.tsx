"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import type { RecentCargoRow } from "../_types/kargo-dashboard"

const statusConfig: Record<string, { label: string; className: string }> = {
  olusturuldu: { label: "Oluşturuldu", className: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  transfer_surecinde: { label: "Transfer Sürecinde", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  dagitimda: { label: "Dağıtımda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  iptal_edildi: { label: "İptal", className: "bg-red-500/10 text-red-600 border-red-500/20" },
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)
}

interface Props {
  cargos: RecentCargoRow[]
}

export function KargoRecentCargosTable({ cargos }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-medium">Son Kargolar</CardTitle>
          <CardDescription className="text-sm">Güncel kargo hareketleri</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/arf/cargo/shipments" className="gap-1">
            Tümü
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Takip No</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Gönderen</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Alıcı</th>
                <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground md:table-cell">Güzergah</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Tutar</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Parça</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cargos.map((c) => {
                const st = statusConfig[c.durum]
                return (
                  <tr key={c.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/arf/cargo/shipments/${c.takipNo}`} className="font-medium text-primary hover:underline">
                        {c.takipNo}
                      </Link>
                      <p className="text-xs text-muted-foreground">{c.olusturulmaZamani}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.gonderen}</td>
                    <td className="px-4 py-3 text-slate-700">{c.alici}</td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                      {c.gonderenSube} → {c.aliciSube}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                      {formatMoney(c.toplam)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-600">{c.parcaSayisi}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={st?.className}>
                        {st?.label}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
