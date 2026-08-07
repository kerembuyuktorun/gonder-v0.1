"use client"

import type { ChangeEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { BranchUser } from "../_types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUsers: BranchUser[]
  availableUsers: BranchUser[]
  onAdd: (users: BranchUser[]) => void
}

export function UserSelectModal({
  open,
  onOpenChange,
  currentUsers,
  availableUsers,
  onAdd,
}: Props) {
  const [query, setQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setSelectedIds([])
    }
  }, [open])

  const existingIds = useMemo(() => new Set(currentUsers.map((user) => user.id)), [currentUsers])

  const filteredUsers = useMemo(
    () =>
      availableUsers.filter((user) => {
        if (existingIds.has(user.id)) {
          return false
        }

        const haystack = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      }),
    [availableUsers, existingIds, query],
  )

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((item) => item !== userId) : [...prev, userId],
    )
  }

  const handleSubmit = () => {
    const users = filteredUsers.filter((user) => selectedIds.includes(user.id))
    if (users.length === 0) {
      return
    }
    onAdd(users)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Kullanıcı Seç</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            placeholder="Ad, soyad veya e-posta ile ara..."
          />
          <ScrollArea className="h-80 rounded-xl border border-slate-200 p-3">
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Eşleşen kullanıcı bulunamadı.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const fullName = `${user.firstName} ${user.lastName}`
                  return (
                    <label
                      key={user.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 transition-colors hover:bg-slate-50"
                    >
                      <Checkbox
                        checked={selectedIds.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-800">{fullName}</span>
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <p className="text-xs text-slate-400">{user.phone}</p>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={selectedIds.length === 0}>
            Seçili Kullanıcıları Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
