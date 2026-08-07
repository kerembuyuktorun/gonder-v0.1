'use client'

import { useEffect, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Mail, MessageSquareText, Pencil, X } from 'lucide-react'
import type { NotificationChannel, NotificationTemplate } from '../_types/definitions'

type Props = {
  templates: NotificationTemplate[]
  onUpsert: (template: NotificationTemplate) => void
}

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  sms: 'SMS',
  email: 'E-posta',
}

const CHANNEL_ICONS: Record<NotificationChannel, typeof Mail> = {
  sms: MessageSquareText,
  email: Mail,
}

const CHANNEL_BADGE_CLASS: Record<NotificationChannel, string> = {
  sms: 'border-sky-200 bg-sky-50 text-sky-700',
  email: 'border-violet-200 bg-violet-50 text-violet-700',
}

type TemplateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: NotificationTemplate | null
  onSubmit: (template: NotificationTemplate) => void
}

function TemplateModal({ open, onOpenChange, template, onSubmit }: TemplateModalProps) {
  const [body, setBody] = useState('')
  const [active, setActive] = useState(true)
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    if (!open || !template) return
    setBody(template.body)
    setActive(template.active)
    setShowValidation(false)
  }, [open, template])

  if (!template) return null

  const bodyError = body.trim() ? null : 'Şablon içeriği boş olamaz'

  const handleSave = () => {
    setShowValidation(true)
    if (bodyError) return
    onSubmit({ ...template, body: body.trim(), active })
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
                  Şablonu Düzenle
                </DialogTitle>
                <p className='mt-1.5 text-sm text-white/60'>
                  {template.eventLabel} · {CHANNEL_LABELS[template.channel]}
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
            <label htmlFor='template-body' className='text-sm font-medium text-slate-700'>
              Şablon İçeriği <span className='text-rose-500'>*</span>
            </label>
            <Textarea
              id='template-body'
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              className='resize-none font-mono text-sm'
            />
            {showValidation && bodyError ? (
              <p className='text-xs font-medium text-rose-600'>{bodyError}</p>
            ) : (
              <p className='text-xs text-slate-400'>
                Değişkenler için çift süslü parantez kullanın, örn. {'{{alici_adi}}'}.
              </p>
            )}
          </div>

          <div className='flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3'>
            <div>
              <p className='text-sm font-medium text-slate-800'>Şablon Aktif</p>
              <p className='text-xs text-slate-500'>Kapatılırsa bu olay için bildirim gönderilmez.</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter className='gap-2 border-t border-slate-100 px-5 py-4 sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Vazgeç
            </Button>
          </DialogClose>
          <Button type='button' onClick={handleSave}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SectionTemplates({ templates, onUpsert }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-base font-semibold text-slate-900'>Bildirim Şablonları</h2>
        <p className='mt-1 text-sm text-slate-500'>
          Sipariş olayları için gönderilen SMS ve e-posta içeriklerini düzenleyin.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400'>
          Henüz şablon tanımlanmadı.
        </div>
      ) : (
        <ul className='divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white'>
          {templates.map((template) => {
            const Icon = CHANNEL_ICONS[template.channel]
            return (
              <li key={template.id} className='flex items-start justify-between gap-4 px-4 py-3.5'>
                <div className='flex min-w-0 items-start gap-3'>
                  <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
                    <Icon className='size-4' />
                  </span>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-sm font-semibold text-slate-900'>
                        {template.eventLabel}
                      </span>
                      <Badge
                        variant='outline'
                        className={`rounded-md px-1.5 py-0 text-[11px] font-medium shadow-none ${CHANNEL_BADGE_CLASS[template.channel]}`}
                      >
                        {CHANNEL_LABELS[template.channel]}
                      </Badge>
                      {!template.active ? (
                        <Badge
                          variant='outline'
                          className='rounded-md border-slate-200 bg-slate-100 px-1.5 py-0 text-[11px] font-medium text-slate-500 shadow-none'
                        >
                          Pasif
                        </Badge>
                      ) : null}
                    </div>
                    <p className='mt-1 line-clamp-2 max-w-xl text-xs text-slate-500'>
                      {template.body}
                    </p>
                  </div>
                </div>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8 shrink-0 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium'
                  onClick={() => {
                    setEditingTemplate(template)
                    setModalOpen(true)
                  }}
                >
                  <Pencil className='mr-1.5 size-3.5' />
                  Düzenle
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <TemplateModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingTemplate(null)
        }}
        template={editingTemplate}
        onSubmit={onUpsert}
      />
    </div>
  )
}
