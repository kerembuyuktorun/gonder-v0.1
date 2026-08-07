'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ChannelAvatar } from '../../_components/channel-logo'
import { listOrderChannels } from '../../_data/order-channels'
import {
  ORDER_CHANNEL_LABELS,
  type OrderChannelConnection,
  type OrderChannelType,
} from '../../_types/orders'

const CHANNEL_TYPES = Object.keys(ORDER_CHANNEL_LABELS) as OrderChannelType[]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTypes: OrderChannelType[]
  selectedChannelId: string | null
  channelCounts?: Record<string, number>
  onApply: (next: { types: OrderChannelType[]; channelId: string | null }) => void
}

export function OrdersChannelFilterSheet({
  open,
  onOpenChange,
  selectedTypes,
  selectedChannelId,
  channelCounts = {},
  onApply,
}: Props) {
  const connections = useMemo(() => listOrderChannels(), [])
  const [draftTypes, setDraftTypes] = useState<OrderChannelType[]>(selectedTypes)
  const [draftChannelId, setDraftChannelId] = useState<string | null>(selectedChannelId)

  function syncDraft(nextOpen: boolean) {
    if (nextOpen) {
      setDraftTypes(selectedTypes)
      setDraftChannelId(selectedChannelId)
    }
    onOpenChange(nextOpen)
  }

  function toggleType(type: OrderChannelType) {
    setDraftTypes((prev) => {
      const next = prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
      if (draftChannelId) {
        const conn = connections.find((item) => item.id === draftChannelId)
        if (conn && next.length && !next.includes(conn.type)) {
          setDraftChannelId(null)
        }
      }
      return next
    })
  }

  const visibleConnections = useMemo(() => {
    if (!draftTypes.length) return connections
    return connections.filter((item) => draftTypes.includes(item.type))
  }, [connections, draftTypes])

  return (
    <Sheet open={open} onOpenChange={syncDraft}>
      <SheetContent side='right' className='flex w-full flex-col sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Kanal filtreleri</SheetTitle>
          <SheetDescription>
            Entegrasyon kanalına veya bağlı mağazaya göre siparişleri daraltın.
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 space-y-6 overflow-y-auto px-4 pb-4'>
          <section className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-medium'>Kanal tipi</h3>
              {draftTypes.length ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs'
                  onClick={() => setDraftTypes([])}
                >
                  Temizle
                </Button>
              ) : null}
            </div>
            <div className='grid grid-cols-2 gap-2'>
              {CHANNEL_TYPES.map((type) => {
                const checked = draftTypes.includes(type)
                const count = channelCounts[type] ?? 0
                return (
                  <label
                    key={type}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition-colors',
                      checked
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border hover:bg-muted/40'
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleType(type)}
                      aria-label={ORDER_CHANNEL_LABELS[type]}
                    />
                    <ChannelAvatar type={type} size='xs' />
                    <span className='min-w-0 flex-1 truncate'>{ORDER_CHANNEL_LABELS[type]}</span>
                    <Badge variant='secondary' className='shrink-0 font-normal tabular-nums'>
                      {count}
                    </Badge>
                  </label>
                )
              })}
            </div>
          </section>

          <section className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-medium'>Bağlı mağaza / bağlantı</h3>
              {draftChannelId ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs'
                  onClick={() => setDraftChannelId(null)}
                >
                  Temizle
                </Button>
              ) : null}
            </div>
            <div className='space-y-1.5'>
              {visibleConnections.map((conn) => (
                <ConnectionRow
                  key={conn.id}
                  connection={conn}
                  selected={draftChannelId === conn.id}
                  count={channelCounts[conn.id] ?? 0}
                  onSelect={() =>
                    setDraftChannelId((prev) => (prev === conn.id ? null : conn.id))
                  }
                />
              ))}
            </div>
          </section>
        </div>

        <SheetFooter className='gap-2 border-t sm:flex-row'>
          <Button
            type='button'
            variant='outline'
            className='sm:flex-1'
            onClick={() => {
              setDraftTypes([])
              setDraftChannelId(null)
              onApply({ types: [], channelId: null })
              onOpenChange(false)
            }}
          >
            Sıfırla
          </Button>
          <Button
            type='button'
            className='sm:flex-1'
            onClick={() => {
              onApply({ types: draftTypes, channelId: draftChannelId })
              onOpenChange(false)
            }}
          >
            Uygula
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ConnectionRow({
  connection,
  selected,
  count,
  onSelect,
}: {
  connection: OrderChannelConnection
  selected: boolean
  count: number
  onSelect: () => void
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      disabled={!connection.isActive && !selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
        selected
          ? 'border-primary/40 bg-primary/5'
          : 'border-border hover:bg-muted/40',
        !connection.isActive && 'opacity-60'
      )}
    >
      <ChannelAvatar type={connection.type} connection={connection} size='md' />
      <span className='min-w-0 flex-1'>
        <span className='flex items-center gap-1.5'>
          <Label className='cursor-pointer truncate font-medium'>{connection.name}</Label>
          {!connection.isActive ? (
            <Badge variant='outline' className='shrink-0 text-[10px] font-normal'>
              Pasif
            </Badge>
          ) : null}
        </span>
        {connection.storeName ? (
          <span className='block truncate text-xs text-muted-foreground'>
            {connection.storeName}
          </span>
        ) : null}
      </span>
      <Badge variant='secondary' className='shrink-0 font-normal tabular-nums'>
        {count}
      </Badge>
      {selected ? <Check className='size-4 shrink-0 text-primary' /> : null}
    </button>
  )
}
