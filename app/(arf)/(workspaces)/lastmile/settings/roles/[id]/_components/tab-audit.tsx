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
import type { RoleAuditLogEntry } from '../../_types/role'

type Props = {
  auditLogs: RoleAuditLogEntry[]
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

export function TabAudit({ auditLogs }: Props) {
  return (
    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
      <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5'>
        <div className='flex items-center gap-2.5'>
          <span className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
            <History className='size-4' />
          </span>
          <h3 className='text-sm font-semibold text-slate-900'>İşlem Geçmişi</h3>
        </div>
        <span className='text-xs tabular-nums text-slate-400'>{auditLogs.length} kayıt</span>
      </div>

      {auditLogs.length === 0 ? (
        <div className='px-4 py-12 text-center'>
          <History className='mx-auto size-5 text-slate-300' />
          <p className='mt-2 text-sm font-medium text-slate-600'>Henüz işlem kaydı yok</p>
          <p className='mt-1 text-xs text-slate-400'>
            Bu rol üzerinde yapılan değişiklikler burada listelenecek.
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
                  Kullanıcı
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  IP Adresi
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  Zaman
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((entry) => (
                <TableRow key={entry.id} className='border-slate-100'>
                  <TableCell className='text-sm font-semibold text-slate-800'>
                    {entry.action}
                  </TableCell>
                  <TableCell className='max-w-xs text-sm text-slate-600'>
                    {entry.description}
                  </TableCell>
                  <TableCell className='text-sm text-slate-700'>{entry.actorName}</TableCell>
                  <TableCell className='font-mono text-xs text-slate-500'>
                    {entry.actorIpAddress ?? '—'}
                  </TableCell>
                  <TableCell className='whitespace-nowrap tabular-nums text-sm text-slate-500'>
                    {formatDateTime(entry.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
