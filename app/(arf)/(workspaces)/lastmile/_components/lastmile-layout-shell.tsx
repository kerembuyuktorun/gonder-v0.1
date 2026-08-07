"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AppHeaderDefaultsProvider,
  AppSidebar,
  type AppHeaderProps,
  type BrandSwitcherItem,
} from "@hascanb/arf-ui-kit/layout-kit"
import { clearAuth, getToken } from "@hascanb/arf-ui-kit/auth-kit"
import { LifeBuoy } from "lucide-react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { getSession, logoutSession } from "../../../(auth)/_api/auth-client"
import { toSidebarUserView, type SidebarUserView } from "../../../_shared/auth-me-user"
import { ARF_ROUTES } from "../../../_shared/routes"
import {
  WORKSPACE_MODULE_CODES,
  withBrandAccess,
  type WorkspaceModuleCode,
} from "../../../_shared/workspace-brand-access"
import {
  brandData,
  brandOptions,
  userData,
  navGroups,
  sidebarUserMenuLabels,
  createSidebarSettingsModalConfig,
  lastmileHeaderInitialNotifications,
  createLastmileHeaderSearchCommands,
} from "../_data/nav"
import {
  isCustomerPortalUser,
  isCustomerRestrictedPath,
} from "../_lib/customer-portal"
import { SupportModal } from "./support-modal"

function hasDemoAuthSession(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.includes("arf_demo_auth=1") || getToken() === "demo-session-token"
}

export function LastmileLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [headerNotifications, setHeaderNotifications] = useState(lastmileHeaderInitialNotifications)
  const [allowedModules, setAllowedModules] = useState<WorkspaceModuleCode[]>([])
  const [sidebarUser, setSidebarUser] = useState<SidebarUserView>(userData)
  const [isCustomerUser, setIsCustomerUser] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const session = await getSession()
      if (cancelled) return

      if (session.success) {
        const modules = (session.data?.modules ?? []).filter(
          (value): value is WorkspaceModuleCode =>
            WORKSPACE_MODULE_CODES.includes(value as WorkspaceModuleCode)
        )
        setAllowedModules(modules)
        setSidebarUser(toSidebarUserView(session.data?.user ?? null, userData))
        setIsCustomerUser(
          isCustomerPortalUser(
            (session.data?.user ?? null) as Record<string, unknown> | null
          )
        )
        return
      }

      if (hasDemoAuthSession()) {
        setAllowedModules([...WORKSPACE_MODULE_CODES])
        setSidebarUser(userData)
        setIsCustomerUser(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const resolvedNavGroups = useMemo(() => {
    if (!isCustomerUser) return navGroups
    return navGroups.map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          if (isCustomerRestrictedPath(item.url)) return null
          const nestedItems = 'items' in item ? item.items : undefined
          const children = nestedItems?.filter(
            (child) => !isCustomerRestrictedPath(child.url)
          )
          if (nestedItems && (!children || children.length === 0)) return null
          return children ? { ...item, items: children } : item
        })
        .filter((item): item is NonNullable<typeof item> => item != null),
    }))
  }, [isCustomerUser])

  const resolvedBrandOptions = useMemo<BrandSwitcherItem[]>(
    () => withBrandAccess(brandOptions as BrandSwitcherItem[], allowedModules),
    [allowedModules]
  )

  const settingsModalConfig = useMemo(
    () => createSidebarSettingsModalConfig(sidebarUser),
    [sidebarUser]
  )

  const lastmileHeaderDefaults = useMemo<Partial<AppHeaderProps>>(
    () => ({
      searchPlaceholder: "Lastmile ara...",
      commandTitle: "Hızlı İşlemler",
      commandDescription: "Ekran veya işlem yazarak hızlıca ilerleyin.",
      searchEmptyMessage: "Uygun sonuç bulunamadı.",
      notificationsLabel: "Bildirimler",
      notificationsMenuLabel: "Bildirimler",
      notificationsEmptyMessage: "Yeni bildiriminiz yok.",
      markAllAsReadLabel: "Tümünü okundu yap",
      viewAllNotificationsLabel: "Tüm bildirimleri görüntüle",
      searchCommands: createLastmileHeaderSearchCommands(router.push),
      notifications: headerNotifications,
      onMarkAllAsRead: () => {
        setHeaderNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
      },
    }),
    [headerNotifications, router],
  )

  return (
    <AppHeaderDefaultsProvider value={lastmileHeaderDefaults}>
      <SidebarProvider>
        <AppSidebar
          brand={brandData}
          brandOptions={resolvedBrandOptions}
          addBrandLabel="Tümünü Gör"
          onAddBrand={() => router.push(ARF_ROUTES.root)}
          userMenuLabels={sidebarUserMenuLabels}
          settingsModalConfig={settingsModalConfig}
          user={sidebarUser}
          navGroups={resolvedNavGroups}
          quickActions={[
            {
              id: "support",
              label: "Yardım & Destek",
              icon: LifeBuoy,
              onSelect: () => setIsSupportModalOpen(true),
            },
          ]}
          onLogout={async () => {
            await logoutSession()
            clearAuth()
            router.push(ARF_ROUTES.auth.signIn)
          }}
        />

        <SidebarInset>{children}</SidebarInset>

        <SupportModal open={isSupportModalOpen} onOpenChange={setIsSupportModalOpen} />

        <Toaster />
        <Sonner />
      </SidebarProvider>
    </AppHeaderDefaultsProvider>
  )
}
