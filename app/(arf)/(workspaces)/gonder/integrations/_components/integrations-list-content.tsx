'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ChevronRight, PlugZap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { SearchInput } from '../../_components/data-workspace/search-input'
import { WorkspaceHeader } from '../../_components/data-workspace/workspace-header'
import { SALES_CHANNELS_CATALOG } from '../../_data/sales-channels-catalog'
import { useSalesChannelIntegrationsHydrated } from '../../_hooks/use-sales-channel-integrations-hydrated'
import { formatRelativeTr } from '../../_lib/sales-channel-connection'
import { useSalesChannelIntegrationsStore } from '../../_stores/sales-channel-integrations-store'
import {
  SALES_CHANNEL_CATEGORY_LABELS,
  type SalesChannelCategory,
  type SalesChannelStatus,
} from '../../_types/sales-channels'
import { SalesChannelLogo } from './sales-channel-logo'
import { SalesChannelStatusBadge } from './sales-channel-status-badge'

type CategoryFilter = 'all' | SalesChannelCategory
type StatusFilter = 'all' | SalesChannelStatus

const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'Tümü' },
  { id: 'marketplace', label: SALES_CHANNEL_CATEGORY_LABELS.marketplace },
  { id: 'storefront', label: SALES_CHANNEL_CATEGORY_LABELS.storefront },
  { id: 'feed', label: SALES_CHANNEL_CATEGORY_LABELS.feed },
]

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'Tüm durumlar' },
  { id: 'connected', label: 'Bağlı' },
  { id: 'disconnected', label: 'Bağlı değil' },
  { id: 'error', label: 'Hata' },
]

export function IntegrationsListContent() {
  const hydrated = useSalesChannelIntegrationsHydrated()
  const connections = useSalesChannelIntegrationsStore((state) => state.connections)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const counts = useMemo(() => {
    const next = { connected: 0, disconnected: 0, error: 0 }
    for (const channel of SALES_CHANNELS_CATALOG) {
      const current = connections[channel.id]?.status ?? 'disconnected'
      next[current] += 1
    }
    return next
  }, [connections])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR')
    return SALES_CHANNELS_CATALOG.filter((channel) => {
      if (category !== 'all' && channel.category !== category) return false
      if (hydrated && status !== 'all') {
        const current = connections[channel.id]?.status ?? 'disconnected'
        if (current !== status) return false
      }
      if (!needle) return true
      const haystack = `${channel.name} ${channel.description} ${SALES_CHANNEL_CATEGORY_LABELS[channel.category]}`
      return haystack.toLocaleLowerCase('tr-TR').includes(needle)
    })
  }, [category, connections, hydrated, query, status])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder', href: ARF_ROUTES.gonder.root },
          { label: 'Entegrasyonlar' },
          { label: 'Satış Kanalları' },
        ]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4'>
        <WorkspaceHeader
          title='Satış Kanalları'
          description='Pazaryeri ve e-ticaret kanallarını bağlayın; siparişler Gönder paneline otomatik aktarılsın.'
        />

        <Card className='min-w-0 gap-0 py-0 shadow-sm'>
          <CardContent className='space-y-3 p-3 sm:p-4'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder='Kanal ara…'
                className='max-w-md'
              />
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                <span>
                  <span className='font-semibold tabular-nums text-emerald-700'>
                    {hydrated ? counts.connected : '–'}
                  </span>{' '}
                  bağlı
                </span>
                <span>
                  <span className='font-semibold tabular-nums text-amber-700'>
                    {hydrated ? counts.error : '–'}
                  </span>{' '}
                  hata
                </span>
                <span>
                  <span className='font-semibold tabular-nums text-foreground'>
                    {hydrated ? counts.disconnected : '–'}
                  </span>{' '}
                  bağlı değil
                </span>
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <FilterRow
                ariaLabel='Kanal türü'
                items={CATEGORY_FILTERS}
                value={category}
                onChange={setCategory}
              />
              <FilterRow
                ariaLabel='Bağlantı durumu'
                items={STATUS_FILTERS}
                value={status}
                onChange={setStatus}
              />
            </div>
          </CardContent>
        </Card>

        {filtered.length === 0 ? (
          <div className='rounded-xl border border-dashed border-border bg-card p-6 text-center'>
            <PlugZap className='mx-auto size-8 text-muted-foreground' />
            <p className='mt-2 text-sm font-medium'>Eşleşen kanal yok</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Aramayı veya filtreleri temizleyip tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className='grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((channel) => {
              const connection = connections[channel.id]
              const currentStatus = hydrated
                ? (connection?.status ?? 'disconnected')
                : null
              const href = ARF_ROUTES.gonder.integrations.channel(channel.id)
              const cta =
                currentStatus === 'connected'
                  ? 'Yönet'
                  : currentStatus === 'error'
                    ? 'Düzelt'
                    : 'Kurulum'

              return (
                <Link key={channel.id} href={href} className='group block min-w-0'>
                  <Card className='h-full min-w-0 gap-0 py-0 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md'>
                    <CardContent className='flex h-full flex-col gap-3 p-3 sm:p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex min-w-0 items-center gap-3'>
                          <SalesChannelLogo channel={channel} size='md' />
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold tracking-tight'>
                              {channel.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {SALES_CHANNEL_CATEGORY_LABELS[channel.category]}
                            </p>
                          </div>
                        </div>
                        {currentStatus ? (
                          <SalesChannelStatusBadge status={currentStatus} />
                        ) : (
                          <span className='h-5 w-16 animate-pulse rounded-md bg-muted' />
                        )}
                      </div>

                      <p className='line-clamp-2 text-sm text-muted-foreground'>
                        {channel.description}
                      </p>

                      {currentStatus === 'error' && connection?.lastError ? (
                        <p className='line-clamp-2 text-xs text-amber-700'>{connection.lastError}</p>
                      ) : (
                        <p className='text-xs text-muted-foreground'>
                          Son senkron:{' '}
                          {currentStatus === 'connected'
                            ? formatRelativeTr(connection?.lastSyncAt)
                            : currentStatus
                              ? '—'
                              : '…'}
                        </p>
                      )}

                      <div className='mt-auto flex items-center justify-between pt-1'>
                        <span className='text-sm font-medium text-foreground/80 group-hover:text-foreground'>
                          {cta}
                        </span>
                        <ChevronRight className='size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function FilterRow<T extends string>({
  ariaLabel,
  items,
  value,
  onChange,
}: {
  ariaLabel: string
  items: Array<{ id: T; label: string }>
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div
      className='flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      role='list'
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type='button'
            role='listitem'
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'border-primary/40 bg-primary/5 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
