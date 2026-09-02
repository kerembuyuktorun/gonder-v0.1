'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Menu, Plus, Send, X } from 'lucide-react'
import { ARF_ROUTES } from '../../../(arf)/_shared/routes'
import { LANDING_MODULES } from '../_lib/modules'
import { useQuoteLanding } from './quote-context'

type NavItem = {
  label: string
  description?: string
  href?: string
  moduleId?: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Platform',
    items: LANDING_MODULES.map((module) => ({
      label: module.label,
      description: module.fullName,
      moduleId: module.id,
    })),
  },
  {
    label: 'Çözümler',
    items: [
      { label: 'Kargo', description: 'Koli ve paket gönderileri', href: '/siparis?tip=kargo' },
      { label: 'Parsiyel Taşıma', description: 'Palet ve parça yükler', href: '/siparis?tip=lojistik' },
      { label: 'Komple Taşıma', description: 'Araç tamamen sana tahsis', href: '/siparis?tip=lojistik' },
      { label: 'Navlun Ağı', description: 'Hat bazlı taşıyıcı kapasitesi', href: '#navlun-agi' },
    ],
  },
  {
    label: 'Kaynaklar',
    items: [
      { label: 'Nasıl çalışır', href: '#cozumler' },
      { label: 'Teklif ağı', href: '#teklif-agi' },
      { label: 'Özellikler', href: '#ozellikler' },
      { label: 'Entegrasyonlar', href: '#entegrasyonlar' },
      { label: 'Gönder Asistan', href: '#asistan' },
      { label: 'Sık sorulanlar', href: '#sss' },
    ],
  },
  {
    label: 'Şirket',
    items: [
      { label: 'İşletmeler için', href: '#isletme' },
      { label: 'Taşıma ağına katıl', href: '#navlun-agi' },
      { label: 'İletişim', href: '#sss' },
    ],
  },
]

export function LandingNav() {
  const { startOrder, showModule } = useQuoteLanding()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroup(null)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenGroup(null)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const activate = (item: NavItem) => {
    setOpenGroup(null)
    setMobileOpen(false)
    if (item.moduleId) showModule(item.moduleId)
  }

  return (
    <header className='sticky top-0 z-50 border-b border-[var(--gl-border)] bg-white'>
      <div className='gl-container flex h-16 items-center justify-between gap-4'>
        <Link
          href='/landing'
          className='flex shrink-0 items-center gap-2 font-semibold'
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          <span className='flex size-8 items-center justify-center rounded-lg bg-[var(--gl-petrol)] text-white'>
            <Send className='size-4' aria-hidden />
          </span>
          <span className='text-lg tracking-tight text-[var(--gl-ink)]'>Gönder</span>
        </Link>

        <nav
          ref={navRef}
          className='absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex'
          aria-label='Ana menü'
        >
          {NAV_GROUPS.map((group) => {
            const open = openGroup === group.label
            return (
              <div key={group.label} className='relative'>
                <button
                  type='button'
                  aria-expanded={open}
                  onClick={() => setOpenGroup(open ? null : group.label)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    open ? 'bg-[var(--gl-subtle)] text-[var(--gl-ink)]' : 'text-[var(--gl-muted)] hover:text-[var(--gl-ink)]'
                  }`}
                >
                  {group.label}
                  <Plus
                    className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                    aria-hidden
                  />
                </button>

                {open ? (
                  <div className='absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-xl border border-[var(--gl-border)] bg-white p-1.5 shadow-[0_24px_56px_-24px_rgb(25_45_50_/_0.3)]'>
                    {group.items.map((item) =>
                      item.href ? (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => activate(item)}
                          className='block rounded-lg px-3 py-2 transition-colors hover:bg-[var(--gl-subtle)]'
                        >
                          <span className='block text-sm font-medium text-[var(--gl-ink)]'>{item.label}</span>
                          {item.description ? (
                            <span className='block text-xs text-[var(--gl-muted)]'>{item.description}</span>
                          ) : null}
                        </Link>
                      ) : (
                        <button
                          key={item.label}
                          type='button'
                          onClick={() => activate(item)}
                          className='block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--gl-subtle)]'
                        >
                          <span className='block text-sm font-medium text-[var(--gl-ink)]'>{item.label}</span>
                          {item.description ? (
                            <span className='block text-xs text-[var(--gl-muted)]'>{item.description}</span>
                          ) : null}
                        </button>
                      )
                    )}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className='hidden shrink-0 items-center gap-2 lg:flex'>
          <Link
            href={ARF_ROUTES.auth.signIn}
            className='rounded-full border border-[var(--gl-border)] px-4 py-2 text-sm font-semibold text-[var(--gl-ink)] transition-colors hover:border-[var(--gl-ink)]'
          >
            Giriş Yap
          </Link>
          <button
            type='button'
            onClick={() => startOrder()}
            className='rounded-full bg-[var(--gl-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--gl-accent-hover)]'
          >
            Teklif Al
          </button>
        </div>

        <button
          type='button'
          className='inline-flex size-10 items-center justify-center rounded-lg border border-[var(--gl-border)] lg:hidden'
          aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className='size-5' aria-hidden /> : <Menu className='size-5' aria-hidden />}
        </button>
      </div>

      {mobileOpen ? (
        <div className='max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-[var(--gl-border)] bg-white px-4 py-4 lg:hidden'>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className='border-b border-[var(--gl-border)] py-3 first:pt-0'>
              <p className='gl-eyebrow'>{group.label}</p>
              <div className='mt-2 flex flex-col'>
                {group.items.map((item) =>
                  item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => activate(item)}
                      className='rounded-lg px-2 py-2 text-sm font-medium text-[var(--gl-ink)]'
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      type='button'
                      onClick={() => activate(item)}
                      className='rounded-lg px-2 py-2 text-left text-sm font-medium text-[var(--gl-ink)]'
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}

          <div className='flex flex-col gap-2 pt-4'>
            <Link href={ARF_ROUTES.auth.signIn} className='gl-btn-secondary text-sm'>
              Giriş Yap
            </Link>
            <button
              type='button'
              className='gl-btn-primary text-sm'
              onClick={() => {
                setMobileOpen(false)
                startOrder()
              }}
            >
              Teklif Al
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
