'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Package, Sparkles, Truck } from 'lucide-react'
import { useQuoteLanding } from './quote-context'

const EXAMPLES = [
  'İstanbul’dan Ankara’ya 3 koli göndereceğim…',
  'Bursa’dan İzmir’e 2 palet seramik, gelecek hafta…',
  '10 ton yük için komple araç lazım…',
  'Kadıköy’den Çankaya’ya 5 kg paket, en uygun fiyat…',
]

const TYPE_MS = 45
const DELETE_MS = 22
const HOLD_MS = 1600

/** Yazıp silen örnek metin — backops tarzı placeholder. */
function useTypewriter(active: boolean) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing')

  useEffect(() => {
    if (!active) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setText(EXAMPLES[0])
      return
    }

    const current = EXAMPLES[index % EXAMPLES.length]
    let timer: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_MS)
      } else {
        timer = setTimeout(() => setPhase('holding'), HOLD_MS)
      }
    } else if (phase === 'holding') {
      timer = setTimeout(() => setPhase('deleting'), 200)
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(current.slice(0, text.length - 1)), DELETE_MS)
      } else {
        setIndex((i) => i + 1)
        setPhase('typing')
        return
      }
    }

    return () => clearTimeout(timer)
  }, [active, index, phase, text])

  return text
}

export function HeroChatbox() {
  const { sendToAssistant, scrollToQuote } = useQuoteLanding()
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const animated = useTypewriter(!focused && value.length === 0)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    sendToAssistant(trimmed)
    setValue('')
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div
        className={`relative rounded-2xl border bg-white p-2 transition-shadow ${
          focused
            ? 'border-[var(--gl-petrol)] shadow-[0_28px_64px_-28px_rgb(25_91_85_/_0.35)]'
            : 'border-[var(--gl-border)] shadow-[0_18px_48px_-24px_rgb(25_45_50_/_0.18)]'
        }`}
      >
        <label htmlFor='hero-chat' className='sr-only'>
          Göndereceğin yükü anlat
        </label>

        <div className='relative'>
          <textarea
            id='hero-chat'
            ref={inputRef}
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            className='w-full resize-none rounded-xl bg-transparent px-3 pt-3 text-[15px] leading-relaxed text-[var(--gl-ink)] outline-none placeholder:text-transparent'
            placeholder='Göndereceğin yükü anlat'
          />

          {/* Animasyonlu örnek metin */}
          {value.length === 0 && !focused ? (
            <p
              aria-hidden
              className='pointer-events-none absolute left-3 top-3 text-[15px] leading-relaxed text-[var(--gl-muted)]'
            >
              {animated}
              <span className='gl-caret' />
            </p>
          ) : null}
        </div>

        <div className='flex flex-col gap-2 px-1 pb-1 pt-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <button
              type='button'
              onClick={() => setValue('3 koli göndereceğim, İstanbul’dan Ankara’ya')}
              className='inline-flex items-center gap-1.5 rounded-full border border-[var(--gl-border)] px-2.5 py-1 text-xs font-medium text-[var(--gl-muted)] transition-colors hover:border-[var(--gl-ink)] hover:text-[var(--gl-ink)]'
            >
              <Package className='size-3.5' aria-hidden />
              Kargo
            </button>
            <button
              type='button'
              onClick={() => setValue('Bursa’dan Ankara’ya 3 palet seramik göndereceğim')}
              className='inline-flex items-center gap-1.5 rounded-full border border-[var(--gl-border)] px-2.5 py-1 text-xs font-medium text-[var(--gl-muted)] transition-colors hover:border-[var(--gl-ink)] hover:text-[var(--gl-ink)]'
            >
              <Truck className='size-3.5' aria-hidden />
              Lojistik
            </button>
          </div>

          <button
            type='button'
            onClick={submit}
            className='inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--gl-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--gl-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gl-accent)] sm:w-auto'
          >
            Hemen Gönder
            <ArrowUp className='size-4' aria-hidden />
          </button>
        </div>
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[var(--gl-muted)]'>
        <span className='inline-flex items-center gap-1.5'>
          <Sparkles className='size-3.5 text-[var(--gl-petrol)]' aria-hidden />
          Gönder Asistan · örnek deneyim
        </span>
        <button
          type='button'
          onClick={scrollToQuote}
          className='font-semibold text-[var(--gl-ink)] underline-offset-4 hover:underline'
        >
          Formla devam et
        </button>
      </div>
    </div>
  )
}
