'use client'

import { LayoutDashboard } from 'lucide-react'
import { KitPageTemplate } from '../_components/kit-page-template'

const OVERVIEW = [
  'Dashboard sayfaları için layout primitive bileşenleri tek bir girişte toplanır.',
  'Header, sidebar, footer ve tam dashboard senaryoları tutarlı şekilde bağlanır.',
  'Bu sayfa diğer kit sayfalarıyla aynı bölüm modelini takip eder.',
]

const SCENARIOS = [
  {
    title: 'Dashboard Layout',
    href: '/test/layout/dashboard',
    description: 'Full dashboard composition scenario.',
    tags: ['dashboard', 'layout'],
  },
  {
    title: 'Header Variants',
    href: '/test/layout/header',
    description: 'Breadcrumb, search and actions in header variants.',
    tags: ['header'],
  },
  {
    title: 'Sidebar Variants',
    href: '/test/layout/sidebar',
    description: 'Navigation groups and collapse behavior.',
    tags: ['sidebar', 'navigation'],
  },
  {
    title: 'Footer Variants',
    href: '/test/layout/footer',
    description: 'Footer content and link structure variants.',
    tags: ['footer'],
  },
]

const API_ITEMS = [
  { name: 'DashboardLayout', type: 'component', required: true, description: 'Top-level shell for dashboard pages.' },
  { name: 'AppHeader', type: 'component', required: false, description: 'Header with breadcrumbs and actions.' },
  { name: 'AppSidebar', type: 'component', required: false, description: 'Sidebar navigation and user area.' },
  { name: 'AppFooter', type: 'component', required: false, description: 'Footer block for app pages.' },
  { name: 'navGroups', type: 'NavGroup[]', required: false, description: 'Sidebar menu group definitions.' },
]

const TEST_CASES = [
  { title: 'Header + sidebar kompozisyonu stabil çalışır', status: 'manual' as const },
  { title: 'Sidebar collapse ve nested nav davranışı çalışır', status: 'manual' as const },
  { title: 'Dashboard ve footer routeları doğru render olur', status: 'manual' as const },
]

export default function LayoutKitLandingPage() {
  return (
    <KitPageTemplate
      kitName="Layout Kit"
      description="Standartlaştırılmış bilgi mimarisi ve bölüm tipleriyle ortak layout kit landing sayfası."
      icon={LayoutDashboard}
      overviewItems={OVERVIEW}
      scenarios={SCENARIOS}
      apiItems={API_ITEMS}
      testCases={TEST_CASES}
    />
  )
}
