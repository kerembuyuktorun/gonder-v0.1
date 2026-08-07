import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchTripListKpi, fetchTripStartOptions, fetchTrips } from "./_api/trips-list-api"
import { TripsListPageContent } from "./_components/trips-list-page-content"

export default async function TripsPage() {
  const [trips, kpi, startOptions] = await Promise.all([fetchTrips(), fetchTripListKpi(), fetchTripStartOptions()])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Operasyon İşlemleri", href: "/arf/cargo/operations/trips" },
          { label: "Sefer Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense>
          <TripsListPageContent
            trips={trips}
            kpi={kpi}
            lines={startOptions.lines}
            suppliers={startOptions.suppliers}
            vehicles={startOptions.vehicles}
            drivers={startOptions.drivers}
          />
        </Suspense>
      </div>
    </>
  )
}
