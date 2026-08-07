"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { IntegrationRecord } from "../_types"
import { INTEGRATION_STATUS_LABELS } from "../_types"

interface Props {
  row: IntegrationRecord
  onConnect: (platformId: string) => void
  onDuplicate: (row: IntegrationRecord) => void
}

function statusClass(status: IntegrationRecord["status"]): string {
  switch (status) {
    case "connected":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "error":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "pending_setup":
      return "border-slate-200 bg-slate-50 text-slate-600"
    default:
      return "border-red-200 bg-red-50 text-red-700"
  }
}

function relativeDate(iso?: string): string {
  if (!iso) return "Henüz senkron yok"
  const diffMin = Math.floor((Date.now() - new Date(iso).valueOf()) / 60_000)
  if (diffMin < 60) return `${diffMin} dk önce`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} saat önce`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay} gün önce`
}

export function IntegrationCard({ row, onConnect, onDuplicate }: Props) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          {row.platform?.logoUrl ? (
            <Image src={row.platform.logoUrl} alt={row.platform.name} width={28} height={28} className="rounded-md" />
          ) : (
            <div className="size-7 rounded-md bg-slate-200" />
          )}
          <span>{row.platform?.name ?? row.platformId}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <Badge variant="outline" className={cn("border", statusClass(row.status))}>
          {INTEGRATION_STATUS_LABELS[row.status]}
        </Badge>
        <p title={row.lastSyncAt ? new Date(row.lastSyncAt).toLocaleString("tr-TR") : "-"}>
          Son Senkronizasyon: {relativeDate(row.lastSyncAt)}
        </p>
        <p>Senkronizasyon: {row.successfulSyncCount ?? 0} işlem başarılı</p>
        <p>Son Hata: {row.lastErrorMessage ?? "Yok"}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {row.connected ? (
          <Button asChild className="flex-1" variant="outline">
            <Link href={`/arf/cargo/settings/integrations/${row.id}`}>Ayarlar</Link>
          </Button>
        ) : (
          <Button type="button" className="flex-1" onClick={() => onConnect(row.platformId)}>
            Bağla
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => onDuplicate(row)}>
          Bağlantıyı Kopyala
        </Button>
      </CardFooter>
    </Card>
  )
}
