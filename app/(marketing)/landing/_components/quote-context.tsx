'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { toOrderQuery, toQuotePrefill, type ParsedPrompt } from '../_lib/parse-prompt'
import { LANDING_MODULES } from '../_lib/modules'
import { saveQuotePrefill } from '../../siparis/_lib/quote-prefill'

export type TransportMode = 'kargo' | 'lojistik'

type QuoteContextValue = {
  /** Sipariş sihirbazını açar; hizmet tipi verilirse önceden seçili gelir. */
  startOrder: (service?: TransportMode) => void
  /** Belirli bir hat için sihirbazı adresleri dolu şekilde açar. */
  startOrderWithRoute: (originCity: string, destCity: string, service?: TransportMode) => void
  /** Asistanın çıkardığı bilgilerle sihirbazı açar. */
  startOrderFromPrompt: (parsed: ParsedPrompt) => void
  /** Hero chatbox'tan asistana taşınan mesaj */
  assistantSeed: { text: string; nonce: number } | null
  sendToAssistant: (text: string) => void
  scrollToAssistant: () => void
  /** Modüller bölümünde açık olan sekme */
  activeModule: string
  setActiveModule: (id: string) => void
  /** Menüden bir modüle atlar ve sekmesini açar */
  showModule: (id: string) => void
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

const ORDER_PATH = '/siparis'

export function QuoteProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [assistantSeed, setAssistantSeed] = useState<{ text: string; nonce: number } | null>(null)
  const [activeModule, setActiveModule] = useState(LANDING_MODULES[0].id)

  const startOrder = useCallback(
    (service?: TransportMode) => {
      router.push(service ? `${ORDER_PATH}?tip=${service}` : ORDER_PATH)
    },
    [router]
  )

  const startOrderWithRoute = useCallback(
    (originCity: string, destCity: string, service: TransportMode = 'lojistik') => {
      const params = new URLSearchParams({ tip: service, from: originCity, to: destCity })
      router.push(`${ORDER_PATH}?${params.toString()}`)
    },
    [router]
  )

  const startOrderFromPrompt = useCallback(
    (parsed: ParsedPrompt) => {
      saveQuotePrefill(toQuotePrefill(parsed))
      router.push(`${ORDER_PATH}?${toOrderQuery(parsed)}`)
    },
    [router]
  )

  const scrollToAssistant = useCallback(() => {
    document.getElementById('asistan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const showModule = useCallback((id: string) => {
    setActiveModule(id)
    requestAnimationFrame(() => {
      document.getElementById('moduller')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const sendToAssistant = useCallback((text: string) => {
    setAssistantSeed({ text, nonce: Date.now() })
  }, [])

  const value = useMemo(
    () => ({
      startOrder,
      startOrderWithRoute,
      startOrderFromPrompt,
      assistantSeed,
      sendToAssistant,
      scrollToAssistant,
      activeModule,
      setActiveModule,
      showModule,
    }),
    [
      activeModule,
      assistantSeed,
      scrollToAssistant,
      sendToAssistant,
      showModule,
      startOrder,
      startOrderFromPrompt,
      startOrderWithRoute,
    ]
  )

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export function useQuoteLanding() {
  const ctx = useContext(QuoteContext)
  if (!ctx) throw new Error('useQuoteLanding must be used within QuoteProvider')
  return ctx
}
