import { notFound } from "next/navigation"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchTripAudit } from "./_api/trip-audit-api"
import { fetchTripDetail } from "./_api/trip-detail-api"
import { fetchTripManifest } from "./_api/trip-manifest-api"
import { TripDetailPageContent } from "./_components/trip-detail-page-content"

interface Props {
  params: Promise<{ tripId: string }>
}

export default async function TripDetailPage({ params }: Props) {
  const { tripId } = await params

  const [detail, manifest, audit] = await Promise.all([
    fetchTripDetail(tripId),
    fetchTripManifest(tripId),
    fetchTripAudit(tripId),
  ])

  if (!detail) {
    notFound()
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Operasyon İşlemleri", href: "/arf/cargo/operations/trips" },
          { label: "Sefer Listesi", href: "/arf/cargo/operations/trips" },
          { label: `${detail.trip.tripNo}` },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-4">
        <TripDetailPageContent initialDetail={detail} initialManifest={manifest} initialAudit={audit} />
      </div>
    </>
  )
}
