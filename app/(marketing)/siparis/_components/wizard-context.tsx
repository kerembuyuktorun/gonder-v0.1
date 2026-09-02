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
  createInitialOrder,
  type LogisticsMode,
  type Offer,
  type OrderDraft,
  type PlaceResult,
  type ServiceType,
} from '../_lib/order-types'

export type StepId = 'route' | 'service' | 'mode' | 'details' | 'offers' | 'payment' | 'success'

type WizardValue = {
  draft: OrderDraft
  setDraft: Dispatch<SetStateAction<OrderDraft>>
  patch: (partial: Partial<OrderDraft>) => void
  step: StepId
  steps: StepId[]
  goTo: (step: StepId) => void
  next: () => void
  back: () => void
  selectedOffer: Offer | null
  setSelectedOffer: Dispatch<SetStateAction<Offer | null>>
  orderRef: string | null
  setOrderRef: Dispatch<SetStateAction<string | null>>
}

const WizardContext = createContext<WizardValue | null>(null)

const BASE_STEPS: StepId[] = ['route', 'service', 'details', 'offers', 'payment', 'success']

export function WizardProvider({
  children,
  initialService = null,
  initialLogisticsMode = null,
  initialOrigin = null,
  initialDestination = null,
}: {
  children: ReactNode
  initialService?: ServiceType | null
  initialLogisticsMode?: LogisticsMode | null
  initialOrigin?: PlaceResult | null
  initialDestination?: PlaceResult | null
}) {
  const [draft, setDraft] = useState<OrderDraft>(() => ({
    ...createInitialOrder(),
    service: initialService,
    logisticsMode: initialLogisticsMode,
    origin: initialOrigin,
    destination: initialDestination,
  }))
  const [step, setStep] = useState<StepId>('route')
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [orderRef, setOrderRef] = useState<string | null>(null)

  // Lojistikte komple/parsiyel seçimi ayrı bir adım olarak araya girer
  const steps = useMemo<StepId[]>(() => {
    if (draft.service !== 'lojistik') return BASE_STEPS
    return ['route', 'service', 'mode', 'details', 'offers', 'payment', 'success']
  }, [draft.service])

  const patch = useCallback((partial: Partial<OrderDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }))
  }, [])

  const goTo = useCallback((target: StepId) => {
    setStep(target)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const next = useCallback(() => {
    setStep((current) => {
      const index = steps.indexOf(current)
      const target = steps[Math.min(index + 1, steps.length - 1)]
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      return target
    })
  }, [steps])

  const back = useCallback(() => {
    setStep((current) => {
      const index = steps.indexOf(current)
      const target = steps[Math.max(index - 1, 0)]
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      return target
    })
  }, [steps])

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      patch,
      step,
      steps,
      goTo,
      next,
      back,
      selectedOffer,
      setSelectedOffer,
      orderRef,
      setOrderRef,
    }),
    [back, draft, goTo, next, orderRef, patch, selectedOffer, step, steps]
  )

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}
