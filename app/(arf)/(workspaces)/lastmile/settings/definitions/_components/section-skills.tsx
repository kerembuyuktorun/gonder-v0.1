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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Hash,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import type { RoutingSkill } from '../_types/definitions'

type SkillAppliesTo = RoutingSkill['appliesTo'][number]

type Props = {
  skills: RoutingSkill[]
  onUpsert: (skill: RoutingSkill) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
}

const APPLIES_TO_OPTIONS: SkillAppliesTo[] = ['order', 'vehicle', 'courier']
const APPLIES_TO_LABELS: Record<SkillAppliesTo, string> = {
  order: 'Sipariş',
  vehicle: 'Araç',
  courier: 'Kurye',
}

function createSkillId() {
  return `sk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function nextVroomSkillId(skills: RoutingSkill[]) {
  if (skills.length === 0) return 1
  return Math.max(...skills.map((skill) => skill.vroomSkillId)) + 1
}

type SkillFormValues = {
  name: string
  description: string
  appliesTo: SkillAppliesTo[]
}

function buildEmptyValues(): SkillFormValues {
  return { name: '', description: '', appliesTo: ['order'] }
}

function skillToValues(skill: RoutingSkill): SkillFormValues {
  return {
    name: skill.name,
    description: skill.description,
    appliesTo: [...skill.appliesTo],
  }
}

type SkillModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSkill: RoutingSkill | null
  nextId: number
  onSubmit: (skill: RoutingSkill) => void
}

function SkillModal({ open, onOpenChange, initialSkill, nextId, onSubmit }: SkillModalProps) {
  const isEdit = Boolean(initialSkill)
  const [values, setValues] = useState<SkillFormValues>(buildEmptyValues())
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(initialSkill ? skillToValues(initialSkill) : buildEmptyValues())
    setShowValidation(false)
  }, [initialSkill, open])

  const nameError = values.name.trim() ? null : 'Yetkinlik adı zorunludur'
  const appliesToError = values.appliesTo.length > 0 ? null : 'En az bir kapsam seçin'

  const toggleAppliesTo = (value: SkillAppliesTo) => {
    setValues((previous) => ({
      ...previous,
      appliesTo: previous.appliesTo.includes(value)
        ? previous.appliesTo.filter((item) => item !== value)
        : [...previous.appliesTo, value],
    }))
  }

  const handleSave = () => {
    setShowValidation(true)
    if (nameError || appliesToError) return

    onSubmit({
      id: initialSkill?.id ?? createSkillId(),
      name: values.name.trim(),
      description: values.description.trim(),
      vroomSkillId: initialSkill?.vroomSkillId ?? nextId,
      appliesTo: values.appliesTo,
      active: initialSkill?.active ?? true,
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
                  {isEdit ? 'Yetkinliği Düzenle' : 'Yeni Yetkinlik'}
                </DialogTitle>
                <p className='mt-1.5 text-sm text-white/60'>
                  Rotalama motorunun eşleştireceği sipariş / araç / kurye yetkinliği.
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
            <label htmlFor='skill-name' className='text-sm font-medium text-slate-700'>
              Yetkinlik Adı <span className='text-rose-500'>*</span>
            </label>
            <Input
              id='skill-name'
              value={values.name}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, name: event.target.value }))
              }
              placeholder='Örn: Soğuk Zincir'
            />
            {showValidation && nameError ? (
              <p className='text-xs font-medium text-rose-600'>{nameError}</p>
            ) : null}
          </div>

          <div className='space-y-1.5'>
            <label htmlFor='skill-description' className='text-sm font-medium text-slate-700'>
              Açıklama
            </label>
            <Textarea
              id='skill-description'
              value={values.description}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, description: event.target.value }))
              }
              placeholder='Bu yetkinliğin ne için kullanıldığını kısaca açıklayın.'
              rows={3}
              className='resize-none'
            />
          </div>

          <div className='space-y-1.5'>
            <span className='text-sm font-medium text-slate-700'>
              Kapsam <span className='text-rose-500'>*</span>
            </span>
            <div className='flex flex-wrap gap-2'>
              {APPLIES_TO_OPTIONS.map((option) => {
                const isActive = values.appliesTo.includes(option)
                return (
                  <button
                    key={option}
                    type='button'
                    onClick={() => toggleAppliesTo(option)}
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {APPLIES_TO_LABELS[option]}
                  </button>
                )
              })}
            </div>
            {showValidation && appliesToError ? (
              <p className='text-xs font-medium text-rose-600'>{appliesToError}</p>
            ) : null}
          </div>

          <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-500'>
            <Hash className='size-3.5 shrink-0' />
            VROOM Skill ID: <span className='font-mono font-semibold text-slate-700'>
              {initialSkill?.vroomSkillId ?? nextId}
            </span>
            <span className='ml-auto text-slate-400'>Otomatik atanır</span>
          </div>
        </div>

        <DialogFooter className='gap-2 border-t border-slate-100 px-5 py-4 sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Vazgeç
            </Button>
          </DialogClose>
          <Button type='button' onClick={handleSave}>
            {isEdit ? 'Kaydet' : 'Yetkinlik Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SectionSkills({ skills, onUpsert, onDelete, onToggleActive }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<RoutingSkill | null>(null)

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => a.vroomSkillId - b.vroomSkillId),
    [skills]
  )
  const nextId = useMemo(() => nextVroomSkillId(skills), [skills])

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-slate-900'>Yetkinlikler</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Rotalama motorunun sipariş, araç ve kurye eşleşmesinde kullandığı yetkinlik seti.
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={() => {
            setEditingSkill(null)
            setModalOpen(true)
          }}
        >
          <Plus className='mr-2 size-4' />
          Yetkinlik Ekle
        </Button>
      </div>

      {sortedSkills.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400'>
          <Sparkles className='mx-auto mb-2 size-5 text-slate-300' />
          Henüz yetkinlik tanımlanmadı.
        </div>
      ) : (
        <ul className='divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white'>
          {sortedSkills.map((skill) => (
            <li key={skill.id} className='flex items-center justify-between gap-4 px-4 py-3.5'>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-semibold text-slate-900'>{skill.name}</span>
                  <Badge
                    variant='outline'
                    className='rounded-md border-slate-200 bg-slate-50 px-1.5 py-0 font-mono text-[11px] font-medium text-slate-500 shadow-none'
                  >
                    #{skill.vroomSkillId}
                  </Badge>
                  {!skill.active ? (
                    <Badge
                      variant='outline'
                      className='rounded-md border-slate-200 bg-slate-100 px-1.5 py-0 text-[11px] font-medium text-slate-500 shadow-none'
                    >
                      Pasif
                    </Badge>
                  ) : null}
                </div>
                {skill.description ? (
                  <p className='mt-1 truncate text-xs text-slate-500'>{skill.description}</p>
                ) : null}
                <div className='mt-1.5 flex flex-wrap gap-1.5'>
                  {skill.appliesTo.map((scope) => (
                    <Badge
                      key={scope}
                      variant='outline'
                      className='rounded-md border-sky-200 bg-sky-50 px-1.5 py-0 text-[11px] font-medium text-sky-700 shadow-none'
                    >
                      {APPLIES_TO_LABELS[scope]}
                    </Badge>
                  ))}
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
                  <DropdownMenuLabel className='truncate'>{skill.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditingSkill(skill)
                      setModalOpen(true)
                    }}
                  >
                    <Pencil className='mr-2 size-4' />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onToggleActive(skill.id, !skill.active)}
                    className={
                      skill.active
                        ? 'text-amber-700 focus:bg-amber-50 focus:text-amber-800'
                        : 'text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800'
                    }
                  >
                    {skill.active ? (
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
                    onSelect={() => onDelete(skill.id)}
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

      <SkillModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingSkill(null)
        }}
        initialSkill={editingSkill}
        nextId={nextId}
        onSubmit={onUpsert}
      />
    </div>
  )
}
