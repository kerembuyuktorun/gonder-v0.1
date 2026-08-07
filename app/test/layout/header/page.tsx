"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'

export default function HeaderVariantsTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Header Variants Test</h1>
        <p className="text-muted-foreground">
          AppHeader komponentinin özellikleri ve kullanımı
        </p>
      </div>

      {/* Current Header Info */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Header</CardTitle>
          <CardDescription>Şu an kullandığınız header AppHeader komponenti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Özellikler:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>✅ Sticky positioning (sayfayı kaydırınca yukarıda kalır)</li>
              <li>✅ Breadcrumb navigation (sayfa yolu gösterimi)</li>
              <li>✅ Sidebar toggle butonu (hamburger menu)</li>
              <li>✅ Responsive tasarım</li>
              <li>✅ Theme uyumlu (dark/light mode)</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Mevcut Breadcrumb:</h3>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">Test & Geliştirme</Badge>
              <span>/</span>
              <Badge variant="outline">Layout Kit Test</Badge>
              <span>/</span>
              <Badge variant="outline">Header Variants</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Props */}
      <Card>
        <CardHeader>
          <CardTitle>AppHeader Props</CardTitle>
          <CardDescription>Özelleştirilebilir özellikler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Prop</th>
                  <th className="text-left p-2">Tip</th>
                  <th className="text-left p-2">Varsayılan</th>
                  <th className="text-left p-2">Açıklama</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">breadcrumbs</td>
                  <td className="p-2 text-xs">BreadcrumbData[]</td>
                  <td className="p-2 text-xs">undefined</td>
                  <td className="p-2 text-xs">Breadcrumb yolu (opsiyonel)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">showSearch</td>
                  <td className="p-2 text-xs">boolean</td>
                  <td className="p-2 text-xs">false</td>
                  <td className="p-2 text-xs">Arama kutusu göster</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">showNotifications</td>
                  <td className="p-2 text-xs">boolean</td>
                  <td className="p-2 text-xs">false</td>
                  <td className="p-2 text-xs">Bildirim ikonu göster</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanım Örneği</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'

<AppHeader
  breadcrumbs={[
    { label: "Ana Sayfa", href: "/" },
    { label: "Ürünler", href: "/products" },
    { label: "Yeni Ürün" },
  ]}
  showSearch={true}
  showNotifications={true}
/>`}
          </pre>
        </CardContent>
      </Card>

      {/* Variants Info */}
      <Card>
        <CardHeader>
          <CardTitle>Header Varyasyonları</CardTitle>
          <CardDescription>Farklı kullanım senaryoları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">1. Minimal Header</h3>
            <p className="text-sm text-muted-foreground">
              Sadece sidebar toggle - breadcrumb yok
            </p>
            <pre className="bg-muted p-2 rounded text-xs">
{`<AppHeader />`}
            </pre>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">2. Breadcrumb ile</h3>
            <p className="text-sm text-muted-foreground">
              Sayfa yolu gösterimi (mevcut kullanım)
            </p>
            <pre className="bg-muted p-2 rounded text-xs">
{`<AppHeader breadcrumbs={[...]} />`}
            </pre>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">3. Full Featured</h3>
            <p className="text-sm text-muted-foreground">
              Arama + bildirim + breadcrumb
            </p>
            <pre className="bg-muted p-2 rounded text-xs">
{`<AppHeader
  breadcrumbs={[...]}
  showSearch={true}
  showNotifications={true}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Type Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Type Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`interface BreadcrumbData {
  label: string
  href?: string
}

interface AppHeaderProps {
  breadcrumbs?: BreadcrumbData[]
  showSearch?: boolean
  showNotifications?: boolean
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Sticky Header Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Sticky Header Demo</CardTitle>
          <CardDescription>Sayfayı aşağı kaydırın, header yukarıda kalır</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Header <code className="bg-muted px-1 py-0.5 rounded">position: sticky</code> özelliğine sahip.
              Sayfayı kaydırdığınızda header her zaman görünür kalır.
            </p>
            <div className="h-[520px] overflow-y-auto rounded-lg border bg-background">
              <AppHeader
                breadcrumbs={[
                  { label: "Test & Geliştirme", href: "/test/layout/dashboard" },
                  { label: "Layout Kit Test", href: "/test/layout/header" },
                  { label: "Sticky Header Demo" },
                ]}
                searchPlaceholder="Demo içinde ara..."
                searchShortcut="⌘K"
                notificationCount={3}
                notificationsLabel="Bildirimler"
              />

              <div className="space-y-4 p-4">
                <p className="text-sm text-muted-foreground">
                  Bu alanı kaydırdığınızda üstteki header sabit kalır. Böylece sticky davranışı canlı olarak test edebilirsiniz.
                </p>

                {Array.from({ length: 16 }).map((_, index) => (
                  <div key={index} className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="text-sm font-semibold">Demo İçerik Satırı {index + 1}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Sticky header doğrulaması için örnek kaydırma içeriği.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
