import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchInterlandSimulationInitialData } from "./_api/interland-units-simulation-api"
import { InterlandUnitsSimulationPageContent } from "./_components/interland-units-simulation-page-content"

export default async function InterlandUnitsSimulationPage() {
  const initialData = await fetchInterlandSimulationInitialData()

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Operasyon İşlemleri", href: "/arf/cargo/operations/trips" },
          { label: "İnterland Birimleri" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <InterlandUnitsSimulationPageContent initialData={initialData} />
      </div>
    </>
  )
}
