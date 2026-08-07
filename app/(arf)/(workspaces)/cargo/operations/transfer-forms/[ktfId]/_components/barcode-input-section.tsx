"use client"

import { type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react"
import { Barcode, Send, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchCargoByBarcode } from "../_api/transfer-form-detail-api"

interface Props {
  ktfId: string
  isKtfClosed: boolean
  onCargoFound: (cargoId: string) => Promise<void>
}

export function BarcodeInputSection({ ktfId: _ktfId, isKtfClosed, onCargoFound }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Otomatik focus
  useEffect(() => {
    if (!isKtfClosed) {
      inputRef.current?.focus()
    }
  }, [isKtfClosed])

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim()
    if (!trimmed) {
      toast.warning("Boş barkod taraması yapılamaz")
      return
    }

    setIsSearching(true)
    try {
      const result = await searchCargoByBarcode(trimmed)

      if (!result.ok) {
        toast.error(result.error)
        setValue("")
        inputRef.current?.focus()
        return
      }

      // Bulduk → üst bileşene ilet ki KTF'ye eklesin
      await onCargoFound(result.cargo.cargoId)
      setValue("")
      inputRef.current?.focus()
    } catch {
      toast.error("Arama sırasında bir hata oluştu")
    } finally {
      setIsSearching(false)
    }
  }, [value, onCargoFound])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        void handleSubmit()
      }
    },
    [handleSubmit],
  )

  if (isKtfClosed) return null

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Barcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Barkod Okut..."
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-9"
          autoFocus
          disabled={isSearching}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("")
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button size="sm" onClick={handleSubmit} disabled={isSearching || !value.trim()}>
        <Send className="mr-1.5 size-3.5" />
        Gönder
      </Button>
    </div>
  )
}
