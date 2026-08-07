import L from 'leaflet'

export type OsmMapTone = 'sky' | 'emerald' | 'amber' | 'muted'

/** facility = depo, pickup = alım, home = teslim, courier = araç, stop = ara durak */
export type OsmMapKind = 'facility' | 'pickup' | 'home' | 'courier' | 'stop'

/** Marker vurgu durumu — aktif/pasif ayrımı buradan okunur */
export type OsmMapMarkerState = 'active' | 'passive' | 'selected'

const TONE_THEME: Record<
  OsmMapTone,
  { fill: string; soft: string; ink: string; ring: string }
> = {
  sky: {
    fill: '#0284c7',
    soft: '#e0f2fe',
    ink: '#0369a1',
    ring: 'rgba(2,132,199,0.45)',
  },
  emerald: {
    fill: '#059669',
    soft: '#d1fae5',
    ink: '#047857',
    ring: 'rgba(5,150,105,0.45)',
  },
  amber: {
    fill: '#d97706',
    soft: '#fef3c7',
    ink: '#b45309',
    ring: 'rgba(217,119,6,0.5)',
  },
  muted: {
    fill: '#94a3b8',
    soft: '#f1f5f9',
    ink: '#64748b',
    ring: 'rgba(148,163,184,0.4)',
  },
}

let markerStylesInjected = false

