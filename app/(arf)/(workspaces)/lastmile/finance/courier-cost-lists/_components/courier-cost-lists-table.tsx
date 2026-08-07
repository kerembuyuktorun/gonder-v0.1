'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { Copy, MoreHorizontal, Star, ToggleLeft } from 'lucide-react'
import type { CourierCostList } from '../../_types'
import { COMPENSATION_MODEL_LABELS } from '../../_types'
import { formatNumber } from '../../_lib/format'

type Props = {
  lists: CourierCostList[]
  assignmentCounts: Record<string, number>
  onClone: (id: string) => void
  onSetDefault: (id: string) => void
  onToggleStatus: (id: string, status: CourierCostList['status']) => void
}

export function CourierCostListsTable({
  lists,
  assignmentCounts,
  onClone,
  onSetDefault,
  onToggleStatus,
}: Props) {
  if (lists.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center'>
        <p className='text-sm font-medium text-slate-700'>Henüz kurye ücret listesi yok</p>
        <p className='mt-1 text-sm text-slate-500'>
          Tarife, maaş + prim veya hibrit bir maliyet listesi oluşturun.
        </p>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white'>
      <table className='w-full min-w-[960px] text-left text-sm'>
        <thead className='border-b bg-slate-50/80 text-[11px] font-medium uppercase tracking-wide text-slate-500'>
          <tr>
            <th className='px-4 py-3'>Kod</th>
            <th className='px-4 py-3'>Ad</th>
            <th className='px-4 py-3'>Model</th>
            <th className='px-4 py-3'>Durum</th>
            <th className='px-4 py-3'>Kurallar</th>
            <th className='px-4 py-3'>Atama</th>
            <th className='px-4 py-3 text-right'>Aksiyon</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100'>
          {lists.map((list) => (
            <tr key={list.id} className='hover:bg-slate-50/60'>
              <td className='px-4 py-3 font-mono text-xs text-slate-600'>{list.code}</td>
              <td className='px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <Link
                    href={ARF_ROUTES.lastmile.finance.courierCostLists.detail(list.id)}
                    className='font-medium text-slate-900 hover:underline'
                  >
                    {list.name}
                  </Link>
                  {list.isDefault ? (
                    <Badge className='bg-lime-100 text-lime-900 hover:bg-lime-100'>
                      Varsayılan
                    </Badge>
                  ) : null}
                </div>
                {list.description ? (
                  <p className='mt-0.5 line-clamp-1 text-xs text-slate-500'>{list.description}</p>
                ) : null}
              </td>
              <td className='px-4 py-3 text-xs text-slate-600'>
                {COMPENSATION_MODEL_LABELS[list.compensationModel]}
              </td>
              <td className='px-4 py-3'>
                <Badge variant={list.status === 'active' ? 'default' : 'secondary'}>
                  {list.status === 'active' ? 'Aktif' : 'Pasif'}
                </Badge>
              </td>
              <td className='px-4 py-3 tabular-nums'>{formatNumber(list.rules.length)}</td>
              <td className='px-4 py-3 tabular-nums'>
                {formatNumber(assignmentCounts[list.id] ?? 0)}
              </td>
              <td className='px-4 py-3 text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='size-8'>
                      <MoreHorizontal className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={ARF_ROUTES.lastmile.finance.courierCostLists.detail(list.id)}>
                        Detay
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onClone(list.id)}>
                      <Copy className='mr-2 size-3.5' />
                      Klonla
                    </DropdownMenuItem>
                    {!list.isDefault ? (
                      <DropdownMenuItem onClick={() => onSetDefault(list.id)}>
                        <Star className='mr-2 size-3.5' />
                        Varsayılan yap
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      onClick={() =>
                        onToggleStatus(list.id, list.status === 'active' ? 'passive' : 'active')
                      }
                    >
                      <ToggleLeft className='mr-2 size-3.5' />
                      {list.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
