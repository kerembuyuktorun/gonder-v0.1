"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ModuleCategory, PermissionDefinition, RoleDetail } from "../../_types"
import type { LocationOption, UserRecord } from "../../../users/_types"
import { RoleProfileSection } from "./role-profile-section"
import { RoleUsersSection } from "./role-users-section"
import { RolePermissionsSection } from "./role-permissions-section"
import { RoleAuditTrailSection } from "./role-audit-trail-section"

interface Props {
  role: RoleDetail
  categories: ModuleCategory[]
  definitions: PermissionDefinition[]
  roleUsers: UserRecord[]
  locations: LocationOption[]
}

export function RoleDetailContent({ role, categories, definitions, roleUsers, locations }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Roller", href: "/arf/cargo/settings/roles" },
          { label: role.name },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-4">
        <RoleProfileSection role={role} />

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="users" className="text-xs">
              Role Ait Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs">
              Yetki Düzenleme
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">
              İşlem Geçmişi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <RoleUsersSection data={roleUsers} locations={locations} />
          </TabsContent>

          <TabsContent value="permissions">
            <RolePermissionsSection role={role} categories={categories} definitions={definitions} />
          </TabsContent>

          <TabsContent value="audit">
            <RoleAuditTrailSection auditLogs={role.auditLogs ?? []} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
