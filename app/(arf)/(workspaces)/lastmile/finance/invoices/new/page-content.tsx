'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { fetchCustomersList } from '../../../customers/_api/customers'
import type { LastmileCustomer } from '../../../customers/_types/customer'
import { createInvoice, listUninvoicedOrders } from '../../_api/invoices-api'
import { InvoiceModeChooser } from '../../_components/invoice-mode-chooser'
import { ManualInvoiceForm } from '../../_components/manual-invoice-form'
import { UninvoicedOrdersTable } from '../../_components/uninvoiced-orders-table'
import { formatTry, ordersToInvoiceLines } from '../../_lib/invoice-from-orders'
import { computeInvoiceTotals } from '../../_mock/invoice-store'
import type { UninvoicedOrderRow } from '../../_types/invoice'

type Mode = 'choose' | 'manual' | 'orders'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function plusDays(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

export default function InvoiceCreatePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('choose')
  const [customers, setCustomers] = useState<LastmileCustomer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [uninvoiced, setUninvoiced] = useState<UninvoicedOrderRow[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void fetchCustomersList({ page: 1, pageSize: 200, statusScope: 'aktif' }).then((result) => {
      if (result.success) setCustomers(result.data.items)
    })
  }, [])

  useEffect(() => {
    const qMode = searchParams.get('mode')
    const qCustomer = searchParams.get('customerId') ?? ''
    const qOrderIds = (searchParams.get('orderIds') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    if (qMode === 'manual') {
      setMode('manual')
      if (qCustomer) setCustomerId(qCustomer)
      return
    }
    if (qMode === 'orders' || qCustomer || qOrderIds.length > 0) {
      setMode('orders')
      if (qCustomer) setCustomerId(qCustomer)
      if (qOrderIds.length > 0) setSelectedIds(qOrderIds)
    }
  }, [searchParams])

  const loadUninvoiced = useCallback(async () => {
    if (!customerId) {
      setUninvoiced([])
      return
    }
    setLoadingOrders(true)
    try {
      const rows = await listUninvoicedOrders({
        customerId,
        search: search.trim() || undefined,
      })
      setUninvoiced(rows)
    } catch {
      toast.error('Faturalanmamış siparişler yüklenemedi')
      setUninvoiced([])
    } finally {
      setLoadingOrders(false)
    }
  }, [customerId, search])

  useEffect(() => {
    if (mode === 'orders') void loadUninvoiced()
  }, [mode, loadUninvoiced])

  const selectedOrders = useMemo(
    () => uninvoiced.filter((row) => selectedIds.includes(row.orderId)),
    [uninvoiced, selectedIds],
  )

  const previewTotals = useMemo(() => {
    const lines = ordersToInvoiceLines(selectedOrders).map((line, index) => ({
      id: `preview_${index}`,
      ...line,
    }))
    return computeInvoiceTotals(lines)
  }, [selectedOrders])

  const customer = customers.find((c) => c.id === customerId)

  const goList = () => router.push(ARF_ROUTES.lastmile.finance.invoices.list)

  const handleManualSubmit = async (payload: {
    customerId: string
    customerName: string
    issueDate: string
    dueDate: string
    lines: Array<{
      description: string
      quantity: number
      unitPrice: number
      taxRate: number
    }>
    notes?: string | null
  }) => {
    setSubmitting(true)
    try {
      const invoice = await createInvoice({
        ...payload,
        source: 'manual',
        status: 'kesildi',
      })
      toast.success(`${invoice.number} oluşturuldu`)
      router.push(ARF_ROUTES.lastmile.finance.invoices.detail(invoice.id))
    } catch {
      toast.error('Fatura kaydedilemedi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOrdersSubmit = async () => {
    if (!customer || selectedOrders.length === 0) {
      toast.error('En az bir sipariş seçin')
      return
    }
    const missingCustomer = selectedOrders.some((row) => !row.customerId)
    if (missingCustomer) {
      toast.error('Seçilen siparişlerde müşteri bilgisi eksik')
      return
    }
    setSubmitting(true)
    try {
      const invoice = await createInvoice({
        customerId: customer.id,
        customerName: customer.marka_kisa_ad || customer.firma_unvani,
        issueDate: todayIso(),
        dueDate: plusDays(14),
        lines: ordersToInvoiceLines(selectedOrders),
        orderIds: selectedOrders.map((row) => row.orderId),
        source: 'orders',
        status: 'kesildi',
      })
      toast.success(`${invoice.number} oluşturuldu`)
      router.push(ARF_ROUTES.lastmile.finance.invoices.detail(invoice.id))
    } catch {
      toast.error('Fatura kaydedilemedi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans & Muhasebe', href: ARF_ROUTES.lastmile.finance.customers.list },
          { label: 'Faturalar', href: ARF_ROUTES.lastmile.finance.invoices.list },
          { label: 'Yeni Fatura' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-4 p-6 pb-24'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Fatura Oluştur</h1>
            <p className='mt-1 text-sm text-slate-500'>
              Manuel e-fatura veya faturalanmamış siparişlerden oluşturun.
            </p>
          </div>
          {mode !== 'choose' ? (
            <Button type='button' variant='outline' size='sm' onClick={() => setMode('choose')}>
              Mod seçimine dön
            </Button>
          ) : null}
        </div>

        {mode === 'choose' ? (
          <InvoiceModeChooser
            onSelectManual={() => setMode('manual')}
            onSelectOrders={() => setMode('orders')}
          />
        ) : null}

        {mode === 'manual' ? (
          <ManualInvoiceForm
            customers={customers}
            initialCustomerId={customerId || undefined}
            submitting={submitting}
            onSubmit={handleManualSubmit}
            onCancel={goList}
          />
        ) : null}

        {mode === 'orders' ? (
          <div className='space-y-4 rounded-lg border bg-white p-4'>
            <div className='max-w-md space-y-2'>
              <Label>Müşteri</Label>
              <Select
                value={customerId || undefined}
                onValueChange={(value) => {
                  setCustomerId(value)
                  setSelectedIds([])
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Müşteri seçin' />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.marka_kisa_ad || c.firma_unvani}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!customerId ? (
              <p className='text-sm text-slate-500'>Faturalanmamış siparişleri görmek için müşteri seçin.</p>
            ) : loadingOrders ? (
              <p className='text-sm text-slate-500'>Siparişler yükleniyor…</p>
            ) : (
              <UninvoicedOrdersTable
                rows={uninvoiced}
                selectedIds={selectedIds}
                onSelectedIdsChange={setSelectedIds}
                search={search}
                onSearchChange={setSearch}
                showCustomerColumn={false}
              />
            )}

            {selectedOrders.length > 0 ? (
              <div className='rounded-md border bg-slate-50 p-3 text-sm'>
                <div className='font-medium'>{selectedOrders.length} sipariş seçildi</div>
                <div className='mt-1 text-slate-600'>
                  Ara toplam {formatTry(previewTotals.subtotal)} · KDV {formatTry(previewTotals.kdv)} ·
                  Toplam {formatTry(previewTotals.total)}
                </div>
                {selectedOrders.some((row) => !row.hasPricing) ? (
                  <div className='mt-1 text-amber-700'>
                    Bazı siparişlerde fiyat snapshot’ı yok; tutar 0 olarak geçebilir.
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={goList} disabled={submitting}>
                Vazgeç
              </Button>
              <Button
                type='button'
                onClick={() => void handleOrdersSubmit()}
                disabled={submitting || !customerId || selectedOrders.length === 0}
              >
                Faturayı kaydet
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
