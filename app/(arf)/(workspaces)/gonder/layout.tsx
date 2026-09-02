import { Manrope, Source_Sans_3 } from 'next/font/google'
import '../../../(marketing)/landing/_lib/design-tokens.css'
import { GonderLayoutShell } from './_components/gonder-layout-shell'

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

export default function GonderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${manrope.variable} ${sourceSans.variable} min-h-svh`}>
      <GonderLayoutShell>{children}</GonderLayoutShell>
    </div>
  )
}
