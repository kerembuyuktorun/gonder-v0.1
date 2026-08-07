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
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'
import { REASON_KIND_LABELS } from '../_types/definitions'
import type { ReasonCode, ReasonKind } from '../_types/definitions'

type Props = {
  reasons: ReasonCode[]
  onUpsert: (reason: ReasonCode) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
}

const KIND_OPTIONS: ReasonKind[] = ['undelivered', 'cancel']

function createReasonId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function nextSortOrder(reasons: ReasonCode[], kind: ReasonKind) {
  const scoped = reasons.filter((reason) => reason.kind === kind)
  if (scoped.length === 0) return 1
  return Math.max(...scoped.map((reason) => reason.sortOrder)) + 1
}

type ReasonFormValues = {
  label: string
  kind: ReasonKind
}

type ReasonModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialReason: ReasonCode | null
  defaultKind: ReasonKind
  reasons: ReasonCode[]
  onSubmit: (reason: ReasonCode) => void
}

function ReasonModal({
  open,
  onOpenChange,
  initialReason,
  defaultKind,
  reasons,
  onSubmit,
}: ReasonModalProps) {
  const isEdit = Boolean(initialReason)
  const [values, setValues] = useState<ReasonFormValues>({ label: '', kind: defaultKind })
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(
      initialReason
        ? { label: initialReason.label, kind: initialReason.kind }
        : { label: '', kind: defaultKind }
    )
    setShowValidation(false)
  }, [defaultKind, initialReason, open])

  const labelError = values.label.trim() ? null : 'Neden metni zorunludur'

  const handleSave = () => {
    setShowValidation(true)
    if (labelError) return

    onSubmit({
      id: initialReason?.id ?? createReasonId(),
      kind: values.kind,
      label: values.label.trim(),
      active: initialReason?.active ?? true,
      sortOrder: initialReason?.sortOrder ?? nextSortOrder(reasons, values.kind),
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
                  {isEdit ? 'Nedeni Düzenle' : 'Yeni Neden Kodu'}
                </DialogTitle>
                <p className='mt-1.5 text-sm text-white/60'>
                  Kurye uygulamasında gösterilecek ret / iptal nedeni.
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
            <span className='text-sm font-medium text-slate-700'>Tür</span>
            <div className='flex flex-wrap gap-2'>
              {KIND_OPTIONS.map((kind) => {
                const isActive = values.kind === kind
                return (
                  <button
                    key={kind}
                    type='button'
                    disabled={isEdit}
                    onClick={() => setValues((previous) => ({ ...previous, kind }))}
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {REASON_KIND_LABELS[kind]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-1.5'>
            <label htmlFor='reason-label' className='text-sm font-medium text-slate-700'>
              Neden Metni <span className='text-rose-500'>*</span>
            </label>
            <Input
              id='reason-label'
              value={values.label}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, label: event.target.value }))
              }
              placeholder='Örn: Müşteri adreste bulunamadı'
            />
            {showValidation && labelError ? (
              <p className='text-xs font-medium text-rose-600'>{labelError}</p>
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
            {isEdit ? 'Kaydet' : 'Neden Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SectionReasons({ reasons, onUpsert, onDelete, onToggleActive }: Props) {
  const [kindFilter, setKindFilter] = useState<ReasonKind>('undelivered')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingReason, setEditingReason] = useState<ReasonCode | null>(null)

  const counts = useMemo(
    () => ({
      undelivered: reasons.filter((reason) => reason.kind === 'undelivered').length,
      cancel: reasons.filter((reason) => reason.kind === 'cancel').length,
    }),
    [reasons]
  )

  const visibleReasons = useMemo(
    () =>
      reasons
        .filter((reason) => reason.kind === kindFilter)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [reasons, kindFilter]
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-slate-900'>Ret / İptal Kodları</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Kurye uygulamasında gösterilen teslim edilemedi ve iptal nedenleri.
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={() => {
            setEditingReason(null)
            setModalOpen(true)
          }}
        >
          <Plus className='mr-2 size-4' />
          Neden Ekle
        </Button>
      </div>

      <div className='inline-flex h-8 flex-wrap items-center gap-1'>
        {KIND_OPTIONS.map((kind) => {
          const isActive = kindFilter === kind
          return (
            <button
              key={kind}
              type='button'
              onClick={() => setKindFilter(kind)}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span>{REASON_KIND_LABELS[kind]}</span>
              <span
                className={cn(
                  'rounded-sm px-1.5 py-0.5 text-[11px] tabular-nums leading-none',
                  isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                {counts[kind]}
              </span>
            </button>
          )
        })}
      </div>

      {visibleReasons.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400'>
          <TriangleAlert className='mx-auto mb-2 size-5 text-slate-300' />
          Bu tür için tanımlı neden yok.
        </div>
      ) : (
        <ul className='divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white'>
          {visibleReasons.map((reason) => (
            <li
              key={reason.id}
              className='flex items-center justify-between gap-4 px-4 py-3.5'
            >
              <div className='flex min-w-0 items-center gap-3'>
                <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500 tabular-nums'>
                  {reason.sortOrder}
                </span>
                <span className='truncate text-sm font-medium text-slate-800'>
                  {reason.label}
                </span>
                {!reason.active ? (
                  <Badge
                    variant='outline'
                    className='rounded-md border-slate-200 bg-slate-100 px-1.5 py-0 text-[11px] font-medium text-slate-500 shadow-none'
                  >
                    Pasif
                  </Badge>
                ) : null}
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
                  <DropdownMenuLabel className='truncate'>{reason.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditingReason(reason)
                      setModalOpen(true)
                    }}
                  >
                    <Pencil className='mr-2 size-4' />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onToggleActive(reason.id, !reason.active)}
                    className={
                      reason.active
                        ? 'text-amber-700 focus:bg-amber-50 focus:text-amber-800'
                        : 'text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800'
                    }
                  >
                    {reason.active ? (
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
                    onSelect={() => onDelete(reason.id)}
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

      <ReasonModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingReason(null)
        }}
        initialReason={editingReason}
        defaultKind={kindFilter}
        reasons={reasons}
        onSubmit={onUpsert}
      />
    </div>
  )
}
