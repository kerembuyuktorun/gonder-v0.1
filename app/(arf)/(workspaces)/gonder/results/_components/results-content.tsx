'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { SiparisPanelScope } from '../../_components/siparis-panel-wizard'
import {
  SiparisQuoteWizard,
  useSiparisQuoteReady,
} from '../../_components/siparis-quote-flow'
import { isOrderReadyForOffers, reconstructOrderFromPriceDraft } from '../../_lib/siparis-draft-map'
import { usePriceDraftStore } from '../../_stores/price-calculation-draft-store'

export function ResultsContent() {
  const router = useRouter()
  const hydratedReady = useSiparisQuoteReady()
  const draft = usePriceDraftStore((s) => s.draft)
  const resetDraft = usePriceDraftStore((s) => s.resetDraft)
  const [wizardKey, setWizardKey] = useState(0)

  if (!hydratedReady.hydrated || !hydratedReady.ready) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Gönder' },
            { label: 'Teklif al', href: ARF_ROUTES.gonder.priceCalculation },
            { label: 'Teklifler' },
          ]}
          searchPlaceholder='Gönder ara...'
          notificationsLabel='Bildirimler'
        />
        <div className='p-4 text-sm text-muted-foreground'>Taslak yükleniyor…</div>
      </>
    )
  }

  const order = draft.siparis ?? reconstructOrderFromPriceDraft(draft)
  const draftReady = isOrderReadyForOffers(order)

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Teklif al', href: ARF_ROUTES.gonder.priceCalculation },
          { label: 'Teklifler' },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0'>
            <h1 className='truncate text-xl font-semibold tracking-tight'>Teklifini seç</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Talebin için oluşan taşıma seçeneklerini hemen değerlendirebilirsin. Gönder ağı uygun
              alternatifleri senin için oluşturur.
            </p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              resetDraft()
              hydratedReady.setReady(false)
              setWizardKey((key) => key + 1)
              router.replace(ARF_ROUTES.gonder.priceCalculation)
            }}
          >
            Taslağı sıfırla
          </Button>
        </div>

        {!draftReady ? (
          <Card>
            <CardContent className='flex flex-col items-start gap-3 py-5'>
              <p className='text-sm text-muted-foreground'>
                Teklif görmek için önce çıkış, varış ve yük bilgilerini tamamla.
              </p>
              <Button asChild>
                <Link href={ARF_ROUTES.gonder.priceCalculation}>Talebi tamamla</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <SiparisPanelScope>
            <SiparisQuoteWizard surface='results' wizardKey={wizardKey} />
          </SiparisPanelScope>
        )}
      </div>
    </>
  )
}
