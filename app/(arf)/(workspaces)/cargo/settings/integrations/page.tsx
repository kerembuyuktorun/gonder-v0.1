import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchAvailablePlatforms, fetchIntegrationCategories, fetchIntegrations } from "./_api/integrations-api"
import { IntegrationsMarketplaceSection } from "./_components/integrations-marketplace-section"

export default async function IntegrationsPage() {
  const [integrations, platforms, categories] = await Promise.all([
    fetchIntegrations(),
    fetchAvailablePlatforms(),
    fetchIntegrationCategories(),
  ])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Entegrasyonlar" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense fallback={<div className="py-6 text-sm text-slate-500">Entegrasyonlar yükleniyor...</div>}>
          <IntegrationsMarketplaceSection
            integrations={integrations}
            platforms={platforms}
            categories={categories}
          />
        </Suspense>
      </div>
    </>
  )
}
