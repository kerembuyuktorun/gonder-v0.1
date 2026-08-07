"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockBranches } from "../../_mock/interlands-mock-data"
import type { InterlandAuditLog, InterlandDetail } from "../../_types"
import { DetailHeaderCard } from "./detail-header-card"
import { DetailNotesHistorySection } from "./detail-notes-history-section"
import { DetailOverviewSection } from "./detail-overview-section"
import { InterlandEditModal } from "./interland-edit-modal"

interface Props {
  initialInterland: InterlandDetail
}

export function DetailContent({ initialInterland }: Props) {
  const [interland, setInterland] = useState(initialInterland)
  const [editOpen, setEditOpen] = useState(false)

  const branches = useMemo(
    () => mockBranches.map((item) => ({ id: item.id, name: item.name })),
    [],
  )

  const appendAudit = (entry: Omit<InterlandAuditLog, "id" | "createdAt">) => {
    setInterland((prev) => ({
      ...prev,
      auditLogs: [
        {
          ...entry,
          id: `audit-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }))
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "İnterlandlar", href: "/arf/cargo/settings/interlands" },
          { label: interland.name },
        ]}
      />

      <InterlandEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        branches={branches}
        value={{
          name: interland.name,
          branchId: interland.branchId,
          branchName: interland.branchName,
        }}
        onSave={(value) => {
          setInterland((prev) => ({ ...prev, ...value }))
          appendAudit({
            actionType: "edit",
            oldValue: "İnterland alanları",
            newValue: "İnterland bilgileri güncellendi",
            actorId: "current-user",
            actorName: "Mevcut Kullanıcı",
          })
        }}
      />

      <div className="flex flex-1 flex-col gap-5 bg-slate-50 p-6">
        <DetailHeaderCard
          interland={interland}
          onEdit={() => setEditOpen(true)}
          onToggleStatus={() => {
            const nextStatus = interland.status === "active" ? "passive" : "active"
            if (!window.confirm(`İnterland ${nextStatus === "active" ? "aktif" : "pasif"} yapılsın mı?`)) {
              return
            }
            setInterland((prev) => ({ ...prev, status: nextStatus }))
            appendAudit({
              actionType: "status_change",
              oldValue: interland.status,
              newValue: nextStatus,
              actorId: "current-user",
              actorName: "Mevcut Kullanıcı",
            })
          }}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="overview" className="text-xs">Kapsam</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notlar ve Geçmiş</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DetailOverviewSection
              interland={interland}
              onInterlandChange={setInterland}
              onAuditAppend={appendAudit}
            />
          </TabsContent>

          <TabsContent value="notes">
            <DetailNotesHistorySection interland={interland} onInterlandChange={setInterland} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
