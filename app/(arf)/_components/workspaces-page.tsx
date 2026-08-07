"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ElementType } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Boxes, LogOut, Package, Route, Send, Truck, Warehouse, Wrench } from "lucide-react"

import { clearAuth, getToken, getUser } from "@hascanb/arf-ui-kit/auth-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ARF_ROUTES } from "../_shared/routes"
import { getDisplayNameFromUser } from "../_shared/auth-me-user"
import {
  WORKSPACE_MODULE_CODES,
  type WorkspaceModuleCode,
} from "../_shared/workspace-brand-access"
import { getSession, logoutSession } from "../(auth)/_api/auth-client"

type WorkspaceItem = {
  id: string
  title: string
  description: string
  href?: string
  status: "ready" | "soon"
  module: WorkspaceModuleCode
  icon: ElementType
}

const workspaces: WorkspaceItem[] = [
  {
    id: "cargo",
    title: "Kargo",
    description: "Kargo kayıt, sorgulama, operasyon ve finans ekranlarına bu modülden giriş yapın.",
    href: ARF_ROUTES.cargo.root,
    status: "ready",
    module: "CARGO",
    icon: Package,
  },
  {
    id: "courier",
    title: "Last Mile",
    description: "Son kilometre teslimat operasyonlarını, rota ve kurye planlamasını yönetin.",
    href: ARF_ROUTES.lastmile.root,
    status: "ready",
    module: "LAST_MILE",
    icon: Route,
  },
  {
    id: "gonder",
    title: "Gönder",
    description: "B2B/B2C lojistik, kargo ve kurye taleplerini Gönder panelinden yönetin.",
    href: ARF_ROUTES.gonder.root,
    status: "ready",
    module: "GONDER",
    icon: Send,
  },
  {
    id: "logistics",
    title: "Lojistik",
    description: "Hat, transfer ve dağıtım planlamasını tek merkezden yönetin.",
    status: "soon",
    module: "LOGISTIC",
    icon: Truck,
  },
  {
    id: "fleet",
    title: "Filo",
    description: "Araçlarınızı, sürücülerinizi ve operasyon uygunluklarını izleyin.",
    status: "soon",
    module: "FLEET",
    icon: Boxes,
  },
  {
    id: "warehouse",
    title: "Depo Yönetimi",
    description: "Depo stok, yerleşim ve sevkiyat hazırlık süreçlerini yönetin.",
    status: "soon",
    module: "DELIVERY",
    icon: Warehouse,
  },
]

const testHubWorkspace: WorkspaceItem = {
  id: "test-hub",
  title: "Test",
  description: "Auth Kit, layout ve yardımcı bileşen testlerine hızlı erişim.",
  href: "/test/auth",
  status: "ready",
  module: "TESTHUB",
  icon: Wrench,
}

function hasDemoAuthSession(): boolean {
  if (typeof document === "undefined") return false

  return document.cookie.includes("arf_demo_auth=1") || getToken() === "demo-session-token"
}

export function WorkspacesPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("Kullanıcı")
  const [allowedModules, setAllowedModules] = useState<WorkspaceModuleCode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const session = await getSession()

      if (session.success) {
        if (cancelled) return

        const sessionUser = session.data?.user
        const storedUser = getUser()
        const user =
          sessionUser && Object.keys(sessionUser).length > 0
            ? sessionUser
            : storedUser

        const modules = (session.data?.modules ?? []).filter(
          (value): value is WorkspaceModuleCode =>
            WORKSPACE_MODULE_CODES.includes(value as WorkspaceModuleCode)
        )

        setDisplayName(getDisplayNameFromUser(user))
        setAllowedModules(modules)
        setIsLoading(false)
        return
      }

      if (hasDemoAuthSession()) {
        if (cancelled) return

        setDisplayName(getDisplayNameFromUser({
          name: 'Demo User',
          username: 'demo-user',
          email: 'superadmin@arfplatform.local',
        }))
        setAllowedModules([...WORKSPACE_MODULE_CODES])
        setIsLoading(false)
        return
      }

      if (!cancelled) {
        router.replace(ARF_ROUTES.auth.signIn)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router])

  const visibleWorkspaces = useMemo(() => {
    if (allowedModules.includes("TESTHUB")) {
      return [...workspaces, testHubWorkspace]
    }

    return workspaces
  }, [allowedModules])

  const handleLogout = async () => {
    await logoutSession()
    clearAuth()
    router.push(ARF_ROUTES.auth.signIn)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6 py-6 md:px-10">
        <p className="text-sm text-muted-foreground">Oturum doğrulanıyor...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh bg-background px-6 py-6 md:px-10">
      <div className="mx-auto my-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-r from-card via-card to-emerald-50/50 p-4 md:p-5">
          <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-emerald-200/35 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 size-36 rounded-full bg-lime-200/30 blur-2xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Hoş geldiniz</p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{displayName}</h1>
              </div>
            </div>

            <Button variant="outline" className="gap-2 border-slate-300 bg-white/80 md:min-w-36" onClick={handleLogout}>
              <LogOut className="size-4" />
              Çıkış Yap
            </Button>
          </div>
        </header>

        <section className="grid w-full gap-5 lg:grid-cols-3">
          {visibleWorkspaces.map((workspace) => {
            const Icon = workspace.icon
            const isReady = workspace.status === "ready"
            const hasAccess = allowedModules.includes(workspace.module)
            const canEnter = isReady && Boolean(workspace.href) && hasAccess

            return (
              <Card
                key={workspace.id}
                className={canEnter ? "border-foreground/70 shadow-sm" : "border-border/80 opacity-95"}
              >
                <CardHeader className="space-y-5">
                  <div
                    className={
                      canEnter
                        ? "w-fit rounded-2xl bg-primary p-4 text-primary-foreground"
                        : "w-fit rounded-2xl bg-muted p-4 text-muted-foreground"
                    }
                  >
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-4xl">{workspace.title}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed">
                      {workspace.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  {canEnter ? (
                    <Button asChild className="w-full justify-between">
                      <Link href={workspace.href!}>
                        Workspace&apos;e Git
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : isReady ? (
                    <Button
                      disabled
                      className="w-full cursor-not-allowed border-transparent bg-primary/35 text-primary-foreground/90 opacity-100 hover:bg-primary/35"
                    >
                      Workspace&apos;e Giriş Yetkiniz Yok
                    </Button>
                  ) : (
                    <Button disabled className="w-full" variant="outline">
                      Yakında
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </section>
      </div>
    </main>
  )
}
