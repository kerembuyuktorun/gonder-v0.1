import type { Metadata } from 'next'
import { Manrope, Source_Sans_3 } from 'next/font/google'
import './landing/_lib/design-tokens.css'

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-source-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gönder — Kargodan komple araca, taşımanın kolay yolu',
  description:
    'Paketini veya yükünü tanımla, taşıma seçeneklerini karşılaştır. Gönderilerini tek yerden yönet. Arf altyapısıyla.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`gonder-landing ${manrope.variable} ${sourceSans.variable} min-h-svh antialiased`}>
      {children}
    </div>
  )
}
