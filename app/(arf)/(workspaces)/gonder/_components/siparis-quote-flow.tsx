'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../_shared/routes'
import { quoteRequestsRepository } from '../_data/quote-requests-repository'
import { usePriceDraftHydrated } from '../_hooks/use-price-draft-hydrated'
import {
  clampSiparisStep,
  isOrderReadyForOffers,
  matchQuoteForOffer,
  orderToPricePatch,
  reconstructOrderFromPriceDraft,
} from '../_lib/siparis-draft-map'
import { usePriceDraftStore } from '../_stores/price-calculation-draft-store'
import { SiparisPanelWizard, type WizardSnapshot } from './siparis-panel-wizard'

export function useSiparisQuoteReady() {
  const hydrated = usePriceDraftHydrated()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!hydrated || ready) return
    const current = usePriceDraftStore.getState().draft
    if (!current.siparis) {
      const order = reconstructOrderFromPriceDraft(current)
      usePriceDraftStore.getState().patchDraft({
        ...orderToPricePatch(order),
        siparis: order,
        siparisStep: current.siparisStep || 'route',
      })
    }
    setReady(true)
  }, [hydrated, ready])

  return { hydrated, ready, setReady }
}

export function SiparisQuoteWizard({
  surface,
  submittingLabel,
  wizardKey,
}: {
  surface: 'form' | 'results'
  submittingLabel?: string
  wizardKey?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const draft = usePriceDraftStore((s) => s.draft)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const persistSnapshot = useCallback(
    (snapshot: WizardSnapshot) => {
      const { draft: order, step, selectedOffer } = snapshot
      usePriceDraftStore.getState().patchDraft({
        ...orderToPricePatch(order),
        siparisStep: step,
        selectedOffer,
        selectedQuoteId: selectedOffer?.id ?? usePriceDraftStore.getState().draft.selectedQuoteId,
        mode: 'quote',
      })

      if (surface === 'form' && step === 'offers' && isOrderReadyForOffers(order)) {
        if (!pathname?.includes('/results')) {
          router.replace(ARF_ROUTES.gonder.results)
        }
        return
      }

      if (surface === 'results' && step !== 'offers') {
        if (!pathname?.includes('/price-calculation')) {
          router.replace(ARF_ROUTES.gonder.priceCalculation)
        }
      }
    },
    [pathname, router, surface]
  )

  const submitQuote = useCallback(
    async (snapshot: WizardSnapshot) => {
      if (submittingRef.current) return
      const { draft: order, selectedOffer } = snapshot
      if (!isOrderReadyForOffers(order) || !selectedOffer) {
        toast.message('Devam etmek için bir teklif seç')
        return
      }

      submittingRef.current = true
      setSubmitting(true)
      try {
        persistSnapshot(snapshot)
        const current = usePriceDraftStore.getState().draft
        const request = await quoteRequestsRepository.createFromPriceDraft(current)
        const matched = matchQuoteForOffer(request.offers, selectedOffer)
        if (matched) {
          await quoteRequestsRepository.selectOffer(request.id, matched.id)
        }
        toast.success(`${request.reference} oluşturuldu`)
        usePriceDraftStore.getState().resetDraft()
        router.push(ARF_ROUTES.gonder.quotes.detail(request.id))
      } catch {
        toast.error('Teklif talebi oluşturulamadı')
        submittingRef.current = false
        setSubmitting(false)
      }
    },
    [persistSnapshot, router]
  )

  const initialOrder = draft.siparis ?? reconstructOrderFromPriceDraft(draft)
  const initialStep =
    surface === 'results'
      ? isOrderReadyForOffers(initialOrder)
        ? 'offers'
        : clampSiparisStep(draft.siparisStep, 'details', 'quote')
      : clampSiparisStep(draft.siparisStep, 'route', 'quote')

  return (
    <SiparisPanelWizard
      key={wizardKey}
      variant='quote'
      initialDraft={initialOrder}
      initialStep={initialStep}
      initialOffer={draft.selectedOffer}
      offersNextLabel={submitting ? (submittingLabel ?? 'Oluşturuluyor…') : 'Teklifi Seç'}
      onChange={persistSnapshot}
      onLastNext={(snapshot) => void submitQuote(snapshot)}
    />
  )
}
