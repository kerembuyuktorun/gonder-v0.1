"use client"

import { Suspense, useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { IntegrationLogEntry, IntegrationRecord, ParameterMapping, SyncSettingsRecord } from "../../_types"
import { INTEGRATION_STATUS_LABELS } from "../../_types"
import { IntegrationAuditLogsSection } from "./integration-audit-logs-section"
import { IntegrationMappingSection } from "./integration-mapping-section"
import { IntegrationSyncSettingsSection } from "./integration-sync-settings-section"

interface Props {
  integration: IntegrationRecord
  initialSyncSettings: SyncSettingsRecord
  initialMappings: ParameterMapping[]
  initialLogs: IntegrationLogEntry[]
}

export function IntegrationDetailContent({ integration, initialSyncSettings, initialMappings, initialLogs }: Props) {
  const [syncSettings, setSyncSettings] = useState(initialSyncSettings)
  const [mappings, setMappings] = useState(initialMappings)

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Entegrasyonlar", href: "/arf/cargo/settings/integrations" },
          { label: integration.platform?.name ?? integration.id },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">Entegrasyon Detay</h1>
            <Badge variant="outline">{INTEGRATION_STATUS_LABELS[integration.status]}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">{integration.platform?.name} • Son senkron: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString("tr-TR") : "-"}</p>
        </div>

        <Tabs defaultValue="sync" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="sync" className="text-xs">Senkronizasyon</TabsTrigger>
            <TabsTrigger value="mapping" className="text-xs">Parametre Eşleştirme</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">Loglar</TabsTrigger>
          </TabsList>

          <TabsContent value="sync">
            <IntegrationSyncSettingsSection integration={integration} logs={initialLogs} value={syncSettings} onChange={setSyncSettings} />
          </TabsContent>
          <TabsContent value="mapping">
            <IntegrationMappingSection integrationId={integration.id} value={mappings} onChange={setMappings} />
          </TabsContent>
          <TabsContent value="logs">
            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loglar yükleniyor...</div>}>
              <IntegrationAuditLogsSection initialLogs={initialLogs} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
