'use client'

import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { WizardStage, WizardStepper } from './wizard-stage'

export function OrderWizard() {
  return (
    <div className='min-h-svh bg-[var(--gl-bg-soft)]'>
      <header className='sticky top-0 z-40 border-b border-[var(--gl-border)] bg-white/90 backdrop-blur-md'>
        <div className='gl-container flex h-16 items-center justify-between gap-4'>
          <Link
            href='/landing'
            className='flex items-center gap-2 font-semibold'
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            <span className='flex size-9 items-center justify-center rounded-xl bg-[var(--gl-petrol)] text-white'>
              <Send className='size-4' aria-hidden />
            </span>
            <span className='text-lg tracking-tight text-[var(--gl-ink)]'>Gönder</span>
          </Link>

          <Link
            href='/landing'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gl-muted)] transition-colors hover:text-[var(--gl-ink)]'
          >
            <ArrowLeft className='size-4' aria-hidden />
            <span className='hidden sm:inline'>Ana sayfaya dön</span>
            <span className='sm:hidden'>Çık</span>
          </Link>
        </div>
      </header>

      <div className='gl-container py-8 sm:py-10'>
        <div className='mx-auto max-w-5xl'>
          <WizardStepper />

          <div className='mt-6 rounded-2xl border border-[var(--gl-border)] bg-white p-5 shadow-[0_18px_48px_-30px_rgb(25_45_50_/_0.25)] sm:p-7'>
            <WizardStage />
          </div>
        </div>
      </div>
    </div>
  )
}
