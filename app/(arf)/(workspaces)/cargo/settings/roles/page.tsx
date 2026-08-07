import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchRoles } from "./_api/roles-api"
import { RolesTableSection } from "./_components/roles-table-section"

export default async function RolesPage() {
  const roles = await fetchRoles()

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Roller" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense fallback={<div className="py-6 text-sm text-slate-500">Roller yükleniyor...</div>}>
          <RolesTableSection data={roles} />
        </Suspense>
      </div>
    </>
  )
}
