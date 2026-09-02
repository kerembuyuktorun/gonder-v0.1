'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { useQuoteLanding } from './quote-context'
import {
  buildReplies,
  hasRoute,
  mergePrompt,
  parsePrompt,
  summaryLine,
  type ChatDraft,
  type ParsedPrompt,
} from '../_lib/parse-prompt'

type ChatMessage = { role: 'user' | 'assistant'; text: string }

const PROMPTS = [
  'Kargom için fiyat almak istiyorum.',
  'Parsiyel taşıma mı, komple araç mı?',
  'Düzce’den Savaştepe’ye 10 palet 7 ton seramik.',
]

const STATIC_ANSWERS: Record<string, string[]> = {
  'Parsiyel taşıma mı, komple araç mı?': [
    'Parsiyel: Araçta yükün kadar yer kullanırsın — palet, koli veya parça yükler için.',
    'Komple: Tüm aracı yüküne ayırırsın — büyük hacim veya ağır yükler için.',
    'Yükünü tarif edersen hangisinin uygun olduğunu birlikte belirleyebiliriz.',
  ],
}

export function AssistantSection() {
  const { startOrderFromPrompt, assistantSeed } = useQuoteLanding()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Merhaba, ben Gönder Asistan. Ne göndereceğini anlat, birlikte teklif taslağını hazırlayalım.',
    },
  ])
  const [input, setInput] = useState('')
  const [summary, setSummary] = useState<ParsedPrompt | null>(null)
  const [typing, setTyping] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const draftRef = useRef<ChatDraft | null>(null)

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

    const canned = STATIC_ANSWERS[text]
    const incoming = canned ? null : parsePrompt(text)
    const parsed = incoming ? mergePrompt(draftRef.current, incoming) : null
    if (parsed) draftRef.current = parsed
    const replies = canned ?? buildReplies(parsed!)

    replies.forEach((reply, i) => {
      const timer = setTimeout(
        () => {
          setMessages((m) => [...m, { role: 'assistant', text: reply }])
          if (i === replies.length - 1) {
            setTyping(false)
            if (parsed) setSummary(parsed)
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

  const ready = summary ? hasRoute(summary) : false

  return (
    <section id='asistan' className='gl-section scroll-mt-16 bg-[var(--gl-bg-soft)]'>
      <div className='gl-container'>
        <div className='grid items-start gap-10 lg:grid-cols-2 lg:gap-14'>
          <div className='space-y-4'>
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
                <p className='text-[10px] text-[var(--gl-muted)]'>Yükünü tarif et, taslağı hazırlayalım</p>
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
                      : 'bg-[var(--gl-subtle)] text-[var(--gl-ink)]'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {typing ? (
                <div className='max-w-[60%] rounded-2xl bg-[var(--gl-subtle)] px-3 py-2 text-sm text-[var(--gl-muted)]'>
                  Yazıyor…
                </div>
              ) : null}
            </div>

            {summary && ready ? (
              <div className='border-t border-[var(--gl-border)] bg-[var(--gl-subtle)]/70 p-4'>
                <p className='gl-eyebrow'>Taşıma özeti</p>
                <p className='mt-1.5 text-sm font-medium'>{summaryLine(summary)}</p>
                <p className='mt-1.5 text-xs text-[var(--gl-muted)]'>
                  Sohbette yanıtlamaya devam edebilir veya forma geçebilirsin.
                </p>
                <button
                  type='button'
                  className='gl-btn-primary mt-3 w-full'
                  onClick={() => startOrderFromPrompt(summary)}
                >
                  Teklif formuna geç
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
