'use client'

import { useCallback, useState } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuoteLanding } from './quote-context'
import type { KargoDraft, LogisticsDraft, QuoteDraft } from '../_lib/quote-types'

type ChatMessage = { role: 'user' | 'assistant'; text: string }

type QuotePrefillPatch = {
  mode?: QuoteDraft['mode']
  kargo?: Partial<KargoDraft>
  lojistik?: Partial<LogisticsDraft>
}

const PROMPTS = [
  'Kargom için fiyat almak istiyorum.',
  'Parsiyel taşıma mı, komple araç mı?',
  'Yükümü tarif ederek teklif hazırlamak istiyorum.',
]

const DEMO_FLOW: Record<string, { replies: string[]; prefill: QuotePrefillPatch }> = {
  'Bursa’dan Ankara’ya gelecek hafta 3 palet seramik göndereceğim.': {
    replies: [
      'Anladım: Bursa → Ankara, 3 palet seramik, gelecek hafta yükleme. Birkaç detay daha:',
      'Nilüfer veya Osmangazi çıkış olabilir mi? Palet ölçüsü standart (120×80 cm) ve istiflenebilir mi?',
      'Özet: Parsiyel · 3 palet · ~750 kg · Bursa/Nilüfer → Ankara/Çankaya · Gelecek hafta. Forma aktarabilirsin.',
    ],
    prefill: {
      mode: 'lojistik',
      lojistik: {
        subtype: 'ltl',
        loadUnit: 'palet',
        pieceCount: 3,
        loadDescription: 'Seramik',
        stackable: false,
        weightKg: 750,
        loadingDate: '',
        origin: { city: 'Bursa', district: 'Nilüfer' },
        destination: { city: 'Ankara', district: 'Çankaya' },
      },
    },
  },
  'Kargom için fiyat almak istiyorum.': {
    replies: [
      'Kargo teklifi için paket boyutunu ve güzergâhı bilmem yeterli.',
      'Hazır boyutlardan seçebilir veya ölçülerini girebilirsin. Çıkış ve varış ili?',
    ],
    prefill: { mode: 'kargo' },
  },
  'Parsiyel taşıma mı, komple araç mı?': {
    replies: [
      'Parsiyel: Araçta yükün kadar yer kullanırsın — palet, koli veya parça yükler için.',
      'Komple: Tüm aracı yüküne ayırırsın — tek seferde büyük hacim veya ağır yükler için.',
      'Yük hacmini tarif edersen hangisinin uygun olduğunu birlikte belirleyebiliriz.',
    ],
    prefill: { mode: 'lojistik' },
  },
  'Yükümü tarif ederek teklif hazırlamak istiyorum.': {
    replies: [
      'Harika. Yükün cinsi, yaklaşık ağırlığı, parça adedi ve çıkış-varış illerini yazman yeterli.',
      'Örnek: "İstanbul\'dan İzmir\'e 2 palet gıda, soğuk zincir gerekli."',
    ],
    prefill: { mode: 'lojistik', lojistik: { subtype: 'ltl' } },
  },
}

