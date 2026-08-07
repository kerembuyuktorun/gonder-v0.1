import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchDistanceDefinitions } from "./_api/distance-definitions-api"
import { DistanceDefinitionsTableSection } from "./_components/distance-definitions-table-section"

export default async function DistanceDefinitionsPage() {
  const definitions = await fetchDistanceDefinitions()

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Mesafe Tanımları" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense fallback={<div className="py-6 text-sm text-slate-500">Mesafe tanımları yükleniyor...</div>}>
          <DistanceDefinitionsTableSection data={definitions} />
        </Suspense>
      </div>
    </>
  )
}
