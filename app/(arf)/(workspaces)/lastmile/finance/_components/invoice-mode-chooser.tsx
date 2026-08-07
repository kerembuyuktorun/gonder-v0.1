'use client'

import Link from 'next/link'
import { FileText, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'

type Props = {
  onSelectManual: () => void
  onSelectOrders: () => void
}

export function InvoiceModeChooser({ onSelectManual, onSelectOrders }: Props) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card className='border-slate-200 shadow-none'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <FileText className='size-5' />
            Manuel e-Fatura
          </CardTitle>
          <CardDescription>
            Müşteri, tarih ve satırları elle girerek fatura oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type='button' onClick={onSelectManual}>
            Manuel devam et
          </Button>
        </CardContent>
      </Card>

      <Card className='border-slate-200 shadow-none'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Package className='size-5' />
            Siparişlerden oluştur
          </CardTitle>
          <CardDescription>
            Müşterinin faturalanmamış siparişlerini seçerek otomatik satır üretin.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Button type='button' onClick={onSelectOrders}>
            Siparişlerden devam et
          </Button>
          <Button type='button' variant='outline' asChild>
            <Link href={ARF_ROUTES.lastmile.finance.uninvoicedOrders.list}>
              Faturalanmamış liste
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
