'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import {
  getOtherSupplier,
  updateOtherSupplier,
} from '../../_api/suppliers-api'
import { formatCurrency } from '../../_lib/format'
import type { OtherSupplierRecord } from '../../_types/supplier'
import { SupplierFormModal } from '../_components/supplier-form-modal'

export default function SupplierDetailPageContent() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const [supplier, setSupplier] = useState<OtherSupplierRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const row = await getOtherSupplier(id)
      if (!row) {
        toast.error('Tedarikçi bulunamadı')
        router.push(ARF_ROUTES.lastmile.finance.suppliers.list)
        return
      }
      setSupplier(row)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    void load()
  }, [load])

  if (loading || !supplier) {
    return <div className='p-6 text-sm text-slate-500'>Yükleniyor…</div>
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Tedarikçiler', href: ARF_ROUTES.lastmile.finance.suppliers.list },
          { label: supplier.unvan },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>{supplier.unvan}</h1>
            <div className='mt-2 flex flex-wrap gap-1'>
              {supplier.tags.map((tag) => (
                <Badge key={tag} variant='secondary' className='uppercase'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' asChild>
              <Link href={ARF_ROUTES.lastmile.finance.suppliers.list}>Listeye dön</Link>
            </Button>
            <Button
              className='bg-lime-400 text-black hover:bg-lime-300'
              onClick={() => setEditOpen(true)}
            >
              Düzenle
            </Button>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-3'>
          <Card className='shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-medium text-slate-500'>Açık ödenecek</CardTitle>
            </CardHeader>
            <CardContent className='text-xl font-semibold tabular-nums'>
              {formatCurrency(supplier.openPayable)}
            </CardContent>
          </Card>
          <Card className='shadow-none sm:col-span-2'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-medium text-slate-500'>İletişim</CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 text-sm'>
              <p>VKN: {supplier.vkn || '—'}</p>
              <p>E-posta: {supplier.email || '—'}</p>
              <p>Telefon: {supplier.telefon || '—'}</p>
              {supplier.notes ? <p className='text-slate-500'>{supplier.notes}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <SupplierFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={supplier}
        onSubmit={async (payload) => {
          const updated = await updateOtherSupplier(supplier.id, payload)
          if (updated) {
            setSupplier(updated)
            toast.success('Tedarikçi güncellendi')
          }
        }}
      />
    </>
  )
}
