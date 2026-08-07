'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { toNationalPhoneDigits } from '../../orders/new/_lib/phone'
import { fetchCustomerAddresses } from '../_api/addresses'
import { fetchCustomerDetail, patchCustomerStatus, updateCustomer } from '../_api/customers'
import {
  CreateCustomerModal,
  type CustomerCreateFormValues,
} from '../_components/create-customer-modal'
import { buildCustomerWritePayload, toBackendStatus } from '../_lib/map-customer'
import { CustomerDetailHeader } from './_components/customer-detail-header'
import { TabFacilities } from './_components/tab-facilities'
import { TabIntegrations } from './_components/tab-integrations'
import { TabOverview } from './_components/tab-overview'
import type { CustomerDetail, CustomerDetailTab } from './_types/customer-detail'

const TAB_ITEMS: Array<{ id: CustomerDetailTab; label: string }> = [
  { id: 'overview', label: 'Genel Bakış' },
  { id: 'facilities', label: 'Adresler Ve Operasyon Bölgeleri' },
  { id: 'orders', label: 'Siparişler' },
  { id: 'integrations', label: 'Entegrasyon Bilgileri' },
]

export default function CustomerDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tab, setTab] = useState<CustomerDetailTab>('overview')
  const [editOpen, setEditOpen] = useState(false)

  const loadCustomer = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    const detailResult = await fetchCustomerDetail(id)
    if (!detailResult.success) {
      setCustomer(null)
      setLoadError(detailResult.error)
      setIsLoading(false)
      return
    }

    let next = detailResult.data

    // Detail addresses gömülü değilse ayrı endpoint
    if (next.addresses.length === 0) {
      const addressesResult = await fetchCustomerAddresses(id)
      if (addressesResult.success) {
        next = {
          ...next,
          addresses: addressesResult.data.items,
          tesis_sayisi: addressesResult.data.items.length,
        }
      }
    }

    setCustomer(next)
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    void loadCustomer()
  }, [loadCustomer])

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Müşteriler', href: ARF_ROUTES.lastmile.customers.list },
            { label: 'Yükleniyor' },
          ]}
        />
        <div className='flex flex-1 items-center justify-center p-6'>
          <p className='text-sm text-slate-600'>Müşteri yükleniyor...</p>
        </div>
      </>
    )
  }

  if (!customer) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Müşteriler', href: ARF_ROUTES.lastmile.customers.list },
            { label: 'Bulunamadı' },
          ]}
        />
        <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6'>
          <p className='text-sm text-slate-600'>{loadError || 'Müşteri bulunamadı.'}</p>
          <Button asChild size='sm'>
            <Link href={ARF_ROUTES.lastmile.customers.list}>Listeye Dön</Link>
          </Button>
        </div>
      </>
    )
  }

  const ordersListHref = ARF_ROUTES.lastmile.orders.listByCustomer(
    customer.id,
    customer.marka_kisa_ad
  )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Müşteriler', href: ARF_ROUTES.lastmile.customers.list },
          { label: customer.marka_kisa_ad },
        ]}
      />

      <div className='flex flex-1 flex-col gap-4 p-6'>
        <div className='sticky top-0 z-20 -mx-6 space-y-4 bg-background/95 px-6 py-1 backdrop-blur supports-backdrop-filter:bg-background/80'>
          <CustomerDetailHeader
            customer={customer}
            onEdit={() => setEditOpen(true)}
            onToggleStatus={async () => {
              const nextStatus = toBackendStatus(customer.durum === 'aktif' ? 'pasif' : 'aktif')
              const result = await patchCustomerStatus(customer.id, nextStatus)
              if (!result.success) {
                toast.error(result.error)
                return
              }
              setCustomer((previous) =>
                previous
                  ? {
                      ...previous,
                      ...result.data,
                      addresses: previous.addresses,
                      api: previous.api,
                      orders: previous.orders,
                    }
                  : previous
              )
              toast.success(
                nextStatus === 'Passive'
                  ? `${result.data.musteri_kodu} pasife alındı`
                  : `${result.data.musteri_kodu} aktifleştirildi`
              )
            }}
          />
        </div>

        <CreateCustomerModal
          open={editOpen}
          onOpenChange={setEditOpen}
          mode='edit'
          initialCustomer={customer}
          onSubmit={async (values: CustomerCreateFormValues) => {
            const national = toNationalPhoneDigits(values.telefon)
            const result = await updateCustomer(
              customer.id,
              buildCustomerWritePayload({
                ...values,
                sektor: values.sektor || customer.sektor,
                phoneE164: national ? `+90${national}` : values.telefon.trim(),
              })
            )
            if (!result.success) {
              if (result.code === 'TAX_NUMBER_EXISTS') {
                throw new Error('Bu VKN / T.C. kimlik numarası zaten kayıtlı')
              }
              throw new Error(result.error)
            }
            setCustomer((previous) =>
              previous
                ? {
                    ...previous,
                    ...result.data,
                    addresses: previous.addresses,
                    api: previous.api,
                    orders: previous.orders,
                  }
                : previous
            )
            toast.success(`${result.data.musteri_kodu} güncellendi`)
          }}
        />

        <Card className='rounded-[24px] border-slate-200/80 shadow-none'>
          <CardContent className='p-4 lg:p-5'>
            <Tabs
              value={tab}
              onValueChange={(value) => {
                if (value === 'orders') {
                  router.push(ordersListHref)
                  return
                }
                setTab(value as CustomerDetailTab)
              }}
              className='gap-4'
            >
              <TabsList className='h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-slate-100/80 p-1'>
                {TAB_ITEMS.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className='rounded-lg px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm'
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value='overview' className='mt-0'>
                <TabOverview customer={customer} />
              </TabsContent>
              <TabsContent value='facilities' className='mt-0'>
                <TabFacilities
                  customerId={customer.id}
                  addresses={customer.addresses}
                  onAddressesChange={(addresses) =>
                    setCustomer((previous) =>
                      previous
                        ? {
                            ...previous,
                            addresses,
                            tesis_sayisi: addresses.length,
                          }
                        : previous
                    )
                  }
                />
              </TabsContent>
              <TabsContent value='integrations' className='mt-0'>
                <TabIntegrations api={customer.api} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
