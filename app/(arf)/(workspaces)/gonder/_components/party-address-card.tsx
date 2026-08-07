'use client'

import { useMemo, useState } from 'react'
import { MapPin, Plus, UserRound, X } from 'lucide-react'
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
  SAVED_CUSTOMERS,
  toAddressDraft,
  type SavedCustomer,
} from '../_data/saved-customers'
import type { AddressDraft } from '../_types/price-calculation'
import { AddressSearchField } from './address-search-field'

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
  const [addingNew, setAddingNew] = useState(false)
  const [customerId, setCustomerId] = useState<string>('')
  const [addressId, setAddressId] = useState<string>('')
  const [pinned, setPinned] = useState(false)

  const customer = useMemo(
    () => SAVED_CUSTOMERS.find((item) => item.id === customerId) ?? null,
    [customerId]
  )

  const addresses = customer?.addresses ?? []
  const canPin = Boolean(value?.label)

  function handleCustomerSelect(nextCustomerId: string) {
    setCustomerId(nextCustomerId)
    setAddressId('')
    setPinned(false)
    setAddingNew(false)
    onChange(null)

    const nextCustomer = SAVED_CUSTOMERS.find((item) => item.id === nextCustomerId)
    if (nextCustomer?.addresses.length === 1) {
      const only = nextCustomer.addresses[0]!
      setAddressId(only.id)
      onChange(toAddressDraft(only))
    }
  }

  function handleAddressSelect(nextAddressId: string) {
    setAddressId(nextAddressId)
    const selected = addresses.find((item) => item.id === nextAddressId)
    onChange(selected ? toAddressDraft(selected) : null)
  }

  function startAddingNew() {
    setAddingNew(true)
    setCustomerId('')
    setAddressId('')
    setPinned(false)
    onChange(null)
  }

  function cancelAddingNew() {
    setAddingNew(false)
    onChange(null)
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
        {addingNew ? (
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <Label className='text-xs text-muted-foreground'>Yeni adres</Label>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 gap-1 px-2 text-xs text-muted-foreground'
                onClick={cancelAddingNew}
              >
                <X className='size-3.5' />
                Listeye dön
              </Button>
            </div>
            <AddressSearchField
              label='Adres'
              value={value}
              onSelect={onChange}
              onClear={() => onChange(null)}
              invalid={invalid}
              compact
            />
          </div>
        ) : (
          <div className='space-y-2'>
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>{customerLabel}</Label>
              <div className='flex gap-1.5'>
                <Select value={customerId || undefined} onValueChange={handleCustomerSelect}>
                  <SelectTrigger className='h-9 flex-1'>
                    <SelectValue placeholder='Müşteri seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    {SAVED_CUSTOMERS.map((item) => (
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
                  onClick={startAddingNew}
                >
                  <Plus className='size-3.5' />
                  Yeni
                </Button>
              </div>
            </div>

            {customer && addresses.length > 1 ? (
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>Adres</Label>
                <Select value={addressId || undefined} onValueChange={handleAddressSelect}>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Adres seçin' />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {value?.label ? <SelectedAddressSummary customer={customer} value={value} /> : null}
          </div>
        )}

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
}: {
  customer: SavedCustomer | null
  value: AddressDraft
}) {
  return (
    <div className='rounded-lg border bg-muted/20 px-2.5 py-2 text-xs'>
      <div className='flex items-start gap-2'>
        <UserRound className='mt-0.5 size-3.5 shrink-0 text-muted-foreground' />
        <div className='min-w-0 space-y-0.5'>
          {customer ? <p className='truncate font-medium'>{customer.name}</p> : null}
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
