import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchPriceDefinitions } from "./_api/price-definitions-api"
import { PriceDefinitionsTableSection } from "./_components/price-definitions-table-section"

export default async function SystemPricingPage() {
  const definitions = await fetchPriceDefinitions()

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Fiyat Tanımları" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense fallback={<div className="py-6 text-sm text-slate-500">Fiyat tanımları yükleniyor...</div>}>
          <PriceDefinitionsTableSection data={definitions} />
        </Suspense>
      </div>
    </>
  )
}
