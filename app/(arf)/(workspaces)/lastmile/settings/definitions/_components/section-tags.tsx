'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Tags as TagsIcon,
  Trash2,
  X,
} from 'lucide-react'
import { TAG_USAGE_LABELS } from '../_types/definitions'
import type { OperationalTag, TagUsage } from '../_types/definitions'

type Props = {
  tags: OperationalTag[]
  onUpsert: (tag: OperationalTag) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
}

const USAGE_OPTIONS: TagUsage[] = ['order', 'customer', 'courier']

const COLOR_PRESETS: Array<{ color: string; textColor: string; label: string }> = [
  { color: '#FEF3C7', textColor: '#92400E', label: 'Amber' },
  { color: '#E0E7FF', textColor: '#3730A3', label: 'İndigo' },
  { color: '#FCE7F3', textColor: '#9D174D', label: 'Pembe' },
  { color: '#FFEDD5', textColor: '#9A3412', label: 'Turuncu' },
  { color: '#FEE2E2', textColor: '#991B1B', label: 'Kırmızı' },
  { color: '#D1FAE5', textColor: '#065F46', label: 'Yeşil' },
  { color: '#DBEAFE', textColor: '#1E40AF', label: 'Mavi' },
  { color: '#F3E8FF', textColor: '#6B21A8', label: 'Mor' },
  { color: '#E2E8F0', textColor: '#334155', label: 'Gri' },
]

