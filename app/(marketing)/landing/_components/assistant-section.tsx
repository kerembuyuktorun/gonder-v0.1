'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import { useQuoteLanding, type QuoteDraftPatch } from './quote-context'
import { buildReplies, parsePrompt } from '../_lib/parse-prompt'

type ChatMessage = { role: 'user' | 'assistant'; text: string }

const PROMPTS = [
  'Kargom için fiyat almak istiyorum.',
  'Parsiyel taşıma mı, komple araç mı?',
  'Bursa’dan Ankara’ya 3 palet seramik göndereceğim.',
]

const STATIC_ANSWERS: Record<string, string[]> = {
  'Parsiyel taşıma mı, komple araç mı?': [
    'Parsiyel: Araçta yükün kadar yer kullanırsın — palet, koli veya parça yükler için.',
    'Komple: Tüm aracı yüküne ayırırsın — büyük hacim veya ağır yükler için.',
    'Yükünü tarif edersen hangisinin uygun olduğunu birlikte belirleyebiliriz.',
  ],
}

function summaryLine(patch: QuoteDraftPatch): string {
  if (patch.mode === 'kargo') {
    const o = patch.kargo?.origin?.city
    const d = patch.kargo?.destination?.city
    return ['Kargo gönderisi', o && d ? `${o} → ${d}` : null].filter(Boolean).join(' · ')
  }

  const l = patch.lojistik
  const parts = [`Lojistik · ${l?.subtype === 'ftl' ? 'Komple araç' : 'Parsiyel'}`]
  if (l?.pieceCount) parts.push(`${l.pieceCount} ${l.loadUnit ?? 'parça'}`)
  if (l?.weightKg) parts.push(`~${l.weightKg.toLocaleString('tr-TR')} kg`)
  if (l?.origin?.city && l?.destination?.city) {
    parts.push(`${l.origin.city} → ${l.destination.city}`)
  }
  return parts.join(' · ')
}

export function AssistantSection() {
  const { prefillFromAssistant, assistantSeed } = useQuoteLanding()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Merhaba, ben Gönder Asistan. Ne göndereceğini anlat, birlikte teklif taslağını hazırlayalım.',
    },
  ])
  const [input, setInput] = useState('')
  const [summary, setSummary] = useState<QuoteDraftPatch | null>(null)
  const [typing, setTyping] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const respond = useCallback((text: string) => {
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setTyping(true)
    setSummary(null)

    const canned = STATIC_ANSWERS[text]
    const parsed = canned ? null : parsePrompt(text)
    const replies = canned ?? buildReplies(parsed!)

    replies.forEach((reply, i) => {
      const timer = setTimeout(
        () => {
          setMessages((m) => [...m, { role: 'assistant', text: reply }])
          if (i === replies.length - 1) {
            setTyping(false)
            if (parsed) setSummary(parsed.patch)
          }
        },
        (i + 1) * 650
      )
      timers.current.push(timer)
    })
  }, [])

  // Hero chatbox'tan gelen mesaj
  useEffect(() => {
    if (!assistantSeed) return
    respond(assistantSeed.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca yeni gönderimde çalışır
  }, [assistantSeed?.nonce])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    respond(trimmed)
  }

  return (
    <section id='asistan' className='gl-section scroll-mt-16 bg-[var(--gl-bg-soft)]'>
      <div className='gl-container'>
        <div className='grid items-start gap-10 lg:grid-cols-2 lg:gap-14'>
          <div className='space-y-4'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--gl-yellow-soft)] px-3 py-1 text-xs font-semibold text-[var(--gl-ink)]'>
              <Sparkles className='size-3.5' aria-hidden />
              Örnek deneyim
            </span>
            <h2 className='text-3xl font-bold sm:text-4xl'>
              Ne göndereceğini anlat. Birlikte hazırlayalım.
            </h2>
            <p className='text-[var(--gl-muted)]'>
              Gönder Asistan yük bilgilerini ayıklar, eksikleri sorar ve teklif formunu senin yerine
              doldurur. Fiyat ve müsaitlik yalnızca bağlı sistemlerden gelir; onayın olmadan
              rezervasyon oluşturulmaz.
            </p>

            <div className='flex flex-wrap gap-2 pt-1'>
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type='button'
                  className='rounded-full border border-[var(--gl-border)] bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--gl-ink)]'
                  onClick={() => respond(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className='gl-card flex flex-col overflow-hidden'>
            <div className='flex items-center gap-2 border-b border-[var(--gl-border)] px-4 py-3'>
              <span className='flex size-8 items-center justify-center rounded-lg bg-[var(--gl-petrol-soft)] text-[var(--gl-petrol)]'>
                <Bot className='size-4' aria-hidden />
              </span>
              <div>
                <p className='text-sm font-semibold'>Gönder Asistan</p>
                <p className='text-[10px] text-[var(--gl-muted)]'>Prototip · örnek yanıtlar</p>
              </div>
            </div>

            <div
              ref={logRef}
              className='flex h-72 flex-col gap-3 overflow-y-auto p-4'
              aria-live='polite'
            >
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto bg-[var(--gl-petrol)] text-white'
                      : 'bg-[var(--gl-bg)] text-[var(--gl-ink)]'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {typing ? (
                <div className='max-w-[60%] rounded-2xl bg-[var(--gl-bg)] px-3 py-2 text-sm text-[var(--gl-muted)]'>
                  Yazıyor…
                </div>
              ) : null}
            </div>

            {summary ? (
              <div className='border-t border-[var(--gl-border)] bg-[var(--gl-bg)]/70 p-4'>
                <p className='gl-eyebrow'>Taşıma özeti</p>
                <p className='mt-1.5 text-sm font-medium'>{summaryLine(summary)}</p>
                <button
                  type='button'
                  className='gl-btn-primary mt-3 w-full'
                  onClick={() => prefillFromAssistant(summary)}
                >
                  Teklif Formuna Aktar
                </button>
              </div>
            ) : null}

            <div className='flex gap-2 border-t border-[var(--gl-border)] p-3'>
              <label htmlFor='assistant-input' className='sr-only'>
                Asistana mesaj yaz
              </label>
              <input
                id='assistant-input'
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder='Örn. İstanbul’dan İzmir’e 2 palet gıda…'
                className='flex-1 rounded-lg border border-[var(--gl-border)] px-3 py-2 text-sm outline-none focus:border-[var(--gl-petrol)]'
              />
              <button
                type='button'
                onClick={handleSend}
                aria-label='Gönder'
                className='inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gl-accent)] text-white transition-colors hover:bg-[var(--gl-accent-hover)]'
              >
                <Send className='size-4' aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
