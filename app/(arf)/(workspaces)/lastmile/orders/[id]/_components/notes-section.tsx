'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Loader2,
  MessageSquare,
  Pencil,
  RefreshCw,
  Send,
  Smartphone,
  Users,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { getSession } from '../../../../../(auth)/_api/auth-client'
import {
  getDisplayNameFromUser,
  toSidebarUserView,
} from '../../../../../_shared/auth-me-user'
import {
  createOrderNote,
  fetchOrderNotes,
  updateOrderNote,
} from '../_api/order-detail'
import type {
  OrderNoteVisibility,
  OrderOperationNote,
} from '../_types/order-detail'

type Props = {
  /** API modunda zorunlu; localOnly iken gerekmez */
  orderId?: string
  kuryeNotu?: string
  legacyInternalNote?: string
  onCourierNoteCreated?: () => void
  /** Rota detay vb. — sipariş API’si yok; initial notlarla local state */
  localOnly?: boolean
  initialNotes?: OrderOperationNote[]
  initialCourierNotes?: OrderOperationNote[]
  /** false ise yalnızca Operasyon Notları (rota detay) */
  showCourierNotes?: boolean
}

const NOTE_VISIBILITY_ROLES = [
  { id: 'Dispatcher', label: 'Dispatcher' },
  { id: 'Manager', label: 'Manager' },
  { id: 'Admin', label: 'Admin' },
  { id: 'Developer', label: 'Developer' },
  { id: 'Operasyon', label: 'Operasyon' },
] as const

