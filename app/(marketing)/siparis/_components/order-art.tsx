/**
 * Sipariş sihirbazındaki seçim kartlarının çizimleri.
 * Tek bir çizgi dili: ink konturlar, petrol/terrakota vurgular.
 */

const INK = '#192d32'
const PETROL = '#195b55'
const ACCENT = '#c44a2d'
const PAPER = '#ffffff'
const SAND = '#e8ce87'
const MIST = '#dbe4e2'

function Wheels({ xs, y }: { xs: number[]; y: number }) {
  return (
    <>
      {xs.map((x) => (
        <circle key={x} cx={x} cy={y} r='7' fill={PAPER} stroke={INK} strokeWidth='3.5' />
      ))}
    </>
  )
}

type VehicleShape = {
  /** Kabinin sol kenarı ve genişliği */
  cab: { x: number; width: number; height: number }
  body: { x: number; width: number; top: number }
  wheels: number[]
  accent: string
  /** Çekici ile dorse ayrı gövde (tır) */
  articulated?: boolean
}

const GROUND_Y = 74
const CHASSIS_Y = 66

const VEHICLE_SHAPES: Record<string, VehicleShape> = {
  kamyonet: {
    cab: { x: 30, width: 26, height: 20 },
    body: { x: 56, width: 58, top: 38 },
    wheels: [44, 100],
    accent: PETROL,
  },
  'kamyon-6': {
    cab: { x: 26, width: 26, height: 26 },
    body: { x: 52, width: 84, top: 30 },
    wheels: [40, 122],
    accent: ACCENT,
  },
  'kamyon-10': {
    cab: { x: 24, width: 26, height: 30 },
    body: { x: 50, width: 104, top: 26 },
    wheels: [38, 126, 146],
    accent: PETROL,
  },
  kirkayak: {
    cab: { x: 22, width: 26, height: 32 },
    body: { x: 48, width: 124, top: 24 },
    wheels: [36, 130, 150, 168],
    accent: ACCENT,
  },
  tir: {
    cab: { x: 18, width: 30, height: 34 },
    body: { x: 56, width: 130, top: 22 },
    wheels: [34, 148, 166, 182],
    accent: PETROL,
    articulated: true,
  },
}

export function VehicleArt({ variant }: { variant: string }) {
  const shape = VEHICLE_SHAPES[variant] ?? VEHICLE_SHAPES.kamyonet
  const cabTop = CHASSIS_Y - shape.cab.height
  const bodyHeight = CHASSIS_Y - shape.body.top

  return (
    <svg viewBox='0 0 200 90' className='h-full w-full' role='presentation'>
      <line x1='6' y1={GROUND_Y + 9} x2='194' y2={GROUND_Y + 9} stroke={MIST} strokeWidth='3' strokeLinecap='round' />

      {/* Tırda çekici ile dorseyi bağlayan şasi */}
      {shape.articulated ? (
        <line
          x1={shape.cab.x + shape.cab.width - 4}
          y1={CHASSIS_Y - 3}
          x2={shape.body.x + 6}
          y2={CHASSIS_Y - 3}
          stroke={INK}
          strokeWidth='4'
          strokeLinecap='round'
        />
      ) : null}

      <rect
        x={shape.body.x}
        y={shape.body.top}
        width={shape.body.width}
        height={bodyHeight}
        rx='4'
        fill={PAPER}
        stroke={INK}
        strokeWidth='3.5'
      />
      <line
        x1={shape.body.x}
        y1={shape.body.top + bodyHeight * 0.45}
        x2={shape.body.x + shape.body.width}
        y2={shape.body.top + bodyHeight * 0.45}
        stroke={MIST}
        strokeWidth='2.5'
      />

      {/* Kabin: burun eğimli kutu */}
      <path
        d={`M${shape.cab.x + 6} ${cabTop} h${shape.cab.width - 6} v${shape.cab.height} h-${shape.cab.width} v-${shape.cab.height - 8} z`}
        fill={shape.accent}
        stroke={INK}
        strokeWidth='3.5'
        strokeLinejoin='round'
      />
      <rect x={shape.cab.x + 2} y={cabTop + 5} width='14' height='10' rx='2' fill={PAPER} />

      <Wheels xs={shape.wheels} y={GROUND_Y} />
    </svg>
  )
}

