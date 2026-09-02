'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, Send, X } from 'lucide-react'
import { ARF_ROUTES } from '../../../(arf)/_shared/routes'
import { useQuoteLanding } from './quote-context'

const NAV = [
  { label: 'Çözümler', href: '#cozumler' },
  { label: 'Özellikler', href: '#ozellikler' },
  { label: 'Navlun Ağı', href: '#navlun-agi' },
  { label: 'Entegrasyonlar', href: '#entegrasyonlar' },
]

const SOLUTIONS = [
  { label: 'Kargo', mode: 'kargo' as const },
  { label: 'Parsiyel Taşıma', mode: 'lojistik' as const },
  { label: 'Komple Taşıma', mode: 'lojistik' as const },
]

export function LandingNav() {
  const { startOrder } = useQuoteLanding()
  const [open, setOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const startQuote = (mode?: 'kargo' | 'lojistik') => {
    setOpen(false)
    setSolutionsOpen(false)
    startOrder(mode)
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled ? 'border-[var(--gl-border)] bg-white/90 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <div className='gl-container flex h-16 items-center justify-between gap-4'>
        <Link href='/landing' className='flex items-center gap-2 font-semibold' style={{ fontFamily: 'var(--font-manrope)' }}>
          <span className='flex size-9 items-center justify-center rounded-xl bg-[var(--gl-petrol)] text-white'>
            <Send className='size-4' />
          </span>
          <span className='text-lg tracking-tight text-[var(--gl-ink)]'>Gönder</span>
        </Link>

        <nav className='hidden items-center gap-6 lg:flex' aria-label='Ana menü'>
          <div className='relative'>
            <button
              type='button'
              className='text-sm font-medium text-[var(--gl-muted)] hover:text-[var(--gl-ink)]'
              aria-expanded={solutionsOpen}
              onClick={() => setSolutionsOpen((v) => !v)}
            >
              Çözümler
            </button>
            {solutionsOpen ? (
              <div className='absolute left-0 top-full z-10 mt-2 min-w-44 rounded-xl border border-[var(--gl-border)] bg-white p-2 shadow-lg'>
                {SOLUTIONS.map((s) => (
                  <button
                    key={s.label}
                    type='button'
                    className='block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--gl-subtle)]'
                    onClick={() => startQuote(s.mode)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {NAV.slice(1).map((item) => (
            <a key={item.href} href={item.href} className='text-sm font-medium text-[var(--gl-muted)] hover:text-[var(--gl-ink)]'>
              {item.label}
            </a>
          ))}
        </nav>

        <div className='hidden items-center gap-2 lg:flex'>
          <Link href={ARF_ROUTES.auth.signIn} className='gl-btn-secondary px-4 py-2 text-sm'>
            Gönderi Takibi
          </Link>
          <Link href={ARF_ROUTES.auth.signIn} className='text-sm font-semibold text-[var(--gl-ink)] hover:underline'>
            Giriş Yap
          </Link>
          <button type='button' className='gl-btn-primary text-sm' onClick={() => startQuote()}>
            Teklif Al
          </button>
        </div>

        <button
          type='button'
          className='inline-flex size-10 items-center justify-center rounded-lg border border-[var(--gl-border)] lg:hidden'
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className='size-5' /> : <Menu className='size-5' />}
        </button>
      </div>

      {open ? (
        <div className='border-t border-[var(--gl-border)] bg-white px-4 py-4 lg:hidden'>
          <div className='flex flex-col gap-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-[var(--gl-muted)]'>Çözümler</p>
            {SOLUTIONS.map((s) => (
              <button key={s.label} type='button' className='rounded-lg px-2 py-2 text-left text-sm' onClick={() => startQuote(s.mode)}>
                {s.label}
              </button>
            ))}
            {NAV.slice(1).map((item) => (
              <a key={item.href} href={item.href} className='rounded-lg px-2 py-2 text-sm' onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className='mt-2 flex flex-col gap-2 border-t border-[var(--gl-border)] pt-3'>
              <Link href={ARF_ROUTES.auth.signIn} className='gl-btn-secondary text-sm'>
                Gönderi Takibi · Giriş
              </Link>
              <button type='button' className='gl-btn-primary text-sm' onClick={() => startQuote()}>
                Teklif Al
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
