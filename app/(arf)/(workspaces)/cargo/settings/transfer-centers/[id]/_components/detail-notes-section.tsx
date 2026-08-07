"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { MessageSquare, Plus, Trash2 } from "lucide-react"
import { NoteModal } from "./note-modal"
import type { TransferCenter, TransferCenterNote } from "../_types"

const categoryConfig: Record<
  TransferCenterNote["category"],
  { label: string; className: string }
> = {
  genel: { label: "Genel", className: "border-slate-200 bg-slate-50 text-slate-600" },
  operasyon: { label: "Operasyon", className: "border-blue-200 bg-blue-50 text-blue-700" },
  finans: { label: "Finans", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  teknik: { label: "Teknik", className: "border-amber-200 bg-amber-50 text-amber-700" },
  diger: { label: "Diğer", className: "border-purple-200 bg-purple-50 text-purple-700" },
}

type NoteInput = Omit<
  TransferCenterNote,
  "id" | "createdAt" | "createdBy" | "createdByName" | "createdByRole"
>

interface Props {
  center: TransferCenter
}

export function DetailNotesSection({ center }: Props) {
  const [notes, setNotes] = useState<TransferCenterNote[]>(
    [...center.notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  )
  const [modalOpen, setModalOpen] = useState(false)

  const handleAddNote = (data: NoteInput) => {
    const newNote: TransferCenterNote = {
      ...data,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: "me",
      createdByName: "Kullanıcı",
      createdByRole: "Operatör",
    }
    setNotes((prev) => [newNote, ...prev])
  }

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    }
  }

  return (
    <>
      <NoteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        centerId={center.id}
        centerName={center.name}
        onAdd={handleAddNote}
      />
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MessageSquare className="size-4 text-slate-400" />
            Notlar
            {notes.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {notes.length}
              </Badge>
            )}
          </CardTitle>
          <Button size="sm" className="h-8 text-xs" onClick={() => setModalOpen(true)}>
            <Plus className="mr-1.5 size-3.5" />
            Not Ekle
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
              <MessageSquare className="size-8" />
              <p className="text-sm">Henüz not eklenmemiş</p>
              <Button size="sm" variant="outline" className="mt-1" onClick={() => setModalOpen(true)}>
                <Plus className="mr-1.5 size-3.5" />
                İlk Notu Ekle
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const catCfg = categoryConfig[note.category]
                const date = new Date(note.createdAt)
                return (
                  <div
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">
                          {note.createdByName}
                        </span>
                        <Badge
                          variant="outline"
                          className="h-5 border-slate-200 px-1.5 text-[10px]"
                        >
                          {note.createdByRole}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("h-5 border px-1.5 text-[10px]", catCfg.className)}
                        >
                          {catCfg.label}
                        </Badge>
                        <span className="text-[10px]">
                          {note.visibility === "internal" ? "🔒" : "👁"}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-xs text-slate-400">
                          {date.toLocaleDateString("tr-TR")}{" "}
                          {date.toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{note.content}</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
