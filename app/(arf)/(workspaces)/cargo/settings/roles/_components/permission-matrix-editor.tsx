"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@hascanb/arf-ui-kit/datatable-kit"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ModuleCategory, PermissionDefinition, RolePermissions } from "../_types"

interface Props {
  categories: ModuleCategory[]
  definitions: PermissionDefinition[]
  value: RolePermissions
  onChange: (next: RolePermissions) => void
  readOnly?: boolean
}

interface GroupedModule {
  moduleCode: string
  moduleName: string
  permissions: PermissionDefinition[]
}

interface MatrixRow {
  moduleCode: string
  moduleName: string
  permissions: PermissionDefinition[]
}

export function PermissionMatrixEditor({
  categories,
  definitions,
  value,
  onChange,
  readOnly = false,
}: Props) {
  const grouped = useMemo(() => {
    const byCategory = new Map<string, GroupedModule[]>()

    categories.forEach((category) => {
      const rows = definitions.filter((d) => d.moduleCategoryId === category.id)
      const groupedModules = new Map<string, GroupedModule>()

      rows.forEach((permission) => {
        const existing = groupedModules.get(permission.moduleCode)
        if (existing) {
          existing.permissions.push(permission)
        } else {
          groupedModules.set(permission.moduleCode, {
            moduleCode: permission.moduleCode,
            moduleName: permission.moduleName,
            permissions: [permission],
          })
        }
      })

      byCategory.set(category.id, [...groupedModules.values()])
    })

    return byCategory
  }, [categories, definitions])

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((category) => [category.id, true])),
  )

  function togglePermission(permissionId: string, nextValue: boolean) {
    onChange({ ...value, [permissionId]: nextValue })
  }

  function toggleAllStandard(modulePermissions: PermissionDefinition[], nextValue: boolean) {
    const next = { ...value }
    modulePermissions
      .filter((permission) => permission.permissionType !== "special")
      .forEach((permission) => {
        next[permission.id] = nextValue
      })
    onChange(next)
  }

  const columns = useMemo<ColumnDef<MatrixRow>[]>(
    () => [
      {
        id: "module",
        header: () => <span>Yetki Adı</span>,
        cell: ({ row }) => (
          <p className="font-medium text-slate-800">{row.original.moduleName}</p>
        ),
      },
      {
        id: "all",
        header: () => <span>Tümü</span>,
        cell: ({ row }) => {
          const standard = row.original.permissions.filter((item) => item.permissionType !== "special")
          const allChecked = standard.length > 0 && standard.every((p) => value[p.id] === true)
          return (
            <Checkbox
              disabled={readOnly}
              checked={allChecked}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                toggleAllStandard(standard, checked === true)
              }
            />
          )
        },
      },
      {
        id: "read",
        header: () => <span>Listele</span>,
        cell: ({ row }) => {
          const permission = row.original.permissions.find((item) => item.permissionType === "read")
          if (!permission) return <span className="text-slate-300">-</span>

          return (
            <Checkbox
              disabled={readOnly}
              checked={value[permission.id] === true}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                togglePermission(permission.id, checked === true)
              }
            />
          )
        },
      },
      {
        id: "create",
        header: () => <span>Oluştur</span>,
        cell: ({ row }) => {
          const permission = row.original.permissions.find((item) => item.permissionType === "create")
          if (!permission) return <span className="text-slate-300">-</span>

          return (
            <Checkbox
              disabled={readOnly}
              checked={value[permission.id] === true}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                togglePermission(permission.id, checked === true)
              }
            />
          )
        },
      },
      {
        id: "update",
        header: () => <span>Güncelle</span>,
        cell: ({ row }) => {
          const permission = row.original.permissions.find((item) => item.permissionType === "update")
          if (!permission) return <span className="text-slate-300">-</span>

          return (
            <Checkbox
              disabled={readOnly}
              checked={value[permission.id] === true}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                togglePermission(permission.id, checked === true)
              }
            />
          )
        },
      },
      {
        id: "delete",
        header: () => <span>Sil</span>,
        cell: ({ row }) => {
          const permission = row.original.permissions.find((item) => item.permissionType === "delete")
          if (!permission) return <span className="text-slate-300">-</span>

          return (
            <Checkbox
              disabled={readOnly}
              checked={value[permission.id] === true}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                togglePermission(permission.id, checked === true)
              }
            />
          )
        },
      },
    ],
    [readOnly, value],
  )

  return (
    <div className="space-y-6">
      {/* Standart Yetkiler Tablosu */}
      <ScrollArea className="rounded-xl border border-slate-200">
        <div className="min-w-[700px] p-3">
          {categories.map((category) => {
            const isOpen = openCategories[category.id] ?? true
            const modules = grouped.get(category.id) ?? []
            return (
              <div key={category.id} className="mb-4 rounded-xl border border-slate-200">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-800 ${isOpen ? "rounded-t-xl" : "rounded-xl"}`}
                  onClick={() => setOpenCategories((prev) => ({ ...prev, [category.id]: !isOpen }))}
                >
                  <span>{category.name}</span>
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>

                {isOpen && (
                  <div className="p-3">
                    <DataTable
                      data={modules as MatrixRow[]}
                      columns={columns}
                      showToolbar={false}
                      enablePagination={false}
                      enableSorting={false}
                      className="rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Özel Yetkiler */}
      {(() => {
        const specialsByCategory = categories
          .map((category) => {
            const modules = grouped.get(category.id) ?? []
            const specials = modules.flatMap((m) =>
              m.permissions.filter((p) => p.permissionType === "special").map((p) => ({ ...p, moduleName: m.moduleName }))
            )
            return { category, specials }
          })
          .filter(({ specials }) => specials.length > 0)

        if (specialsByCategory.length === 0) return null

        return (
          <div className="rounded-xl border border-slate-200">
            <div className="rounded-t-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">
              Özel Yetkiler
            </div>
            <div className="divide-y divide-slate-100 p-4">
              {specialsByCategory.map(({ category, specials }) => (
                <div key={category.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{category.name}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {specials.map((permission) => (
                      <label key={permission.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <Checkbox
                          disabled={readOnly}
                          checked={value[permission.id] === true}
                          onCheckedChange={(checked: boolean | "indeterminate") =>
                            togglePermission(permission.id, checked === true)
                          }
                        />
                        {permission.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
