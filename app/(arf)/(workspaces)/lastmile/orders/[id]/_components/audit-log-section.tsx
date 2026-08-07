'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OrderAuditLogItem } from '../_types/order-detail'

export function AuditLogSection({ items }: { items: OrderAuditLogItem[] }) {
  if (items.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-slate-500">Hareket kaydı yok</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>İşlem</TableHead>
            <TableHead>İşlem Sahibi</TableHead>
            <TableHead>İşlem Yapılan Ip</TableHead>
            <TableHead>İşlem Zamanı</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-slate-700">
                <span className="font-medium text-slate-800">{item.action}</span>
                {item.sourceLabel || item.itemCode || item.location ? (
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    {item.sourceLabel ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {item.sourceLabel}
                      </span>
                    ) : null}
                    {item.itemCode ? <span className="font-mono">{item.itemCode}</span> : null}
                    {item.location ? <span>{item.location}</span> : null}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-slate-700">{item.actor}</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">{item.ip}</TableCell>
              <TableCell className="whitespace-nowrap text-slate-600">{item.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