function formatNoteDate(value: string): string {
  if (!value) return ''
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

function formatVisibilityLabel(
  visibility: OrderNoteVisibility,
  roles: string[]
): string {
  if (visibility === 'everyone') return 'Herkes'
  if (roles.length === 0) return 'Rol seçin'
  if (roles.length === 1) return roles[0]!
  return `${roles.length} rol`
}

function canEditNote(
  note: OrderOperationNote,
  currentUserId: string,
  currentUserName: string,
  localOnly = false
): boolean {
  if (note.id.startsWith('legacy-')) return false
  if (localOnly && note.id.startsWith('local-')) return true
  if (currentUserId && note.createdById) return note.createdById === currentUserId
  if (currentUserName && note.author) {
    return note.author.trim().toLocaleLowerCase('tr-TR') ===
      currentUserName.trim().toLocaleLowerCase('tr-TR')
  }
  return localOnly
}

export function NotesSection({
  orderId = '',
  kuryeNotu = '',
  legacyInternalNote = '',
  onCourierNoteCreated,
  localOnly = false,
  initialNotes = [],
  initialCourierNotes = [],
  showCourierNotes = true,
}: Props) {
  const [notes, setNotes] = useState<OrderOperationNote[]>(() =>
    localOnly ? initialNotes : []
  )
  const [courierNotes, setCourierNotes] = useState<OrderOperationNote[]>(() =>
    localOnly ? initialCourierNotes : []
  )
  const [draft, setDraft] = useState('')
  const [courierDraft, setCourierDraft] = useState('')
  const [loading, setLoading] = useState(!localOnly)
  const [courierLoading, setCourierLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [courierSubmitting, setCourierSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserName, setCurrentUserName] = useState('Operasyon Ekibi')
  const [currentUserRole, setCurrentUserRole] = useState('')
  const [courierOpen, setCourierOpen] = useState(false)
  const [courierLoaded, setCourierLoaded] = useState(localOnly)
  const [expandedNoteIds, setExpandedNoteIds] = useState<Record<string, boolean>>({})
  const [visibility, setVisibility] = useState<OrderNoteVisibility>('everyone')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const visibilityLabel = useMemo(
    () => formatVisibilityLabel(visibility, selectedRoles),
    [visibility, selectedRoles]
  )

  const toggleNote = (noteId: string) => {
    if (editingNoteId === noteId) return
    setExpandedNoteIds((current) => ({
      ...current,
      [noteId]: !current[noteId],
    }))
  }

  const toggleRole = (roleId: string, checked: boolean) => {
    setVisibility('roles')
    setSelectedRoles((current) => {
      if (checked) {
        return current.includes(roleId) ? current : [...current, roleId]
      }
      return current.filter((role) => role !== roleId)
    })
  }

  const startEdit = (note: OrderOperationNote) => {
    setEditingNoteId(note.id)
    setEditDraft(note.note)
    setExpandedNoteIds((current) => ({ ...current, [note.id]: true }))
  }

  const cancelEdit = () => {
    setEditingNoteId(null)
    setEditDraft('')
  }

  const loadNotes = useCallback(async () => {
    if (localOnly) {
      setLoading(false)
      setLoadError(null)
      return
    }
    setLoading(true)
    setLoadError(null)
    const result = await fetchOrderNotes(orderId, 'INTERNAL')
    setLoading(false)

    if (!result.success) {
      setLoadError(result.error)
      return
    }
    setNotes(result.data)
  }, [localOnly, orderId])

  const loadCourierNotes = useCallback(async () => {
    if (localOnly) {
      setCourierLoading(false)
      setCourierLoaded(true)
      return
    }
    setCourierLoading(true)
    const result = await fetchOrderNotes(orderId, 'COURIER')
    setCourierLoading(false)
    setCourierLoaded(true)

    if (!result.success) {
      toast.error(result.error || 'Kurye notları yüklenemedi')
      return
    }
    setCourierNotes(result.data)
  }, [localOnly, orderId])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  useEffect(() => {
    if (localOnly) return
    if (!courierOpen || courierLoaded || courierLoading) return
    void loadCourierNotes()
  }, [courierOpen, courierLoaded, courierLoading, loadCourierNotes, localOnly])

  useEffect(() => {
    let cancelled = false
    void getSession().then((result) => {
      if (cancelled || !result.success) return
      const user = result.data?.user ?? null
      const id =
        typeof user?.id === 'string'
          ? user.id
          : typeof user?.userId === 'string'
            ? user.userId
            : ''
      setCurrentUserId(id)
      setCurrentUserName(getDisplayNameFromUser(user))
      setCurrentUserRole(toSidebarUserView(user).role)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const applyEditedNote = (updated: OrderOperationNote) => {
    if (updated.noteType === 'COURIER') {
      setCourierNotes((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      )
    } else {
      setNotes((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      )
    }
  }

  const handleSaveEdit = async (note: OrderOperationNote) => {
    const next = editDraft.trim()
    if (!next || editSaving) return
    if (next === note.note) {
      cancelEdit()
      return
    }

    if (localOnly) {
      applyEditedNote({ ...note, note: next })
      cancelEdit()
      toast.success('Not güncellendi')
      if (note.noteType === 'COURIER') onCourierNoteCreated?.()
      return
    }

    setEditSaving(true)
    const result = await updateOrderNote(note.id, next, note.noteType)
    setEditSaving(false)

    if (!result.success) {
      toast.error(result.error || 'Not güncellenemedi')
      return
    }

    const updated: OrderOperationNote = {
      ...note,
      ...(result.data ?? {}),
      note: result.data?.note || next,
      noteType: note.noteType,
      createdById: result.data?.createdById || note.createdById || currentUserId || undefined,
    }
    applyEditedNote(updated)
    cancelEdit()
    toast.success('Not güncellendi')
    if (note.noteType === 'COURIER') onCourierNoteCreated?.()
  }

  const handleSubmit = async () => {
    const note = draft.trim()
    if (!note || submitting) return

    if (visibility === 'roles' && selectedRoles.length === 0) {
      toast.error('En az bir rol seçin veya Herkes olarak gönderin')
      return
    }

    if (localOnly) {
      const created: OrderOperationNote = {
        id: `local-note-${Date.now()}`,
        note,
        author: currentUserName,
        role: currentUserRole || undefined,
        createdById: currentUserId || undefined,
        visibility,
        visibleRoles: visibility === 'roles' ? selectedRoles : undefined,
        createdAt: new Date().toISOString(),
        noteType: 'INTERNAL',
      }
      setNotes((current) => [...current, created])
      setExpandedNoteIds((current) => ({ ...current, [created.id]: true }))
      setDraft('')
      toast.success('Operasyon notu eklendi')
      return
    }

    setSubmitting(true)
    const result = await createOrderNote(orderId, note, 'INTERNAL')
    setSubmitting(false)

    if (!result.success) {
      toast.error(result.error || 'Not eklenemedi')
      return
    }

    setDraft('')
    toast.success('Operasyon notu eklendi')

    if (result.data) {
      const created: OrderOperationNote = {
        ...result.data,
        author:
          result.data.author && result.data.author !== 'Operasyon Ekibi'
            ? result.data.author
            : currentUserName,
        role: result.data.role || currentUserRole || undefined,
        createdById: result.data.createdById || currentUserId || undefined,
        visibility,
        visibleRoles: visibility === 'roles' ? selectedRoles : undefined,
        createdAt: result.data.createdAt || new Date().toISOString(),
      }
      setNotes((current) => [...current, created])
      setExpandedNoteIds((current) => ({ ...current, [created.id]: true }))
    } else {
      await loadNotes()
    }
  }

  const handleCourierSubmit = async () => {
    const note = courierDraft.trim()
    if (!note || courierSubmitting) return

    if (localOnly) {
      const created: OrderOperationNote = {
        id: `local-courier-note-${Date.now()}`,
        note,
        author: currentUserName,
        role: currentUserRole || undefined,
        createdById: currentUserId || undefined,
        createdAt: new Date().toISOString(),
        noteType: 'COURIER',
      }
      setCourierNotes((current) => [...current, created])
      setCourierDraft('')
      toast.success('Kurye notu gönderildi')
      onCourierNoteCreated?.()
      return
    }

    setCourierSubmitting(true)
    const result = await createOrderNote(orderId, note, 'COURIER')
    setCourierSubmitting(false)

    if (!result.success) {
      toast.error(result.error || 'Kurye notu eklenemedi')
      return
    }

    setCourierDraft('')
    toast.success('Kurye notu gönderildi')

    if (result.data) {
      const created: OrderOperationNote = {
        ...result.data,
        author:
          result.data.author && result.data.author !== 'Operasyon Ekibi'
            ? result.data.author
            : currentUserName,
        role: result.data.role || currentUserRole || undefined,
        createdById: result.data.createdById || currentUserId || undefined,
        noteType: 'COURIER',
        createdAt: result.data.createdAt || new Date().toISOString(),
      }
      setCourierNotes((current) => [...current, created])
    } else {
      await loadCourierNotes()
    }

    onCourierNoteCreated?.()
  }

  const visibleCourierNotes =
    courierNotes.length > 0
      ? courierNotes
      : kuryeNotu.trim()
        ? [
            {
              id: 'legacy-courier-note',
              note: kuryeNotu.trim(),
              author: 'Operasyon',
              createdAt: '',
              noteType: 'COURIER' as const,
            },
          ]
        : []

  const visibleNotes =
    notes.length > 0
      ? notes
      : legacyInternalNote.trim()
        ? [
            {
              id: 'legacy-internal-note',
              note: legacyInternalNote.trim(),
              author: 'Operasyon Ekibi',
              createdAt: '',
              noteType: 'INTERNAL' as const,
              visibility: 'everyone' as const,
            },
          ]
        : []

  const renderEditControls = (note: OrderOperationNote) => {
    if (editingNoteId !== note.id) return null
    return (
      <div className="space-y-2">
        <Textarea
          value={editDraft}
          onChange={(event) => setEditDraft(event.target.value.slice(0, 1000))}
          className="min-h-20 resize-none rounded-xl border-slate-200 bg-white text-sm"
          disabled={editSaving}
          autoFocus
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-xl px-3 text-xs"
            disabled={editSaving}
            onClick={cancelEdit}
          >
            <X className="size-3.5" />
            Vazgeç
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 rounded-xl px-3 text-xs"
            disabled={!editDraft.trim() || editSaving}
            onClick={() => void handleSaveEdit(note)}
          >
            {editSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Kaydet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={
          showCourierNotes && courierOpen
            ? 'grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)]'
            : 'grid gap-5'
        }
      >
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <MessageSquare className="size-4" />
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Operasyon Notları</h3>
                {visibleNotes.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {visibleNotes.length}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!loading && loadError ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-slate-500"
                  onClick={() => void loadNotes()}
                >
                  <RefreshCw className="size-3.5" />
                  Yenile
                </Button>
              ) : null}
              {showCourierNotes && !courierOpen ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-xl border-slate-200 bg-white px-3 text-xs text-slate-600 shadow-sm"
                  onClick={() => setCourierOpen(true)}
                >
                  <Smartphone className="size-3.5" />
                  Kurye Notları
                  <ChevronRight className="size-3.5 opacity-60" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="size-4 animate-spin" />
                Notlar yükleniyor…
              </div>
            ) : visibleNotes.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <MessageSquare className="size-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-700">Henüz operasyon notu yok</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  Ekip içi gelişmeleri ve önemli operasyon bilgilerini buradan paylaşın.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleNotes.map((note) => {
                  const expanded = Boolean(expandedNoteIds[note.id])
                  const editable = canEditNote(
                    note,
                    currentUserId,
                    currentUserName,
                    localOnly
                  )
                  const isEditing = editingNoteId === note.id
                  const noteVisibility =
                    note.visibility === 'roles' && note.visibleRoles?.length
                      ? note.visibleRoles.join(', ')
                      : note.visibility === 'roles'
                        ? 'Seçili roller'
                        : 'Herkes'
                  return (
                    <article
                      key={note.id}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/60"
                    >
                      <div className="flex w-full items-start justify-between gap-3 p-4">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                          onClick={() => toggleNote(note.id)}
                          aria-expanded={expanded}
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                            <UserRound className="size-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800">
                              {note.author}
                            </p>
                            {note.role ? (
                              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                {note.role}
                              </p>
                            ) : null}
                          </div>
                        </button>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="hidden items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200/80 sm:inline-flex">
                            {note.visibility === 'roles' ? (
                              <Users className="size-3" />
                            ) : (
                              <Eye className="size-3" />
                            )}
                            {noteVisibility}
                          </span>
                          {note.createdAt ? (
                            <time className="text-[10px] text-slate-400">
                              {formatNoteDate(note.createdAt)}
                            </time>
                          ) : null}
                          {editable && !isEditing ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-slate-400 hover:text-slate-700"
                              onClick={() => startEdit(note)}
                              aria-label="Notu düzenle"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          ) : null}
                          <button
                            type="button"
                            className="rounded-md p-0.5 text-slate-400 hover:text-slate-600"
                            onClick={() => toggleNote(note.id)}
                            aria-label={expanded ? 'Notu gizle' : 'Notu aç'}
                          >
                            <ChevronDown
                              className={`size-4 transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      {expanded ? (
                        <div className="space-y-2 border-t border-slate-200/60 px-4 pb-4 pt-3">
                          <p className="inline-flex items-center gap-1 text-[10px] text-slate-400 sm:hidden">
                            {note.visibility === 'roles' ? (
                              <Users className="size-3" />
                            ) : (
                              <Eye className="size-3" />
                            )}
                            {noteVisibility}
                          </p>
                          {isEditing ? (
                            renderEditControls(note)
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {note.note}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            )}

            {!loading && loadError ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Güncel notlar yüklenemedi. Yeni not eklemeyi tekrar deneyebilirsiniz.
              </p>
            ) : null}
          </div>

          <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault()
                    void handleSubmit()
                  }
                }}
                placeholder="Operasyon ekibine not yazın…"
                className="min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                disabled={submitting}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
                <span className="text-[10px] text-slate-400">{draft.length}/1000</span>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 max-w-[160px] gap-1.5 rounded-xl border-slate-200 px-2.5 text-xs text-slate-600"
                        disabled={submitting}
                      >
                        {visibility === 'roles' ? (
                          <Users className="size-3.5 shrink-0" />
                        ) : (
                          <Eye className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate">{visibilityLabel}</span>
                        <ChevronDown className="size-3.5 shrink-0 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs text-slate-500">
                        Kimler görsün?
                      </DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={visibility}
                        onValueChange={(value) => {
                          const next = value as OrderNoteVisibility
                          setVisibility(next)
                          if (next === 'everyone') setSelectedRoles([])
                        }}
                      >
                        <DropdownMenuRadioItem value="everyone">
                          Herkes
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="roles">
                          Seçili roller
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-slate-500">
                        Roller
                      </DropdownMenuLabel>
                      {NOTE_VISIBILITY_ROLES.map((role) => (
                        <DropdownMenuCheckboxItem
                          key={role.id}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) =>
                            toggleRole(role.id, Boolean(checked))
                          }
                          onSelect={(event) => event.preventDefault()}
                        >
                          {role.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 rounded-xl px-3 text-xs"
                    disabled={!draft.trim() || submitting}
                    onClick={() => void handleSubmit()}
                  >
                    {submitting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    Gönder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showCourierNotes && courierOpen ? (
          <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                  <Smartphone className="size-4" />
                </span>
                <h3 className="text-sm font-semibold text-slate-900">Kurye Notları</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-slate-500"
                onClick={() => setCourierOpen(false)}
                aria-label="Kurye notunu gizle"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {courierLoading ? (
                <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 className="size-4 animate-spin" />
                  Yükleniyor…
                </div>
              ) : visibleCourierNotes.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Kurye notu eklenmemiş</p>
              ) : (
                visibleCourierNotes.map((note) => {
                  const editable = canEditNote(
                    note,
                    currentUserId,
                    currentUserName,
                    localOnly
                  )
                  const isEditing = editingNoteId === note.id
                  return (
                    <div
                      key={note.id}
                      className="rounded-xl border border-slate-200/70 bg-white p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[11px] font-medium text-slate-600">
                          {note.author}
                          {note.role ? (
                            <span className="font-normal text-slate-400"> · {note.role}</span>
                          ) : null}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          {note.createdAt ? (
                            <time className="text-[10px] text-slate-400">
                              {formatNoteDate(note.createdAt)}
                            </time>
                          ) : null}
                          {editable && !isEditing ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-slate-400 hover:text-slate-700"
                              onClick={() => startEdit(note)}
                              aria-label="Notu düzenle"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="mt-2">{renderEditControls(note)}</div>
                      ) : (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {note.note}
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-auto border-t border-slate-200/70 bg-white/70 p-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100">
                <Textarea
                  value={courierDraft}
                  onChange={(event) => setCourierDraft(event.target.value.slice(0, 1000))}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                      event.preventDefault()
                      void handleCourierSubmit()
                    }
                  }}
                  placeholder="Kuryeye ekstra not yazın…"
                  className="min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                  disabled={courierSubmitting}
                />
                <div className="flex items-center justify-between gap-3 px-2 pb-1">
                  <span className="text-[10px] text-slate-400">{courierDraft.length}/1000</span>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 rounded-xl px-3 text-xs"
                    disabled={!courierDraft.trim() || courierSubmitting}
                    onClick={() => void handleCourierSubmit()}
                  >
                    {courierSubmitting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    Gönder
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
