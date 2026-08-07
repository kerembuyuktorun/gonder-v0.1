'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users2 } from 'lucide-react'
import { ARF_ROUTES } from '../../../../../../_shared/routes'
import { UserStatusBadge } from '../../../../users/_components/user-status-badge'
import { USERS_MOCK } from '../../../../users/_mock/users-mock-data'
import type { RoleDetail } from '../../_types/role'

type Props = {
  role: RoleDetail
}

export function TabUsers({ role }: Props) {
  const users = useMemo(
    () => USERS_MOCK.filter((user) => user.rol === role.id),
    [role.id]
  )

  return (
    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
      <div className='flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5'>
        <div className='flex items-center gap-2.5'>
          <span className='flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
            <Users2 className='size-4' />
          </span>
          <h3 className='text-sm font-semibold text-slate-900'>Role Ait Kullanıcılar</h3>
        </div>
        <span className='text-xs tabular-nums text-slate-400'>{users.length} kullanıcı</span>
      </div>

      {users.length === 0 ? (
        <div className='px-4 py-12 text-center'>
          <Users2 className='mx-auto size-5 text-slate-300' />
          <p className='mt-2 text-sm font-medium text-slate-600'>Bu role atanmış kullanıcı yok</p>
          <p className='mt-1 text-xs text-slate-400'>
            Kullanıcı listesinden bu rolü kullanıcılara atayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-slate-100 hover:bg-transparent'>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  Ad Soyad
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  E-posta
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  Durum
                </TableHead>
                <TableHead className='bg-slate-50/80 font-semibold text-slate-600'>
                  Kurum
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className='border-slate-100'>
                  <TableCell>
                    <Link
                      href={ARF_ROUTES.lastmile.users.detail(user.id)}
                      className='text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60'
                    >
                      {user.ad_soyad}
                    </Link>
                  </TableCell>
                  <TableCell className='text-sm text-slate-700'>{user.email}</TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.durum} />
                  </TableCell>
                  <TableCell className='text-sm text-slate-700'>{user.bagli_kurum}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
