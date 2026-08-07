"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit3, Power, PowerOff } from "lucide-react"
import { fetchLineAuditLogs, toggleLineStatus, updateLine } from "../_api/lines-api"
import { LineTypeBadge } from "./line-type-badge"
import { LineDetailTimeline } from "./line-detail-timeline"
import { LineScheduleCard } from "./line-schedule-card"
import type { LineAuditLogEntry, LineFormState, LineRecord, LocationOption } from "../_types"
import { LineCreateEditModal } from "./line-create-edit-modal"
import { LineProfileSection } from "./line-profile-section"
import { LineAuditTrailSection } from "./line-audit-trail-section"

interface Props {
  initialLine: LineRecord
  locations: LocationOption[]
  initialAuditLogs: LineAuditLogEntry[]
}

const STATUS_LABELS: Record<LineRecord["status"], string> = {
  active: "Aktif",
  passive: "Pasif",
}

const STATUS_CLASSES: Record<LineRecord["status"], string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  passive: "bg-slate-100 text-slate-600 border-slate-200",
}

function getInitialsFromLineName(name: string) {
  const parts = name.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? "H"
  const second = parts[1]?.[0] ?? "T"
  return `${first}${second}`.toUpperCase()
}

function formatDateTime(iso?: string) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function LineDetailPageContent({ initialLine, locations, initialAuditLogs }: Props) {
  const [line, setLine] = useState<LineRecord>(initialLine)
  const [auditLogs, setAuditLogs] = useState<LineAuditLogEntry[]>(initialAuditLogs)
  const [isActioning, setIsActioning] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  async function handleToggleStatus() {
    setIsActioning(true)
    try {
      const updated = await toggleLineStatus(line.id)
      if (updated) {
        setLine(updated)
        const refreshed = await fetchLineAuditLogs(line.id)
        setAuditLogs(refreshed)
      }
    } finally {
      setIsActioning(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-sm font-semibold text-white">
                {getInitialsFromLineName(line.name)}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">{line.name}</h1>
                  <Badge variant="outline" className={`text-xs ${STATUS_CLASSES[line.status]}`}>
                    {STATUS_LABELS[line.status]}
                  </Badge>
                  <LineTypeBadge type={line.type} />
                </div>
                <p className="text-sm text-slate-600">
                  {line.stops[0]?.locationName ?? "-"} • {line.stops[line.stops.length - 1]?.locationName ?? "-"}
                </p>
                <p className="text-xs text-slate-500">Son Güncelleme: {formatDateTime(line.updatedAt)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={isActioning} onClick={() => void handleToggleStatus()} className="h-9">
                {line.status === "active" ? <PowerOff className="mr-1.5 size-4" /> : <Power className="mr-1.5 size-4" />}
                {line.status === "active" ? "Pasif Yap" : "Aktif Yap"}
              </Button>
              <Button type="button" size="sm" onClick={() => setIsEditOpen(true)} className="h-9">
                <Edit3 className="mr-1.5 size-4" />
                Düzenle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid h-10 w-full grid-cols-4 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
          <TabsTrigger value="profile" className="text-xs">Profil</TabsTrigger>
          <TabsTrigger value="route" className="text-xs">Güzergah</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs">Zamanlama</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">İşlem Geçmişi</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <LineProfileSection line={line} />
        </TabsContent>

        <TabsContent value="route" className="pt-3">
          <LineDetailTimeline line={line} />
        </TabsContent>

        <TabsContent value="schedule" className="pt-3">
          <LineScheduleCard line={line} />
        </TabsContent>

        <TabsContent value="history" className="pt-3">
          <LineAuditTrailSection auditLogs={auditLogs} />
        </TabsContent>
      </Tabs>

      <LineCreateEditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        initial={line}
        locations={locations}
        onSubmit={async (payload: LineFormState) => {
          const updated = await updateLine(line.id, payload)
          setLine(updated)
          const refreshed = await fetchLineAuditLogs(line.id)
          setAuditLogs(refreshed)
        }}
      />
    </div>
  )
}
