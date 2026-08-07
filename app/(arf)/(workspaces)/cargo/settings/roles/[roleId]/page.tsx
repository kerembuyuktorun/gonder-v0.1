import { Suspense } from "react"
import { notFound } from "next/navigation"
import {
  fetchRoleCategoriesForPage,
  fetchRoleDetailForPage,
  fetchRolePermissionDefinitionsForPage,
} from "./_api/role-detail-api"
import { fetchUsersByRoleId, fetchLocations } from "../../users/_api/users-api"
import { RoleDetailContent } from "./_components/role-detail-content"

interface Props {
  params: Promise<{ roleId: string }>
}

export default async function RoleDetailPage({ params }: Props) {
  const { roleId } = await params

  const [role, categories, definitions, roleUsers, locations] = await Promise.all([
    fetchRoleDetailForPage(roleId),
    fetchRoleCategoriesForPage(),
    fetchRolePermissionDefinitionsForPage(),
    fetchUsersByRoleId(roleId),
    fetchLocations(),
  ])

  if (!role) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Rol detayi yukleniyor...</div>}>
      <RoleDetailContent role={role} categories={categories} definitions={definitions} roleUsers={roleUsers} locations={locations} />
    </Suspense>
  )
}
