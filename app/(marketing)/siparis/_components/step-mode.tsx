'use client'

import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'
import type { LogisticsMode } from '../_lib/order-types'

const MODES: Array<{ id: LogisticsMode; title: string; hint: string; art: 'ltl' | 'ftl' }> = [
  {
    id: 'ltl',
    title: 'LTL — Parsiyel Taşımacılık',
    hint: 'Aracın bir kısmını kullanırsın, navlunu diğer yüklerle paylaşırsın. Palet ve parça bazlı yükler için uygun.',
    art: 'ltl',
  },
  {
    id: 'ftl',
    title: 'FTL — Komple Taşımacılık',
    hint: 'Araç tamamen sana tahsis edilir. Aktarmasız, doğrudan ve en hızlı seçenek.',
    art: 'ftl',
  },
]

function TrailerArt({ variant }: { variant: 'ltl' | 'ftl' }) {
  const filled = variant === 'ftl'
  const slots = [0, 1, 2, 3, 4, 5, 6, 7]

  return (
    <svg viewBox='0 0 240 110' className='h-full w-full' role='presentation'>
      <line x1='10' y1='96' x2='230' y2='96' stroke='#dbe4e2' strokeWidth='3' strokeLinecap='round' />

      <rect x='48' y='24' width='148' height='58' rx='5' fill='#ffffff' stroke='#192d32' strokeWidth='3.5' />

      {slots.map((index) => {
        const col = index % 4
        const row = Math.floor(index / 4)
        // Parsiyelde araç yarı dolu, kompleyde tamamı senin yükün
        const isMine = filled || index % 4 === 1
        return (
          <rect
            key={index}
            x={58 + col * 34}
            y={32 + row * 26}
            width='28'
            height='20'
            rx='2'
            fill={isMine ? '#c44a2d' : '#e6ebea'}
            stroke='#192d32'
            strokeWidth='2.5'
          />
        )
      })}

      <path d='M20 52h26v30H12v-20z' fill='#195b55' stroke='#192d32' strokeWidth='3.5' strokeLinejoin='round' />
      <rect x='18' y='56' width='14' height='11' rx='2' fill='#ffffff' />

      {[30, 150, 172, 194].map((cx) => (
        <circle key={cx} cx={cx} cy='90' r='8' fill='#ffffff' stroke='#192d32' strokeWidth='3.5' />
      ))}
    </svg>
  )
}

export function StepMode() {
  const { draft, patch, next, back } = useWizard()

  return (
    <div>
      <StepHeader
        title='Taşıma opsiyonu'
        description='Yükün aracın tamamını mı kaplıyor, yoksa bir bölümünü mü? Doğru seçim navlunu doğrudan etkiler.'
      />

      <div className='grid gap-4 sm:grid-cols-2'>
        {MODES.map((mode) => {
          const selected = draft.logisticsMode === mode.id
          return (
            <button
              key={mode.id}
              type='button'
              onClick={() => patch({ logisticsMode: mode.id })}
              aria-pressed={selected}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${
                selected
                  ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)] shadow-[0_20px_44px_-28px_rgb(25_91_85_/_0.5)]'
                  : 'border-[var(--gl-border)] bg-white hover:border-[var(--gl-border-strong)]'
              }`}
            >
              <div className='h-28'>
                <TrailerArt variant={mode.art} />
              </div>
              <p className='mt-3 text-base font-bold text-[var(--gl-ink)]'>{mode.title}</p>
              <p className='mt-1.5 text-sm leading-relaxed text-[var(--gl-muted)]'>{mode.hint}</p>
            </button>
          )
        })}
      </div>

      <StepNav onBack={back} onNext={next} nextDisabled={!draft.logisticsMode} />
    </div>
  )
}
