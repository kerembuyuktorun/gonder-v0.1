"use client"

import type { ChangeEvent } from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import type { BlockedInterlandPayload } from "../_types"

interface BranchOption {
  id: string
  name: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  branches: BranchOption[]
  onCreate: (payload: BlockedInterlandPayload) => Promise<void>
}

export function CreateBlockedInterlandModal({ open, onOpenChange, branches, onCreate }: Props) {
  const [name, setName] = useState("")
  const [branchId, setBranchId] = useState("")
  const [branchPickerOpen, setBranchPickerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === branchId),
    [branchId, branches],
  )

  const reset = () => {
    setName("")
    setBranchId("")
    setBranchPickerOpen(false)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !selectedBranch || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate({
        name: name.trim(),
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
      })
      reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Yasaklı İnterland Oluştur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="blocked-name">İnterland Adı</Label>
            <Input
              id="blocked-name"
              value={name}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
              placeholder="Örn: İstanbul Esenyurt Yasaklı İnterland"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bağlı Şube</Label>
            <Popover open={branchPickerOpen} onOpenChange={setBranchPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selectedBranch?.name ?? "Şube seçin"}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Şube ara..." />
                  <CommandList>
                    <CommandEmpty>Şube bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {branches.map((branch) => (
                        <CommandItem
                          key={branch.id}
                          value={branch.name}
                          onSelect={() => {
                            setBranchId(branch.id)
                            setBranchPickerOpen(false)
                          }}
                        >
                          <Check className={cn("mr-2 size-4", branchId === branch.id ? "opacity-100" : "opacity-0")} />
                          {branch.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!name.trim() || !branchId || isSubmitting}>
            {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
