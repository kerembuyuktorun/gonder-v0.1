'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { History } from 'lucide-react'
import { HistoryLoadMore } from '../../../_components/history-load-more'
import type { CourierActivityEvent } from '../_types/courier-detail'
import { PanelHeader } from './detail-panels'

type Props = {
  events: CourierActivityEvent[]
  total: number
  onLoadMore?: () => void
  loadingMore?: boolean
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CourierActivityLog({
  events,
  total,
  onLoadMore,
  loadingMore = false,
}: Props) {
  const sortedEvents = [...events].sort(
    (left, right) => new Date(right.at).getTime() - new Date(left.at).getTime()
  )

  const countLabel =
    total > sortedEvents.length
      ? `${sortedEvents.length}/${total} kayıt`
      : `${sortedEvents.length} kayıt`

  return (
    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
      <PanelHeader
        icon={History}
        title='İşlem Geçmişi'
        meta={<span className='text-xs tabular-nums text-slate-400'>{countLabel}</span>}
      />

      {sortedEvents.length === 0 ? (
        <div className='px-4 py-12 text-center'>
          <History className='mx-auto size-5 text-slate-300' />
          <p className='mt-2 text-sm font-medium text-slate-600'>Henüz işlem kaydı yok</p>
          <p className='mt-1 text-xs text-slate-400'>
            Bu kurye üzerinde yapılan güncellemeler burada listelenir.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-slate-100 hover:bg-transparent'>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  İşlem
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  Açıklama
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  İşlem Sahibi
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  IP
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  Zaman
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.map((event) => (
                <TableRow key={event.id} className='border-slate-100'>
                  <TableCell className='text-sm font-semibold text-slate-800'>
                    {event.title}
                  </TableCell>
                  <TableCell className='max-w-xs text-sm text-slate-600'>
                    {event.detail || '—'}
                  </TableCell>
                  <TableCell className='text-sm text-slate-700'>{event.actor || '—'}</TableCell>
                  <TableCell className='font-mono text-xs text-slate-500'>
                    {event.ip || '—'}
                  </TableCell>
                  <TableCell className='whitespace-nowrap tabular-nums text-sm text-slate-500'>
                    {formatDateTime(event.at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <HistoryLoadMore
        visible={sortedEvents.length < total}
        loading={loadingMore}
        loaded={sortedEvents.length}
        total={total}
        onClick={() => onLoadMore?.()}
      />
    </section>
  )
}
