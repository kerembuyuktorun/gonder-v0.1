'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { getToken } from '@hascanb/arf-ui-kit/auth-kit'
import { Filter, Pencil, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { getSession } from '../../../../(auth)/_api/auth-client'
import { quoteRepository } from '../../_data/quote-repository'
import {
  SERVICE_TIMING_LABELS,
  LOGISTICS_SUBTYPE_LABELS,
  OPERATION_TYPE_LABELS,
} from '../../_lib/price-calculation-labels'
import {
  isPriceDraftReady,
  usePriceDraftStore,
} from '../../_stores/price-calculation-draft-store'
import { calcPiecesTotals, type SearchQuote } from '../../_types/price-calculation'
import { usePriceDraftHydrated } from '../../_hooks/use-price-draft-hydrated'
import { QuoteResultsList } from './quote-results-list'
import { QuoteSpecialistBanner } from '../../_components/quote-network-notice'
import { needsLogisticsSpecialist } from '../../_lib/quote-specialist'
import {
  ResultsFiltersPanel,
  type ResultsFiltersState,
} from './results-filters-panel'

const DEFAULT_FILTERS: ResultsFiltersState = {
  sort: 'recommended',
  onlyInstant: false,
  onlyPickup: false,
  serviceTypes: [],
  maxPrice: null,
}

function hasAuthSession(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('arf_demo_auth=1') || Boolean(getToken())
}

export function ResultsContent() {
  const router = useRouter()
  const draft = usePriceDraftStore((s) => s.draft)
  const hydrated = usePriceDraftHydrated()
  const setSelectedQuoteId = usePriceDraftStore((s) => s.setSelectedQuoteId)
  const setMode = usePriceDraftStore((s) => s.setMode)

  const [quotes, setQuotes] = useState<SearchQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ResultsFiltersState>(DEFAULT_FILTERS)

  useEffect(() => {
    if (!hydrated) return

    const currentDraft = usePriceDraftStore.getState().draft
    if (!isPriceDraftReady(currentDraft)) {
      setLoading(false)
      setQuotes([])
      return
    }

    let cancelled = false
    setLoading(true)

    void quoteRepository
      .search(currentDraft)
      .then((result) => {
        if (cancelled) return
        setQuotes(result)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setQuotes([])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    hydrated,
    draft.operationType,
    draft.origin?.placeId,
    draft.origin?.label,
    draft.destination?.placeId,
    draft.destination?.label,
    draft.pieces,
    draft.logisticsSubtype,
    draft.courierSpeed,
    draft.weightKg,
    draft.vehicleType,
    draft.bodyType,
    draft.loadType,
  ])

  const draftReady = isPriceDraftReady(draft)

  const availableServiceTypes = useMemo(
    () => Array.from(new Set(quotes.map((quote) => quote.serviceType))),
    [quotes]
  )

  const filteredQuotes = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR')
    let list = quotes.filter((quote) => {
      if (filters.onlyInstant && !quote.hasInstantPrice) return false
      if (filters.onlyPickup && !quote.hasPickupService) return false
      if (filters.maxPrice != null && quote.priceTry != null && quote.priceTry > filters.maxPrice) {
        return false
      }
      if (filters.serviceTypes.length > 0 && !filters.serviceTypes.includes(quote.serviceType)) {
        return false
      }
      if (!q) return true
      const haystack = `${quote.providerName} ${quote.serviceName}`.toLocaleLowerCase('tr-TR')
      return haystack.includes(q)
    })

    list = [...list].sort((a, b) => {
      if (filters.sort === 'price') {
        return (a.priceTry ?? Number.MAX_SAFE_INTEGER) - (b.priceTry ?? Number.MAX_SAFE_INTEGER)
      }
      if (filters.sort === 'duration') {
        return a.etaLabel.localeCompare(b.etaLabel, 'tr')
      }
      const aRec = a.badges?.includes('recommended') ? 1 : 0
      const bRec = b.badges?.includes('recommended') ? 1 : 0
      return bRec - aRec
    })

    return list
  }, [quotes, search, filters])

  async function handleSelect(quote: SearchQuote) {
    setSelectedQuoteId(quote.id)
    setMode('shipment')

    const createPath = ARF_ROUTES.gonder.shipments.create
    const session = await getSession()
    const authenticated = session.success || hasAuthSession()

    if (authenticated) {
      router.push(createPath)
      return
    }

    router.push(`${ARF_ROUTES.auth.signIn}?next=${encodeURIComponent(createPath)}`)
  }

  const pieceTotals = calcPiecesTotals(draft.pieces)
  const packageSummary =
    draft.operationType === 'logistics'
      ? draft.logisticsSubtype
        ? LOGISTICS_SUBTYPE_LABELS[draft.logisticsSubtype]
        : 'Lojistik'
      : draft.pieces.length > 0
        ? `${draft.pieces.length} parça · ${pieceTotals.quantity} adet · ${Math.round(pieceTotals.desi * 100) / 100} desi`
        : 'Parça yok'

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Fiyat Hesaplama', href: ARF_ROUTES.gonder.priceCalculation },
          { label: 'Sonuçlar' },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        {hydrated && !draftReady ? (
          <Card>
            <CardContent className='flex flex-col items-start gap-3 py-5'>
              <p className='text-sm text-muted-foreground'>
                Fiyat hesaplama taslağı bulunamadı. Önce formu doldurun.
              </p>
              <Button asChild>
                <Link href={ARF_ROUTES.gonder.priceCalculation}>Fiyat Hesaplamaya Git</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
        <Card>
          <CardContent className='flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0 space-y-1.5'>
              <p className='text-sm font-semibold'>
                {(draft.origin?.city ?? draft.origin?.label) || '—'} →{' '}
                {(draft.destination?.city ?? draft.destination?.label) || '—'}
              </p>
              <div className='flex flex-wrap gap-2'>
                {draft.operationType ? (
                  <Badge variant='outline'>{OPERATION_TYPE_LABELS[draft.operationType]}</Badge>
                ) : null}
                {draft.operationType === 'logistics' && draft.logisticsSubtype ? (
                  <Badge variant='outline'>
                    {LOGISTICS_SUBTYPE_LABELS[draft.logisticsSubtype]}
                  </Badge>
                ) : null}
                {draft.courierSpeed ? (
                  <Badge variant='outline'>{SERVICE_TIMING_LABELS[draft.courierSpeed]}</Badge>
                ) : null}
                <Badge variant='outline'>{packageSummary}</Badge>
              </div>
            </div>
            <Button variant='outline' asChild className='gap-1.5'>
              <Link href={ARF_ROUTES.gonder.priceCalculation}>
                <Pencil className='size-4' />
                Düzenle
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='relative min-w-0 flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Provider veya servis ara…'
              className='pl-9'
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' className='gap-1.5 lg:hidden'>
                <Filter className='size-4' />
                Filtreler
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='flex w-full flex-col overflow-hidden sm:max-w-md'>
              <SheetHeader className='shrink-0'>
                <SheetTitle>Filtreler</SheetTitle>
              </SheetHeader>
              <div className='min-h-0 flex-1 overflow-y-auto px-4 pb-4'>
                <ResultsFiltersPanel
                  value={filters}
                  onChange={setFilters}
                  availableServiceTypes={availableServiceTypes}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className='grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)]'>
          <Card className='hidden h-fit lg:block'>
            <CardContent className='p-3'>
              <ResultsFiltersPanel
                value={filters}
                onChange={setFilters}
                availableServiceTypes={availableServiceTypes}
              />
            </CardContent>
          </Card>

          <div className='min-w-0 space-y-3'>
            <p className='text-sm text-muted-foreground'>
              {!hydrated || loading
                ? 'Teklifler yükleniyor…'
                : `${filteredQuotes.length} teklif bulundu`}
            </p>
            {!hydrated || loading ? (
              <Card>
                <CardContent className='py-6 text-center text-sm text-muted-foreground'>
                  Teklifler aranıyor…
                </CardContent>
              </Card>
            ) : (
              <>
                {needsLogisticsSpecialist({
                  operationType: draft.operationType,
                  logisticsSubtype: draft.logisticsSubtype,
                  vehicleType: draft.vehicleType,
                  bodyType: draft.bodyType,
                  loadType: draft.loadType,
                  totalDesi: pieceTotals.desi,
                  weightKg: draft.weightKg,
                }) ? (
                  <QuoteSpecialistBanner />
                ) : null}
                <QuoteResultsList quotes={filteredQuotes} onSelect={handleSelect} />
              </>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </>
  )
}
