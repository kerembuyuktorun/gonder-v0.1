'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { deleteRole, suspendRole, activateRole, updateRole } from '../_api/roles-api'
import { getStoredRoleById } from '../_mock/roles-mock-data'
import type { RoleDetail } from '../_types/role'
import { RoleProfileHeader } from './_components/role-profile-header'
import { TabAudit } from './_components/tab-audit'
import { TabPermissions } from './_components/tab-permissions'
import { TabUsers } from './_components/tab-users'

type RoleDetailTab = 'users' | 'permissions' | 'audit'

const TAB_ITEMS: Array<{ id: RoleDetailTab; label: string }> = [
  { id: 'users', label: 'Role Ait Kullanıcılar' },
  { id: 'permissions', label: 'Yetki Düzenleme' },
  { id: 'audit', label: 'İşlem Geçmişi' },
]

export default function RoleDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const initial = useMemo(() => getStoredRoleById(id) ?? null, [id])
  const [role, setRole] = useState<RoleDetail | null>(initial)
  const [tab, setTab] = useState<RoleDetailTab>('users')

  const refresh = () => {
    const refreshed = getStoredRoleById(id)
    if (refreshed) setRole(refreshed)
  }

  if (!role) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Roller ve Yetkiler', href: ARF_ROUTES.lastmile.settings.roles.list },
            { label: 'Bulunamadı' },
          ]}
        />
        <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6'>
          <p className='text-sm text-slate-600'>Rol bulunamadı.</p>
          <Button asChild size='sm'>
            <Link href={ARF_ROUTES.lastmile.settings.roles.list}>Listeye Dön</Link>
          </Button>
        </div>
      </>
    )
  }

  const handleSaveProfile = async (values: { name: string; description: string }) => {
    const updated = await updateRole(role.id, {
      name: values.name,
      description: values.description,
    })
    if (!updated) {
      toast.error('Rol güncellenemedi.')
      return
    }
    refresh()
    toast.success(`${updated.name} güncellendi`)
  }

  const handleToggleStatus = async () => {
    const isPassive = role.status === 'passive'
    const updated = isPassive ? await activateRole(role.id) : await suspendRole(role.id)
    if (!updated) return
    refresh()
    toast.success(isPassive ? `${role.name} aktifleştirildi` : `${role.name} pasife alındı`)
  }

  const handleDelete = async () => {
    if (!confirm(`"${role.name}" rolünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }
    const result = await deleteRole(role.id)
    if (!result.ok) {
      toast.error(result.reason ?? 'Rol silinemedi.')
      return
    }
    toast.success(`${role.name} silindi`)
    router.push(ARF_ROUTES.lastmile.settings.roles.list)
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Roller ve Yetkiler', href: ARF_ROUTES.lastmile.settings.roles.list },
          { label: role.name },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-4 p-6'>
        <div className='sticky top-0 z-20 -mx-6 space-y-4 bg-background/95 px-6 py-1 backdrop-blur supports-backdrop-filter:bg-background/80'>
          <RoleProfileHeader
            role={role}
            onSaveProfile={handleSaveProfile}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        </div>

        <Card className='rounded-[24px] border-slate-200/80 shadow-none'>
          <CardContent className='p-4 lg:p-5'>
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as RoleDetailTab)}
              className='gap-4'
            >
              <TabsList className='h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-slate-100/80 p-1'>
                {TAB_ITEMS.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className='rounded-lg px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm'
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value='users' className='mt-0'>
                <TabUsers role={role} />
              </TabsContent>
              <TabsContent value='permissions' className='mt-0'>
                <TabPermissions role={role} onSaved={() => refresh()} />
              </TabsContent>
              <TabsContent value='audit' className='mt-0'>
                <TabAudit auditLogs={role.auditLogs ?? []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