function ensureMarkerStyles() {
  if (typeof document === 'undefined') return
  const existing = document.getElementById('lastmile-osm-marker-styles')
  if (markerStylesInjected && existing) return
  existing?.remove()
  markerStylesInjected = true
  const style = document.createElement('style')
  style.id = 'lastmile-osm-marker-styles'
  style.textContent = `
    .lastmile-osm-marker {
      background: transparent !important;
      border: none !important;
    }
    @keyframes lastmile-marker-pulse {
      0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.55; }
      70% { transform: translate(-50%, -50%) scale(1.85); opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(1.85); opacity: 0; }
    }
    .lastmile-marker-pulse {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      pointer-events: none;
      animation: lastmile-marker-pulse 2.1s ease-out infinite;
    }
    .leaflet-tooltip.lastmile-map-tooltip {
      background: #ffffff;
      color: #0f172a;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 0.75rem;
      padding: 0;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1.35;
      box-shadow:
        0 1px 2px rgba(15, 23, 42, 0.04),
        0 10px 28px rgba(15, 23, 42, 0.12);
      white-space: normal;
      max-width: 240px;
    }
    .leaflet-tooltip.lastmile-map-tooltip::before {
      border: none !important;
      content: '';
      position: absolute;
      left: 50%;
      bottom: -4px;
      width: 8px;
      height: 8px;
      margin-left: -4px;
      background: #ffffff;
      border-right: 1px solid rgba(15, 23, 42, 0.08);
      border-bottom: 1px solid rgba(15, 23, 42, 0.08);
      transform: rotate(45deg);
      border-radius: 1px;
    }
    .leaflet-tooltip.lastmile-map-tooltip.leaflet-tooltip-bottom::before {
      top: -4px;
      bottom: auto;
      border-right: none;
      border-bottom: none;
      border-left: 1px solid rgba(15, 23, 42, 0.08);
      border-top: 1px solid rgba(15, 23, 42, 0.08);
    }
    .lm-tip {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.55rem 0.7rem 0.6rem;
      min-width: 140px;
    }
    .lm-tip-meta {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .lm-tip-kind {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.625rem;
      font-weight: 650;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #64748b;
    }
    .lm-tip-dot {
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      flex-shrink: 0;
    }
    .lm-tip-status {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      padding: 0.1rem 0.4rem;
      font-size: 0.625rem;
      font-weight: 650;
      letter-spacing: 0.02em;
    }
    .lm-tip-status-active {
      background: #ecfdf5;
      color: #047857;
    }
    .lm-tip-status-on-route {
      background: #ecfdf5;
      color: #047857;
    }
    .lm-tip-status-idle {
      background: #e0f2fe;
      color: #0369a1;
    }
    .lm-tip-status-selected {
      background: #e0f2fe;
      color: #0369a1;
    }
    .lm-tip-status-passive {
      background: #fff1f2;
      color: #be123c;
    }
    .lm-tip-status-neutral {
      background: #f1f5f9;
      color: #64748b;
    }
    .lm-tip-title {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 600;
      color: #0f172a;
      letter-spacing: -0.015em;
      line-height: 1.35;
      word-break: break-word;
    }
  `
  document.head.appendChild(style)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resolveTone(kind: OsmMapKind, tone?: OsmMapTone): OsmMapTone {
  if (tone) return tone
  if (kind === 'courier') return 'amber'
  if (kind === 'stop') return 'muted'
  if (kind === 'facility' || kind === 'pickup') return 'sky'
  return 'emerald'
}

function toneOffset(kind: OsmMapKind) {
  if (kind === 'courier') return -14
  if (kind === 'stop') return -10
  return -20
}

/** Alım — paket */
function pickupIcon(color: string) {
  return `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.5 8.5 12 4l8.5 4.5v9L12 22l-8.5-4.5v-9z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M3.5 8.5 12 13l8.5-4.5" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M12 13v9" stroke="${color}" stroke-width="1.8"/>
  </svg>`
}

/** Teslim — ev */
function homeIcon(color: string) {
  return `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 11.2 12 4.2l8 7" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.8 10.5V19.5h10.4v-9" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M10.2 19.5v-4.6h3.6v4.6" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`
}

/** Depo / tesis */
function facilityIcon(color: string) {
  return `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20V9.2L12 4l8 5.2V20" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M9.5 20v-5.2h5V20" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M9 11h.01M15 11h.01M9 14.5h.01M15 14.5h.01" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`
}

/** Araç */
function courierIcon(color: string) {
  return `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.5 10h10.5v7.5H3.5V10z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M14 11h3.2L20.5 15v2.5H14V11z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="7" cy="18.8" r="1.5" stroke="${color}" stroke-width="1.5"/>
    <circle cx="17.5" cy="18.8" r="1.5" stroke="${color}" stroke-width="1.5"/>
  </svg>`
}

function iconForKind(kind: OsmMapKind, color: string) {
  if (kind === 'courier') return courierIcon(color)
  if (kind === 'facility') return facilityIcon(color)
  if (kind === 'pickup') return pickupIcon(color)
  return homeIcon(color)
}

function resolveState(
  kind: OsmMapKind,
  tone: OsmMapTone,
  options?: { pulse?: boolean; state?: OsmMapMarkerState }
): OsmMapMarkerState {
  if (options?.state) return options.state
  if (tone === 'muted') return 'passive'
  if (kind === 'courier' && (options?.pulse ?? true)) return 'active'
  return 'active'
}

function markerBubbleHtml(opts: {
  kind: OsmMapKind
  theme: (typeof TONE_THEME)[OsmMapTone]
  state: OsmMapMarkerState
  pulse: boolean
}) {
  const { kind, theme, state, pulse } = opts
  const isPassive = state === 'passive'
  const isSelected = state === 'selected'
  const discSize = isPassive ? 30 : isSelected ? 36 : 34
  const tipColor = isPassive ? '#cbd5e1' : theme.fill
  const discBg = isPassive ? '#ffffff' : theme.fill
  const discBorder = isPassive
    ? '1.5px solid #cbd5e1'
    : isSelected
      ? `2.5px solid #ffffff`
      : `1.5px solid rgba(255,255,255,0.85)`
  const iconColor = isPassive ? '#94a3b8' : '#ffffff'
  const outerRing = isPassive
    ? 'none'
    : isSelected
      ? `0 0 0 3px ${theme.fill}, 0 0 0 6px ${theme.soft}`
      : `0 0 0 3px ${theme.soft}`
  const shadow = isPassive
    ? '0 2px 8px rgba(15,23,42,.08)'
    : '0 6px 16px rgba(15,23,42,.18)'

  return `
    <div style="
      position:relative;width:44px;height:52px;
      opacity:${isPassive ? '0.72' : '1'};
    ">
      ${
        pulse && !isPassive
          ? `<span class="lastmile-marker-pulse" style="top:17px;background:${theme.ring};"></span>`
          : ''
      }
      <div style="
        position:absolute;left:50%;top:${isSelected ? '1px' : '3px'};
        transform:translateX(-50%);
        width:${discSize}px;height:${discSize}px;border-radius:9999px;
        background:${discBg};
        border:${discBorder};
        box-shadow:${outerRing}, ${shadow};
        display:flex;align-items:center;justify-content:center;
      ">${iconForKind(kind, iconColor)}</div>
      <div style="
        position:absolute;left:50%;bottom:6px;transform:translateX(-50%);
        width:10px;height:10px;
        background:${tipColor};
        clip-path: polygon(50% 100%, 0 0, 100% 0);
      "></div>
      ${
        isSelected
          ? `<div style="
              position:absolute;right:2px;top:0;
              width:14px;height:14px;border-radius:9999px;
              background:#0f172a;border:2px solid #fff;
              box-shadow:0 2px 6px rgba(15,23,42,.2);
              display:flex;align-items:center;justify-content:center;
            ">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5 10 17.5 19 7" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>`
          : ''
      }
    </div>
  `
}

export function createLastmileMapMarkerIcon(
  kind: OsmMapKind,
  tone?: OsmMapTone,
  label?: string,
  options?: { pulse?: boolean; state?: OsmMapMarkerState }
) {
  ensureMarkerStyles()
  const resolved = resolveTone(kind, tone)
  const theme = TONE_THEME[resolved]
  const state = resolveState(kind, resolved, options)
  const safe = escapeHtml((label ?? '').slice(0, 2))
  const pulse =
    options?.pulse ?? (kind === 'courier' && state !== 'passive')

  if (kind === 'stop') {
    const isPassive = state === 'passive'
    return L.divIcon({
      className: 'lastmile-osm-marker',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      html: `
        <div style="
          width:26px;height:26px;border-radius:9999px;
          background:${isPassive ? '#ffffff' : theme.fill};
          border:${isPassive ? '1.5px solid #cbd5e1' : '2px solid #ffffff'};
          box-shadow:${
            isPassive
              ? '0 2px 8px rgba(15,23,42,.1)'
              : `0 0 0 3px ${theme.soft}, 0 4px 12px rgba(15,23,42,.16)`
          };
          display:flex;align-items:center;justify-content:center;
          color:${isPassive ? theme.ink : '#ffffff'};
          font:700 10px/1 ui-sans-serif,system-ui,sans-serif;
          opacity:${isPassive ? '0.75' : '1'};
        ">${safe || ''}</div>
      `,
    })
  }

  return L.divIcon({
    className: 'lastmile-osm-marker',
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    html: markerBubbleHtml({
      kind,
      theme,
      state,
      pulse,
    }),
  })
}

export function getMapMarkerTooltipOffset(kind: OsmMapKind) {
  return toneOffset(kind)
}

export function getMapPointKindLabel(kind: OsmMapKind): string {
  switch (kind) {
    case 'pickup':
      return 'Alım Noktası'
    case 'home':
      return 'Teslim Noktası'
    case 'courier':
      return 'Araç'
    case 'facility':
      return 'Tesis'
    case 'stop':
      return 'Durak'
  }
}

export function getMapToneColor(tone: OsmMapTone): string {
  return TONE_THEME[tone].fill
}
