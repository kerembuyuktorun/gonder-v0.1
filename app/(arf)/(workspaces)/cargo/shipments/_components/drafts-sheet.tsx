'use client'

import { type ChangeEvent, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Search, Trash2 } from 'lucide-react'

export interface ShipmentDraftListItem {
  id: string
  title: string
  subtitle: string
  updatedAt: string
  progress: number
}

interface DraftsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  drafts: ShipmentDraftListItem[]
  activeDraftId: string | null
  onContinue: (draftId: string) => void
  onDelete: (draftId: string) => void
}

export function DraftsSheet({
  open,
  onOpenChange,
  drafts,
  activeDraftId,
  onContinue,
  onDelete,
}: DraftsSheetProps) {
  const [query, setQuery] = useState('')

  const filteredDrafts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR')
    if (!normalizedQuery) {
      return drafts
    }

    return drafts.filter((draft) => {
      const text = `${draft.title} ${draft.subtitle}`.toLocaleLowerCase('tr-TR')
      return text.includes(normalizedQuery)
    })
  }, [drafts, query])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-l border-slate-200 bg-slate-50/95 p-0 sm:max-w-xl">
        <SheetHeader className="gap-2 border-b border-slate-200 bg-white px-5 py-4 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight text-slate-900">Taslaklar</SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            Kaydedilmiş taslaklarınızı buradan arayabilir, devam edebilir veya silebilirsiniz.
          </SheetDescription>
        </SheetHeader>

        <div className="border-b border-slate-200 bg-white px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder="Taslak ara..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] px-4 py-4">
          <div className="space-y-3">
            {filteredDrafts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-base font-medium text-slate-800">Taslak bulunamadı</p>
                <p className="mt-1 text-sm text-slate-500">
                  Arama filtresini temizleyin veya bu formu taslak olarak kaydedin.
                </p>
              </div>
            ) : (
              filteredDrafts.map((draft) => {
                const isActive = activeDraftId === draft.id

                return (
                  <div
                    key={draft.id}
                    className={cn(
                      'rounded-2xl border bg-white p-4 shadow-sm transition',
                      isActive ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{draft.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{draft.subtitle}</p>
                        <p className="mt-1 text-xs text-slate-500">Son işlem: {draft.updatedAt}</p>
                      </div>
                      {isActive ? (
                        <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          Aktif
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
                        <span>Tamamlanma</span>
                        <span>%{draft.progress}</span>
                      </div>
                      <Progress value={draft.progress} className="h-2 rounded-full" />
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Button className="h-9 rounded-xl px-3" onClick={() => onContinue(draft.id)}>
                        Devam Et
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 rounded-xl border-rose-200 px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => onDelete(draft.id)}
                      >
                        <Trash2 className="mr-1.5 size-4" />
                        Sil
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
