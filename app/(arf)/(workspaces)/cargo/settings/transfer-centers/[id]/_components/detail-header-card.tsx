"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowLeft, MapPin, Phone, Power, PowerOff, Share2, User } from "lucide-react"
import type { TransferCenter, TransferCenterStatus } from "../_types"

const statusConfig: Record<TransferCenterStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  passive: { label: "Pasif", className: "bg-red-500/10 text-red-700 border-red-500/20" },
  maintenance: {
    label: "Bakımda",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
}

interface Props {
  center: TransferCenter
  status: TransferCenterStatus
  onToggleStatus: () => void
}

export function DetailHeaderCard({ center, status, onToggleStatus }: Props) {
  const statusCfg = statusConfig[status]

  const handleShare = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleToggle = () => {
    const isPassive = status === "passive"
    const message = isPassive
      ? `${center.name} aktif hale getirilecek. Onaylıyor musunuz?`
      : `${center.name} pasif yapılacak. Aktif işlemler duraklatılabilir. Onaylıyor musunuz?`
    if (window.confirm(message)) {
      onToggleStatus()
    }
  }

  const mapsUrl =
    center.latitude && center.longitude
      ? `https://maps.google.com/?q=${center.latitude},${center.longitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(center.address)}`

  return (
    <Card
      className={cn(
        "rounded-2xl border-slate-200 bg-white shadow-sm",
        status === "passive" && "border-red-300 bg-red-50/30",
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="mt-0.5 size-9 shrink-0 rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <Link href="/arf/cargo/settings/transfer-centers">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  {center.name}
                </h1>
                <Badge variant="outline" className={cn("border", statusCfg.className)}>
                  {statusCfg.label}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-slate-100 font-mono text-xs text-slate-600"
                >
                  {center.code}
                </Badge>
                {center.workingHours && (
                  <Badge variant="outline" className="border-slate-200 text-xs text-slate-500">
                    {center.workingHours}
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {center.district}, {center.city}
                </span>
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {center.managerName}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" />
                  {center.managerPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-1.5 size-3.5" />
              Paylaş
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
            >
              {status === "passive" ? (
                <>
                  <Power className="mr-1.5 size-3.5" />
                  Aktif Yap
                </>
              ) : (
                <>
                  <PowerOff className="mr-1.5 size-3.5" />
                  Pasif Yap
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="mr-1.5 size-3.5" />
                Konum
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
