"use client"

import { useEffect, useRef, useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  deactivateUser,
  fetchLocations,
  reactivateUser,
} from "../../_api/users-api"
import type { UserDetail } from "../../_types"
import { USER_ROLE_LABELS } from "../../_types"
import type { LocationOption } from "../../_types"
import type { UserRole } from "../../_types/user"
import { Camera, Edit3, Power, PowerOff } from "lucide-react"
import { UserAssetsSection } from "./user-assets-section"
import { UserAuditTrailSection } from "./user-audit-trail-section"
import { UserDocumentsSection } from "./user-documents-section"
import { UserEditModal } from "../../_components/user-edit-modal"
import { UserProfileSection } from "./user-profile-section"

interface Props {
  initialUser: UserDetail
}

const STATUS_LABELS: Record<UserDetail["status"], string> = {
  active: "Aktif",
  passive: "Pasif",
  suspended: "Askıda",
}

const STATUS_CLASSES: Record<UserDetail["status"], string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  passive: "bg-slate-100 text-slate-600 border-slate-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

function formatDateTime(iso?: string) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function DetailContent({ initialUser }: Props) {
  const [user, setUser] = useState<UserDetail>(initialUser)
  const [isActioning, setIsActioning] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(initialUser.profilePhotoUrl ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true

    void fetchLocations().then((data) => {
      if (isMounted) {
        setLocations(data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (profilePhotoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePhotoPreview)
      }
    }
  }, [profilePhotoPreview])

  function handleProfilePhotoPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (profilePhotoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profilePhotoPreview)
    }

    const objectUrl = URL.createObjectURL(file)
    setProfilePhotoPreview(objectUrl)
    setUser((prev) => ({ ...prev, profilePhotoUrl: objectUrl }))
    event.target.value = ""
  }

  async function handleReactivate() {
    if (!window.confirm(`${user.firstName} ${user.lastName} adlı kullanıcı yeniden aktifleştirilecek. Onaylıyor musunuz?`)) return
    setIsActioning(true)
    try {
      const updated = await reactivateUser(user.id)
      if (updated) setUser({ ...user, ...updated })
    } finally {
      setIsActioning(false)
    }
  }

  async function handleDeactivate() {
    if (!window.confirm(`${user.firstName} ${user.lastName} adlı kullanıcı pasife alınacak. Bu işlem geri alınabilir. Onaylıyor musunuz?`)) return
    setIsActioning(true)
    try {
      const updated = await deactivateUser(user.id)
      if (updated) setUser({ ...user, ...updated })
    } finally {
      setIsActioning(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Kullanıcılar", href: "/arf/cargo/settings/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4">
        {/* Başlık kartı */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative mt-0.5 size-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-900 text-sm font-semibold text-white"
                  aria-label="Profil resmi yükle"
                >
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Profil resmi" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center">{getInitials(user.firstName, user.lastName)}</span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/55 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="size-4" />
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoPick}
                />

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_CLASSES[user.status]}`}
                    >
                      {STATUS_LABELS[user.status]}
                    </Badge>
                    {user.isTemporaryPassword && (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-xs text-amber-700">
                        Şifre aktivasyonu bekleniyor
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {USER_ROLE_LABELS[user.role as UserRole]} •{" "}
                    {user.locationName ?? "Genel Merkez"}
                  </p>
                  <p className="text-xs text-slate-500">Son Giriş Zamanı: {formatDateTime(user.lastLogin)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isActioning}
                  onClick={() => {
                    if (user.status === "active") {
                      void handleDeactivate()
                      return
                    }
                    void handleReactivate()
                  }}
                  className="h-9"
                >
                  {user.status === "active" ? <PowerOff className="mr-1.5 size-4" /> : <Power className="mr-1.5 size-4" />}
                  {user.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="h-9"
                >
                  <Edit3 className="mr-1.5 size-4" />
                  Düzenle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab'lar */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-4 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="profile" className="text-xs">
              Profil
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              Dosyalar
            </TabsTrigger>
            <TabsTrigger value="assets" className="text-xs">
              Zimmet
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">
              İşlem Geçmişi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <UserProfileSection user={user} />
          </TabsContent>

          <TabsContent value="documents">
            <UserDocumentsSection user={user} />
          </TabsContent>

          <TabsContent value="assets">
            <UserAssetsSection user={user} />
          </TabsContent>

          <TabsContent value="audit">
            <UserAuditTrailSection auditLogs={user.auditLogs} />
          </TabsContent>
        </Tabs>
      </div>

      <UserEditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
        locations={locations}
        onSaved={(updated) => {
          setUser((prev) => ({ ...prev, ...updated }))
        }}
      />
    </>
  )
}
