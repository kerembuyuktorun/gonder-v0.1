"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Linkedin, Github } from "lucide-react"

export default function FooterVariantsTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Footer Variants Test</h1>
        <p className="text-muted-foreground">
          AppFooter komponentinin özellikleri ve kullanımı
        </p>
      </div>

      {/* Footer Status */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Durumu</CardTitle>
          <CardDescription>DashboardLayout'ta footer gösterimi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Footer Özellikleri:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>✅ İsteğe bağlı (showFooter prop)</li>
              <li>✅ Multi-column link grupları</li>
              <li>✅ Social media linkleri</li>
              <li>✅ Copyright metni</li>
              <li>✅ Company açıklaması</li>
              <li>✅ Privacy/Terms linkleri</li>
              <li>✅ Lucide React ikonları</li>
              <li>✅ Responsive tasarım</li>
            </ul>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <Badge variant="outline">Şu an footer kapalı</Badge>
            <span className="text-sm text-muted-foreground">
              DashboardLayout'ta showFooter=true yapın
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Props */}
      <Card>
        <CardHeader>
          <CardTitle>AppFooter Props</CardTitle>
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
                  <td className="p-2 font-mono text-xs">companyName</td>
                  <td className="p-2 text-xs">string</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Şirket adı</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">description</td>
                  <td className="p-2 text-xs">string</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Kısa açıklama</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">linkGroups</td>
                  <td className="p-2 text-xs">FooterLinkGroup[]</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Link kolonları</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">socialLinks</td>
                  <td className="p-2 text-xs">FooterSocialLink[]</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Social media linkleri</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">copyrightText</td>
                  <td className="p-2 text-xs">string</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Copyright metni</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">showPrivacyTerms</td>
                  <td className="p-2 text-xs">boolean</td>
                  <td className="p-2">❌</td>
                  <td className="p-2 text-xs">Privacy/Terms linkleri</td>
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
          <CardDescription>DashboardLayout ile footer ekleme</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { DashboardLayout } from '@hascanb/arf-ui-kit/layout-kit'
import { Github, Twitter, Linkedin } from 'lucide-react'

<DashboardLayout
  brandData={{...}}
  userData={{...}}
  navGroups={[...]}
  showFooter={true}
  footerData={{
    companyName: "ARF Tech",
    description: "Modern web uygulamaları geliştiriyoruz",
    linkGroups: [
      {
        title: "Ürünler",
        links: [
          { label: "Auth Kit", href: "/products/auth" },
          { label: "Layout Kit", href: "/products/layout" },
          { label: "Form Kit", href: "/products/form" },
        ],
      },
      {
        title: "Şirket",
        links: [
          { label: "Hakkımızda", href: "/about" },
          { label: "İletişim", href: "/contact" },
          { label: "Kariyer", href: "/careers" },
        ],
      },
    ],
    socialLinks: [
      { platform: "github", url: "https://github.com/...", icon: Github },
      { platform: "twitter", url: "https://twitter.com/...", icon: Twitter },
      { platform: "linkedin", url: "https://linkedin.com/...", icon: Linkedin },
    ],
    copyrightText: "© 2026 ARF Tech. Tüm hakları saklıdır.",
    showPrivacyTerms: true,
  }}
>
  {children}
</DashboardLayout>`}
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
{`interface FooterLinkGroup {
  title: string
  links: FooterLink[]
}

interface FooterLink {
  label: string
  href: string
}

interface FooterSocialLink {
  platform: string      // "github", "twitter", etc.
  url: string
  icon: LucideIcon
}

interface AppFooterProps {
  companyName?: string
  description?: string
  linkGroups?: FooterLinkGroup[]
  socialLinks?: FooterSocialLink[]
  copyrightText?: string
  showPrivacyTerms?: boolean
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Visual Example */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Görünümü</CardTitle>
          <CardDescription>Tipik bir footer layout'u</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-muted/30">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="space-y-2">
                <h3 className="font-bold">ARF Tech</h3>
                <p className="text-sm text-muted-foreground">
                  Modern web uygulamaları geliştiriyoruz
                </p>
                <div className="flex gap-2 pt-2">
                  <Github size={20} className="text-muted-foreground hover:text-foreground cursor-pointer" />
                  <Twitter size={20} className="text-muted-foreground hover:text-foreground cursor-pointer" />
                  <Linkedin size={20} className="text-muted-foreground hover:text-foreground cursor-pointer" />
                  <Facebook size={20} className="text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
              </div>

              {/* Link Groups */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Ürünler</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="hover:text-foreground cursor-pointer">Auth Kit</li>
                  <li className="hover:text-foreground cursor-pointer">Layout Kit</li>
                  <li className="hover:text-foreground cursor-pointer">Form Kit</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Şirket</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="hover:text-foreground cursor-pointer">Hakkımızda</li>
                  <li className="hover:text-foreground cursor-pointer">İletişim</li>
                  <li className="hover:text-foreground cursor-pointer">Kariyer</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Destek</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="hover:text-foreground cursor-pointer">Dokümantasyon</li>
                  <li className="hover:text-foreground cursor-pointer">API Referans</li>
                  <li className="hover:text-foreground cursor-pointer">İletişim</li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2026 ARF Tech. Tüm hakları saklıdır.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-foreground">Gizlilik Politikası</a>
                <a href="#" className="hover:text-foreground">Kullanım Şartları</a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Varyasyonları</CardTitle>
          <CardDescription>Farklı kullanım senaryoları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">1. Minimal Footer</h3>
            <p className="text-sm text-muted-foreground">
              Sadece copyright ve sosyal medya
            </p>
            <pre className="bg-muted p-2 rounded text-xs">
{`footerData={{
  copyrightText: "© 2026 Company",
  socialLinks: [...]
}}`}
            </pre>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">2. Full Footer</h3>
            <p className="text-sm text-muted-foreground">
              Tüm özellikler (yukarıdaki örnek)
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">3. Footer Yok</h3>
            <p className="text-sm text-muted-foreground">
              DashboardLayout'ta showFooter=false (varsayılan)
            </p>
            <pre className="bg-muted p-2 rounded text-xs">
{`<DashboardLayout
  {...props}
  // showFooter prop verilmezse footer görünmez
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Enable Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Footer'ı Etkinleştir</CardTitle>
          <CardDescription>Mevcut layout'a footer eklemek için</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <code className="bg-muted px-1 py-0.5 rounded">app/(dashboard)/layout.tsx</code> dosyasında:
          </p>
          <pre className="bg-muted p-3 rounded text-xs">
{`<AppSidebar 
  brand={brandData}
  user={userData}
  navGroups={navGroups}
  
  // Footer için bu props'ları ekleyin:
  showFooter={true}
  footerData={{
    companyName: "Kargo Sistemi",
    copyrightText: "© 2026 Kargo Sistemi",
    showPrivacyTerms: true,
  }}
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
