'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { listInvoices } from '../_api/invoices-api'
import { formatTry } from '../_lib/invoice-from-orders'
import type { LastmileInvoice } from '../_types/invoice'
import { INVOICE_SOURCE_LABEL, INVOICE_STATUS_LABEL } from '../_types/invoice'

export default function InvoicesPageContent() {
  const router = useRouter()
  const [rows, setRows] = useState<LastmileInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const items = await listInvoices()
      setRows(items)
    } catch {
      toast.error('Faturalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => {
      const hay = `${row.number} ${row.customerName} ${row.status}`.toLowerCase()
      return hay.includes(q)
    })
  }, [rows, search])

  const summary = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + row.total, 0)
    const draft = rows.filter((row) => row.status === 'taslak').length
    const issued = rows.filter((row) => row.status === 'kesildi').length
    return { count: rows.length, total, draft, issued }
  }, [rows])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Faturalar' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-4 p-6 pb-24'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Faturalar</h1>
            <p className='mt-1 text-sm text-slate-500'>
              Manuel veya siparişlerden oluşturulan müşteri faturaları.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button size='sm' asChild>
              <Link href={ARF_ROUTES.lastmile.finance.invoices.create}>
                <Plus className='mr-1.5 size-3.5' />
                Yeni Fatura
              </Link>
            </Button>
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-lg border bg-white p-4'>
            <div className='text-xs text-slate-500'>Toplam fatura</div>
            <div className='mt-1 text-2xl font-semibold'>{summary.count}</div>
          </div>
          <div className='rounded-lg border bg-white p-4'>
            <div className='text-xs text-slate-500'>Kesilen</div>
            <div className='mt-1 text-2xl font-semibold'>{summary.issued}</div>
          </div>
          <div className='rounded-lg border bg-white p-4'>
            <div className='text-xs text-slate-500'>Taslak</div>
            <div className='mt-1 text-2xl font-semibold'>{summary.draft}</div>
          </div>
          <div className='rounded-lg border bg-white p-4'>
            <div className='text-xs text-slate-500'>Toplam tutar</div>
            <div className='mt-1 text-2xl font-semibold'>{formatTry(summary.total)}</div>
          </div>
        </div>

        <div className='relative max-w-md'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
          <Input
            className='pl-9'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Fatura no veya müşteri ara…'
          />
        </div>

        <div className='overflow-hidden rounded-lg border bg-white'>
          <table className='w-full text-sm'>
            <thead className='bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500'>
              <tr>
                <th className='px-3 py-2'>No</th>
                <th className='px-3 py-2'>Müşteri</th>
                <th className='px-3 py-2'>Tarih</th>
                <th className='px-3 py-2'>Durum</th>
                <th className='px-3 py-2'>Kaynak</th>
                <th className='px-3 py-2 text-right'>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className='px-3 py-10 text-center text-slate-500'>
                    Yükleniyor…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-3 py-10 text-center text-slate-500'>
                    Fatura bulunamadı
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className='cursor-pointer border-t hover:bg-slate-50'
                    onClick={() => router.push(ARF_ROUTES.lastmile.finance.invoices.detail(row.id))}
                  >
                    <td className='px-3 py-2 font-medium'>{row.number}</td>
                    <td className='px-3 py-2'>{row.customerName}</td>
                    <td className='px-3 py-2'>
                      {row.issueDate
                        ? new Date(row.issueDate).toLocaleDateString('tr-TR')
                        : '—'}
                    </td>
                    <td className='px-3 py-2'>
                      <Badge variant='secondary'>{INVOICE_STATUS_LABEL[row.status]}</Badge>
                    </td>
                    <td className='px-3 py-2'>{INVOICE_SOURCE_LABEL[row.source]}</td>
                    <td className='px-3 py-2 text-right font-medium'>{formatTry(row.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
