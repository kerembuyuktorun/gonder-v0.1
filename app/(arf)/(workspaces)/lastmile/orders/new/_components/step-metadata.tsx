'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Braces, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MetaField, OrderCreateFormState } from '../_types/order-create'

type Props = {
  form: OrderCreateFormState
  setForm: Dispatch<SetStateAction<OrderCreateFormState>>
}

export function StepMetadata({ form, setForm }: Props) {
  const addMetaField = () => {
    const field: MetaField = {
      id: `meta-${Date.now()}`,
      key: '',
      value: '',
    }
    setForm((previous) => ({
      ...previous,
      meta_fields: [...previous.meta_fields, field],
    }))
  }

  const updateMetaField = (id: string, patch: Partial<MetaField>) => {
    setForm((previous) => ({
      ...previous,
      meta_fields: previous.meta_fields.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }))
  }

  const removeMetaField = (id: string) => {
    setForm((previous) => ({
      ...previous,
      meta_fields: previous.meta_fields.filter((item) => item.id !== id),
    }))
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
        <span className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600'>
          <Braces className='size-5' />
        </span>
        <div>
          <h3 className='text-sm font-semibold text-slate-900'>Gelişmiş Meta Veri</h3>
          <p className='mt-1 text-xs leading-relaxed text-slate-500'>
          Anahtar–Değer çiftleri JSON olarak saklanır. Bu alanlar opsiyoneldir ve operasyon akışını etkilemez.
          </p>
        </div>
      </div>

      <div className='space-y-3'>
        {form.meta_fields.map((field, index) => (
          <div
            key={field.id}
            className='grid items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[auto_1fr_1fr_auto]'
          >
            <span className='flex size-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600'>
              {index + 1}
            </span>
            <Input
              placeholder='Anahtar (Örn. kampanya_kodu)'
              value={field.key}
              onChange={(event) => updateMetaField(field.id, { key: event.target.value })}
            />
            <Input
              placeholder='Değer'
              value={field.value}
              onChange={(event) => updateMetaField(field.id, { value: event.target.value })}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-9 text-slate-500 hover:text-rose-600'
              aria-label='Meta veri alanını sil'
              onClick={() => removeMetaField(field.id)}
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
        ))}
      </div>

      <div className='flex justify-center'>
        <Button type='button' variant='outline' onClick={addMetaField}>
          <Plus className='mr-2 size-4' />
          Yeni Alan Ekle
        </Button>
      </div>
    </div>
  )
}
