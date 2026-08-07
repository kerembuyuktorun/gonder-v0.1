'use client'

import { MessageSquare } from 'lucide-react'
import { KitPageTemplate } from '../_components/kit-page-template'

const OVERVIEW = [
  'Feedback bildirimleri ve toast davranışı tek bir route altında merkezileştirilir.',
  'Mesaj varyantları ve bildirim seçenekleri ortak bölümler altında gruplanır.',
  'Sayfa düzeni ve içerik tipi diğer tüm kit sayfalarıyla hizalıdır.',
]

const SCENARIOS = [
  {
    title: 'Feedback Demo Hub',
    href: '/test/feedback/demo',
    description: 'Detaylı toast varyantı ve seçenekleri test sayfası.',
    tags: ['demo', 'toast', 'notifications'],
  },
]

const API_ITEMS = [
  { name: 'FeedbackProvider', type: 'component', required: true, description: 'Provider wrapper for feedback context.' },
  { name: 'useFeedback', type: 'hook', required: false, description: 'Hook to trigger typed feedback actions.' },
  { name: 'success', type: 'function', required: false, description: 'Success toast helper.' },
  { name: 'error', type: 'function', required: false, description: 'Error toast helper.' },
  { name: 'warning/info', type: 'function', required: false, description: 'Warning and info helpers.' },
]

const TEST_CASES = [
  { title: 'Basic toast varyantları doğru tetiklenir', status: 'manual' as const },
  { title: 'Custom duration ve konumlandırma seçenekleri çalışır', status: 'manual' as const },
  { title: 'Provider ve hook bağlantısı tutarlı çalışır', status: 'manual' as const },
]

export default function FeedbackKitLandingPage() {
  return (
    <KitPageTemplate
      kitName="Feedback Kit"
      description="Docs, demo ve validation checklist için ortak yapı kullanan feedback kit landing sayfası."
      icon={MessageSquare}
      overviewItems={OVERVIEW}
      scenarios={SCENARIOS}
      apiItems={API_ITEMS}
      testCases={TEST_CASES}
    />
  )
}
