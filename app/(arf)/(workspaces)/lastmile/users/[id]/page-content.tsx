'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  CreateUserModal,
  type UserCreateFormValues,
} from '../_components/create-user-modal'
import {
  activateUser,
  assignUserRole,
  fetchUserActivity,
  fetchUserDetail,
  fetchUserSessions,
  passiveUser,
  sendPasswordResetLink,
  updateUser,
  updateUserPersonnelProfile,
} from '../_api/users-client'
import {
  buildPersonnelProfileInput,
  buildUpdateUserInput,
} from '../_lib/map-user'
import type { LastmileUser, UserDocumentMeta, UserKind } from '../_types/user'
import { TabActivity } from './_components/tab-activity'
import { TabPersonnel } from './_components/tab-personnel'
import { UserDetailHeader } from './_components/user-detail-header'
import type { UserActivityEvent, UserDetailTab, UserSession } from './_types/user-detail'

export default function UserDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [user, setUser] = useState<LastmileUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activity, setActivity] = useState<UserActivityEvent[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [tab, setTab] = useState<UserDetailTab>('personnel')
  const [editOpen, setEditOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const showPersonnel = user?.kullanici_tipi === 'ic_ekip'
  const activeTab: UserDetailTab =
    showPersonnel && tab === 'personnel' ? 'personnel' : 'activity'

  const loadUser = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    const [detailResult, activityResult, sessionsResult] = await Promise.all([
      fetchUserDetail(id),
      fetchUserActivity(id),
      fetchUserSessions(id),
    ])

    if (!detailResult.success) {
      setUser(null)
      setLoadError(detailResult.error)
      setIsLoading(false)
      return
    }

    setUser(detailResult.data)
    setActivity(activityResult.success ? activityResult.data : [])
    setSessions(sessionsResult.success ? sessionsResult.data : [])
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void loadUser()
  }, [loadUser, refreshKey])

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Kullanıcı Listesi', href: ARF_ROUTES.lastmile.users.list },
            { label: 'Yükleniyor...' },
          ]}
        />
        <div className='flex flex-1 items-center justify-center p-6 text-sm text-slate-500'>
          Kullanıcı bilgileri yükleniyor...
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Kullanıcı Listesi', href: ARF_ROUTES.lastmile.users.list },
            { label: 'Bulunamadı' },
          ]}
        />
        <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6'>
          <p className='text-sm text-slate-600'>{loadError ?? 'Kullanıcı bulunamadı.'}</p>
          <Button asChild size='sm'>
            <Link href={ARF_ROUTES.lastmile.users.list}>Listeye Dön</Link>
          </Button>
        </div>
      </>
    )
  }

  const handleToggleAccess = async () => {
    if (user.durum === 'davet') {
      toast.message('Davet durumundaki kullanıcı pasife alınamaz')
      return
    }

    const result =
      user.durum === 'pasif' || user.durum === 'askida'
        ? await activateUser(user.id)
        : await passiveUser(user.id)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      user.durum === 'pasif' || user.durum === 'askida'
        ? `${user.ad_soyad} aktif edildi`
        : `${user.ad_soyad} pasife alındı`
    )
    setRefreshKey((previous) => previous + 1)
  }

  const handlePasswordReset = async () => {
    const result = await sendPasswordResetLink(user.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(`Şifre sıfırlama bağlantısı ${user.email} adresine gönderildi`)
  }

  const handleAvatarChange = (nextUrl: string | null) => {
    setUser((previous) => (previous ? { ...previous, profil_url: nextUrl } : previous))
  }

  const handleDocumentsChange = (documents: UserDocumentMeta[]) => {
    setUser((previous) => (previous ? { ...previous, evraklar: documents } : previous))
  }

  const handleEditSubmit = async (values: UserCreateFormValues) => {
    if (!values.roleId) {
      throw new Error('Rol seçin')
    }

    const updateResult = await updateUser(user.id, buildUpdateUserInput(values))
    if (!updateResult.success) {
      throw new Error(updateResult.error)
    }

    if (values.roleId !== user.roleId) {
      const roleResult = await assignUserRole(user.id, values.roleId)
      if (!roleResult.success) {
        throw new Error(roleResult.error)
      }
    }

    if (values.kullanici_tipi === ('ic_ekip' as UserKind)) {
      const personnelResult = await updateUserPersonnelProfile(
        user.id,
        buildPersonnelProfileInput(values.personel)
      )
      if (!personnelResult.success) {
        throw new Error(personnelResult.error)
      }
    }

    toast.success(`${values.ad_soyad.trim()} güncellendi`)
    setRefreshKey((previous) => previous + 1)
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Kullanıcı Listesi', href: ARF_ROUTES.lastmile.users.list },
          { label: user.ad_soyad },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex min-w-0 flex-1 flex-col gap-5 bg-slate-50/80 p-4 pb-10 pt-3 lg:px-6'>
        <UserDetailHeader
          user={user}
          onEdit={() => setEditOpen(true)}
          onToggleStatus={handleToggleAccess}
          onPasswordReset={handlePasswordReset}
          onAvatarChange={handleAvatarChange}
        />

        <CreateUserModal
          open={editOpen}
          onOpenChange={setEditOpen}
          mode='edit'
          initialUser={user}
          onSubmit={handleEditSubmit}
        />

        <Card className='rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_32px_rgba(15,23,42,0.04)]'>
          <CardContent className='p-5 lg:p-6'>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setTab(value as UserDetailTab)}
              className='w-full'
            >
              <TabsList className='mb-5 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200/70 bg-slate-100/70 p-1'>
                {showPersonnel ? (
                  <TabsTrigger value='personnel'>Personel Bilgileri</TabsTrigger>
                ) : null}
                <TabsTrigger value='activity'>Oturumlar Ve Hareket Geçmişi</TabsTrigger>
              </TabsList>

              {showPersonnel ? (
                <TabsContent value='personnel' className='mt-0'>
                  <TabPersonnel user={user} onDocumentsChange={handleDocumentsChange} />
                </TabsContent>
              ) : null}

              <TabsContent value='activity' className='mt-0'>
                <TabActivity sessions={sessions} events={activity} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
