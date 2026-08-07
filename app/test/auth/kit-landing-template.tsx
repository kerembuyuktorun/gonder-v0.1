'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, FileText, CheckCircle2, Accessibility, Activity } from 'lucide-react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'

interface KitLandingPageProps {
  kitName: string
  kitSlug: string
  kitDescription: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  
  // Demo section
  demoComponent?: React.ReactNode
  
  // API section - props documentation
  apiDocs?: Array<{
    componentName: string
    props: Array<{
      name: string
      type: string
      required: boolean
      description: string
      defaultValue?: string
    }>
  }>
  
  // Test Cases
  testCases?: Array<{
    category: string
    cases: Array<{
      title: string
      description: string
      path: string
    }>
  }>
  
  // A11y checklist
  a11yItems?: Array<{
    category: string
    items: Array<{
      title: string
      status: 'pass' | 'fail' | 'partial'
      notes?: string
    }>
  }>
  
  // Performance metrics
  performanceMetrics?: Array<{
    metric: string
    value: string
    target: string
    status: 'pass' | 'fail'
  }>
}

export function KitLandingPage({
  kitName,
    kitSlug: _kitSlug,
  kitDescription,
  breadcrumbs = [],
  demoComponent,
  apiDocs = [],
  testCases = [],
  a11yItems = [],
  performanceMetrics = []
}: KitLandingPageProps) {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Test Hub', href: '/test' },
          { label: kitName },
          ...breadcrumbs
        ]}
        searchPlaceholder={`${kitName} icinde ara...`}
        notificationCount={0}
      />

      <main className="flex flex-1 flex-col gap-6 p-6">
        {/* Header Section */}
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{kitName}</h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            {kitDescription}
          </p>
        </section>

        {/* Tabs Navigation */}
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="demo" className="gap-2">
              <FileText className="size-4" />
              <span className="hidden sm:inline">Demo</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Code className="size-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="gap-2">
              <CheckCircle2 className="size-4" />
              <span className="hidden sm:inline">Testler</span>
            </TabsTrigger>
            <TabsTrigger value="a11y" className="gap-2">
              <Accessibility className="size-4" />
              <span className="hidden sm:inline">A11y</span>
            </TabsTrigger>
            <TabsTrigger value="perf" className="gap-2">
              <Activity className="size-4" />
              <span className="hidden sm:inline">Perf</span>
            </TabsTrigger>
          </TabsList>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Canli Demo</CardTitle>
                <CardDescription>
                  {kitName} in interaktif demosunu asagida gorebilirsiniz. Formlar, butonlar,
                  ve diger ozelliklerle oynayarak davranisini test edin.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-96 bg-muted/20 rounded-lg border border-dashed p-6">
                {demoComponent ? (
                  demoComponent
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Demo bileşeni henüz tanımlanmamış.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Referansi</CardTitle>
                <CardDescription>
                  Tum bileşenlerin prop'ları, türleri ve açıklamaları.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {apiDocs.length > 0 ? (
                  apiDocs.map((doc) => (
                    <div key={doc.componentName} className="space-y-3">
                      <div className="border-b pb-2">
                        <h3 className="font-mono font-semibold text-sm">
                          &lt;{doc.componentName} /&gt;
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {doc.props.map((prop) => (
                          <div
                            key={prop.name}
                            className="border rounded p-3 space-y-1 text-sm bg-slate-50 dark:bg-slate-900"
                          >
                            <div className="flex items-center gap-2">
                              <code className="font-semibold text-primary">
                                {prop.name}
                              </code>
                              <span className="text-xs font-mono text-muted-foreground">
                                {prop.type}
                              </span>
                              {prop.required && (
                                <span className="text-xs bg-red-500/10 text-red-600 px-2 py-0.5 rounded">
                                  Zorunlu
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground">{prop.description}</p>
                            {prop.defaultValue && (
                              <p className="text-xs text-muted-foreground font-mono">
                                Default: <code>{prop.defaultValue}</code>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">API dokümantasyonu henüz hazırlanmamış.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Senaryoları</CardTitle>
                <CardDescription>
                  Bu kit için tasarlanmış test sayfalarını ve senaryolarını bulun.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {testCases.length > 0 ? (
                  testCases.map((testGroup) => (
                    <div key={testGroup.category} className="space-y-3">
                      <h3 className="font-semibold text-sm">{testGroup.category}</h3>
                      <div className="grid gap-2">
                        {testGroup.cases.map((testCase) => (
                          <Link
                            key={testCase.title}
                            href={testCase.path}
                            className="block p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                          >
                            <p className="font-medium text-sm">{testCase.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {testCase.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Test senaryoları henüz eklenmemiş.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* A11y Tab */}
          <TabsContent value="a11y" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Erişilebilirlik (A11y)</CardTitle>
                <CardDescription>
                  Bu kit'in erişilebilirlik denetim sonuçları ve durum.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {a11yItems.length > 0 ? (
                  a11yItems.map((category) => (
                    <div key={category.category} className="space-y-3">
                      <h3 className="font-semibold text-sm">{category.category}</h3>
                      <div className="space-y-2">
                        {category.items.map((item) => (
                          <div
                            key={item.title}
                            className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900"
                          >
                            <div className="flex items-center gap-2">
                              {item.status === 'pass' && (
                                <div className="size-2 rounded-full bg-emerald-500" />
                              )}
                              {item.status === 'fail' && (
                                <div className="size-2 rounded-full bg-red-500" />
                              )}
                              {item.status === 'partial' && (
                                <div className="size-2 rounded-full bg-amber-500" />
                              )}
                              <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {item.status === 'pass' && 'Geçti'}
                              {item.status === 'fail' && 'Başarısız'}
                              {item.status === 'partial' && 'Kısmi'}
                            </span>
                          </div>
                        ))}
                      </div>
                      {category.items.some((i) => i.notes) && (
                        <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20">
                          <p className="font-semibold">Notlar:</p>
                          {category.items
                            .filter((i) => i.notes)
                            .map((i) => (
                              <p key={i.title}>• {i.notes}</p>
                            ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">A11y denetimi henüz yapılmamış.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="perf" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performans Metrikleri</CardTitle>
                <CardDescription>
                  Kit'in performans hedefleri ve ölçümleri.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.length > 0 ? (
                  <div className="space-y-3">
                    {performanceMetrics.map((metric) => (
                      <div
                        key={metric.metric}
                        className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{metric.metric}</p>
                          <p className="text-xs text-muted-foreground">
                            Hedef: {metric.target}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-semibold">
                            {metric.value}
                          </span>
                          {metric.status === 'pass' ? (
                            <div className="size-2 rounded-full bg-emerald-500" />
                          ) : (
                            <div className="size-2 rounded-full bg-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Performans metrikleri henüz ölçülmemiş. Sonraki aşamada benchmark
                    sonuçları burada yer alacak.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
