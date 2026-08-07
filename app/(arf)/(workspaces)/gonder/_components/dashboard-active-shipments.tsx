"use client"

import Link from 'next/link'
import { ChevronRight, Clock, Package, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../_shared/routes'
import { tDashboard } from '../_data/dashboard-labels'
import type { DashboardActiveShipment } from '../_types/dashboard'
import { shipmentStatusConfig } from './dashboard-status-config'

interface Props {
  shipments: DashboardActiveShipment[]
}

export function DashboardActiveShipments({ shipments }: Props) {
  return (
    <Card className='min-w-0 gap-0 py-0 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-3 pt-3 pb-1.5'>
        <div>
          <CardTitle className='text-sm font-semibold'>Aktif gönderiler</CardTitle>
        </div>
        <Button variant='ghost' size='sm' asChild className='h-8'>
          <Link href={ARF_ROUTES.gonder.shipments.active} className='gap-1'>
            Tümünü gör
            <ChevronRight className='size-4' />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className='p-0 pb-1'>
        {shipments.length === 0 ? (
          <div className='flex flex-col items-start gap-2 px-3 py-3'>
            <p className='text-sm text-muted-foreground'>Aktif gönderi yok</p>
            <Button asChild size='sm'>
              <Link href={ARF_ROUTES.gonder.shipments.create} className='gap-1.5'>
                <Plus className='size-4' />
                İlk gönderini oluştur
              </Link>
            </Button>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[640px] text-left text-sm'>
              <thead className='border-y border-border bg-muted/30 text-xs text-muted-foreground'>
                <tr>
                  <th className='px-3 py-1.5 font-medium'>Referans</th>
                  <th className='px-3 py-1.5 font-medium'>Rota</th>
                  <th className='px-3 py-1.5 font-medium'>Hizmet</th>
                  <th className='px-3 py-1.5 font-medium'>Durum</th>
                  <th className='px-3 py-1.5 font-medium'>Güncelleme</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {shipments.slice(0, 6).map((shipment) => {
                  const status = shipmentStatusConfig[shipment.status]

                  return (
                    <tr key={shipment.id} className='transition-colors hover:bg-muted/40'>
                      <td className='px-3 py-1.5'>
                        <Link href={shipment.href} className='inline-flex items-center gap-2 font-medium hover:underline'>
                          <span className='flex size-6 items-center justify-center rounded-md bg-muted'>
                            <Package className='size-3.5 text-muted-foreground' />
                          </span>
                          {shipment.reference}
                        </Link>
                      </td>
                      <td className='px-3 py-1.5 text-muted-foreground'>
                        {shipment.origin} → {shipment.destination}
                      </td>
                      <td className='px-3 py-1.5'>{shipment.serviceType}</td>
                      <td className='px-3 py-1.5'>
                        <Badge variant='outline' className={status.className}>
                          {tDashboard(status.labelKey)}
                        </Badge>
                      </td>
                      <td className='px-3 py-1.5'>
                        <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='size-3' />
                          {shipment.updatedAt}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
