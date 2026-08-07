"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { TransferCenterNote } from "../_types"

type NoteInput = Omit<
  TransferCenterNote,
  "id" | "createdAt" | "createdBy" | "createdByName" | "createdByRole"
>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  centerId: string
  centerName: string
  onAdd: (note: NoteInput) => void
}

export function NoteModal({ open, onOpenChange, centerId, centerName, onAdd }: Props) {
  const [category, setCategory] = useState<TransferCenterNote["category"]>("genel")
  const [visibility, setVisibility] = useState<TransferCenterNote["visibility"]>("public")
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    if (!content.trim()) return
    onAdd({ content: content.trim(), category, visibility, centerId, centerName })
    setContent("")
    setCategory("genel")
    setVisibility("public")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Not Ekle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="note-category">Kategori</Label>
            <Select
              value={category}
              onValueChange={(v: string) => setCategory(v as TransferCenterNote["category"])}
            >
              <SelectTrigger id="note-category">
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genel">Genel</SelectItem>
                <SelectItem value="operasyon">Operasyon</SelectItem>
                <SelectItem value="finans">Finans</SelectItem>
                <SelectItem value="teknik">Teknik</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Görünürlük</Label>
            <RadioGroup
              value={visibility}
              onValueChange={(v: string) => setVisibility(v as TransferCenterNote["visibility"])}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="internal" id="note-internal" />
                <Label htmlFor="note-internal" className="cursor-pointer font-normal">
                  🔒 Sadece Genel Merkez Görür
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="public" id="note-public" />
                <Label htmlFor="note-public" className="cursor-pointer font-normal">
                  👁 Herkes Görür
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-content">Not İçeriği</Label>
            <Textarea
              id="note-content"
              placeholder="Notunuzu buraya yazın..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-right text-xs text-slate-400">{content.length}/500</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
