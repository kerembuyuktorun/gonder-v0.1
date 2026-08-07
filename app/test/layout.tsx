"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import {
  AppSidebar,
  type BrandSwitcherItem,
} from "@hascanb/arf-ui-kit/layout-kit"
import { clearAuth, getToken } from "@hascanb/arf-ui-kit/auth-kit"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import {
  Boxes,
  LayoutDashboard,
  ShieldCheck,
  Table,
  KeyRound,
  FileUp,
  AlertTriangle,
  Bell,
  Wrench,
  House,
  Images,
  Package,
  Route,
  Send,
  Truck,
  Warehouse,
} from "lucide-react"
import { getSession, logoutSession } from "../(arf)/(auth)/_api/auth-client"
import { ARF_ROUTES } from "../(arf)/_shared/routes"
import {
  WORKSPACE_MODULE_CODES,
  withBrandAccess,
  type WorkspaceModuleCode,
} from "../(arf)/_shared/workspace-brand-access"

const brandData = {
  title: "Test",
  subtitle: "V1.0",
  url: "/test",
  icon: Wrench,
}

const brandOptions: BrandSwitcherItem[] = [
  {
    id: "cargo",
    title: "Kargo",
    subtitle: "V1.0",
    url: ARF_ROUTES.cargo.root,
    icon: Package,
    shortcut: "1",
  },
  {
    id: "lastmile",
    title: "Last Mile",
    subtitle: "V1.0",
    url: ARF_ROUTES.lastmile.root,
    icon: Route,
    shortcut: "2",
  },
  {
    id: "gonder",
    title: "Gönder",
    subtitle: "V1.0",
    url: ARF_ROUTES.gonder.root,
    icon: Send,
    shortcut: "3",
  },
  {
    id: "logistics",
    title: "Lojistik",
    subtitle: "Yakında",
    url: ARF_ROUTES.root,
    icon: Truck,
    shortcut: "4",
  },
  {
    id: "fleet",
    title: "Filo",
    subtitle: "Yakında",
    url: ARF_ROUTES.root,
    icon: Boxes,
    shortcut: "5",
  },
  {
    id: "warehouse",
    title: "Depo Yönetimi",
    subtitle: "Yakında",
    url: ARF_ROUTES.root,
    icon: Warehouse,
    shortcut: "6",
  },
  {
    id: "test",
    title: "Test",
    subtitle: "V1.0",
    url: "/test",
    icon: Wrench,
    shortcut: "7",
  },
]

const userData = {
  name: "QA Workspace",
  email: "qa@arf-ui-kit.local",
  avatar: "",
  role: "Validation Hub",
}

const navGroups = [
  {
    label: "Lab Giriş",
    items: [
      {
        title: "Test Home",
        url: "/test",
        icon: LayoutDashboard,
      },
      {
        title: "Cargo Workspace",
        url: "/cargo",
        icon: House,
      },
    ],
  },
  {
    label: "Kit Testleri",
    items: [
      {
        title: "Auth Kit",
        icon: ShieldCheck,
        items: [
          { title: "Landing", url: "/test/auth" },
          { title: "Demo Hub", url: "/test/auth/demo" },
          { title: "SignIn Template", url: "/test/auth/pages/signin" },
          { title: "SignIn2 Template", url: "/test/auth/pages/signin2" },
          { title: "OTP Template", url: "/test/auth/pages/otp" },
          { title: "Forgot Password Template", url: "/test/auth/pages/forgot-password" },
          { title: "Reset Password Template", url: "/test/auth/pages/reset-password" },
          { title: "SignIn Form", url: "/test/auth/components/signin-form" },
          { title: "OTP Form", url: "/test/auth/components/otp-form" },
          { title: "Forgot Password Form", url: "/test/auth/components/forgot-password-form" },
          { title: "Reset Password Form", url: "/test/auth/components/reset-password-form" },
        ],
      },
      {
        title: "Layout Kit",
        icon: LayoutDashboard,
        items: [
          { title: "Landing", url: "/test/layout-kit" },
          { title: "Demo", url: "/test/layout/dashboard" },
          { title: "Header", url: "/test/layout/header" },
          { title: "Sidebar", url: "/test/layout/sidebar" },
          { title: "Footer", url: "/test/layout/footer" },
        ],
      },
      {
        title: "DataTable Kit",
        icon: Table,
        items: [
          { title: "Landing", url: "/test/datatable" },
          { title: "Demo", url: "/test/datatable/basic" },
          { title: "Advanced", url: "/test/datatable/advanced" },
          { title: "Server-side", url: "/test/datatable/server-side" },
        ],
      },
      {
        title: "Form Kit",
        icon: KeyRound,
        items: [
          { title: "Landing", url: "/test/form" },
          { title: "Demo Hub", url: "/test/form/demo" },
          { title: "Advanced Form", url: "/test/form/advanced" },
        ],
      },
      {
        title: "File Kit",
        icon: FileUp,
        items: [
          { title: "Landing", url: "/test/file-uploader" },
          { title: "Demo Hub", url: "/test/file-uploader/demo" },
        ],
      },
      {
        title: "Errors Kit",
        icon: AlertTriangle,
        items: [
          { title: "Landing", url: "/test/errors" },
          { title: "Demo Hub", url: "/test/errors/demo" },
        ],
      },
      {
        title: "Feedback Kit",
        icon: Bell,
        items: [
          { title: "Landing", url: "/test/feedback" },
          { title: "Demo Hub", url: "/test/feedback/demo" },
        ],
      },
      {
        title: "Utils ve Icons",
        icon: Wrench,
        items: [
          { title: "Validation Utils", url: "/test/utils/validation" },
          { title: "Token Utils", url: "/test/utils/token" },
          { title: "Auth Icons", url: "/test/icons/auth" },
        ],
      },
      {
        title: "Component Gallery",
        icon: Images,
        items: [{ title: "Gallery Hub", url: "/test/gallery" }],
      },
    ],
  },
]

function hasDemoAuthSession(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.includes("arf_demo_auth=1") || getToken() === "demo-session-token"
}

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [allowedModules, setAllowedModules] = useState<WorkspaceModuleCode[]>([])

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
        return
      }

      if (hasDemoAuthSession()) {
        setAllowedModules([...WORKSPACE_MODULE_CODES])
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const resolvedBrandOptions = useMemo(
    () => withBrandAccess(brandOptions, allowedModules),
    [allowedModules]
  )

  return (
    <SidebarProvider>
      <AppSidebar
        brand={brandData}
        brandOptions={resolvedBrandOptions}
        addBrandLabel="Tümünü Gör"
        onAddBrand={() => router.push(ARF_ROUTES.root)}
        user={userData}
        navGroups={navGroups}
        onLogout={async () => {
          await logoutSession()
          clearAuth()
          router.push(ARF_ROUTES.auth.signIn)
        }}
      />
      <SidebarInset>{children}</SidebarInset>
      <Toaster />
      <Sonner />
    </SidebarProvider>
  )
}
