import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchInterlands } from "./_api/interland-list-api"
import { InterlandsTableSection } from "./_components/interlands-table-section"

export default async function InterlandsPage() {
  const interlands = await fetchInterlands()

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "İnterlandlar" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense fallback={<div className="py-6 text-sm text-slate-500">İnterlandlar yükleniyor...</div>}>
          <InterlandsTableSection data={interlands} />
        </Suspense>
      </div>
    </>
  )
}
