import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchSimulationLookups } from "./_api/price-list-simulation-api"
import { PriceListSimulationPageContent } from "./_components/price-list-simulation-page-content"

export default async function PriceListsPage() {
  const lookups = await fetchSimulationLookups()

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Satış & Pazarlama" },
          { label: "Fiyat Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense fallback={<div className="py-6 text-sm text-slate-500">Simülasyon yükleniyor...</div>}>
          <PriceListSimulationPageContent lookups={lookups} />
        </Suspense>
      </div>
    </>
  )
}
