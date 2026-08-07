'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Pencil, Plus, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  customersRepository,
  toAddressDraft,
  type SavedCustomer,
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

const CITY_OPTIONS = ['Adana', 'Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli']

type InlineMode =
  | { type: 'idle' }
  | { type: 'create-customer' }
  | { type: 'create-address'; customerId: string }

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
  const [editOpen, setEditOpen] = useState(false)
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
  const canEditSelected = Boolean(customerId && selectedAddress && value?.label)

  const cityOptions = useMemo(() => {
    if (addressForm.city && !CITY_OPTIONS.includes(addressForm.city)) {
      return [addressForm.city, ...CITY_OPTIONS]
    }
    return CITY_OPTIONS
  }, [addressForm.city])

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

  function closeEditSheet() {
    setEditOpen(false)
    setFormError(null)
    setSaving(false)
  }

  function handleCustomerSelect(nextCustomerId: string) {
    setCustomerId(nextCustomerId)
    setAddressId('')
    setPinned(false)
    closeInline()
    closeEditSheet()
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
    closeEditSheet()
    const selected = addresses.find((item) => item.id === nextAddressId)
    onChange(selected ? toAddressDraft(selected) : null)
  }

  function startCreateCustomer() {
    setCustomerForm({ ...EMPTY_CUSTOMER_FORM })
    setFormError(null)
    setEditOpen(false)
    setMode({ type: 'create-customer' })
  }

  function startCreateAddress() {
    if (!customerId) {
      toast.message('Önce müşteri seçin veya oluşturun')
      return
    }
    setAddressForm({ ...EMPTY_ADDRESS_FORM })
    setFormError(null)
    setEditOpen(false)
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
    closeInline()
    setEditOpen(true)
  }

  async function saveCustomer() {
    if (mode.type !== 'create-customer') return
    setSaving(true)
    setFormError(null)
    try {
      const created = await customersRepository.createCustomer(customerForm)
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
      setCustomerId(created.id)
      setAddressId('')
      onChange(null)
      toast.success('Müşteri kaydedildi')
      setMode({ type: 'create-address', customerId: created.id })
      setAddressForm({ ...EMPTY_ADDRESS_FORM })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function saveAddress() {
    if (mode.type !== 'create-address') return
    setSaving(true)
    setFormError(null)
    try {
      const saved = await customersRepository.createAddress(mode.customerId, addressForm)
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
      setCustomerId(mode.customerId)
      setAddressId(saved.id)
      onChange(toAddressDraft(saved))
      toast.success('Adres kaydedildi')
      closeInline()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function saveEditedAddress() {
    if (!customerId || !selectedAddress) return
    setSaving(true)
    setFormError(null)
    try {
      const saved = await customersRepository.updateAddress(
        customerId,
        selectedAddress.id,
        addressForm
      )
      if (customer) {
        await customersRepository.updateCustomer(customerId, {
          customerType: 'corporate',
          name: customer.name,
          phone: addressForm.phone,
        })
      }
      await queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
      setAddressId(saved.id)
      onChange(toAddressDraft(saved))
      toast.success('Adres güncellendi')
      closeEditSheet()
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
              <SelectTrigger className='h-9 min-w-0 flex-1'>
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
              disabled={isInlineOpen}
              onClick={startCreateCustomer}
            >
              <Plus className='size-3.5' />
              <span className='hidden sm:inline'>Yeni</span>
              <span className='sr-only sm:hidden'>Yeni müşteri</span>
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
              <SelectTrigger className='h-9 min-w-0 flex-1'>
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
              disabled={!customerId || isInlineOpen}
              onClick={startCreateAddress}
            >
              <Plus className='size-3.5' />
              <span className='hidden sm:inline'>Yeni</span>
              <span className='sr-only sm:hidden'>Yeni adres</span>
            </Button>
          </div>
        </div>

        {mode.type === 'create-customer' ? (
          <InlineCustomerForm
            title='Yeni müşteri'
            values={customerForm}
            onChange={setCustomerForm}
            onSave={() => void saveCustomer()}
            onCancel={closeInline}
            saving={saving}
            error={formError}
          />
        ) : null}

        {mode.type === 'create-address' ? (
          <InlineAddressForm
            title='Yeni adres'
            values={addressForm}
            onChange={setAddressForm}
            onSave={() => void saveAddress()}
            onCancel={closeInline}
            saving={saving}
            error={formError}
          />
        ) : null}

        {!isInlineOpen && value?.label ? (
          <SelectedAddressSummary
            customer={customer}
            value={value}
            addressTitle={selectedAddress?.title}
            canEdit={canEditSelected}
            onEdit={startEditAddress}
          />
        ) : null}

        {invalid && !value?.label ? (
          <p className='text-[11px] text-destructive'>Adres zorunludur</p>
        ) : null}
      </CardContent>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) closeEditSheet()
        }}
      >
        <SheetContent side='right' className='flex w-full flex-col sm:max-w-md'>
          <SheetHeader>
            <SheetTitle>Adresi düzenle</SheetTitle>
          </SheetHeader>

          <div className='flex-1 space-y-3 overflow-y-auto px-4 pb-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Adres adı</Label>
              <Input
                value={addressForm.title}
                onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                placeholder='Örn. Merkez Depo'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Açık adres</Label>
              <Textarea
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                placeholder='Mahalle, cadde, no'
                rows={3}
                className='resize-none'
              />
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>İlçe</Label>
                <Input
                  value={addressForm.district ?? ''}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, district: e.target.value })
                  }
                  placeholder='İlçe'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>Şehir</Label>
                <Select
                  value={addressForm.city || undefined}
                  onValueChange={(next) => setAddressForm({ ...addressForm, city: next })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Şehir seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Telefon (opsiyonel)</Label>
              <Input
                value={addressForm.phone ?? ''}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                placeholder='Telefon'
              />
            </div>

            {formError ? <p className='text-xs text-destructive'>{formError}</p> : null}
          </div>

          <SheetFooter className='gap-2 border-t sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              className='sm:flex-1'
              disabled={saving}
              onClick={closeEditSheet}
            >
              İptal
            </Button>
            <Button
              type='button'
              className='sm:flex-1'
              disabled={saving}
              onClick={() => void saveEditedAddress()}
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>
  )
}

function SelectedAddressSummary({
  customer,
  value,
  addressTitle,
  canEdit,
  onEdit,
}: {
  customer: SavedCustomer | null
  value: AddressDraft
  addressTitle?: string
  canEdit: boolean
  onEdit: () => void
}) {
  return (
    <div className='rounded-lg border bg-muted/20 px-2.5 py-2 text-xs'>
      <div className='flex items-start gap-2'>
        <div className='flex min-w-0 flex-1 items-start gap-2'>
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
        <Button
          type='button'
          size='sm'
          variant='outline'
          className='h-7 shrink-0 gap-1 px-2 text-xs'
          disabled={!canEdit}
          onClick={onEdit}
        >
          <Pencil className='size-3.5' />
          Düzenle
        </Button>
      </div>
    </div>
  )
}
