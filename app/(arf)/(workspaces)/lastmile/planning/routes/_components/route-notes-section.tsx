'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  createRouteNote,
  deleteRouteNote,
  fetchRouteNotes,
} from '../_api/routes-client'
import type { RouteNoteItem, RouteNoteVisibility } from '../_types/planning-route-detail'

const VISIBILITY_OPTIONS: { value: RouteNoteVisibility; label: string }[] = [
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'operation', label: 'Operasyon' },
  { value: 'everyone', label: 'Herkes' },
]

function formatNoteDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function visibilityLabel(value: RouteNoteVisibility): string {
  return VISIBILITY_OPTIONS.find((item) => item.value === value)?.label ?? value
}

type Props = {
  routeId: string
  demoNotes?: RouteNoteItem[]
  localOnly?: boolean
}

export function RouteNotesSection({ routeId, demoNotes = [], localOnly = false }: Props) {
  const [notes, setNotes] = useState<RouteNoteItem[]>(demoNotes)
  const [loading, setLoading] = useState(!localOnly)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState('')
  const [visibility, setVisibility] = useState<RouteNoteVisibility>('dispatcher')

  const loadNotes = useCallback(async () => {
    if (localOnly) {
      setNotes(demoNotes)
      setLoading(false)
      return
    }

    setLoading(true)
    const result = await fetchRouteNotes(routeId)
    setLoading(false)
    if (!result.success) {
      toast.error(result.error || 'Rota notları yüklenemedi.')
      return
    }
    setNotes(result.data.items)
  }, [demoNotes, localOnly, routeId])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  const handleCreate = async () => {
    const note = draft.trim()
    if (!note) return

    if (localOnly) {
      setNotes((prev) => [
        {
          id: `local-${Date.now()}`,
          note,
          visibility,
          authorName: 'Siz',
          createdUserId: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
      setDraft('')
      return
    }

    setSubmitting(true)
    const result = await createRouteNote({ routeId, note, visibility })
    setSubmitting(false)
    if (!result.success) {
      toast.error(result.error || 'Not eklenemedi.')
      return
    }
    setDraft('')
    setNotes((prev) => [result.data, ...prev])
    toast.success('Not eklendi')
  }

  const handleDelete = async (noteId: string) => {
    if (localOnly) {
      setNotes((prev) => prev.filter((item) => item.id !== noteId))
      return
    }

    const result = await deleteRouteNote(noteId)
    if (!result.success) {
      toast.error(result.error || 'Not silinemedi.')
      return
    }
    setNotes((prev) => prev.filter((item) => item.id !== noteId))
    toast.success('Not silindi')
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-slate-200 bg-slate-50/60 p-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
          <div className='min-w-0 flex-1 space-y-2'>
            <label className='text-xs font-medium text-slate-600'>Yeni rota notu</label>
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder='Operasyon veya dispatcher notu…'
              rows={3}
            />
          </div>
          <div className='flex w-full flex-col gap-2 sm:w-44'>
            <label className='text-xs font-medium text-slate-600'>Görünürlük</label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as RouteNoteVisibility)}
            >
              <SelectTrigger className='h-10 bg-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              className='h-10'
              disabled={submitting || !draft.trim()}
              onClick={() => void handleCreate()}
            >
              {submitting ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : (
                <Send className='mr-2 size-4' />
              )}
              Not Ekle
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center gap-2 py-10 text-sm text-slate-500'>
          <Loader2 className='size-4 animate-spin' />
          Notlar yükleniyor…
        </div>
      ) : notes.length === 0 ? (
        <p className='rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500'>
          Henüz rota notu yok
        </p>
      ) : (
        <ul className='space-y-3'>
          {notes.map((item) => (
            <li
              key={item.id}
              className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
            >
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-sm font-medium text-slate-900'>
                      {item.authorName}
                    </span>
                    <Badge variant='outline' className='text-[10px]'>
                      {visibilityLabel(item.visibility)}
                    </Badge>
                  </div>
                  <p className='mt-2 whitespace-pre-wrap text-sm text-slate-700'>{item.note}</p>
                  <p className='mt-2 text-xs text-slate-500'>{formatNoteDate(item.createdAt)}</p>
                </div>
                {!localOnly ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-8 text-rose-600 hover:text-rose-700'
                    onClick={() => void handleDelete(item.id)}
                    aria-label='Notu sil'
                  >
                    <Trash2 className='size-4' />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
