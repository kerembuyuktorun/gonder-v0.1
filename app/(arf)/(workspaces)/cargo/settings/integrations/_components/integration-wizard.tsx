"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { testIntegrationConnection } from "../_api/integrations-api"
import type { CreateIntegrationPayload, IntegrationPlatform } from "../_types"
import { IntegrationCredentialsForm } from "./integration-credentials-form"
import { PlatformTemplateSelector } from "./platform-template-selector"
import { TestConnectionAction } from "./test-connection-action"

const formSchema = z.object({
  platformId: z.string().min(1, "Platform seçimi zorunludur."),
  customWebhookEnabled: z.boolean(),
  credentials: z.record(z.string()),
})

type WizardValues = z.infer<typeof formSchema>

interface Props {
  platforms: IntegrationPlatform[]
  initialPlatformId?: string
  onCancel: () => void
  onCreate: (payload: CreateIntegrationPayload) => Promise<void>
}

export function IntegrationWizard({ platforms, initialPlatformId, onCancel, onCreate }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isTesting, setIsTesting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [lastStandardPlatformId, setLastStandardPlatformId] = useState(initialPlatformId ?? "")

  const form = useForm<WizardValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      platformId: initialPlatformId ?? "",
      customWebhookEnabled: false,
      credentials: {},
    },
  })

  const platformId = form.watch("platformId")
  const customWebhookEnabled = form.watch("customWebhookEnabled")
  const selectedPlatform = useMemo(
    () => platforms.find((platform) => platform.id === (customWebhookEnabled ? "custom-webhook" : platformId)),
    [customWebhookEnabled, platformId, platforms],
  )
  const credentials = form.watch("credentials")

  const requiredKeys = selectedPlatform?.requiredCredentials.filter((field) => field.required).map((field) => field.key) ?? []
  const hasMissingRequiredCredentials = requiredKeys.some((key) => !(credentials[key] ?? "").trim())

  const testPayload: CreateIntegrationPayload = {
    platformId: customWebhookEnabled ? "custom-webhook" : platformId,
    customWebhookEnabled,
    credentials: credentials ?? {},
  }

  const handleNext = async () => {
    if (step === 1) {
      const ok = await form.trigger(["platformId", "customWebhookEnabled"])
      if (!ok) return
      setStep(2)
      return
    }

    if (step === 2) {
      if (!selectedPlatform || hasMissingRequiredCredentials) {
        setTestResult({ success: false, message: "Zorunlu kimlik alanlarını doldurun." })
        return
      }
      setStep(3)
    }
  }

  const runConnectionTest = async () => {
    setIsTesting(true)
    try {
      const result = await testIntegrationConnection(testPayload)
      setTestResult(result)
    } finally {
      setIsTesting(false)
    }
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    try {
      await onCreate(testPayload)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
        <button type="button" className={`rounded-lg px-2 py-1 ${step === 1 ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500"}`}>1. Platform</button>
        <button type="button" className={`rounded-lg px-2 py-1 ${step === 2 ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500"}`}>2. Kimlik</button>
        <button type="button" className={`rounded-lg px-2 py-1 ${step === 3 ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500"}`}>3. Test</button>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Platform Seçimi</Label>
            <PlatformTemplateSelector
              value={customWebhookEnabled ? "custom-webhook" : platformId}
              platforms={platforms.filter((platform) => platform.id !== "custom-webhook")}
              onChange={(id) => {
                setLastStandardPlatformId(id)
                form.setValue("platformId", id, { shouldValidate: true })
                setTestResult(null)
              }}
            />
            {form.formState.errors.platformId && <p className="text-xs text-red-600">{form.formState.errors.platformId.message}</p>}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Checkbox
              checked={customWebhookEnabled}
              onCheckedChange={(checked: CheckedState) => {
                const enabled = Boolean(checked)
                form.setValue("customWebhookEnabled", enabled)
                if (enabled) {
                  if (platformId && platformId !== "custom-webhook") {
                    setLastStandardPlatformId(platformId)
                  }
                  form.setValue("platformId", "custom-webhook", { shouldValidate: true })
                } else {
                  form.setValue("platformId", lastStandardPlatformId, { shouldValidate: true })
                }
                form.setValue("credentials", {})
                setTestResult(null)
              }}
            />
            <span className="text-sm">Özel Webhook / API Kullan</span>
          </div>
          {selectedPlatform ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{selectedPlatform.name}</p>
              {selectedPlatform.description ? <p className="mt-1">{selectedPlatform.description}</p> : null}
              {selectedPlatform.docsUrl ? (
                <a href={selectedPlatform.docsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-medium text-sky-700 underline underline-offset-2">
                  Dokümantasyonu aç
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {step === 2 && (
        <IntegrationCredentialsForm
          platform={selectedPlatform}
          values={credentials ?? {}}
          onChange={(key, value) => {
            const current = form.getValues("credentials")
            form.setValue("credentials", { ...current, [key]: value }, { shouldDirty: true })
            setTestResult(null)
          }}
        />
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p><span className="font-medium">Platform:</span> {selectedPlatform?.name ?? "-"}</p>
            <p><span className="font-medium">Bağlantı Türü:</span> {customWebhookEnabled ? "Özel Webhook" : "Standart Entegrasyon"}</p>
          </div>
          <TestConnectionAction isLoading={isTesting} onClick={() => void runConnectionTest()} />
          {testResult && (
            <div className={`rounded-xl border px-3 py-2 text-sm ${testResult.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {testResult.success ? "🟢 " : "🔴 "}{testResult.message}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
        <div className="flex items-center gap-2">
          {step > 1 && <Button type="button" variant="outline" onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}>Geri</Button>}
          {step < 3 ? (
            <Button type="button" onClick={() => void handleNext()}>İleri</Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!testResult?.success || isSubmitting}
            >
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
