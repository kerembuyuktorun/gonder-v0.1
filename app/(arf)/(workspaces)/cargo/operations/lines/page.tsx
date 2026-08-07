import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchLineKpi, fetchLineLocations, fetchLines } from "./_api/lines-api"
import { LinesListPageContent } from "./_components/lines-list-page-content"

export default async function LinesPage() {
  const [lines, kpi, locations] = await Promise.all([fetchLines(), fetchLineKpi(), fetchLineLocations()])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Operasyon İşlemleri", href: "/arf/cargo/operations/trips" },
          { label: "Hat Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense fallback={<div className="py-6 text-sm text-slate-500">Hat listesi yükleniyor...</div>}>
          <LinesListPageContent lines={lines} kpi={kpi} locations={locations} />
        </Suspense>
      </div>
    </>
  )
}
