'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { toOrderQuery, type ParsedPrompt } from '../_lib/parse-prompt'

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
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

const ORDER_PATH = '/siparis'

export function QuoteProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [assistantSeed, setAssistantSeed] = useState<{ text: string; nonce: number } | null>(null)

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
      router.push(`${ORDER_PATH}?${toOrderQuery(parsed)}`)
    },
    [router]
  )

  const scrollToAssistant = useCallback(() => {
    document.getElementById('asistan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const sendToAssistant = useCallback(
    (text: string) => {
      setAssistantSeed({ text, nonce: Date.now() })
      requestAnimationFrame(scrollToAssistant)
    },
    [scrollToAssistant]
  )

  const value = useMemo(
    () => ({
      startOrder,
      startOrderWithRoute,
      startOrderFromPrompt,
      assistantSeed,
      sendToAssistant,
      scrollToAssistant,
    }),
    [assistantSeed, scrollToAssistant, sendToAssistant, startOrder, startOrderFromPrompt, startOrderWithRoute]
  )

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export function useQuoteLanding() {
  const ctx = useContext(QuoteContext)
  if (!ctx) throw new Error('useQuoteLanding must be used within QuoteProvider')
  return ctx
}
