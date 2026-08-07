'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AddressDraftInput } from '../_data/customers-repository'

export type InlineAddressFormValues = AddressDraftInput

const CITY_OPTIONS = ['Adana', 'Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli']
const TITLE_OPTIONS = ['Merkez Depo', 'Şube', 'Ofis', 'Fabrika', 'Teslimat Adresi', 'Diğer']

type Props = {
  title: string
  values: InlineAddressFormValues
  onChange: (next: InlineAddressFormValues) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
  error?: string | null
}

export const EMPTY_ADDRESS_FORM: InlineAddressFormValues = {
  title: 'Teslimat Adresi',
  line1: '',
  city: '',
  district: '',
  neighborhood: '',
  contactName: '',
  phone: '',
}

export function InlineAddressForm({
  title,
  values,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
}: Props) {
  return (
    <div className='space-y-2 rounded-lg border border-dashed bg-muted/20 p-2.5'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-xs font-medium'>{title}</p>
        <div className='flex gap-1.5'>
          <Button type='button' variant='ghost' size='sm' className='h-7 px-2 text-xs' onClick={onCancel}>
            Vazgeç
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-7 px-2.5 text-xs'
            disabled={saving}
            onClick={onSave}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>

      <div className='grid gap-2 sm:grid-cols-2'>
        <div className='space-y-1 sm:col-span-2'>
          <Label className='text-[11px] text-muted-foreground'>Adres etiketi</Label>
          <Select
            value={values.title}
            onValueChange={(value) => onChange({ ...values, title: value })}
          >
            <SelectTrigger className='h-8'>
              <SelectValue placeholder='Etiket seçin' />
            </SelectTrigger>
            <SelectContent>
              {TITLE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-1'>
          <Label className='text-[11px] text-muted-foreground'>Şehir</Label>
          <Select
            value={values.city || undefined}
            onValueChange={(value) => onChange({ ...values, city: value })}
          >
            <SelectTrigger className='h-8'>
              <SelectValue placeholder='Şehir seçin' />
            </SelectTrigger>
            <SelectContent>
              {CITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-1'>
          <Label className='text-[11px] text-muted-foreground'>İlçe</Label>
          <Input
            className='h-8'
            value={values.district ?? ''}
            onChange={(e) => onChange({ ...values, district: e.target.value })}
            placeholder='İlçe'
          />
        </div>
        <div className='space-y-1 sm:col-span-2'>
          <Label className='text-[11px] text-muted-foreground'>Mahalle / açık adres</Label>
          <Input
            className='h-8'
            value={values.line1}
            onChange={(e) => onChange({ ...values, line1: e.target.value })}
            placeholder='Mahalle, cadde, no'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-[11px] text-muted-foreground'>Yetkili / kişi</Label>
          <Input
            className='h-8'
            value={values.contactName ?? ''}
            onChange={(e) => onChange({ ...values, contactName: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-[11px] text-muted-foreground'>Telefon</Label>
          <Input
            className='h-8'
            value={values.phone ?? ''}
            onChange={(e) => onChange({ ...values, phone: e.target.value })}
          />
        </div>
      </div>

      {error ? <p className='text-[11px] text-destructive'>{error}</p> : null}
    </div>
  )
}
