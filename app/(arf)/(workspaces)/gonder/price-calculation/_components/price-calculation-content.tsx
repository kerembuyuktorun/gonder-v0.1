'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { SiparisPanelScope } from '../../_components/siparis-panel-wizard'
import {
  SiparisQuoteWizard,
  useSiparisQuoteReady,
} from '../../_components/siparis-quote-flow'
import { usePriceDraftStore } from '../../_stores/price-calculation-draft-store'

export function PriceCalculationContent() {
  const hydratedReady = useSiparisQuoteReady()
  const resetDraft = usePriceDraftStore((s) => s.resetDraft)
  const [wizardKey, setWizardKey] = useState(0)

  if (!hydratedReady.hydrated || !hydratedReady.ready) {
    return (
      <>
        <AppHeader
          breadcrumbs={[{ label: 'Gönder' }, { label: 'Teklif al' }]}
          searchPlaceholder='Gönder ara...'
          notificationsLabel='Bildirimler'
        />
        <div className='p-4 text-sm text-muted-foreground'>Taslak yükleniyor…</div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Teklifler', href: ARF_ROUTES.gonder.quotes.list },
          { label: 'Teklif al' },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0'>
            <h1 className='truncate text-xl font-semibold tracking-tight'>Teklif al</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Talebini oluştur, Gönder uygun taşıma seçeneklerini senin için bulsun.
            </p>
          </div>
          <div className='flex shrink-0 flex-wrap gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href={ARF_ROUTES.gonder.quotes.list}>Teklif listesi</Link>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                resetDraft()
                hydratedReady.setReady(false)
                setWizardKey((key) => key + 1)
              }}
            >
              Taslağı sıfırla
            </Button>
          </div>
        </div>

        <SiparisPanelScope>
          <SiparisQuoteWizard surface='form' wizardKey={wizardKey} />
        </SiparisPanelScope>
      </div>
    </>
  )
}
