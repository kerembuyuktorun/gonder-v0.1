"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowLeft, MapPin, Pencil, Phone, Power, PowerOff, Share2, User } from "lucide-react"
import type { BranchDetail, BranchStatus } from "../_types"

const statusConfig: Record<BranchStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  passive: { label: "Pasif", className: "bg-red-500/10 text-red-700 border-red-500/20" },
}

interface Props {
  branch: BranchDetail
  status: BranchStatus
  onToggleStatus: () => void
  onEdit: () => void
}

export function DetailHeaderCard({ branch, status, onToggleStatus, onEdit }: Props) {
  const statusCfg = statusConfig[status]

  const handleShare = () => {
    void navigator.clipboard?.writeText(window.location.href)
  }

  const handleToggle = () => {
    const isPassive = status === "passive"
    const message = isPassive
      ? `${branch.ad} aktif hale getirilecek. Onaylıyor musunuz?`
      : `${branch.ad} pasif yapılacak. Operasyon akışı duraklatılabilir. Onaylıyor musunuz?`

    if (window.confirm(message)) {
      onToggleStatus()
    }
  }

  const mapsUrl =
    branch.latitude && branch.longitude
      ? `https://maps.google.com/?q=${branch.latitude},${branch.longitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(branch.acikAdres ?? `${branch.il} ${branch.ilce}`)}`

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
              <Link href="/arf/cargo/settings/branches">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">{branch.ad}</h1>
                <Badge variant="outline" className={cn("border", statusCfg.className)}>
                  {statusCfg.label}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-slate-100 font-mono text-xs text-slate-600"
                >
                  {branch.kod}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {branch.il}, {branch.ilce}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-4" />
                  {branch.telefon}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-4" />
                  {branch.acenteSahibi ?? branch.acenteYoneticisi ?? "Yetkili tanımlı değil"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={onEdit}>
              <Pencil className="mr-1.5 size-4" />
              Düzenle
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={handleShare}>
              <Share2 className="mr-1.5 size-4" />
              Paylaş
            </Button>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <a href={mapsUrl} target="_blank" rel="noreferrer">
                <MapPin className="mr-1.5 size-4" />
                Konum
              </a>
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={handleToggle}>
              {status === "passive" ? (
                <Power className="mr-1.5 size-4" />
              ) : (
                <PowerOff className="mr-1.5 size-4" />
              )}
              {status === "passive" ? "Aktif Yap" : "Pasif Yap"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
