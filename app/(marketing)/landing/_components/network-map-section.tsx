'use client'

import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuoteLanding } from './quote-context'
import { CITY_MAP_COORDS, TURKEY_CITIES } from '../_lib/turkey-cities'

const MAP_CITIES = TURKEY_CITIES.filter((c) => CITY_MAP_COORDS[c])

const BENEFITS = [
  'Ambar hatlarının dijital görünürlüğü',
  'Standart yük bilgisi iletimi',
  'Kapasiteye göre eşleştirme',
  'Tekliflerin tek talep üzerinden takibi',
  'Yükleme, aktarma ve teslimat bilgisine erişim',
]

function TurkeyOutline() {
  return (
    <path
      d='M8 18 C12 8, 28 6, 42 12 C58 8, 78 14, 82 28 C88 38, 84 52, 76 62 C68 72, 52 78, 38 74 C24 70, 12 58, 8 42 Z'
      fill='#ffffff'
      stroke='rgba(25,91,85,0.28)'
      strokeWidth='0.8'
    />
  )
}

export function NetworkMapSection() {
  const { prefillRoute } = useQuoteLanding()
  const [origin, setOrigin] = useState('İstanbul')
  const [dest, setDest] = useState('Ankara')

  const originCoord = CITY_MAP_COORDS[origin]
  const destCoord = CITY_MAP_COORDS[dest]

  const routeLine = useMemo(() => {
    if (!originCoord || !destCoord || origin === dest) return null
    return { x1: originCoord.x, y1: originCoord.y, x2: destCoord.x, y2: destCoord.y }
  }, [origin, dest, originCoord, destCoord])

  return (
    <section
      id='navlun-agi'
      className='gl-section scroll-mt-16 border-y border-[var(--gl-border)] bg-[var(--gl-petrol-soft)]'
    >
      <div className='gl-container'>
        <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-14'>
          <div className='space-y-5'>
            <p className='gl-eyebrow'>Navlun ağı</p>
            <h2 className='text-3xl font-bold text-[var(--gl-ink)] sm:text-4xl'>
              81 il. Tek navlun ağı.
            </h2>
            <p className='text-lg font-semibold text-[var(--gl-petrol)]'>
              Ambar taşımacılığını dijitalleştiriyoruz.
            </p>
            <p className='max-w-lg text-sm leading-relaxed text-[var(--gl-muted)]'>
              Yerel ambarları ve taşıma ağlarını ortak bir dijital yapıda buluşturuyoruz. Yüküne
              uygun hattı bulmanı, teklif almanı ve taşıma sürecini takip etmeni kolaylaştırıyoruz.
            </p>

            <ul className='space-y-2.5 text-sm text-[var(--gl-ink)]'>
              {BENEFITS.map((item) => (
                <li key={item} className='flex items-start gap-2.5'>
                  <span
                    className='mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--gl-petrol)]'
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className='flex flex-wrap gap-3 pt-2'>
              <button
                type='button'
                className='gl-btn-primary'
                onClick={() => prefillRoute(origin, dest, 'lojistik')}
              >
                Yüküm İçin Teklif Al
              </button>
              <a href='#isletme' className='gl-btn-secondary'>
                Taşıma Ağına Katıl
              </a>
            </div>
          </div>

          <div className='gl-card space-y-4 p-4 sm:p-5'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label>Çıkış ili</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAP_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label>Varış ili</Label>
                <Select value={dest} onValueChange={setDest}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAP_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--gl-border)] bg-[var(--gl-bg-soft)]'>
              <svg viewBox='0 0 100 80' className='h-full w-full' aria-label='Türkiye navlun ağı haritası'>
                <TurkeyOutline />
                {routeLine ? (
                  <line
                    x1={routeLine.x1}
                    y1={routeLine.y1}
                    x2={routeLine.x2}
                    y2={routeLine.y2}
                    stroke='var(--gl-accent)'
                    strokeWidth='1.2'
                    strokeDasharray='2 1.5'
                  />
                ) : null}
                {MAP_CITIES.map((city) => {
                  const coord = CITY_MAP_COORDS[city]
                  if (!coord) return null
                  const active = city === origin || city === dest
                  return (
                    <g key={city}>
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={active ? 2.8 : 1.6}
                        fill={active ? 'var(--gl-accent)' : 'rgba(25,91,85,0.45)'}
                      />
                      {active ? (
                        <text
                          x={coord.x}
                          y={coord.y - 4.5}
                          textAnchor='middle'
                          fontSize='3.6'
                          fontWeight='600'
                          fill='#192d32'
                          className='select-none'
                        >
                          {city}
                        </text>
                      ) : null}
                    </g>
                  )
                })}
              </svg>
              <p className='absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] text-[var(--gl-muted)]'>
                <MapPin className='size-3' aria-hidden />
                Örnek harita — gerçek kapasite verisi yok
              </p>
            </div>

            <p className='text-xs leading-relaxed text-[var(--gl-muted)]'>
              81 il ağ kapsamını gösterir; belirli tarih, ilçe ve yük için hizmet bulunabilirliği
              teklif adımında belirlenir.
            </p>

            <div className='lg:hidden'>
              <button
                type='button'
                className='gl-btn-secondary w-full'
                onClick={() => prefillRoute(origin, dest, 'lojistik')}
              >
                Bu hatta teklif al
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
