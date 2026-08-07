'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { getInvoice } from '../../_api/invoices-api'
import { formatTry } from '../../_lib/invoice-from-orders'
import type { LastmileInvoice } from '../../_types/invoice'
import { INVOICE_SOURCE_LABEL, INVOICE_STATUS_LABEL } from '../../_types/invoice'

export default function InvoiceDetailPageContent() {
  const params = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<LastmileInvoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void getInvoice(params.id).then((item) => {
      if (cancelled) return
      setInvoice(item)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [params.id])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Faturalar', href: ARF_ROUTES.lastmile.finance.invoices.list },
          { label: invoice?.number ?? 'Detay' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-4 p-6 pb-24'>
        {loading ? (
          <p className='text-sm text-slate-500'>Yükleniyor…</p>
        ) : !invoice ? (
          <div className='space-y-3'>
            <p className='text-sm text-slate-500'>Fatura bulunamadı.</p>
            <Button asChild variant='outline'>
              <Link href={ARF_ROUTES.lastmile.finance.invoices.list}>Listeye dön</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <h1 className='text-2xl font-semibold tracking-tight'>{invoice.number}</h1>
                <p className='mt-1 text-sm text-slate-500'>{invoice.customerName}</p>
              </div>
              <div className='flex gap-2'>
                <Badge variant='secondary'>{INVOICE_STATUS_LABEL[invoice.status]}</Badge>
                <Badge variant='outline'>{INVOICE_SOURCE_LABEL[invoice.source]}</Badge>
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='rounded-lg border bg-white p-4 text-sm'>
                <div className='text-slate-500'>Fatura tarihi</div>
                <div className='mt-1 font-medium'>
                  {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className='rounded-lg border bg-white p-4 text-sm'>
                <div className='text-slate-500'>Vade</div>
                <div className='mt-1 font-medium'>
                  {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className='rounded-lg border bg-white p-4 text-sm'>
                <div className='text-slate-500'>Toplam</div>
                <div className='mt-1 font-medium'>{formatTry(invoice.total)}</div>
              </div>
            </div>

            <div className='overflow-hidden rounded-lg border bg-white'>
              <table className='w-full text-sm'>
                <thead className='bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th className='px-3 py-2'>Açıklama</th>
                    <th className='px-3 py-2'>Miktar</th>
                    <th className='px-3 py-2'>Birim</th>
                    <th className='px-3 py-2'>KDV %</th>
                    <th className='px-3 py-2 text-right'>Satır tutarı</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id} className='border-t'>
                      <td className='px-3 py-2'>{line.description}</td>
                      <td className='px-3 py-2'>{line.quantity}</td>
                      <td className='px-3 py-2'>{formatTry(line.unitPrice)}</td>
                      <td className='px-3 py-2'>{line.taxRate}</td>
                      <td className='px-3 py-2 text-right'>
                        {formatTry(line.quantity * line.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='ml-auto w-full max-w-xs space-y-1 rounded-lg border bg-white p-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-slate-500'>Ara toplam</span>
                <span>{formatTry(invoice.subtotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-500'>KDV</span>
                <span>{formatTry(invoice.kdv)}</span>
              </div>
              <div className='flex justify-between font-semibold'>
                <span>Toplam</span>
                <span>{formatTry(invoice.total)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