const BODY_SHAPES: Record<string, () => React.ReactNode> = {
  tenteli: () => (
    <>
      <rect x='34' y='26' width='132' height='42' rx='4' fill={PAPER} stroke={INK} strokeWidth='3.5' />
      {[52, 70, 88, 106, 124, 142].map((x) => (
        <line key={x} x1={x} y1='30' x2={x} y2='64' stroke={MIST} strokeWidth='3' strokeLinecap='round' />
      ))}
    </>
  ),
  kapali: () => (
    <>
      <rect x='34' y='26' width='132' height='42' rx='4' fill={PAPER} stroke={INK} strokeWidth='3.5' />
      <line x1='100' y1='26' x2='100' y2='68' stroke={INK} strokeWidth='3' />
      <circle cx='94' cy='47' r='2.5' fill={INK} />
      <circle cx='106' cy='47' r='2.5' fill={INK} />
    </>
  ),
  frigo: () => (
    <>
      <rect x='34' y='26' width='132' height='42' rx='4' fill={PAPER} stroke={INK} strokeWidth='3.5' />
      <rect x='44' y='16' width='34' height='14' rx='3' fill={PETROL} stroke={INK} strokeWidth='3' />
      <path
        d='M120 36v22M111 42l18 10M129 42l-18 10'
        stroke={PETROL}
        strokeWidth='3.5'
        strokeLinecap='round'
      />
    </>
  ),
  acik: () => (
    <>
      <rect x='34' y='50' width='132' height='18' rx='3' fill={PAPER} stroke={INK} strokeWidth='3.5' />
      <rect x='58' y='28' width='30' height='22' rx='2' fill={SAND} stroke={INK} strokeWidth='3' />
      <rect x='98' y='34' width='26' height='16' rx='2' fill={ACCENT} stroke={INK} strokeWidth='3' />
    </>
  ),
  lowbed: () => (
    <>
      <path
        d='M34 44h26l10 14h62l10-14h24v18H34z'
        fill={PAPER}
        stroke={INK}
        strokeWidth='3.5'
        strokeLinejoin='round'
      />
      <rect x='78' y='30' width='44' height='28' rx='3' fill={SAND} stroke={INK} strokeWidth='3' />
    </>
  ),
  silobas: () => (
    <>
      <rect x='40' y='30' width='120' height='34' rx='17' fill={PAPER} stroke={INK} strokeWidth='3.5' />
      {[72, 100, 128].map((x) => (
        <path key={x} d={`M${x - 9} 30h18l-9 10z`} fill={PETROL} stroke={INK} strokeWidth='2.5' strokeLinejoin='round' />
      ))}
    </>
  ),
}

export function BodyArt({ variant }: { variant: string }) {
  const render = BODY_SHAPES[variant] ?? BODY_SHAPES.tenteli
  return (
    <svg viewBox='0 0 200 84' className='h-full w-full' role='presentation'>
      {render()}
    </svg>
  )
}

function Box({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx='2' fill={fill} stroke={INK} strokeWidth='3' />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={INK} strokeWidth='2' opacity='0.35' />
    </>
  )
}

