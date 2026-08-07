"use client"

interface Props {
  minKm: number
  maxKm: number | null
  hasUpperLimit: boolean
}

function formatKm(value: number): string {
  const rounded = Number(value.toFixed(2))
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

export function KmRangePreview({ minKm, maxKm, hasUpperLimit }: Props) {
  const start = formatKm(Number(minKm || 0))
  const end = hasUpperLimit && maxKm !== null ? `${formatKm(maxKm)} KM` : "Limit Yok"

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      Tanım Aralığı Önizleme: <span className="font-medium">{start} KM - {end}</span>
    </div>
  )
}
