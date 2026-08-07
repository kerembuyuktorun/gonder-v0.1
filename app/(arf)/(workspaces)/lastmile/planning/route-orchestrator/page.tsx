import { RouteOrchestratorPageContent } from './page-content'

/** Canlı orkestratör — backend API (bağlantı `_api/orchestrator-client.ts`). */
export default async function RouteOrchestratorLivePage({
  searchParams,
}: {
  searchParams: Promise<{ routeId?: string }>
}) {
  const params = await searchParams
  const initialRouteId =
    typeof params.routeId === 'string' && params.routeId.trim()
      ? params.routeId.trim()
      : null

  return (
    <RouteOrchestratorPageContent mode='live' initialRouteId={initialRouteId} />
  )
}
