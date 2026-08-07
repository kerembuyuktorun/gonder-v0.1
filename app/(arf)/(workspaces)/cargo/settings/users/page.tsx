import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchLocations, fetchUsers } from "./_api/users-api"
import { UsersTableSection } from "./_components/users-table-section"

export default async function UsersPage() {
  const [users, locations] = await Promise.all([fetchUsers(), fetchLocations()])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Kullanıcılar" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense
          fallback={
            <div className="py-6 text-sm text-slate-500">Kullanıcılar yükleniyor...</div>
          }
        >
          <UsersTableSection data={users} locations={locations} />
        </Suspense>
      </div>
    </>
  )
}
