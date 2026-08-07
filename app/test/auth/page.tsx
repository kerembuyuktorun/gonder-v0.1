'use client'

import { ShieldCheck } from 'lucide-react'
import { KitPageTemplate } from '../_components/kit-page-template'

const OVERVIEW = [
  'Authentication formları ve sayfa seviyesindeki auth akışları tek bir merkezde toplanır.',
  'Config odaklı provider kullanımı, tekrar kullanılabilir UI primitive bileşenleriyle sunulur.',
  'Validation ve token yardımcıları tek bir standart landing sayfasından erişilir.',
]

const SCENARIOS = [
  {
    title: 'Full Auth Demo Hub',
    href: '/test/auth/demo',
    description: 'Kapsamlı auth-kit etkileşimli demo ve docs sayfası.',
    tags: ['demo', 'full'],
  },
  {
    title: 'Sign In Page Template',
    href: '/test/auth/pages/signin',
    description: 'Etkileşimli sign-in page template senaryoları.',
    tags: ['page-template', 'signin'],
  },
  {
    title: 'Auth Icons',
    href: '/test/icons/auth',
    description: 'Brand icon variants used in auth flows.',
    tags: ['icons'],
  },
  {
    title: 'Validation Utils',
    href: '/test/utils/validation',
    description: 'Validation helper checks for auth-related rules.',
    tags: ['utils', 'validation'],
  },
  {
    title: 'Token Utils',
    href: '/test/utils/token',
    description: 'Token decode and expiration helper checks.',
    tags: ['utils', 'token'],
  },
]

const API_ITEMS = [
  { name: 'AuthKitProvider', type: 'component', required: true, description: 'Auth context ve configuration sağlar.' },
  { name: 'SignInForm', type: 'component', required: false, description: 'Tekrar kullanılabilir sign-in form bileşeni.' },
  { name: 'OtpForm', type: 'component', required: false, description: 'One-time-password doğrulama formu.' },
  { name: 'useAuthKit', type: 'hook', required: false, description: 'Auth state ve auth action erişimi sağlar.' },
  { name: 'config', type: 'AuthKitConfig', required: true, description: 'Provider configuration nesnesi.' },
]

const TEST_CASES = [
  { title: 'Sign-in page doğru render olur ve input kabul eder', status: 'manual' as const },
  { title: 'OTP ve reset flow giriş linkleri erişilebilir', status: 'manual' as const },
  { title: 'Token utility sayfası demo payload ile çalışır', status: 'manual' as const },
]

export default function AuthKitLandingPage() {
  return (
    <KitPageTemplate
      kitName="Auth Kit"
      description="Birleşik sayfa düzeninde merkezileştirilmiş authentication kit docs ve demo senaryoları."
      icon={ShieldCheck}
      overviewItems={OVERVIEW}
      scenarios={SCENARIOS}
      apiItems={API_ITEMS}
      testCases={TEST_CASES}
    />
  )
}
