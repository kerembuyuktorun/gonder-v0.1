'use client'

import { Forklift, ShieldCheck, Snowflake, Sparkles } from 'lucide-react'
import { NumberField, ToggleRow } from './inputs'
import { useWizard } from './wizard-context'

export function ExtrasBlock() {
  const { draft, setDraft } = useWizard()
  const { extras } = draft

  const set = (partial: Partial<typeof extras>) => {
    setDraft((prev) => ({ ...prev, extras: { ...prev.extras, ...partial } }))
  }

  return (
    <div>
      <p className='gl-eyebrow'>Ek ihtiyaçlar</p>
      <div className='mt-3 grid gap-3 sm:grid-cols-2'>
        <ToggleRow
          label='Forklift / yükleme desteği'
          hint='Çıkış ve varışta elleçleme'
          checked={extras.forklift}
          onChange={(checked) => set({ forklift: checked })}
          icon={<Forklift className='size-4' aria-hidden />}
        />
        <ToggleRow
          label='Isı kontrollü taşıma'
          hint='Soğuk zincir gerektiren yükler'
          checked={extras.temperatureControl}
          onChange={(checked) => set({ temperatureControl: checked })}
          icon={<Snowflake className='size-4' aria-hidden />}
        />
        <ToggleRow
          label='Kırılabilir yük'
          hint='Ek ambalaj ve özenli istifleme'
          checked={extras.fragile}
          onChange={(checked) => set({ fragile: checked })}
          icon={<Sparkles className='size-4' aria-hidden />}
        />
        <ToggleRow
          label='Yük sigortası'
          hint='Beyan değeri üzerinden teminat'
          checked={extras.insurance}
          onChange={(checked) => set({ insurance: checked })}
          icon={<ShieldCheck className='size-4' aria-hidden />}
        />
      </div>

      {extras.insurance ? (
        <div className='mt-3 max-w-xs'>
          <NumberField
            label='Beyan edilen yük değeri'
            suffix='₺'
            value={extras.declaredValue}
            onChange={(v) => set({ declaredValue: v })}
          />
        </div>
      ) : null}
    </div>
  )
}
