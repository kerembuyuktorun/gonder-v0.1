"use client"

import { Suspense, useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Building2, MessageSquare, Package, ReceiptText, Users } from "lucide-react"
import type { BranchCargoRecord, BranchDetail } from "../_types"
import { DetailCargoesSection } from "./detail-cargoes-section"
import { DetailCommissionSection } from "./detail-commission-section"
import { DetailFinancialSection } from "./detail-financial-section"
import { BranchDetailEditModal } from "./branch-detail-edit-modal"
import { DetailHeaderCard } from "./detail-header-card"
import { DetailInfoSection } from "./detail-info-section"
import { DetailNotesSection } from "./detail-notes-section"
import { DetailUsersSection } from "./detail-users-section"

interface Props {
  initialBranch: BranchDetail
  initialCargoes: BranchCargoRecord[]
}

export function BranchDetailContent({ initialBranch, initialCargoes }: Props) {
  const [branch, setBranch] = useState(initialBranch)
  const [editOpen, setEditOpen] = useState(false)

  const handleToggleStatus = () => {
    setBranch((prev) => ({
      ...prev,
      status: prev.status === "passive" ? "active" : "passive",
    }))
  }

  return (
    <>
      <BranchDetailEditModal open={editOpen} onOpenChange={setEditOpen} branch={branch} onSave={setBranch} />

      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Şubeler", href: "/arf/cargo/settings/branches" },
          { label: branch.ad },
        ]}
      />
      <div className="flex flex-1 flex-col gap-5 bg-slate-50 p-6">
        <DetailHeaderCard branch={branch} status={branch.status} onToggleStatus={handleToggleStatus} onEdit={() => setEditOpen(true)} />

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-6 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="info" className="flex items-center gap-1.5 text-xs">
              <Building2 className="size-3.5" />
              Detay
            </TabsTrigger>
            <TabsTrigger value="cargoes" className="flex items-center gap-1.5 text-xs">
              <Package className="size-3.5" />
              Kargolar
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs">
              <Users className="size-3.5" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1.5 text-xs">
              <MessageSquare className="size-3.5" />
              Notlar
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="size-3.5" />
              Finansal
            </TabsTrigger>
            <TabsTrigger value="commission" className="flex items-center gap-1.5 text-xs">
              <ReceiptText className="size-3.5" />
              Hakediş
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <DetailInfoSection branch={branch} />
          </TabsContent>
          <TabsContent value="cargoes">
            <Suspense fallback={<div className="text-sm text-slate-500">Kargo verisi yükleniyor...</div>}>
              <DetailCargoesSection cargoes={initialCargoes} />
            </Suspense>
          </TabsContent>
          <TabsContent value="users">
            <DetailUsersSection users={branch.users} onUsersChange={(users) => setBranch((prev) => ({ ...prev, users }))} />
          </TabsContent>
          <TabsContent value="notes">
            <DetailNotesSection
              branchId={branch.id}
              branchName={branch.ad}
              notes={branch.notes}
              onNotesChange={(notes) => setBranch((prev) => ({ ...prev, notes }))}
            />
          </TabsContent>
          <TabsContent value="financial">
            <DetailFinancialSection />
          </TabsContent>
          <TabsContent value="commission">
            <Suspense fallback={<div className="text-sm text-slate-500">Hakediş verisi yükleniyor...</div>}>
              <DetailCommissionSection branch={branch} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
