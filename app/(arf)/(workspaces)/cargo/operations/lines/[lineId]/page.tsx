import { notFound } from "next/navigation"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchLineAuditLogs, fetchLineById, fetchLineLocations } from "../_api/lines-api"
import { LineDetailPageContent } from "../_components/line-detail-page-content"

interface Props {
  params: Promise<{ lineId: string }>
}

export default async function LineDetailPage({ params }: Props) {
  const { lineId } = await params
  const [line, locations, auditLogs] = await Promise.all([
    fetchLineById(lineId),
    fetchLineLocations(),
    fetchLineAuditLogs(lineId),
  ])

  if (!line) {
    notFound()
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Operasyon İşlemleri", href: "/arf/cargo/operations/trips" },
          { label: "Hat Listesi", href: "/arf/cargo/operations/lines" },
          { label: "Hat Detay" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <LineDetailPageContent initialLine={line} locations={locations} initialAuditLogs={auditLogs} />
      </div>
    </>
  )
}
