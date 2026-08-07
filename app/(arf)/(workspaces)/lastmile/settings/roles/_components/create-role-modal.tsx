'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ShieldCheck, X } from 'lucide-react'
import type { LastmileRole, RoleDetail } from '../_types/role'

export type RoleFormValues = {
  name: string
  description: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: RoleFormValues) => Promise<void>
  mode?: 'create' | 'edit'
  initialRole?: RoleDetail | null
  existingRoles?: LastmileRole[]
}

function buildEmptyValues(): RoleFormValues {
  return { name: '', description: '' }
}

function roleDetailToValues(role: RoleDetail): RoleFormValues {
  return {
    name: role.name,
    description: role.description ?? '',
  }
}

export function CreateRoleModal({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialRole = null,
  existingRoles = [],
}: Props) {
  const [values, setValues] = useState<RoleFormValues>(buildEmptyValues())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    setValues(isEdit && initialRole ? roleDetailToValues(initialRole) : buildEmptyValues())
    setIsSubmitting(false)
    setShowValidation(false)
    setSubmitError(null)
    setCreateSuccess(false)
  }, [initialRole, isEdit, open])

  const nameError = useMemo(() => {
    const trimmed = values.name.trim()
    if (!trimmed) return 'Rol adı zorunludur'
    const nameKey = trimmed.toLocaleLowerCase('tr-TR')
    const isDuplicate = existingRoles.some(
      (role) =>
        role.id !== initialRole?.id &&
        role.name.trim().toLocaleLowerCase('tr-TR') === nameKey
    )
    if (isDuplicate) return 'Bu isimde bir rol zaten var'
    return null
  }, [existingRoles, initialRole?.id, values.name])

  const handleSave = async () => {
    setShowValidation(true)
    setSubmitError(null)
    if (nameError) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: values.name.trim().replace(/\s+/g, ' '),
        description: values.description.trim(),
      })
      if (isEdit) {
        onOpenChange(false)
      } else {
        setCreateSuccess(true)
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Rol kaydedilemedi. Lütfen tekrar deneyin.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className='max-h-[92vh] overflow-y-auto rounded-[28px] border-0 p-0 shadow-2xl sm:max-w-lg!'
      >
        {createSuccess ? (
          <div className='px-6 py-12 text-center'>
            <span className='mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'>
              <ShieldCheck className='size-6' />
            </span>
            <h2 className='mt-4 text-xl font-semibold tracking-tight text-slate-900'>
              Rol oluşturuldu
            </h2>
            <p className='mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500'>
              <span className='font-medium text-slate-800'>{values.name}</span> rolü kaydedildi.
              Yetkileri rol detayındaki <span className='font-medium text-slate-700'>Yetki Düzenleme</span>{' '}
              sekmesinden tanımlayabilirsiniz.
            </p>
            <Button type='button' className='mt-6' onClick={() => onOpenChange(false)}>
              Listeye Dön
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className='space-y-0'>
              <div className='relative overflow-hidden rounded-t-[28px] border-2 border-b-0 border-lime-400 bg-slate-950 px-5 pt-5 pb-6 text-white'>
                <div
                  aria-hidden
                  className='pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-lime-300/20 blur-3xl'
                />
                <div
                  aria-hidden
                  className='pointer-events-none absolute -bottom-20 left-10 size-40 rounded-full bg-sky-400/15 blur-3xl'
                />
                <div className='relative flex items-start justify-between gap-3'>
                  <div>
                    <DialogTitle className='text-2xl font-semibold tracking-tight text-white'>
                      {isEdit ? 'Rolü Düzenle' : 'Yeni Rol Oluştur'}
                    </DialogTitle>
                    <p className='mt-1.5 text-sm text-white/60'>
                      {isEdit
                        ? 'Rol adı ve açıklamasını güncelleyin.'
                        : 'Önce rolü tanımlayın; yetkileri detay sayfasından ekleyin.'}
                    </p>
                  </div>
                  <DialogClose asChild>
                    <button
                      type='button'
                      className='inline-flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
                      aria-label='Kapat'
                    >
                      <X className='size-5' />
                    </button>
                  </DialogClose>
                </div>
              </div>
            </DialogHeader>

            <div className='grid gap-4 px-5 pt-5 pb-2'>
              <div className='space-y-1.5'>
                <label htmlFor='role-name' className='text-sm font-medium text-slate-700'>
                  Rol Adı <span className='text-rose-500'>*</span>
                </label>
                <Input
                  id='role-name'
                  value={values.name}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder='Örn: Bölge Operasyon Sorumlusu'
                />
                {showValidation && nameError ? (
                  <p className='text-xs font-medium text-rose-600'>{nameError}</p>
                ) : (
                  <p className='text-xs text-slate-400'>
                    Kullanıcı listesinde ve rol seçimlerinde görünecek isim.
                  </p>
                )}
              </div>

              <div className='space-y-1.5'>
                <label htmlFor='role-description' className='text-sm font-medium text-slate-700'>
                  Açıklama
                </label>
                <Textarea
                  id='role-description'
                  value={values.description}
                  onChange={(event) =>
                    setValues((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder='Bu rolün sorumluluk alanını kısaca tanımlayın.'
                  rows={3}
                  className='resize-none'
                />
                <p className='text-xs text-slate-400'>İsteğe bağlı.</p>
              </div>

              {!isEdit ? (
                <p className='rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-500'>
                  Yetki matrisi bu adımda yok. Rol oluşturulduktan sonra detay sayfasındaki{' '}
                  <span className='font-medium text-slate-700'>Yetki Düzenleme</span> sekmesinden
                  tanımlanır.
                </p>
              ) : null}

              {submitError ? (
                <p className='text-sm font-medium text-rose-600' role='alert'>
                  {submitError}
                </p>
              ) : null}
            </div>

            <DialogFooter className='gap-2 border-t border-slate-100 px-5 py-4 sm:justify-end'>
              <DialogClose asChild>
                <Button type='button' variant='outline' disabled={isSubmitting}>
                  Vazgeç
                </Button>
              </DialogClose>
              <Button type='button' disabled={isSubmitting} onClick={handleSave}>
                {isSubmitting
                  ? 'Kaydediliyor...'
                  : isEdit
                    ? 'Kaydet'
                    : 'Rol Oluştur'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
