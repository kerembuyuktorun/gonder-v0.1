'use client'

import { ArrowRight } from 'lucide-react'
import { LANDING_MODULES } from '../_lib/modules'
import { ModulePreview } from './module-preview'
import { useQuoteLanding } from './quote-context'

export function ModulesSection() {
  const { activeModule, setActiveModule, startOrder } = useQuoteLanding()
  const active = LANDING_MODULES.find((m) => m.id === activeModule) ?? LANDING_MODULES[0]

  return (
    <section
      id='moduller'
      className='scroll-mt-20 overflow-hidden border-t border-[var(--gl-border)] bg-[var(--gl-bg-soft)] pt-[clamp(3.5rem,8vw,6rem)]'
    >
      <div className='gl-container'>
        <div className='mx-auto max-w-2xl text-center'>
          <p className='gl-eyebrow'>Modüller</p>
          <h2 className='mt-3 text-3xl font-bold text-[var(--gl-ink)] sm:text-4xl'>
            Operasyonun her katmanı için bir modül
          </h2>
          <p className='mt-3 text-[var(--gl-muted)]'>
            Siparişten teslimata, ambardan navluna. İhtiyacın olanı seç, hepsi aynı veri üzerinde birlikte çalışsın.
          </p>
        </div>

        <div
          role='tablist'
          aria-label='Modüller'
          className='mx-auto mt-9 flex max-w-full snap-x gap-1 overflow-x-auto rounded-full border border-[var(--gl-border)] bg-white p-1 [scrollbar-width:none] sm:w-fit [&::-webkit-scrollbar]:hidden'
        >
          {LANDING_MODULES.map((module) => {
            const selected = module.id === active.id
            return (
              <button
                key={module.id}
                type='button'
                role='tab'
                id={`module-tab-${module.id}`}
                aria-selected={selected}
                aria-controls={`module-panel-${module.id}`}
                onClick={() => setActiveModule(module.id)}
                className={`shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-[var(--gl-ink)] text-white'
                    : 'text-[var(--gl-muted)] hover:bg-[var(--gl-subtle)] hover:text-[var(--gl-ink)]'
                }`}
              >
                {module.label}
              </button>
            )
          })}
        </div>

        <div
          key={active.id}
          role='tabpanel'
          id={`module-panel-${active.id}`}
          aria-labelledby={`module-tab-${active.id}`}
          className='gl-fade-in'
        >
          <div className='mx-auto mt-8 max-w-2xl text-center'>
            <p className='gl-eyebrow'>{active.fullName}</p>
            <h3 className='mt-2 text-xl font-bold text-[var(--gl-ink)] sm:text-2xl'>{active.headline}</h3>
            <p className='mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--gl-muted)]'>
              {active.description}
            </p>
            <button
              type='button'
              onClick={() => startOrder()}
              className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gl-accent)] underline-offset-4 hover:underline'
            >
              Bu modülle başla
              <ArrowRight className='size-4' aria-hidden />
            </button>
          </div>

          <div className='mt-10'>
            <ModulePreview module={active} />
          </div>
        </div>
      </div>
    </section>
  )
}
