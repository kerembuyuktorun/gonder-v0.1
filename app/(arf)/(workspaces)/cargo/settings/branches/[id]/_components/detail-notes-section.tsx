"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { MessageSquare, Plus, Trash2 } from "lucide-react"
import { NoteModal } from "./note-modal"
import type { BranchNote } from "../_types"

const categoryConfig: Record<BranchNote["category"], { label: string; className: string }> = {
  genel: { label: "Genel", className: "border-slate-200 bg-slate-50 text-slate-600" },
  operasyon: { label: "Operasyon", className: "border-blue-200 bg-blue-50 text-blue-700" },
  finans: { label: "Finans", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  teknik: { label: "Teknik", className: "border-amber-200 bg-amber-50 text-amber-700" },
  diger: { label: "Diğer", className: "border-violet-200 bg-violet-50 text-violet-700" },
}

type NoteInput = Omit<
  BranchNote,
  "id" | "createdAt" | "createdBy" | "createdByName" | "createdByRole" | "sourceType" | "sourceName"
>

interface Props {
  branchId: string
  branchName: string
  notes: BranchNote[]
  onNotesChange: (notes: BranchNote[]) => void
}

export function DetailNotesSection({ branchId, branchName, notes, onNotesChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const currentUserRole = "yonetici"
  const currentUserId = "current-user"
  const currentUserSourceType = "genel_merkez"

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes],
  )

  const visibleNotes = useMemo(
    () =>
      sortedNotes.filter((note) => {
        if (note.visibility === "public") {
          return true
        }
        return currentUserSourceType === "genel_merkez" || currentUserRole === "yonetici"
      }),
    [currentUserRole, currentUserSourceType, sortedNotes],
  )

  const handleAddNote = (data: NoteInput) => {
    const newNote: BranchNote = {
      ...data,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUserId,
      createdByName: "Mevcut Kullanıcı",
      createdByRole: "Yönetici",
      sourceType: "genel_merkez",
      sourceName: "Genel Merkez",
    }

    onNotesChange([newNote, ...notes])
  }

  const handleDeleteNote = (noteId: string) => {
    if (!window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      return
    }

    onNotesChange(notes.filter((note) => note.id !== noteId))
  }

  const canDelete = (note: BranchNote) =>
    note.createdBy === currentUserId || currentUserRole === "yonetici" || currentUserSourceType === "genel_merkez"

  return (
    <>
      <NoteModal open={modalOpen} onOpenChange={setModalOpen} branchId={branchId} branchName={branchName} onAdd={handleAddNote} />
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MessageSquare className="size-4 text-slate-400" />
            Notlar
            {visibleNotes.length > 0 && (
              <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">
                {visibleNotes.length}
              </span>
            )}
          </CardTitle>
          <Button size="sm" className="h-8 text-xs" onClick={() => setModalOpen(true)}>
            <Plus className="mr-1.5 size-3.5" />
            Not Ekle
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {visibleNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
              <MessageSquare className="size-8" />
              <p className="text-sm">Henüz not eklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleNotes.map((note) => {
                const catCfg = categoryConfig[note.category]
                return (
                  <article key={note.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn("border", catCfg.className)}>
                          {catCfg.label}
                        </Badge>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                          {note.visibility === "internal" ? "Sadece Genel Merkez Görür" : "Herkes Görür"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{new Date(note.createdAt).toLocaleString("tr-TR")}</span>
                        {canDelete(note) && (
                          <button
                            type="button"
                            className="text-slate-400 transition-colors hover:text-red-600"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{note.content}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{note.createdByName}</span>
                      <span>{note.createdByRole}</span>
                      <span>{note.sourceName}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
