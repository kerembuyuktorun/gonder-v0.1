'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  createInitialDraft,
  type ContactDraft,
  type KargoDraft,
  type LogisticsDraft,
  type QuoteDraft,
  type QuoteResultState,
} from '../_lib/quote-types'

export type QuoteDraftPatch = {
  mode?: QuoteDraft['mode']
  kargo?: Partial<KargoDraft>
  lojistik?: Partial<LogisticsDraft>
}

type QuoteContextValue = {
  draft: QuoteDraft
  setDraft: Dispatch<SetStateAction<QuoteDraft>>
  result: QuoteResultState
  setResult: Dispatch<SetStateAction<QuoteResultState>>
  contact: ContactDraft
  setContact: Dispatch<SetStateAction<ContactDraft>>
  formStep: number
  setFormStep: Dispatch<SetStateAction<number>>
  scrollToQuote: () => void
  prefillFromAssistant: (partial: QuoteDraftPatch) => void
  prefillRoute: (originCity: string, destCity: string, mode?: QuoteDraft['mode']) => void
  /** Hero chatbox'tan asistana taşınan mesaj */
  assistantSeed: { text: string; nonce: number } | null
  sendToAssistant: (text: string) => void
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<QuoteDraft>(createInitialDraft)
  const [result, setResult] = useState<QuoteResultState>({ kind: 'idle' })
  const [formStep, setFormStep] = useState(0)
  const [assistantSeed, setAssistantSeed] = useState<{ text: string; nonce: number } | null>(null)
  const [contact, setContact] = useState<ContactDraft>({
    name: '',
    company: '',
    email: '',
    phone: '',
    note: '',
  })

  const scrollToQuote = useCallback(() => {
    document.getElementById('teklif-al')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const sendToAssistant = useCallback((text: string) => {
    setAssistantSeed({ text, nonce: Date.now() })
    requestAnimationFrame(() => {
      document.getElementById('asistan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const prefillFromAssistant = useCallback(
    (partial: QuoteDraftPatch) => {
      setDraft((prev) => ({
        ...prev,
        ...(partial.mode ? { mode: partial.mode } : {}),
        kargo: { ...prev.kargo, ...partial.kargo },
        lojistik: { ...prev.lojistik, ...partial.lojistik },
      }))
      setFormStep(0)
      setResult({ kind: 'idle' })
      scrollToQuote()
    },
    [scrollToQuote]
  )

  const prefillRoute = useCallback(
    (originCity: string, destCity: string, mode: QuoteDraft['mode'] = 'lojistik') => {
      setDraft((prev) => ({
        ...prev,
        mode,
        kargo: {
          ...prev.kargo,
          origin: { ...prev.kargo.origin, city: originCity },
          destination: { ...prev.kargo.destination, city: destCity },
        },
        lojistik: {
          ...prev.lojistik,
          origin: { ...prev.lojistik.origin, city: originCity },
          destination: { ...prev.lojistik.destination, city: destCity },
        },
      }))
      setFormStep(2)
      setResult({ kind: 'idle' })
      scrollToQuote()
    },
    [scrollToQuote]
  )

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      result,
      setResult,
      contact,
      setContact,
      formStep,
      setFormStep,
      scrollToQuote,
      prefillFromAssistant,
      prefillRoute,
      assistantSeed,
      sendToAssistant,
    }),
    [
      assistantSeed,
      contact,
      draft,
      formStep,
      prefillFromAssistant,
      prefillRoute,
      result,
      scrollToQuote,
      sendToAssistant,
    ]
  )

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export function useQuoteLanding() {
  const ctx = useContext(QuoteContext)
  if (!ctx) throw new Error('useQuoteLanding must be used within QuoteProvider')
  return ctx
}
