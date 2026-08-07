'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserRound } from 'lucide-react'
import { HistoryLoadMore } from '../../../_components/history-load-more'
import type {
  VehicleActivityEvent,
  VehicleAssignmentRecord,
} from '../_types/vehicle-detail'
import { PanelHeader } from './detail-panels'
import { VehicleActivityLog } from './vehicle-activity-log'

type Props = {
  assignments: VehicleAssignmentRecord[]
  activities: VehicleActivityEvent[]
  assignmentTotal: number
  activityTotal: number
  onLoadMoreAssignments?: () => void
  onLoadMoreActivities?: () => void
  loadingMoreAssignments?: boolean
  loadingMoreActivities?: boolean
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

export function TabAssignmentHistory({
  assignments,
  activities,
  assignmentTotal,
  activityTotal,
  onLoadMoreAssignments,
  onLoadMoreActivities,
  loadingMoreAssignments = false,
  loadingMoreActivities = false,
}: Props) {
  const assignmentCountLabel =
    assignmentTotal > assignments.length
      ? `${assignments.length}/${assignmentTotal} kayıt`
      : `${assignments.length} kayıt`

  return (
    <div className='grid gap-4'>
      <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <PanelHeader
          icon={UserRound}
          title='Zimmet Geçmişi'
          meta={
            <span className='text-xs tabular-nums text-slate-400'>{assignmentCountLabel}</span>
          }
        />

        {assignments.length === 0 ? (
          <div className='px-4 py-12 text-center'>
            <UserRound className='mx-auto size-5 text-slate-300' />
            <p className='mt-2 text-sm font-medium text-slate-600'>Zimmet kaydı yok</p>
            <p className='mt-1 text-xs text-slate-400'>
              Bu araca henüz sürücü zimmetlenmemiş.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-slate-100 hover:bg-transparent'>
                  <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                    Sürücü
                  </TableHead>
                  <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                    Başlangıç
                  </TableHead>
                  <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                    Bitiş
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((item) => (
                  <TableRow key={item.id} className='border-slate-100'>
                    <TableCell>
                      <div className='flex items-center gap-2.5'>
                        <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                          <UserRound className='size-3.5' />
                        </span>
                        <span className='text-sm font-medium text-slate-900'>
                          {item.courierName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='whitespace-nowrap text-sm text-slate-700'>
                      {formatDateTime(item.startedAt)}
                    </TableCell>
                    <TableCell className='whitespace-nowrap text-sm text-slate-700'>
                      {item.endedAt ? formatDateTime(item.endedAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <HistoryLoadMore
          visible={assignments.length < assignmentTotal}
          loading={loadingMoreAssignments}
          loaded={assignments.length}
          total={assignmentTotal}
          onClick={() => onLoadMoreAssignments?.()}
        />
      </section>

      <VehicleActivityLog
        events={activities}
        total={activityTotal}
        onLoadMore={onLoadMoreActivities}
        loadingMore={loadingMoreActivities}
      />
    </div>
  )
}
