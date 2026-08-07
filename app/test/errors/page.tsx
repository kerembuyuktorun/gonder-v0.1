'use client'

import { ShieldAlert } from 'lucide-react'
import { KitPageTemplate } from '../_components/kit-page-template'

const OVERVIEW = [
  'Merkezi error render ve handling patternleri tek yerde dokümante edilir.',
  'Runtime error senaryoları birleşik landing route üzerinden doğrulanır.',
  'Sayfa tasarımı ve içerik formatı diğer kit sayfalarıyla eşleşir.',
]

const SCENARIOS = [
  {
    title: 'Error Handling Demo Hub',
    href: '/test/errors/demo',
    description: 'Kapsamlı error throw/render/recovery senaryoları.',
    tags: ['demo', 'boundary', 'renderer'],
  },
]

const API_ITEMS = [
  { name: 'ErrorsKitProvider', type: 'component', required: true, description: 'Provider to map and manage app errors.' },
  { name: 'GlobalErrorBoundary', type: 'component', required: false, description: 'Top-level React error boundary.' },
  { name: 'useErrorHandler', type: 'hook', required: false, description: 'Hook for normalized error handling.' },
  { name: 'createErrorHandler', type: 'function', required: false, description: 'Factory for custom handler strategy.' },
  { name: 'ErrorRenderer', type: 'component', required: false, description: 'Typed page rendering by error category.' },
]

const TEST_CASES = [
  { title: 'Bilinen error türleri beklenen UI bloklarına map edilir', status: 'manual' as const },
  { title: 'Unhandled errorlar generic error deneyimine fallback eder', status: 'manual' as const },
  { title: 'Recovery aksiyonları error görünümlerinden tetiklenebilir', status: 'manual' as const },
]

export default function ErrorsKitLandingPage() {
  return (
    <KitPageTemplate
      kitName="Errors Kit"
      description="Diğer kitlerle aynı görsel dil ve bölüm kategorilerini kullanan birleşik error kit landing sayfası."
      icon={ShieldAlert}
      overviewItems={OVERVIEW}
      scenarios={SCENARIOS}
      apiItems={API_ITEMS}
      testCases={TEST_CASES}
    />
  )
}
