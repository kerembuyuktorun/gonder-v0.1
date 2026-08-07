"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CheckIcon, Filter, Plus, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createIntegration } from "../_api/integrations-api"
import type {
  CreateIntegrationPayload,
  IntegrationCategoryOption,
  IntegrationPlatform,
  IntegrationRecord,
} from "../_types"
import { useIntegrationFilters } from "../_hooks/use-integration-filters"
import { CreateIntegrationModal } from "./create-integration-modal"
import { IntegrationCard } from "./integration-card"

interface Props {
  integrations: IntegrationRecord[]
  platforms: IntegrationPlatform[]
  categories: IntegrationCategoryOption[]
}

const statusOptions = [
  { label: "Bağlı ve Aktif", value: "connected" },
  { label: "Bağlantı Koptu", value: "disconnected" },
  { label: "Hata Var", value: "error" },
  { label: "Kurulum Bekliyor", value: "pending_setup" },
] as const

export function IntegrationsMarketplaceSection({ integrations, platforms, categories }: Props) {
  const [rows, setRows] = useState(integrations)
  const [modalOpen, setModalOpen] = useState(false)
  const [initialPlatformId, setInitialPlatformId] = useState<string | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const category = searchParams.get("category") ?? "all"
  const status = searchParams.get("status") ?? "all"
  const q = searchParams.get("q") ?? ""
  const pageParam = Number(searchParams.get("page") ?? "1")
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = 6

  const filteredRows = useIntegrationFilters(rows, { category, status, q })
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [currentPage, filteredRows])
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))

  const categoryButtons = useMemo(
    () => [{ id: "all", label: "Tümü" }, ...categories.map((item) => ({ id: item.id, label: item.label }))],
    [categories],
  )

  const selectedStatusOption = statusOptions.find((o) => o.value === status)

  const setParam = (key: string, value: string, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    if (resetPage) {
      params.delete("page")
    }
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  const handleCreate = async (payload: CreateIntegrationPayload) => {
    const created = await createIntegration(payload)
    setRows((prev) => [created, ...prev])
    setSuccessMessage("Entegrasyon başarıyla oluşturuldu.")
  }

  return (
    <div className="space-y-6">
      <CreateIntegrationModal
        open={modalOpen}
        platforms={platforms}
        initialPlatformId={initialPlatformId}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setInitialPlatformId(undefined)
        }}
        onCreate={handleCreate}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entegrasyonlar</h1>
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Yeni Entegrasyon Oluştur / Bağla
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={showFacetedFilters ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => setShowFacetedFilters((prev) => !prev)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtreler
            </Button>

            {showFacetedFilters && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Durum
                    {selectedStatusOption && (
                      <>
                        <Separator orientation="vertical" className="mx-2 h-4" />
                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                          {selectedStatusOption.label}
                        </Badge>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Durum" />
                    <CommandList>
                      <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {statusOptions.map((option) => {
                          const isSelected = status === option.value
                          return (
                            <CommandItem
                              key={option.value}
                              onSelect={() =>
                                setParam("status", isSelected ? "all" : option.value)
                              }
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible",
                                )}
                              >
                                <CheckIcon className="h-4 w-4" />
                              </div>
                              <span>{option.label}</span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                      {selectedStatusOption && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => setParam("status", "all")}
                              className="justify-center text-center"
                            >
                              Filtreleri Temizle
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryButtons.map((item) => (
              <Button
                key={item.id}
                variant={category === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setParam("category", item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagedRows.map((row) => (
              <IntegrationCard
                key={row.id}
                row={row}
                onConnect={(platformId) => {
                  setInitialPlatformId(platformId)
                  setModalOpen(true)
                }}
                onDuplicate={(rowToClone) => {
                  setInitialPlatformId(rowToClone.platformId)
                  setModalOpen(true)
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Sayfa {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setParam("page", String(currentPage - 1), false)}
              >
                Önceki
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setParam("page", String(currentPage + 1), false)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface Props {
  integrations: IntegrationRecord[]
  platforms: IntegrationPlatform[]
  categories: IntegrationCategoryOption[]
}

