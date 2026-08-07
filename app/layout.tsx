import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@/styles/globals.css'

const fontSans = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: 'Kargo Otomasyon Sistemi',
  description: 'Profesyonel Kargo Yönetim ve Takip Sistemi',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`} suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="https://tweakcn.com/live-preview.min.js"
            strategy="afterInteractive"
            async
            crossOrigin="anonymous"
          />
        )}
        <Analytics />
      </body>
    </html>
  )
}
