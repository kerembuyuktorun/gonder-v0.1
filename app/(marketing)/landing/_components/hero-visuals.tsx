/**
 * Hero çevresinde taşıyıcı ve gönderi temalı sade çizimler.
 * Stok fotoğraf yerine tek bir çizim dili kullanılır.
 */

type TileProps = {
  className?: string
  label: string
  caption?: string
}

function TileFrame({
  className,
  label,
  caption,
  tone,
  children,
}: TileProps & { tone: string; children: React.ReactNode }) {
  return (
    <figure className={`gl-tile ${className ?? ''}`}>
      <div className='relative' style={{ background: tone }}>
        <svg viewBox='0 0 160 120' className='h-full w-full' role='img' aria-label={label}>
          {children}
        </svg>
      </div>
      {caption ? (
        <figcaption className='flex items-center gap-1.5 border-t border-[var(--gl-border)] bg-white px-3 py-2 text-[11px] font-medium text-[var(--gl-muted)]'>
          <span className='size-1.5 rounded-full bg-[var(--gl-petrol)]' aria-hidden />
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function TileCourier(props: TileProps) {
  return (
    <TileFrame {...props} tone='linear-gradient(150deg,#eaf1ef,#dfeae7)'>
      <circle cx='118' cy='34' r='16' fill='#fbf3de' />
      {/* yol */}
      <path d='M0 96h160' stroke='#c9d6d2' strokeWidth='3' strokeLinecap='round' />
      <path d='M12 96h18M46 96h18M80 96h18M114 96h18' stroke='#ffffff' strokeWidth='2' strokeLinecap='round' />
      {/* motor */}
      <circle cx='52' cy='86' r='11' fill='none' stroke='#192d32' strokeWidth='4' />
      <circle cx='112' cy='86' r='11' fill='none' stroke='#192d32' strokeWidth='4' />
      <path d='M52 86l14-22h22l10 22' fill='none' stroke='#195b55' strokeWidth='4' strokeLinejoin='round' />
      <path d='M88 64l16-6' stroke='#195b55' strokeWidth='4' strokeLinecap='round' />
      {/* kutu */}
      <rect x='60' y='40' width='26' height='22' rx='3' fill='#c44a2d' />
      <path d='M60 51h26' stroke='#fbeee9' strokeWidth='2.5' />
      {/* kurye */}
      <circle cx='84' cy='30' r='8' fill='#192d32' />
      <path d='M84 38c-7 4-10 12-10 18' stroke='#192d32' strokeWidth='4' strokeLinecap='round' />
    </TileFrame>
  )
}

export function TileTruck(props: TileProps) {
  return (
    <TileFrame {...props} tone='linear-gradient(150deg,#fbf3de,#f3e8cd)'>
      <path d='M0 94h160' stroke='#ddd0ad' strokeWidth='3' strokeLinecap='round' />
      {/* dorse */}
      <rect x='16' y='38' width='76' height='46' rx='5' fill='#ffffff' stroke='#192d32' strokeWidth='4' />
      <path d='M16 60h76' stroke='#dedcd5' strokeWidth='3' />
      {/* çekici */}
      <path
        d='M92 52h26l16 18v14H92z'
        fill='#195b55'
        stroke='#192d32'
        strokeWidth='4'
        strokeLinejoin='round'
      />
      <rect x='98' y='56' width='18' height='13' rx='2' fill='#eaf1ef' />
      <circle cx='44' cy='88' r='10' fill='#ffffff' stroke='#192d32' strokeWidth='4' />
      <circle cx='114' cy='88' r='10' fill='#ffffff' stroke='#192d32' strokeWidth='4' />
    </TileFrame>
  )
}

export function TileWarehouse(props: TileProps) {
  return (
    <TileFrame {...props} tone='linear-gradient(150deg,#eef1ec,#e3e8e1)'>
      {/* çatı */}
      <path d='M20 52L80 24l60 28' fill='none' stroke='#192d32' strokeWidth='4' strokeLinejoin='round' />
      <rect x='28' y='52' width='104' height='44' rx='4' fill='#ffffff' stroke='#192d32' strokeWidth='4' />
      {/* kapılar */}
      <rect x='42' y='66' width='24' height='30' fill='#eaf1ef' stroke='#195b55' strokeWidth='3' />
      <rect x='78' y='66' width='24' height='30' fill='#eaf1ef' stroke='#195b55' strokeWidth='3' />
      <path d='M42 78h24M78 78h24' stroke='#195b55' strokeWidth='2.5' />
      {/* palet */}
      <rect x='112' y='78' width='18' height='12' rx='2' fill='#c44a2d' />
    </TileFrame>
  )
}

export function TilePackages(props: TileProps) {
  return (
    <TileFrame {...props} tone='linear-gradient(150deg,#fbeee9,#f6e0d8)'>
      {/* büyük koli */}
      <rect x='28' y='46' width='52' height='46' rx='4' fill='#ffffff' stroke='#192d32' strokeWidth='4' />
      <path d='M54 46v46' stroke='#dedcd5' strokeWidth='3' />
      <path d='M28 62h52' stroke='#c44a2d' strokeWidth='4' />
      {/* küçük koli */}
      <rect x='88' y='60' width='40' height='32' rx='4' fill='#ffffff' stroke='#192d32' strokeWidth='4' />
      <path d='M108 60v32' stroke='#dedcd5' strokeWidth='3' />
      <path d='M88 72h40' stroke='#195b55' strokeWidth='4' />
      {/* etiket */}
      <rect x='34' y='26' width='34' height='14' rx='3' fill='#195b55' />
      <path d='M40 33h22' stroke='#ffffff' strokeWidth='2.5' strokeLinecap='round' />
    </TileFrame>
  )
}

export function TileRoute(props: TileProps) {
  return (
    <TileFrame {...props} tone='linear-gradient(150deg,#eaf1ef,#e6efe9)'>
      <path
        d='M28 88C28 60 60 74 78 56s16-32 54-30'
        fill='none'
        stroke='#195b55'
        strokeWidth='3.5'
        strokeDasharray='7 6'
        strokeLinecap='round'
      />
      {/* çıkış */}
      <circle cx='28' cy='88' r='9' fill='#ffffff' stroke='#192d32' strokeWidth='4' />
      <circle cx='28' cy='88' r='3' fill='#192d32' />
      {/* varış pin */}
      <path d='M132 22c9 0 16 7 16 16 0 11-16 26-16 26s-16-15-16-26c0-9 7-16 16-16z' fill='#c44a2d' />
      <circle cx='132' cy='38' r='6' fill='#ffffff' />
    </TileFrame>
  )
}
