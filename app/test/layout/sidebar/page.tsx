"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Home, Package, ChevronRight } from "lucide-react"

export default function SidebarVariantsTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sidebar Variants Test</h1>
        <p className="text-muted-foreground">
          AppSidebar komponentinin özellikleri ve kullanımı
        </p>
      </div>

      {/* Current Sidebar Info */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Sidebar</CardTitle>
          <CardDescription>Soldaki menü AppSidebar komponenti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Özellikler:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>✅ Collapsible (açılır/kapanır)</li>
              <li>✅ Nested navigation (2 seviye: NavItem → NavSubItem)</li>
              <li>✅ Active route highlighting (aktif sayfa vurgulu)</li>
              <li>✅ Badge desteği (bildirim sayısı gösterimi)</li>
              <li>✅ User dropdown (kullanıcı menüsü)</li>
              <li>✅ Lucide React ikonları</li>
              <li>✅ Responsive (mobilde otomatik overlay)</li>
              <li>✅ Theme uyumlu</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Navigation Yapısı:</h3>
            <div className="space-y-1 text-sm font-mono bg-muted p-3 rounded">
              <div className="flex items-center gap-1">
                <Home size={14} /> Ana Sayfa
              </div>
              <div className="flex items-center gap-1">
                <Package size={14} /> Kargolar <Badge className="ml-2 text-xs">12</Badge>
                <div className="ml-4 space-y-1 mt-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ChevronRight size={12} /> Tüm Kargolar
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ChevronRight size={12} /> Yeni Kargo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Props */}
      <Card>
        <CardHeader>
          <CardTitle>AppSidebar Props</CardTitle>
          <CardDescription>Özelleştirilebilir özellikler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Prop</th>
                  <th className="text-left p-2">Tip</th>
                  <th className="text-left p-2">Zorunlu</th>
                  <th className="text-left p-2">Açıklama</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">brand</td>
                  <td className="p-2 text-xs">BrandData</td>
                  <td className="p-2">✅</td>
                  <td className="p-2 text-xs">Logo ve marka bilgileri</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">user</td>
                  <td className="p-2 text-xs">UserData</td>
                  <td className="p-2">✅</td>
                  <td className="p-2 text-xs">Kullanıcı bilgileri</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">navGroups</td>
                  <td className="p-2 text-xs">NavGroup[]</td>
                  <td className="p-2">✅</td>
                  <td className="p-2 text-xs">Menü grupları</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Yapısı</CardTitle>
          <CardDescription>Nested menü oluşturma</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { Home, Package } from 'lucide-react'

const navGroups = [
  {
    label: "Menü",  // Grup başlığı (opsiyonel)
    items: [
      {
        title: "Ana Sayfa",
        url: "/",
        icon: Home,
      },
      {
        title: "Kargolar",
        icon: Package,
        badge: "12",      // Bildirim sayısı
        items: [          // Alt menü
          { title: "Tüm Kargolar", url: "/shipments" },
          { title: "Yeni Kargo", url: "/shipments/new" },
        ],
      },
    ],
  },
  {
    // Label olmadan grup (ayraç çizgisi görünür)
    items: [
      {
        title: "Ayarlar",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]`}
          </pre>
        </CardContent>
      </Card>

      {/* Type Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Type Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`interface NavGroup {
  label?: string          // Grup başlığı (opsiyonel)
  items: NavItem[]
}

interface NavItem {
  title: string
  url?: string           // Ana item tıklanabilir mi?
  icon: LucideIcon
  badge?: string         // Bildirim badge
  items?: NavSubItem[]   // Alt menü
}

interface NavSubItem {
  title: string
  url: string           // Alt item'lar mutlaka url'e sahip
}

interface BrandData {
  title: string
  subtitle?: string
  url: string
  icon: LucideIcon
}

interface UserData {
  name: string
  email: string
  avatar?: string
  role?: string
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Active State */}
      <Card>
        <CardHeader>
          <CardTitle>Active State</CardTitle>
          <CardDescription>Aktif rota vurgulama</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Otomatik Active Detection:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>URL ile eşleşen menü öğesi otomatik vurgulanır</li>
              <li>Alt menü açıksa parent da vurgulu olur</li>
              <li>Collapsible alt menüler açık kalır</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">CSS Sınıfları:</h3>
            <pre className="bg-muted p-2 rounded text-xs">
{`// Aktif item
<a className="bg-sidebar-accent text-sidebar-accent-foreground">

// Hover state
<a className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* User Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle>User Dropdown</CardTitle>
          <CardDescription>Sidebar footer kullanıcı menüsü</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sidebar'ın altında kullanıcı bilgileri ve dropdown menü bulunur:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Avatar (varsa) veya baş harfler</li>
            <li>İsim ve email</li>
            <li>Rol badge'i (varsa)</li>
            <li>Profil, Ayarlar, Çıkış Yap menüleri</li>
          </ul>
        </CardContent>
      </Card>

      {/* Responsive Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Davranış</CardTitle>
          <CardDescription>Mobil ve desktop davranışı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Desktop (≥768px):</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Sidebar yan tarafta sabit</li>
              <li>Toggle butonu ile genişlik 256px ↔ 64px</li>
              <li>Kapatıldığında sadece ikonlar görünür</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Mobile (&lt;768px):</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Sidebar overlay olarak açılır</li>
              <li>Hamburger menü butonu header'da</li>
              <li>Dışına tıklanınca kapanır</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Try It */}
      <Card>
        <CardHeader>
          <CardTitle>Deneyin!</CardTitle>
          <CardDescription>Sidebar'ı test edin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Sol taraftaki sidebar'da şunları test edebilirsiniz:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Toggle butonuna tıklayarak sidebar'ı açın/kapatın</li>
            <li>Nested menülere tıklayın (Kargolar, Auth Kit Test)</li>
            <li>Farklı sayfalara gidin ve active state'i görün</li>
            <li>User dropdown'ı açın (sidebar altı)</li>
            <li>Tarayıcı genişliğini değiştirin (responsive test)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
