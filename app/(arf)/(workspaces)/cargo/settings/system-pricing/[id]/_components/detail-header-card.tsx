"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PriceDefinitionDetail } from "../../_types"
import { ArrowLeft, Edit3, Power, PowerOff } from "lucide-react"

interface Props {
  detail: PriceDefinitionDetail
  onEdit: () => void
  onToggleStatus: () => void
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("tr-TR")
}

export function DetailHeaderCard({ detail, onEdit, onToggleStatus }: Props) {
  const passive = detail.status === "passive"

  return (
    <Card className={cn("sticky top-2 z-20 rounded-2xl border-slate-200 bg-white shadow-sm", passive && "border-red-200 bg-red-50") }>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" asChild className="mt-0.5 size-9 rounded-lg border border-slate-200 bg-white shadow-sm">
              <Link href="/arf/cargo/settings-pricing">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">{detail.name}</h1>
                <Badge variant="outline" className={cn("border", passive ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
                  {passive ? "Pasif" : "Aktif"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Geçerlilik: {formatDate(detail.validFrom)} - {formatDate(detail.validTo)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-9" onClick={onToggleStatus}>
              {passive ? <Power className="mr-1.5 size-4" /> : <PowerOff className="mr-1.5 size-4" />}
              {passive ? "Aktif Yap" : "Pasif Yap"}
            </Button>
            <Button type="button" size="sm" className="h-9" onClick={onEdit}>
              <Edit3 className="mr-1.5 size-4" />
              Düzenle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
