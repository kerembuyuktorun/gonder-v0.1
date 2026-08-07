'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerDetailOrder } from '../_types/customer-detail'

type Props = {
  orders: CustomerDetailOrder[]
}

const STATUS_STYLES: Record<string, string> = {
  Yolda: 'border-sky-200 bg-sky-50 text-sky-700',
  'Teslim Edildi': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Atama Bekliyor': 'border-slate-200 bg-slate-50 text-slate-700',
  'İptal Edildi': 'border-rose-200 bg-rose-50 text-rose-700',
}

export function TabOrders({ orders }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    return orders.filter((order) => {
      if (status !== 'all' && order.durum !== status) return false
      if (!q) return true
      return (
        order.takip_no.toLocaleLowerCase('tr-TR').includes(q) ||
        order.alis_noktasi.toLocaleLowerCase('tr-TR').includes(q) ||
        order.varis_noktasi.toLocaleLowerCase('tr-TR').includes(q)
      )
    })
  }, [orders, query, status])

  const statuses = useMemo(
    () => Array.from(new Set(orders.map((order) => order.durum))),
    [orders]
  )

  return (
    <Card className='rounded-2xl border-slate-200 shadow-none'>
      <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <CardTitle className='text-base'>Siparişler</CardTitle>
        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
          <div className='relative min-w-[220px]'>
            <Search className='absolute left-2.5 top-2.5 size-4 text-slate-400' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Takip no veya nokta ara...'
              className='h-9 pl-8'
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className='h-9 w-full sm:w-[180px]'>
              <SelectValue placeholder='Durum' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tüm durumlar</SelectItem>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-xl border border-slate-200'>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50/80'>
                <TableHead>Takip No</TableHead>
                <TableHead>Sipariş Tipi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Alış Noktası</TableHead>
                <TableHead>Varış Noktası</TableHead>
                <TableHead>Oluşturulma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='py-10 text-center text-sm text-slate-500'>
                    Bu filtrelerle sipariş bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className='font-mono text-sm font-semibold text-secondary'>
                      {order.takip_no}
                    </TableCell>
                    <TableCell>{order.siparis_tipi}</TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={cn(
                          'whitespace-nowrap',
                          STATUS_STYLES[order.durum] ?? 'border-slate-200 bg-slate-50'
                        )}
                      >
                        {order.durum}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.alis_noktasi}</TableCell>
                    <TableCell>{order.varis_noktasi}</TableCell>
                    <TableCell className='whitespace-nowrap tabular-nums text-slate-600'>
                      {order.olusturulma}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
