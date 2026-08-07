import { Suspense } from "react"
import { notFound } from "next/navigation"
import {
  fetchIntegrationAuditLogs,
  fetchIntegrationDetailById,
  fetchIntegrationParameterMappings,
  fetchIntegrationSyncSettings,
} from "./_api/integration-detail-api"
import { IntegrationDetailContent } from "./_components/integration-detail-content"

interface Props {
  params: Promise<{ integrationId: string }>
}

export default async function IntegrationDetailPage({ params }: Props) {
  const { integrationId } = await params

  const [integration, syncSettings, mappings, logs] = await Promise.all([
    fetchIntegrationDetailById(integrationId),
    fetchIntegrationSyncSettings(integrationId),
    fetchIntegrationParameterMappings(integrationId),
    fetchIntegrationAuditLogs(integrationId),
  ])

  if (!integration) {
    notFound()
  }

  return (
    <Suspense>
      <IntegrationDetailContent
        integration={integration}
        initialSyncSettings={syncSettings}
        initialMappings={mappings}
        initialLogs={logs}
      />
    </Suspense>
  )
}