export function AssistantSection() {
  const { prefillFromAssistant } = useQuoteLanding()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Merhaba, ben Gönder Asistan. Ne göndereceğini anlat, birlikte teklif taslağını hazırlayalım.',
    },
  ])
  const [input, setInput] = useState('')
  const [summary, setSummary] = useState<QuotePrefillPatch | null>(null)
  const [typing, setTyping] = useState(false)

  const runDemo = useCallback((text: string) => {
    const flow = DEMO_FLOW[text]
    if (!flow) return

    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setTyping(true)
    setSummary(null)

    flow.replies.forEach((reply, i) => {
      setTimeout(() => {
        setMessages((m) => [...m, { role: 'assistant', text: reply }])
        if (i === flow.replies.length - 1) {
          setTyping(false)
          setSummary(flow.prefill)
        }
      }, (i + 1) * 700)
    })
  }, [])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (DEMO_FLOW[trimmed]) {
      runDemo(trimmed)
      return
    }
    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'Bu prototipte yalnızca hazır örnekler destekleniyor. Yukarıdaki örneklerden birini deneyebilir veya doğrudan teklif formunu kullanabilirsin.',
        },
      ])
      setTyping(false)
    }, 600)
  }

  return (
    <section id='asistan' className='gl-section scroll-mt-16 bg-[var(--gl-bg)]'>
      <div className='gl-container'>
        <div className='grid gap-10 lg:grid-cols-2'>
          <div className='space-y-4'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--gl-yellow)]/50 px-3 py-1 text-xs font-semibold text-[var(--gl-ink)]'>
              <Sparkles className='size-3.5' />
              Örnek deneyim
            </span>
            <h2 className='text-3xl font-bold sm:text-4xl'>Ne göndereceğini anlat. Birlikte hazırlayalım.</h2>
            <p className='text-[var(--gl-muted)]'>
              Gönder Asistan, yük bilgilerini ayıklar ve teklif formunu senin yerine doldurur. Gerçek fiyat ve
              müsaitlik yalnızca bağlı sistemlerden gelir.
            </p>
            <div className='flex flex-wrap gap-2'>
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type='button'
                  className='rounded-full border border-[var(--gl-border)] bg-white px-3 py-1.5 text-xs font-medium hover:border-[var(--gl-ink)]'
                  onClick={() => runDemo(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type='button'
              className='rounded-full border border-[var(--gl-border)] bg-white px-3 py-1.5 text-xs font-medium hover:border-[var(--gl-ink)]'
              onClick={() =>
                runDemo('Bursa’dan Ankara’ya gelecek hafta 3 palet seramik göndereceğim.')
              }
            >
              Bursa → Ankara · 3 palet seramik
            </button>
          </div>

          <div className='gl-card flex flex-col overflow-hidden'>
            <div className='flex items-center gap-2 border-b border-[var(--gl-border)] px-4 py-3'>
              <span className='flex size-8 items-center justify-center rounded-lg bg-[var(--gl-petrol)] text-white'>
                <Bot className='size-4' />
              </span>
              <div>
                <p className='text-sm font-semibold'>Gönder Asistan</p>
                <p className='text-[10px] text-[var(--gl-muted)]'>Prototip · örnek yanıtlar</p>
              </div>
            </div>

            <div className='flex max-h-72 flex-1 flex-col gap-3 overflow-y-auto p-4'>
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
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
              <div className='border-t border-[var(--gl-border)] bg-[var(--gl-bg)]/80 p-4'>
                <p className='text-xs font-semibold text-[var(--gl-muted)]'>Taşıma özeti</p>
                <p className='mt-1 text-sm'>
                  {summary.mode === 'kargo'
                    ? 'Kargo gönderisi'
                    : `Lojistik · ${summary.lojistik?.subtype === 'ftl' ? 'Komple' : 'Parsiyel'}`}
                  {summary.lojistik?.origin?.city
                    ? ` · ${summary.lojistik.origin.city} → ${summary.lojistik.destination?.city}`
                    : null}
                </p>
                <Button
                  className='mt-3 w-full bg-[var(--gl-accent)] hover:bg-[var(--gl-accent-hover)]'
                  onClick={() => prefillFromAssistant(summary as Partial<QuoteDraft>)}
                >
                  Teklif Formuna Aktar
                </Button>
              </div>
            ) : null}

            <div className='flex gap-2 border-t border-[var(--gl-border)] p-3'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder='Mesajını yaz…'
                className='flex-1 rounded-lg border border-[var(--gl-border)] px-3 py-2 text-sm outline-none focus:border-[var(--gl-petrol)]'
              />
              <Button type='button' size='sm' onClick={handleSend}>
                Gönder
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