function createTagId() {
  return `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

type TagFormValues = {
  name: string
  color: string
  textColor: string
  usages: TagUsage[]
}

function buildEmptyValues(): TagFormValues {
  return {
    name: '',
    color: COLOR_PRESETS[0].color,
    textColor: COLOR_PRESETS[0].textColor,
    usages: ['order'],
  }
}

function tagToValues(tag: OperationalTag): TagFormValues {
  return {
    name: tag.name,
    color: tag.color,
    textColor: tag.textColor,
    usages: [...tag.usages],
  }
}

type TagModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTag: OperationalTag | null
  onSubmit: (tag: OperationalTag) => void
}

function TagModal({ open, onOpenChange, initialTag, onSubmit }: TagModalProps) {
  const isEdit = Boolean(initialTag)
  const [values, setValues] = useState<TagFormValues>(buildEmptyValues())
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(initialTag ? tagToValues(initialTag) : buildEmptyValues())
    setShowValidation(false)
  }, [initialTag, open])

  const nameError = values.name.trim() ? null : 'Etiket adı zorunludur'
  const usageError = values.usages.length > 0 ? null : 'En az bir kullanım alanı seçin'

  const toggleUsage = (usage: TagUsage) => {
    setValues((previous) => ({
      ...previous,
      usages: previous.usages.includes(usage)
        ? previous.usages.filter((item) => item !== usage)
        : [...previous.usages, usage],
    }))
  }

  const handleSave = () => {
    setShowValidation(true)
    if (nameError || usageError) return

    onSubmit({
      id: initialTag?.id ?? createTagId(),
      name: values.name.trim(),
      color: values.color,
      textColor: values.textColor,
      usages: values.usages,
      active: initialTag?.active ?? true,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className='max-h-[92vh] overflow-y-auto rounded-[28px] border-0 p-0 shadow-2xl sm:max-w-lg!'
      >
        <DialogHeader className='space-y-0'>
          <div className='relative overflow-hidden rounded-t-[28px] border-2 border-b-0 border-lime-400 bg-slate-950 px-5 pt-5 pb-6 text-white'>
            <div
              aria-hidden
              className='pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-lime-300/20 blur-3xl'
            />
            <div className='relative flex items-start justify-between gap-3'>
              <div>
                <DialogTitle className='text-2xl font-semibold tracking-tight text-white'>
                  {isEdit ? 'Etiketi Düzenle' : 'Yeni Etiket'}
                </DialogTitle>
                <p className='mt-1.5 text-sm text-white/60'>
                  Sipariş, müşteri ve kurye kayıtlarında görünecek etiketi tanımlayın.
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
            <label htmlFor='tag-name' className='text-sm font-medium text-slate-700'>
              Etiket Adı <span className='text-rose-500'>*</span>
            </label>
            <Input
              id='tag-name'
              value={values.name}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, name: event.target.value }))
              }
              placeholder='Örn: Kırılabilir'
            />
            {showValidation && nameError ? (
              <p className='text-xs font-medium text-rose-600'>{nameError}</p>
            ) : null}
          </div>

          <div className='space-y-1.5'>
            <span className='text-sm font-medium text-slate-700'>Renk</span>
            <div className='flex flex-wrap gap-2'>
              {COLOR_PRESETS.map((preset) => {
                const isSelected = values.color === preset.color
                return (
                  <button
                    key={preset.color}
                    type='button'
                    title={preset.label}
                    onClick={() =>
                      setValues((previous) => ({
                        ...previous,
                        color: preset.color,
                        textColor: preset.textColor,
                      }))
                    }
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full border-2 transition-transform',
                      isSelected
                        ? 'border-slate-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: preset.color }}
                  >
                    {isSelected ? (
                      <span
                        className='size-2 rounded-full'
                        style={{ backgroundColor: preset.textColor }}
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>
            <span
              className='mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium'
              style={{ backgroundColor: values.color, color: values.textColor }}
            >
              {values.name.trim() || 'Önizleme'}
            </span>
          </div>

          <div className='space-y-1.5'>
            <span className='text-sm font-medium text-slate-700'>
              Kullanım Alanları <span className='text-rose-500'>*</span>
            </span>
            <div className='flex flex-wrap gap-2'>
              {USAGE_OPTIONS.map((usage) => {
                const isActive = values.usages.includes(usage)
                return (
                  <button
                    key={usage}
                    type='button'
                    onClick={() => toggleUsage(usage)}
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {TAG_USAGE_LABELS[usage]}
                  </button>
                )
              })}
            </div>
            {showValidation && usageError ? (
              <p className='text-xs font-medium text-rose-600'>{usageError}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className='gap-2 border-t border-slate-100 px-5 py-4 sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Vazgeç
            </Button>
          </DialogClose>
          <Button type='button' onClick={handleSave}>
            {isEdit ? 'Kaydet' : 'Etiket Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SectionTags({ tags, onUpsert, onDelete, onToggleActive }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<OperationalTag | null>(null)

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name, 'tr')),
    [tags]
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-slate-900'>Etiketler</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Sipariş, müşteri ve kurye kayıtlarında kullanılan operasyonel etiketler.
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={() => {
            setEditingTag(null)
            setModalOpen(true)
          }}
        >
          <Plus className='mr-2 size-4' />
          Etiket Ekle
        </Button>
      </div>

      {sortedTags.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400'>
          <TagsIcon className='mx-auto mb-2 size-5 text-slate-300' />
          Henüz etiket tanımlanmadı.
        </div>
      ) : (
        <ul className='divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white'>
          {sortedTags.map((tag) => (
            <li key={tag.id} className='flex items-center justify-between gap-4 px-4 py-3.5'>
              <div className='flex min-w-0 items-center gap-3'>
                <span
                  className='inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium'
                  style={{ backgroundColor: tag.color, color: tag.textColor }}
                >
                  {tag.name}
                </span>
                <div className='flex flex-wrap items-center gap-1.5'>
                  {tag.usages.map((usage) => (
                    <Badge
                      key={usage}
                      variant='outline'
                      className='rounded-md border-slate-200 bg-slate-50 px-1.5 py-0 text-[11px] font-medium text-slate-500 shadow-none'
                    >
                      {TAG_USAGE_LABELS[usage]}
                    </Badge>
                  ))}
                  {!tag.active ? (
                    <Badge
                      variant='outline'
                      className='rounded-md border-slate-200 bg-slate-100 px-1.5 py-0 text-[11px] font-medium text-slate-500 shadow-none'
                    >
                      Pasif
                    </Badge>
                  ) : null}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8 shrink-0 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium'
                  >
                    İşlemler
                    <ChevronDown className='ml-1 size-3.5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-52'>
                  <DropdownMenuLabel className='truncate'>{tag.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditingTag(tag)
                      setModalOpen(true)
                    }}
                  >
                    <Pencil className='mr-2 size-4' />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onToggleActive(tag.id, !tag.active)}
                    className={
                      tag.active
                        ? 'text-amber-700 focus:bg-amber-50 focus:text-amber-800'
                        : 'text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800'
                    }
                  >
                    {tag.active ? (
                      <>
                        <PauseCircle className='mr-2 size-4' />
                        Pasife Al
                      </>
                    ) : (
                      <>
                        <PlayCircle className='mr-2 size-4' />
                        Aktifleştir
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onDelete(tag.id)}
                    className='text-rose-700 focus:bg-rose-50 focus:text-rose-700'
                  >
                    <Trash2 className='mr-2 size-4' />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      <TagModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingTag(null)
        }}
        initialTag={editingTag}
        onSubmit={onUpsert}
      />
    </div>
  )
}