const LOAD_SHAPES: Record<string, () => React.ReactNode> = {
  palet: () => (
    <>
      <Box x={40} y={20} w={40} h={30} fill={SAND} />
      <Box x={84} y={20} w={40} h={30} fill={SAND} />
      <Box x={62} y={-6} w={40} h={26} fill={SAND} />
      <rect x='34' y='52' width='96' height='8' rx='2' fill={PAPER} stroke={INK} strokeWidth='3' />
      <rect x='40' y='60' width='12' height='8' fill={PAPER} stroke={INK} strokeWidth='3' />
      <rect x='76' y='60' width='12' height='8' fill={PAPER} stroke={INK} strokeWidth='3' />
      <rect x='112' y='60' width='12' height='8' fill={PAPER} stroke={INK} strokeWidth='3' />
    </>
  ),
  koli: () => (
    <>
      <Box x={38} y={30} w={48} h={36} fill={PAPER} />
      <Box x={92} y={38} w={38} h={28} fill={PAPER} />
      <Box x={56} y={4} w={38} h={26} fill={SAND} />
    </>
  ),
  boru: () => (
    <>
      {[
        [44, 44],
        [72, 44],
        [100, 44],
        [58, 20],
        [86, 20],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <ellipse cx={cx} cy={cy} rx='13' ry='13' fill={PAPER} stroke={INK} strokeWidth='3' />
          <ellipse cx={cx} cy={cy} rx='5' ry='5' fill={MIST} stroke={INK} strokeWidth='2' />
        </g>
      ))}
      <rect x='118' y='12' width='10' height='52' rx='3' fill={PETROL} stroke={INK} strokeWidth='3' />
    </>
  ),
  cuval: () => (
    <>
      <path
        d='M48 24c0-6 6-8 14-8s14 2 14 8v34c0 5-4 8-14 8s-14-3-14-8z'
        fill={SAND}
        stroke={INK}
        strokeWidth='3'
      />
      <path
        d='M92 30c0-6 6-8 14-8s14 2 14 8v28c0 5-4 8-14 8s-14-3-14-8z'
        fill={PAPER}
        stroke={INK}
        strokeWidth='3'
      />
      <path d='M52 22h20M96 28h20' stroke={INK} strokeWidth='3' strokeLinecap='round' />
    </>
  ),
  varil: () => (
    <>
      {[
        [56, PAPER],
        [102, ACCENT],
      ].map(([x, fill]) => (
        <g key={String(x)}>
          <rect x={Number(x)} y='16' width='34' height='50' rx='6' fill={String(fill)} stroke={INK} strokeWidth='3' />
          <line x1={Number(x)} y1='32' x2={Number(x) + 34} y2='32' stroke={INK} strokeWidth='2.5' opacity='0.5' />
          <line x1={Number(x)} y1='50' x2={Number(x) + 34} y2='50' stroke={INK} strokeWidth='2.5' opacity='0.5' />
        </g>
      ))}
    </>
  ),
  diger: () => (
    <>
      <Box x={58} y={22} w={54} h={44} fill={PAPER} />
      <path
        d='M78 40c0-5 4-8 9-8s9 3 9 8-6 5-6 10'
        fill='none'
        stroke={PETROL}
        strokeWidth='3.5'
        strokeLinecap='round'
      />
      <circle cx='87' cy='58' r='2.5' fill={PETROL} />
    </>
  ),
}

export function LoadArt({ variant }: { variant: string }) {
  const render = LOAD_SHAPES[variant] ?? LOAD_SHAPES.koli
  return (
    <svg viewBox='0 0 170 76' className='h-full w-full' role='presentation'>
      {render()}
    </svg>
  )
}

/** Paket ön ayarları: kutu boyutu seçilen ölçüye göre büyür. */
export function PackageArt({ variant }: { variant: string }) {
  if (variant === 'zarf') {
    return (
      <svg viewBox='0 0 120 76' className='h-full w-full' role='presentation'>
        <rect x='22' y='20' width='76' height='40' rx='4' fill={PAPER} stroke={INK} strokeWidth='3' />
        <path d='M22 24l38 24 38-24' fill='none' stroke={INK} strokeWidth='3' strokeLinejoin='round' />
      </svg>
    )
  }

  const scale: Record<string, number> = { kucuk: 0.42, orta: 0.62, buyuk: 0.82, xl: 1 }
  const s = scale[variant] ?? 0.72
  const w = 62 * s
  const h = 48 * s

  return (
    <svg viewBox='0 0 120 76' className='h-full w-full' role='presentation'>
      <line x1='14' y1='68' x2='106' y2='68' stroke={MIST} strokeWidth='3' strokeLinecap='round' />
      <rect
        x={60 - w / 2}
        y={66 - h}
        width={w}
        height={h}
        rx='3'
        fill={PAPER}
        stroke={INK}
        strokeWidth='3'
      />
      <line x1={60} y1={66 - h} x2={60} y2='66' stroke={INK} strokeWidth='2.5' opacity='0.3' />
      <rect x={60 - w / 2} y={66 - h * 0.62} width={w} height={h * 0.14} fill={SAND} opacity='0.85' />
    </svg>
  )
}
