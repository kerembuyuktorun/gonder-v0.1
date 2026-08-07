'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Pencil, Plus, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  customersRepository,
  toAddressDraft,
  type SavedCustomer,
  type SavedCustomerAddress,
} from '../_data/customers-repository'
import type { AddressDraft } from '../_types/price-calculation'
import {
  EMPTY_ADDRESS_FORM,
  InlineAddressForm,
  type InlineAddressFormValues,
} from './inline-address-form'
import {
  EMPTY_CUSTOMER_FORM,
  InlineCustomerForm,
  type InlineCustomerFormValues,
} from './inline-customer-form'

const CUSTOMERS_KEY = ['gonder', 'customers'] as const

type InlineMode =
  | { type: 'idle' }
  | { type: 'create-customer' }
  | { type: 'edit-customer'; customerId: string }
  | { type: 'create-address'; customerId: string }
  | { type: 'edit-address'; customerId: string; addressId: string }

type Props = {
  title: string
  customerLabel: string
  pinLabel: string
  value: AddressDraft | null
  onChange: (value: AddressDraft | null) => void
  invalid?: boolean
}

export function PartyAddressCard({
  title,
  customerLabel,
  pinLabel,
  value,
  onChange,
  invalid,
}: Props) {
  const queryClient = useQueryClient()
  const { data: customers = [] } = useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: () => customersRepository.list(),
  })

  const [customerId, setCustomerId] = useState('')
  const [addressId, setAddressId] = useState('')
  const [pinned, setPinned] = useState(false)
  const [mode, setMode] = useState<InlineMode>({ type: 'idle' })
  const [customerForm, setCustomerForm] = useState<InlineCustomerFormValues>(EMPTY_CUSTOMER_FORM)
  const [addressForm, setAddressForm] = useState<InlineAddressFormValues>(EMPTY_ADDRESS_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const customer = useMemo(
    () => customers.find((item) => item.id === customerId) ?? null,
    [customerId, customers]
  )
  const addresses = customer?.addresses ?? []
  const selectedAddress = addresses.find((item) => item.id === addressId) ?? null
  const canPin = Boolean(value?.label)
  const isInlineOpen = mode.type !== 'idle'

  useEffect(() => {
    if (!customerId) return
    const stillExists = customers.some((item) => item.id === customerId)
    if (!stillExists) {
      setCustomerId('')
      setAddressId('')
    }
  }, [customerId, customers])

  function closeInline() {
    setMode({ type: 'idle' })
    setFormError(null)
    setSaving(false)
  }

  function handleCustomerSelect(nextCustomerId: string) {
    setCustomerId(nextCustomerId)
    setAddressId('')
    setPinned(false)
    closeInline()
    onChange(null)

    const nextCustomer = customers.find((item) => item.id === nextCustomerId)
    if (nextCustomer?.addresses.length === 1) {
      const only = nextCustomer.addresses[0]!
      setAddressId(only.id)
      onChange(toAddressDraft(only))
    }
  }

  function handleAddressSelect(nextAddressId: string) {
    setAddressId(nextAddressId)
    closeInline()
    const selected = addresses.find((item) => item.id === nextAddressId)
    onChange(selected ? toAddressDraft(selected) : null)
  }

  function startCreateCustomer() {
    setCustomerForm({ ...EMPTY_CUSTOMER_FORM })
    setFormError(null)
    setMode({ type: 'create-customer' })
  }

  function startEditCustomer() {
    if (!customer) return
    setCustomerForm({
      customerType: 'corporate',
      name: customer.name,
      phone: customer.phone ?? '',
      email: '',
      taxNumber: '',
      contactName: '',
    })
    setFormError(null)
    setMode({ type: 'edit-customer', customerId: customer.id })
  }

  function startCreateAddress() {
    if (!customerId) {
      toast.message('Önce müşteri seçin veya oluşturun')
      return
    }
    setAddressForm({ ...EMPTY_ADDRESS_FORM })
    setFormError(null)
    setMode({ type: 'create-address', customerId })
  }

  function startEditAddress() {
    if (!customerId || !selectedAddress) return
    setAddressForm({
      title: selectedAddress.title,
      line1: selectedAddress.line1 ?? selectedAddress.label,
      city: selectedAddress.city ?? '',
      district: selectedAddress.district ?? '',
      neighborhood: '',
      contactName: '',
      phone: customer?.phone ?? '',
    })
    setFormError(null)
    setMode({ type: 'edit-address', customerId, addressId: selectedAddress.id })
  }

  async function saveCustomer() {
    setSaving(true)
    setFormError(null)
    try {
      if (mode.type === 'create-customer') {
        const created = await customersRepository.createCustomer(customerForm)
        await queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
        setCustomerId(created.id)
        setAddressId('')
        onChange(null)
        toast.success('Müşteri kaydedildi')
        setMode({ type: 'create-address', customerId: created.id })
        setAddressForm({ ...EMPTY_ADDRESS_FORM })
        return
      }
      if (mode.type === 'edit-customer') {
        const updated = await customersRepository.updateCustomer(mode.customerId, customerForm)
        await queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
        setCustomerId(updated.id)
        toast.success('Müşteri güncellendi')
        closeInline()
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function saveAddress() {
    if (mode.type !== 'create-address' && mode.type !== 'edit-address') return
    setSaving(true)
    setFormError(null)
    try {
      let saved: SavedCustomerAddress
      if (mode.type === 'create-address') {
        saved = await customersRepository.createAddress(mode.customerId, addressForm)
      } else {
        saved = await customersRepository.updateAddress(
          mode.customerId,
          mode.addressId,
          addressForm
        )
      }
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
      setCustomerId(mode.customerId)
      setAddressId(saved.id)
      onChange(toAddressDraft(saved))
      toast.success(mode.type === 'create-address' ? 'Adres kaydedildi' : 'Adres güncellendi')
      closeInline()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className='min-w-0 gap-0 py-0 shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-3 pt-3 pb-1.5'>
        <CardTitle className='text-sm font-semibold'>{title}</CardTitle>
        <label className='inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground'>
          <Switch
            checked={pinned}
            disabled={!canPin}
            onCheckedChange={setPinned}
            aria-label={pinLabel}
            className='scale-90'
          />
          <span className={cn(!canPin && 'opacity-50')}>{pinLabel}</span>
        </label>
      </CardHeader>

      <CardContent className='space-y-2 px-3 pb-3 pt-0'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>{customerLabel}</Label>
          <div className='flex gap-1.5'>
            <Select
              value={customerId || undefined}
              onValueChange={handleCustomerSelect}
              disabled={isInlineOpen && mode.type.startsWith('create')}
            >
              <SelectTrigger className='h-9 flex-1'>
                <SelectValue placeholder='Müşteri seçin' />
              </SelectTrigger>
              <SelectContent>
                {customers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 shrink-0 gap-1 px-2.5'
              disabled={!customerId || isInlineOpen}
              onClick={startEditCustomer}
            >
              <Pencil className='size-3.5' />
              Düzenle
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 shrink-0 gap-1 px-2.5'
              disabled={isInlineOpen}
              onClick={startCreateCustomer}
            >
              <Plus className='size-3.5' />
              Yeni
            </Button>
          </div>
        </div>

        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Adres</Label>
          <div className='flex gap-1.5'>
            <Select
              value={addressId || undefined}
              onValueChange={handleAddressSelect}
              disabled={!customerId || isInlineOpen}
            >
              <SelectTrigger className='h-9 flex-1'>
                <SelectValue
                  placeholder={customerId ? 'Adres seçin' : 'Önce müşteri seçin'}
                />
              </SelectTrigger>
              <SelectContent>
                {addresses.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 shrink-0 gap-1 px-2.5'
              disabled={!selectedAddress || isInlineOpen}
              onClick={startEditAddress}
            >
              <Pencil className='size-3.5' />
              Düzenle
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 shrink-0 gap-1 px-2.5'
              disabled={!customerId || isInlineOpen}
              onClick={startCreateAddress}
            >
              <Plus className='size-3.5' />
              Yeni
            </Button>
          </div>
        </div>

        {mode.type === 'create-customer' || mode.type === 'edit-customer' ? (
          <InlineCustomerForm
            title={mode.type === 'create-customer' ? 'Yeni müşteri' : 'Müşteriyi düzenle'}
            values={customerForm}
            onChange={setCustomerForm}
            onSave={() => void saveCustomer()}
            onCancel={closeInline}
            saving={saving}
            error={formError}
          />
        ) : null}

        {mode.type === 'create-address' || mode.type === 'edit-address' ? (
          <InlineAddressForm
            title={mode.type === 'create-address' ? 'Yeni adres' : 'Adresi düzenle'}
            values={addressForm}
            onChange={setAddressForm}
            onSave={() => void saveAddress()}
            onCancel={closeInline}
            saving={saving}
            error={formError}
          />
        ) : null}

        {!isInlineOpen && value?.label ? (
          <SelectedAddressSummary customer={customer} value={value} addressTitle={selectedAddress?.title} />
        ) : null}

        {invalid && !value?.label ? (
          <p className='text-[11px] text-destructive'>Adres zorunludur</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SelectedAddressSummary({
  customer,
  value,
  addressTitle,
}: {
  customer: SavedCustomer | null
  value: AddressDraft
  addressTitle?: string
}) {
  return (
    <div className='rounded-lg border bg-muted/20 px-2.5 py-2 text-xs'>
      <div className='flex items-start gap-2'>
        <UserRound className='mt-0.5 size-3.5 shrink-0 text-muted-foreground' />
        <div className='min-w-0 space-y-0.5'>
          {customer ? <p className='truncate font-medium'>{customer.name}</p> : null}
          {customer?.phone ? (
            <p className='truncate text-muted-foreground'>{customer.phone}</p>
          ) : null}
          {addressTitle ? (
            <p className='truncate font-medium text-foreground/80'>{addressTitle}</p>
          ) : null}
          <p className='truncate text-muted-foreground'>{value.label}</p>
          {value.city || value.district ? (
            <p className='inline-flex items-center gap-1 text-muted-foreground'>
              <MapPin className='size-3' />
              {[value.district, value.city].filter(Boolean).join(', ')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
