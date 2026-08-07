"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { IntegrationPlatform } from "../_types"

interface Props {
  platform?: IntegrationPlatform
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function IntegrationCredentialsForm({ platform, values, onChange }: Props) {
  if (!platform) {
    return <div className="text-sm text-slate-500">Önce platform seçimi yapın.</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {platform.requiredCredentials.map((field) => (
        <div key={field.key} className={field.type === "textarea" ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
          <Label htmlFor={field.key}>
            {field.label} {field.required ? "*" : ""}
          </Label>
          {field.type === "textarea" ? (
            <Textarea
              id={field.key}
              value={values[field.key] ?? ""}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(field.key, event.target.value)}
              placeholder={field.helpText}
            />
          ) : (
            <Input
              id={field.key}
              type={field.type === "password" ? "password" : "text"}
              value={values[field.key] ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(field.key, event.target.value)}
              placeholder={field.helpText}
            />
          )}
          {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        </div>
      ))}
      <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Bu bilgiler şifreli olarak sunucuda saklanacaktır.
      </div>
    </div>
  )
}
