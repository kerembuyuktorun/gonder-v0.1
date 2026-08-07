import Link from 'next/link'
import {
  ShieldCheck,
  LayoutDashboard,
  Table,
  KeyRound,
  FileUp,
  AlertTriangle,
  Bell,
  Wrench,
  Images,
  Accessibility,
  Activity,
} from 'lucide-react'

import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const sections = [
  { title: 'Auth Kit', href: '/test/auth', icon: ShieldCheck, description: 'Sign-in, reset, OTP ve auth akış testleri' },
  { title: 'Layout Kit', href: '/test/layout-kit', icon: LayoutDashboard, description: 'Dashboard, header, sidebar, footer varyantları' },
  { title: 'DataTable Kit', href: '/test/datatable', icon: Table, description: 'Basic/advanced/server-side tablo davranış testleri' },
  { title: 'Form Kit', href: '/test/form', icon: KeyRound, description: 'Schema, wizard, autosave ve conditional field senaryoları' },
  { title: 'File Kit', href: '/test/file-uploader', icon: FileUp, description: 'Upload, preview, dedupe ve RHF entegrasyonu' },
  { title: 'Errors Kit', href: '/test/errors', icon: AlertTriangle, description: 'Error boundary, normalize ve aksiyon politikası' },
  { title: 'Feedback Kit', href: '/test/feedback', icon: Bell, description: 'Toast dispatch, provider davranışı ve kullanım kalıpları' },
  { title: 'Utils ve Icons', href: '/test/utils/validation', icon: Wrench, description: 'Validation, token ve icon yardımcı paket testleri' },
  { title: 'Component Gallery', href: '/test/gallery', icon: Images, description: 'Tüm UI bileşenleri ve varyantları tek merkezde' },
  { title: 'A11y Paneli', href: '/test/a11y', icon: Accessibility, description: 'Erişilebilirlik kontrolleri, odak ve semantik denetimleri' },
  { title: 'Performance Benchmarks', href: '/test/benchmarks', icon: Activity, description: 'Bileşen ağırlığı ve etkileşim performans metrikleri' },
]

export default function TestHomePage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Test ve Docs Hub' }]}
        searchPlaceholder="Test sayfası ara..."
        notificationCount={0}
      />

      <main className="flex flex-1 flex-col gap-6 p-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Test ve Dokümantasyon Merkezi</h1>
          <p className="text-sm text-muted-foreground">
            Tüm kitler için canlı test senaryoları, davranış doğrulamaları ve dokümantasyon referansları.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.title} href={section.href} className="group">
              <Card className="h-full border-slate-200 transition-all group-hover:border-sky-300 group-hover:shadow-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <section.icon className="size-4 text-sky-600" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-sky-700">Detaylı test sayfasına git</CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </main>
    </>
  )
}
