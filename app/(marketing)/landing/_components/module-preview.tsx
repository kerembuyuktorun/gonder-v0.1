'use client'

import { ChevronLeft, ChevronRight, Play, Plus, Search } from 'lucide-react'
import type { AppTone, LandingModule } from '../_lib/modules'

const TONE_CLASS: Record<AppTone, string> = {
  petrol: 'bg-[#195b55] text-white',
  petrolLight: 'bg-[#1f726a] text-white',
  accent: 'bg-[#c44a2d] text-white',
  ink: 'bg-[#192d32] text-white',
  yellow: 'bg-[#e8ce87] text-[#192d32]',
  slate: 'bg-[#64807f] text-white',
}

function PanelHeader({ title }: { title: string }) {
  return (
    <div className='flex items-center justify-between gap-2 px-3 pb-2 pt-3'>
      <span className='inline-flex items-center gap-1 text-sm font-semibold text-[var(--gl-ink)]'>
        {title}
        <ChevronRight className='size-3.5 text-[var(--gl-muted)]' aria-hidden />
      </span>
      <span className='flex size-5 items-center justify-center rounded-md text-[var(--gl-muted)]'>
        <Plus className='size-3.5' aria-hidden />
      </span>
    </div>
  )
}

export function ModulePreview({ module }: { module: LandingModule }) {
  return (
    <div className='relative'>
      <div
        className='pointer-events-none absolute -inset-x-6 -top-6 bottom-0 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(25,91,85,0.07),transparent)]'
        aria-hidden
      />

      <div className='relative overflow-hidden rounded-t-[1.5rem] border border-b-0 border-[var(--gl-border)] bg-white shadow-[0_-4px_80px_-30px_rgb(25_45_50_/_0.35)]'>
        {/* Çalışma alanı üst çubuğu */}
        <div className='flex items-center justify-between gap-3 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <span className='flex size-6 items-center justify-center rounded-full bg-[var(--gl-subtle)] text-[var(--gl-muted)]'>
              <ChevronLeft className='size-3.5' aria-hidden />
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--gl-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--gl-ink)]'>
              {module.workspace}
              <ChevronRight className='size-3' aria-hidden />
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <div className='flex -space-x-2'>
              {['#195b55', '#c44a2d', '#64807f', '#e8ce87'].map((color) => (
                <span
                  key={color}
                  className='size-6 rounded-full border-2 border-white'
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
              ))}
            </div>
            <span className='rounded-full border border-[var(--gl-border)] px-2.5 py-1 text-xs font-medium text-[var(--gl-muted)]'>
              Davet et
            </span>
          </div>
        </div>

        {/* Modülün uygulamaları */}
        <div className='relative'>
          <div className='flex gap-4 overflow-hidden px-4 pb-5 pt-3'>
            <div className='flex w-16 shrink-0 flex-col items-center gap-2'>
              <span className='flex size-12 items-center justify-center rounded-xl border-2 border-dashed border-[var(--gl-border-strong)] text-[var(--gl-muted)]'>
                <Plus className='size-5' aria-hidden />
              </span>
              <span className='text-center text-[10px] leading-tight text-[var(--gl-muted)]'>Yeni uygulama</span>
            </div>

            {module.apps.map((app) => {
              const Icon = app.icon
              return (
                <div key={app.label} className='flex w-16 shrink-0 flex-col items-center gap-2'>
                  <span
                    className={`flex size-12 items-center justify-center rounded-xl ${TONE_CLASS[app.tone]}`}
                  >
                    <Icon className='size-5' aria-hidden />
                  </span>
                  <span className='text-center text-[10px] leading-tight text-[var(--gl-muted)]'>{app.label}</span>
                </div>
              )
            })}
          </div>
          <div
            className='pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent'
            aria-hidden
          />
        </div>

        {/* Kayıtlar / veri / akışlar */}
        <div className='grid gap-3 px-4 pb-4 md:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-xl border border-[var(--gl-border)] bg-white'>
            <div className='flex items-center justify-between gap-2 px-3 pb-2 pt-3'>
              <span className='text-sm font-semibold text-[var(--gl-ink)]'>{module.recordsTitle}</span>
              <Search className='size-3.5 text-[var(--gl-muted)]' aria-hidden />
            </div>
            <ul className='px-3 pb-3'>
              {module.records.map((record, index) => (
                <li key={record.title} className='flex items-start gap-2 border-t border-[var(--gl-border)] py-2 first:border-t-0'>
                  <span
                    className='mt-1.5 size-1.5 shrink-0 rounded-full'
                    style={{ backgroundColor: index % 3 === 0 ? '#c44a2d' : index % 3 === 1 ? '#e8ce87' : '#195b55' }}
                    aria-hidden
                  />
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-xs font-medium text-[var(--gl-ink)]'>{record.title}</span>
                    <span className='block truncate text-[11px] text-[var(--gl-muted)]'>{record.meta}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className='rounded-xl border border-[var(--gl-border)] bg-white'>
            <PanelHeader title='Veri' />
            <ul className='px-3 pb-3'>
              {module.entities.map((entity) => (
                <li
                  key={entity.label}
                  className='flex items-center gap-2 border-t border-[var(--gl-border)] py-2 first:border-t-0'
                >
                  <span className='flex size-4 shrink-0 items-center justify-center rounded bg-[var(--gl-subtle)]' aria-hidden>
                    <span className='size-1.5 rounded-[2px] bg-[var(--gl-muted)]' />
                  </span>
                  <span className='min-w-0 flex-1 truncate text-xs text-[var(--gl-ink)]'>{entity.label}</span>
                  <span
                    className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                      entity.delta ? 'text-[var(--gl-petrol)]' : 'text-[var(--gl-muted)]'
                    }`}
                  >
                    {entity.delta ?? entity.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className='rounded-xl border border-[var(--gl-border)] bg-white'>
            <PanelHeader title='Akışlar' />
            <ul className='px-3 pb-3'>
              {module.workflows.map((workflow) => (
                <li
                  key={workflow.label}
                  className='flex items-center gap-2 border-t border-[var(--gl-border)] py-2 first:border-t-0'
                >
                  <Play className='size-3 shrink-0 text-[var(--gl-muted)]' aria-hidden />
                  <span className='min-w-0 flex-1 truncate text-xs text-[var(--gl-ink)]'>{workflow.label}</span>
                  <span className='shrink-0 text-[11px] text-[var(--gl-muted)]'>{workflow.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Alt kesim: içeriğin devam ettiğini hissettirir */}
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#e4e9e8] via-[#e4e9e8]/85 to-transparent'
        aria-hidden
      />
    </div>
  )
}
