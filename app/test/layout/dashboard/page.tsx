"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DashboardLayoutTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard Layout Test</h1>
        <p className="text-muted-foreground">
          DashboardLayout komponentinin kullanımı ve özellikleri
        </p>
      </div>

      {/* Component Info */}
      <Card>
        <CardHeader>
          <CardTitle>DashboardLayout Komponenti</CardTitle>
          <CardDescription>
            Sidebar, Header ve Footer'ı bir araya getiren wrapper component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Özellikler:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>✅ Otomatik sidebar açma/kapama</li>
              <li>✅ Sticky header</li>
              <li>✅ İsteğe bağlı footer</li>
              <li>✅ Responsive tasarım</li>
              <li>✅ Theme desteği (dark/light)</li>
              <li>✅ Nested navigation (2 seviye)</li>
              <li>✅ Badge desteği</li>
              <li>✅ Active route highlighting</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Badge>SidebarProvider</Badge>
            <Badge>AppSidebar</Badge>
            <Badge>AppHeader</Badge>
            <Badge>AppFooter</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Props Table */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
          <CardDescription>DashboardLayout bileşeni props'ları</CardDescription>
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
                  <td className="p-2 font-mono text-xs">brandData</td>
                  <td className="p-2 text-xs">BrandData</td>
                  <td className="p-2">✅</td>
                  <td className="p-2 text-xs">Logo ve marka bilgileri</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">userData</td>
                  <td className="p-2 text-xs">UserData</td>
                  <td className="p-2">✅</td>
                  <td className="p-2 text-xs">Kullanıcı bilgileri</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">navGroups</td>
                  <td className="p-2 text-xs">NavGroup[]</td>
                  <td className="p-2">✅</td>
                  <td className="p-2 text-xs">Menü yapısı</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">showFooter</td>
                  <td className="p-2 text-xs">boolean</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Footer göster/gizle</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">footerData</td>
                  <td className="p-2 text-xs">AppFooterProps</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Footer içeriği</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">children</td>
                  <td className="p-2 text-xs">ReactNode</td>
                  <td className="p-2">✅</td>
                  <td className="p-2 text-xs">Sayfa içeriği</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanım Örneği</CardTitle>
          <CardDescription>app/(dashboard)/layout.tsx</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { DashboardLayout } from '@hascanb/arf-ui-kit/layout-kit'
import { Home, Package, Users } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <DashboardLayout
      brandData={{
        title: "My App",
        subtitle: "v1.0",
        url: "/",
        icon: Home,
      }}
      userData={{
        name: "John Doe",
        email: "john@example.com",
        avatar: "/avatar.jpg",
        role: "Admin",
      }}
      navGroups={[
        {
          label: "Menü",
          items: [
            {
              title: "Ana Sayfa",
              url: "/",
              icon: Home,
            },
            {
              title: "Ürünler",
              icon: Package,
              badge: "12",
              items: [
                { title: "Tüm Ürünler", url: "/products" },
                { title: "Yeni Ürün", url: "/products/new" },
              ],
            },
          ],
        },
      ]}
      showFooter={true}
    >
      {children}
    </DashboardLayout>
  )
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Navigation Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Hazır Navigation Setleri</CardTitle>
          <CardDescription>Layout Kit utils'den import edilebilir</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { 
  testNavGroups,      // Test & geliştirme menüsü
  cargoNavGroups,     // Kargo sistemi örneği
  ecommerceNavGroups, // E-ticaret örneği
  basicNavGroups,     // Basit menü
} from '@hascanb/arf-ui-kit/layout-kit'

<DashboardLayout
  brandData={...}
  userData={...}
  navGroups={testNavGroups} // Hazır menü kullan
/>`}
          </pre>
        </CardContent>
      </Card>

      {/* Type Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Type Definitions</CardTitle>
          <CardDescription>TypeScript tip tanımlamaları</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`interface BrandData {
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
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

interface NavItem {
  title: string
  url?: string
  icon: LucideIcon
  badge?: string
  items?: NavSubItem[]
}

interface NavSubItem {
  title: string
  url: string
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Live Example */}
      <Card>
        <CardHeader>
          <CardTitle>Canlı Örnek</CardTitle>
          <CardDescription>
            Şu an kullandığınız layout DashboardLayout komponenti!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Sidebar'daki menü, header'daki breadcrumb ve bu sayfa artık 
            DashboardLayout komponenti kullanılarak render ediliyor.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.location.reload()}>
              Sayfayı Yenile
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.history.back()}>
              Geri Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
