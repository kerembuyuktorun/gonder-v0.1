'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { fetchCustomersList } from '../../customers/_api/customers'
import { mockCustomerList } from '../../customers/_mock/customers-mock-data'
import type { LastmileCustomer } from '../../customers/_types/customer'
import { isLastmileDemoForced } from '../../_lib/lastmile-demo-mode'
import { listUninvoicedOrders } from '../_api/invoices-api'
import { UninvoicedOrdersTable } from '../_components/uninvoiced-orders-table'
import type { UninvoicedOrderRow } from '../_types/invoice'

const ALL = 'all'

export default function UninvoicedOrdersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const [customers, setCustomers] = useState<LastmileCustomer[]>([])
  const [customerFilter, setCustomerFilter] = useState<string>(ALL)
  const [rows, setRows] = useState<UninvoicedOrderRow[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (forceDemo) {
      setCustomers(mockCustomerList.filter((c) => c.durum === 'aktif'))
      return
    }
    void fetchCustomersList({ page: 1, pageSize: 200, statusScope: 'aktif' }).then((result) => {
      if (result.success) setCustomers(result.data.items)
    })
  }, [forceDemo])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const items = await listUninvoicedOrders({
        customerId: customerFilter === ALL ? undefined : customerFilter,
        search: search.trim() || undefined,
      })
      setRows(items)
      setSelectedIds((prev) => prev.filter((id) => items.some((row) => row.orderId === id)))
    } catch {
      toast.error('Faturalanmamış siparişler yüklenemedi')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [customerFilter, search])

  useEffect(() => {
    void load()
  }, [load])

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.orderId)),
    [rows, selectedIds],
  )

  const goInvoice = () => {
    if (selectedRows.length === 0) {
      toast.error('En az bir sipariş seçin')
      return
    }
    const customerIds = Array.from(
      new Set(selectedRows.map((row) => row.customerId).filter(Boolean)),
    )
    if (customerIds.length !== 1) {
      toast.error('Faturalama için seçilen siparişler aynı müşteriye ait olmalı')
      return
    }
    const params = new URLSearchParams({
      mode: 'orders',
      customerId: customerIds[0],
      orderIds: selectedRows.map((row) => row.orderId).join(','),
    })
    router.push(`${ARF_ROUTES.lastmile.finance.invoices.create}?${params.toString()}`)
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Faturalanmamış Siparişler' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-4 p-6 pb-24'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {forceDemo ? 'Faturalanmamış Siparişler (Demo)' : 'Faturalanmamış Siparişler'}
              </h1>
              {forceDemo ? (
                <Badge className='bg-amber-100 text-amber-900 hover:bg-amber-100'>Demo veri</Badge>
              ) : null}
            </div>
            <p className='mt-1 text-sm text-slate-500'>
              Henüz faturaya bağlanmamış siparişleri seçerek faturalayın.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button size='sm' asChild>
              <Link href={ARF_ROUTES.lastmile.finance.invoices.create}>Yeni Fatura</Link>
            </Button>
          </div>
        </div>

        <div className='max-w-xs space-y-2'>
          <Label>Müşteri filtresi</Label>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tümü</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.marka_kisa_ad || c.firma_unvani}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className='text-sm text-slate-500'>Yükleniyor…</p>
        ) : (
          <UninvoicedOrdersTable
            rows={rows}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            search={search}
            onSearchChange={setSearch}
            emptyMessage='Faturalanacak sipariş yok'
          />
        )}

        {selectedRows.length > 0 ? (
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/50 px-4 py-3'>
            <p className='text-sm font-medium'>{selectedRows.length} sipariş seçildi</p>
            <Button type='button' onClick={goInvoice}>
              Faturala
            </Button>
          </div>
        ) : null}
      </div>
    </>
  )
}
