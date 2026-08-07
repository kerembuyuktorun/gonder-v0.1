'use client'

import type { ReactNode } from 'react'
import {
  History,
  Info,
  MonitorSmartphone,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatUserDateTime } from '../../_lib/query-users'
import type { UserActivityEvent, UserSession } from '../_types/user-detail'

type Props = {
  sessions: UserSession[]
  events: UserActivityEvent[]
}

function SectionCard({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <section className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
      <div className='flex items-center gap-2.5 border-b border-slate-100 px-4 py-3.5 sm:px-5'>
        <span className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
          <Icon className='size-4' aria-hidden />
        </span>
        <h3 className='text-sm font-semibold text-slate-900'>{title}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              className='inline-flex size-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300'
              aria-label={`${title} hakkında bilgi`}
            >
              <Info className='size-3.5' aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            sideOffset={6}
            className='max-w-xs text-left text-xs leading-relaxed'
          >
            {hint}
          </TooltipContent>
        </Tooltip>
      </div>
      {children}
    </section>
  )
}

export function TabActivity({ sessions, events }: Props) {
  return (
    <div className='space-y-4'>
      <SectionCard
        icon={MonitorSmartphone}
        title='Oturumlar'
        hint='Aktif ve son oturum cihazları. Güvenilmeyen oturumları buradan takip edebilirsiniz.'
      >
        {sessions.length === 0 ? (
          <p className='px-5 py-10 text-center text-sm text-slate-500'>
            Kayıtlı oturum yok
          </p>
        ) : (
          <ul className='divide-y divide-slate-100'>
            {sessions.map((session) => (
              <li
                key={session.id}
                className='flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5'
              >
                <div className='flex min-w-0 items-start gap-3'>
                  <span className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
                    <MonitorSmartphone className='size-4' aria-hidden />
                  </span>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='text-sm font-semibold text-slate-900'>
                        {session.device}
                      </p>
                      {session.current ? (
                        <Badge
                          variant='outline'
                          className='rounded-md border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[11px] font-medium text-emerald-700 shadow-none'
                        >
                          Bu cihaz
                        </Badge>
                      ) : null}
                    </div>
                    <p className='mt-0.5 text-sm text-slate-500'>
                      {session.browser} · {session.location}
                    </p>
                  </div>
                </div>
                <div className='pl-12 text-left sm:pl-0 sm:text-right'>
                  <p className='font-mono text-xs text-slate-600'>{session.ip}</p>
                  <p className='mt-0.5 text-xs tabular-nums text-slate-400'>
                    {formatUserDateTime(session.lastActiveAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        icon={History}
        title='Hareket Geçmişi'
        hint='Hesap üzerinde yapılan işlem kayıtları (rol, durum, profil ve güvenlik olayları).'
      >
        {events.length === 0 ? (
          <p className='px-5 py-10 text-center text-sm text-slate-500'>
            Hareket kaydı yok
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50/80'>
                  <TableHead>İşlem</TableHead>
                  <TableHead>İşlem Sahibi</TableHead>
                  <TableHead>İşlem Yapılan Ip</TableHead>
                  <TableHead>İşlem Zamanı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className='text-slate-700'>
                      <span className='font-medium text-slate-800'>{event.title}</span>
                      {event.detail ? (
                        <span className='mt-0.5 block text-xs text-slate-500'>
                          {event.detail}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className='text-slate-700'>
                      {event.actor?.trim() || '—'}
                    </TableCell>
                    <TableCell className='font-mono text-xs text-slate-600'>
                      {event.ip?.trim() || '—'}
                    </TableCell>
                    <TableCell className='whitespace-nowrap text-slate-600'>
                      {formatUserDateTime(event.at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
