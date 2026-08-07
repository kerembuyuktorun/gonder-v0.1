"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateRole } from "../../_api/roles-api"
import type { ModuleCategory, PermissionDefinition, RoleDetail } from "../../_types"
import { PermissionMatrixEditor } from "../../_components/permission-matrix-editor"

interface Props {
  role: RoleDetail
  categories: ModuleCategory[]
  definitions: PermissionDefinition[]
}

export function RolePermissionsSection({ role, categories, definitions }: Props) {
  const [permissions, setPermissions] = useState(role.permissions)
  const [draftPermissions, setDraftPermissions] = useState(role.permissions)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  function startEditing() {
    setDraftPermissions({ ...permissions })
    setIsEditing(true)
  }

  function cancelEditing() {
    setDraftPermissions({ ...permissions })
    setIsEditing(false)
  }

  async function saveChanges() {
    if (role.roleType === "system") return
    setIsSaving(true)
    try {
      const updated = await updateRole(role.id, { permissions: draftPermissions })
      if (!updated) {
        window.alert("Yetkiler kaydedilemedi.")
        return
      }
      setPermissions(updated.permissions)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Yetki Düzenleme</CardTitle>
        {role.roleType === "custom" ? (
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={cancelEditing} disabled={isSaving}>
                Vazgeç
              </Button>
              <Button type="button" onClick={() => void saveChanges()} disabled={isSaving}>
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={startEditing}>
              Düzenle
            </Button>
          )
        ) : (
          <p className="text-xs text-slate-500">Sistem rolleri sadece görüntülenebilir.</p>
        )}
      </CardHeader>
      <CardContent>
        <PermissionMatrixEditor
          categories={categories}
          definitions={definitions}
          value={isEditing ? draftPermissions : permissions}
          onChange={setDraftPermissions}
          readOnly={!isEditing}
        />
      </CardContent>
    </Card>
  )
}
