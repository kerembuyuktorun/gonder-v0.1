'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Bot, Package, Sparkles, Truck } from 'lucide-react'
import { useQuoteLanding } from './quote-context'
import { hasRoute, type ChatDraft, type ParsedPrompt } from '../_lib/parse-prompt'

const EXAMPLES = [
  'İstanbul’dan Ankara’ya 3 koli göndereceğim…',
  'Bursa’dan İzmir’e 2 palet seramik, gelecek hafta…',
  '10 ton yük için komple araç lazım…',
  'Kadıköy’den Çankaya’ya 5 kg paket, en uygun fiyat…',
]

const TYPE_MS = 45
const DELETE_MS = 22
const HOLD_MS = 1600

type ChatMessage = { role: 'user' | 'assistant'; text: string }

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
  const { startOrder, startOrderFromPrompt } = useQuoteLanding()
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState<ChatDraft | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const animated = useTypewriter(!expanded && !focused && value.length === 0)
  const ready = draft ? hasRoute(draft) : false

  const draftRef = useRef<ChatDraft | null>(null)
  draftRef.current = draft

  useEffect(() => {
    if (!expanded) return
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [expanded, messages, pending])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    setExpanded(true)
    setError(null)
    setValue('')
    setMessages((current) => [...current, { role: 'user', text: trimmed }])
    setPending(true)
    requestAnimationFrame(() => inputRef.current?.focus())

    try {
      const response = await fetch('/api/landing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, draft: draftRef.current }),
      })
      const payload = (await response.json()) as {
        reply?: string
        parsed?: ParsedPrompt
        error?: string
      }
      if (!response.ok || !payload.reply || !payload.parsed) {
        throw new Error(payload.error || 'Yanıt alınamadı')
      }
      setDraft(payload.parsed)
      setMessages((current) => [...current, { role: 'assistant', text: payload.reply! }])
    } catch {
      setError('Şu an yanıt verilemedi. Çıkış ve varış şehirlerini yazarak tekrar dene.')
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'Yük nereden nereye gidecek? Örneğin: İstanbul’dan Ankara’ya.',
        },
      ])
    } finally {
      setPending(false)
    }
  }

  const submit = () => {
    if (!value.trim()) {
      inputRef.current?.focus()
      return
    }
    void send(value)
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div
        className={`relative overflow-hidden rounded-2xl border bg-white p-2 text-left transition-shadow ${
          focused || expanded
            ? 'border-[var(--gl-petrol)] shadow-[0_28px_64px_-28px_rgb(25_91_85_/_0.35)]'
            : 'border-[var(--gl-border)] shadow-[0_18px_48px_-24px_rgb(25_45_50_/_0.18)]'
        }`}
      >
        {expanded ? (
          <div className='flex items-center gap-2 px-2 pb-2 pt-1'>
            <span className='flex size-8 items-center justify-center rounded-lg bg-[var(--gl-petrol-soft)] text-[var(--gl-petrol)]'>
              <Bot className='size-4' aria-hidden />
            </span>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-[var(--gl-ink)]'>Gönder Asistan</p>
              <p className='text-[11px] text-[var(--gl-muted)]'>
                {draft?.originLabel || draft?.origin || 'Çıkış'} →{' '}
                {draft?.destinationLabel || draft?.destination || 'Varış'}
                {draft?.loadingDate ? ` · ${draft.loadingDate}` : ''}
              </p>
            </div>
          </div>
        ) : null}

        {expanded ? (
          <div
            ref={logRef}
            className='mb-2 flex max-h-80 min-h-64 flex-col gap-2 overflow-y-auto rounded-xl bg-[var(--gl-subtle)]/60 px-3 py-3'
            aria-live='polite'
          >
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-auto bg-[var(--gl-petrol)] text-white'
                    : 'bg-white text-[var(--gl-ink)] shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {pending ? (
              <div className='max-w-[70%] rounded-2xl bg-white px-3 py-2 text-sm text-[var(--gl-muted)] shadow-sm'>
                Bakıyorum…
              </div>
            ) : null}
          </div>
        ) : null}

        <label htmlFor='hero-chat' className='sr-only'>
          Göndereceğin yükü anlat
        </label>

        <div className='relative'>
          <textarea
            id='hero-chat'
            ref={inputRef}
            rows={expanded ? 2 : 2}
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
            className={`w-full resize-none rounded-xl bg-transparent px-3 pt-3 text-[15px] leading-relaxed text-[var(--gl-ink)] outline-none ${
              expanded ? 'placeholder:text-[var(--gl-muted)]' : 'placeholder:text-transparent'
            }`}
            placeholder={expanded ? 'Yükleme günü, istif… veya formdan devam et' : 'Göndereceğin yükü anlat'}
          />

          {value.length === 0 && !focused && !expanded ? (
            <p
              aria-hidden
              className='pointer-events-none absolute left-3 top-3 text-[15px] leading-relaxed text-[var(--gl-muted)]'
            >
              {animated}
              <span className='gl-caret' />
            </p>
          ) : null}
        </div>

        {error ? <p className='px-3 pb-1 text-xs text-[var(--gl-accent)]'>{error}</p> : null}

        <div className='flex flex-col gap-2 px-1 pb-1 pt-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <button
              type='button'
              onClick={() => void send('İstanbul’dan Ankara’ya 3 koli göndereceğim')}
              className='inline-flex items-center gap-1.5 rounded-full border border-[var(--gl-border)] px-2.5 py-1 text-xs font-medium text-[var(--gl-muted)] transition-colors hover:border-[var(--gl-ink)] hover:text-[var(--gl-ink)]'
            >
              <Package className='size-3.5' aria-hidden />
              Kargo
            </button>
            <button
              type='button'
              onClick={() => void send('Bursa’dan Ankara’ya 3 palet seramik göndereceğim')}
              className='inline-flex items-center gap-1.5 rounded-full border border-[var(--gl-border)] px-2.5 py-1 text-xs font-medium text-[var(--gl-muted)] transition-colors hover:border-[var(--gl-ink)] hover:text-[var(--gl-ink)]'
            >
              <Truck className='size-3.5' aria-hidden />
              Lojistik
            </button>
          </div>

          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
            {ready && draft ? (
              <button
                type='button'
                onClick={() => startOrderFromPrompt({ ...draft, missing: [] })}
                className='inline-flex w-full items-center justify-center rounded-xl border border-[var(--gl-petrol)] px-4 py-2.5 text-sm font-semibold text-[var(--gl-petrol)] transition-colors hover:bg-[var(--gl-petrol-soft)] sm:w-auto'
              >
                Teklif formuna geç
              </button>
            ) : null}
            <button
              type='button'
              onClick={submit}
              disabled={pending}
              className='inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--gl-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--gl-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gl-accent)] disabled:opacity-60 sm:w-auto'
            >
              {expanded ? 'Gönder' : 'Hemen Gönder'}
              <ArrowUp className='size-4' aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[var(--gl-muted)]'>
        <span className='inline-flex items-center gap-1.5'>
          <Sparkles className='size-3.5 text-[var(--gl-petrol)]' aria-hidden />
          Çıkış ve varışı yaz; sohbette tamamla veya formdan devam et
        </span>
        <button
          type='button'
          onClick={() => startOrder()}
          className='font-semibold text-[var(--gl-ink)] underline-offset-4 hover:underline'
        >
          Formla devam et
        </button>
      </div>
    </div>
  )
}
