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
import type { CustomerDraftInput, CustomerType } from '../_data/customers-repository'

export type InlineCustomerFormValues = CustomerDraftInput

type Props = {
  title: string
  values: InlineCustomerFormValues
  onChange: (next: InlineCustomerFormValues) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
  error?: string | null
}

export const EMPTY_CUSTOMER_FORM: InlineCustomerFormValues = {
  customerType: 'corporate',
  name: '',
  phone: '',
  email: '',
  taxNumber: '',
  contactName: '',
}

export function InlineCustomerForm({
  title,
  values,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
}: Props) {
  const isCorporate = values.customerType === 'corporate'

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

      <div className='space-y-1'>
        <Label className='text-[11px] text-muted-foreground'>Müşteri tipi</Label>
        <Select
          value={values.customerType}
          onValueChange={(value: CustomerType) =>
            onChange({ ...values, customerType: value })
          }
        >
          <SelectTrigger className='h-8'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='corporate'>Kurumsal</SelectItem>
            <SelectItem value='individual'>Bireysel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-2 sm:grid-cols-2'>
        <div className='space-y-1 sm:col-span-2'>
          <Label className='text-[11px] text-muted-foreground'>
            {isCorporate ? 'Ünvan / şirket adı' : 'Ad soyad'}
          </Label>
          <Input
            className='h-8'
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            placeholder={isCorporate ? 'Örn. Moda Tekstil A.Ş.' : 'Örn. Ayşe Yılmaz'}
          />
        </div>
        {isCorporate ? (
          <>
            <div className='space-y-1'>
              <Label className='text-[11px] text-muted-foreground'>Vergi no</Label>
              <Input
                className='h-8'
                value={values.taxNumber ?? ''}
                onChange={(e) => onChange({ ...values, taxNumber: e.target.value })}
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-[11px] text-muted-foreground'>Yetkili</Label>
              <Input
                className='h-8'
                value={values.contactName ?? ''}
                onChange={(e) => onChange({ ...values, contactName: e.target.value })}
              />
            </div>
          </>
        ) : null}
        <div className='space-y-1'>
          <Label className='text-[11px] text-muted-foreground'>Telefon</Label>
          <Input
            className='h-8'
            value={values.phone ?? ''}
            onChange={(e) => onChange({ ...values, phone: e.target.value })}
            placeholder='05xx xxx xx xx'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-[11px] text-muted-foreground'>E-posta</Label>
          <Input
            className='h-8'
            type='email'
            value={values.email ?? ''}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
          />
        </div>
      </div>

      {error ? <p className='text-[11px] text-destructive'>{error}</p> : null}
    </div>
  )
}
