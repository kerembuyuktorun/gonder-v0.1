'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CheckCircle2, Code2, Layers } from 'lucide-react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Scenario = {
  title: string
  href: string
  description: string
  tags?: string[]
}

type ApiItem = {
  name: string
  type: string
  required?: boolean
  description: string
  defaultValue?: string
}

type TestCaseItem = {
  title: string
  status: 'done' | 'manual' | 'todo'
}

type KitPageTemplateProps = {
  kitName: string
  description: string
  status?: 'Stable' | 'Beta'
  icon: LucideIcon
  overviewItems: string[]
  scenarios: Scenario[]
  apiItems: ApiItem[]
  testCases: TestCaseItem[]
}

function statusBadgeVariant(status: TestCaseItem['status']): 'default' | 'secondary' | 'outline' {
  if (status === 'done') return 'default'
  if (status === 'manual') return 'secondary'
  return 'outline'
}

function statusLabel(status: TestCaseItem['status']): string {
  if (status === 'done') return 'Tamamlandı'
  if (status === 'manual') return 'Manuel'
  return 'Yapılacak'
}

export function KitPageTemplate({
  kitName,
  description,
  status = 'Stable',
  icon: Icon,
  overviewItems,
  scenarios,
  apiItems,
  testCases,
}: KitPageTemplateProps) {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Test Hub', href: '/test' },
          { label: kitName },
        ]}
        searchPlaceholder={`${kitName} ara...`}
        notificationCount={0}
      />

      <main className="flex flex-1 flex-col gap-6 p-6">
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <Icon className="size-7 text-sky-600" />
            <h1 className="text-3xl font-semibold tracking-tight">{kitName}</h1>
            <Badge>{status}</Badge>
          </div>
          <p className="max-w-3xl text-base text-muted-foreground">{description}</p>
        </section>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Layers className="size-4" />
              <span>Genel Bakış</span>
            </TabsTrigger>
            <TabsTrigger value="demo" className="gap-2">
              <ArrowRight className="size-4" />
              <span>Demo</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Code2 className="size-4" />
              <span>API</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="gap-2">
              <CheckCircle2 className="size-4" />
              <span>Test Cases</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bu Kit Neler Sunar?</CardTitle>
                <CardDescription>Tüm kit sayfaları aynı içerik modelini izler.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {overviewItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scenarios.map((scenario) => (
                <Card key={scenario.href}>
                  <CardHeader>
                    <CardTitle className="text-base">{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scenario.tags && scenario.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {scenario.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Link href={scenario.href} className="inline-flex items-center text-sm font-medium text-sky-700 hover:underline">
                      Senaryoyu aç
                      <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Temel API Yüzeyi</CardTitle>
                <CardDescription>Her kit sayfası için ortak API tablo formatı.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="hidden border-b pb-2 text-sm font-medium text-muted-foreground md:grid md:grid-cols-[1.2fr_1fr_0.8fr_2fr_0.8fr] md:gap-3">
                  <span>Ad</span>
                  <span>Tip</span>
                  <span>Zorunlu</span>
                  <span>Açıklama</span>
                  <span>Varsayılan</span>
                </div>
                {apiItems.map((item) => (
                  <div key={item.name} className="grid gap-1 rounded-md border p-3 text-sm md:grid-cols-[1.2fr_1fr_0.8fr_2fr_0.8fr] md:gap-3">
                    <span className="font-medium">{item.name}</span>
                    <code className="text-xs md:text-sm">{item.type}</code>
                    <span>{item.required ? 'Evet' : 'Hayır'}</span>
                    <span className="text-muted-foreground">{item.description}</span>
                    <span>{item.defaultValue ?? '-'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Doğrulama Checklist'i</CardTitle>
                <CardDescription>Test otomasyonu kaldırıldıktan sonraki manuel doğrulama matrisi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {testCases.map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm">{item.title}</span>
                    <Badge variant={statusBadgeVariant(item.status)}>{statusLabel(item.status)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
