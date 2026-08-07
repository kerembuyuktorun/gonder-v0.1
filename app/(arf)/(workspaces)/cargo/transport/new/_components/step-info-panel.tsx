'use client'

import type { ReactNode } from 'react'

interface StepInfoPanelProps {
  title: string
  description: string
  children?: ReactNode
}

export function StepInfoPanel({ title, description, children }: StepInfoPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50/80 p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  )
}
