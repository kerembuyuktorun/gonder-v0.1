import { Headset, Layers } from 'lucide-react'

const MOCK_OFFERS = [
  {
    initials: 'AP',
    bg: '#195b55',
    name: 'ARF Parcel',
    source: 'Anlık Teklif',
    tag: 'Önerilen',
    eta: '1–2 iş günü',
    type: 'Koli / Paket',
    price: '₺189',
  },
  {
    initials: 'EG',
    bg: '#2f6b3a',
    name: 'EkoGönder',
    source: 'Gönder Eşleşmesi',
    tag: 'En Uygun',
    eta: '3–5 iş günü',
    type: 'Koli / Paket',
    price: '₺118',
  },
  {
    initials: 'AF',
    bg: '#7c4a1e',
    name: 'Anadolu Filo',
    source: 'Uzman Teklifi',
    tag: 'LTL / Parsiyel',
    eta: 'Değerlendiriliyor',
    type: 'Kamyon · Tenteli',
    price: '—',
  },
]

export function QuoteNetworkSection() {
  return (
    <section id='teklif-agi' className='gl-section scroll-mt-16'>
      <div className='gl-container space-y-14'>
        <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-14'>
          <div className='space-y-4'>
            <p className='gl-eyebrow'>Teklif ağı</p>
            <h2 className='text-3xl font-bold text-[var(--gl-ink)] sm:text-4xl'>
              Tek Talep. Birden Fazla Taşıma Seçeneği.
            </h2>
            <p className='max-w-xl text-base leading-relaxed text-[var(--gl-muted)]'>
              Gönder, anlaşmalı firmalar ve taşıma ağı üzerinden talebiniz için uygun seçenekleri
              oluşturur. İlk tekliflerinizi hemen değerlendirebilir, süreç devam ederken farklı
              taşıyıcı veya fiyat alternatifleri de oluşabilir.
            </p>
          </div>

          <div className='space-y-2.5'>
            {MOCK_OFFERS.map((offer) => (
              <div
                key={offer.name}
                className='flex items-center gap-3 rounded-2xl border border-[var(--gl-border)] bg-white p-3 shadow-[0_12px_32px_-24px_rgb(25_45_50_/_0.45)]'
              >
                <span
                  className='flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white'
                  style={{ background: offer.bg }}
                  aria-hidden
                >
                  {offer.initials}
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <p className='text-sm font-semibold text-[var(--gl-ink)]'>{offer.name}</p>
                    <span className='rounded-full bg-[var(--gl-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--gl-muted)]'>
                      {offer.source}
                    </span>
                    <span className='rounded-full bg-[var(--gl-yellow-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--gl-ink)]'>
                      {offer.tag}
                    </span>
                  </div>
                  <p className='mt-0.5 text-xs text-[var(--gl-muted)]'>
                    {offer.eta} · {offer.type}
                  </p>
                </div>
                <p className='shrink-0 text-sm font-bold tabular-nums text-[var(--gl-ink)]'>
                  {offer.price}
                </p>
              </div>
            ))}
            <p className='px-1 text-xs leading-relaxed text-[var(--gl-muted)]'>
              Kullanılabilir seçenekleri hemen değerlendirebilirsiniz. Ana aksiyon her zaman teklifi
              seçmektir.
            </p>
          </div>
        </div>

        <div className='grid items-start gap-8 rounded-3xl border border-[var(--gl-border)] bg-[var(--gl-bg-soft)] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12'>
          <div className='space-y-4'>
            <span className='inline-flex size-11 items-center justify-center rounded-xl bg-[var(--gl-petrol)]/10 text-[var(--gl-petrol)]'>
              <Headset className='size-5' aria-hidden />
            </span>
            <h3 className='text-2xl font-bold text-[var(--gl-ink)] sm:text-3xl'>
              Kompleks Taşımalarda Lojistik Uzmanı Desteği
            </h3>
            <p className='max-w-xl text-base leading-relaxed text-[var(--gl-muted)]'>
              Standart dışı ve özel lojistik ihtiyaçlarında Gönder Lojistik Uzmanları talebinizi
              değerlendirir, uygun araç ve taşıyıcı alternatiflerini araştırır.
            </p>
          </div>
          <ul className='grid gap-2.5 text-sm text-[var(--gl-ink)] sm:grid-cols-2'>
            {[
              'FTL / komple',
              'LTL / parsiyel',
              'Özel araç',
              'Büyük hacimli yük',
              'Standart dışı ihtiyaç',
              'Kompleks lojistik',
            ].map((item) => (
              <li
                key={item}
                className='flex items-center gap-2.5 rounded-xl border border-[var(--gl-border)] bg-white px-3 py-2.5'
              >
                <Layers className='size-4 shrink-0 text-[var(--gl-petrol)]' aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
