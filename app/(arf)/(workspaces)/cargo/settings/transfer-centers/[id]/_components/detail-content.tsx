"use client"

import { Suspense, useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, MessageSquare, Navigation, ReceiptText, Users } from "lucide-react"
import { DetailHeaderCard } from "./detail-header-card"
import { DetailInfoSection } from "./detail-info-section"
import { DetailRoutesSection } from "./detail-routes-section"
import { DetailUsersSection } from "./detail-users-section"
import { DetailNotesSection } from "./detail-notes-section"
import { DetailCommissionSection } from "./detail-commission-section"
import type { TransferCenter, TransferCenterStatus } from "../_types"

interface Props {
  center: TransferCenter
}

export function TransferCenterDetailContent({ center }: Props) {
  const [status, setStatus] = useState<TransferCenterStatus>(center.status)

  const handleToggleStatus = () => {
    setStatus((prev) => (prev === "passive" ? "active" : "passive"))
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Transfer Merkezleri", href: "/arf/cargo/settings/transfer-centers" },
          { label: center.name },
        ]}
      />
      <div className="flex flex-1 flex-col gap-5 bg-slate-50 p-6">
        <DetailHeaderCard center={center} status={status} onToggleStatus={handleToggleStatus} />

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-5 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="info" className="flex items-center gap-1.5 text-xs">
              <Building2 className="size-3.5" />
              Detay
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-1.5 text-xs">
              <Navigation className="size-3.5" />
              Hatlar
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs">
              <Users className="size-3.5" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1.5 text-xs">
              <MessageSquare className="size-3.5" />
              Notlar
            </TabsTrigger>
            <TabsTrigger value="commission" className="flex items-center gap-1.5 text-xs">
              <ReceiptText className="size-3.5" />
              Hakediş
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <DetailInfoSection center={center} />
          </TabsContent>
          <TabsContent value="routes">
            <DetailRoutesSection center={center} />
          </TabsContent>
          <TabsContent value="users">
            <DetailUsersSection center={center} />
          </TabsContent>
          <TabsContent value="notes">
            <DetailNotesSection center={center} />
          </TabsContent>
          <TabsContent value="commission">
            <Suspense fallback={<div className="text-sm text-slate-500">Hakediş verisi yükleniyor...</div>}>
              <DetailCommissionSection center={center} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
