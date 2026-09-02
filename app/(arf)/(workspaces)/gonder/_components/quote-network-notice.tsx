import { Info } from 'lucide-react'

export function QuoteNetworkNotice() {
  return (
    <div className='rounded-xl border border-border bg-muted/40 px-3 py-3 sm:px-4'>
      <p className='text-sm font-semibold'>Teklifleriniz hazır.</p>
      <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
        Kullanılabilir seçenekleri hemen değerlendirebilirsiniz. Gönder ağı talebinizi işlemeye
        devam ederken farklı bir taşıyıcı veya daha uygun bir teklif oluşması da mümkün olabilir.
      </p>
    </div>
  )
}

export function QuoteSpecialistBanner() {
  return (
    <div className='flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3 sm:px-4'>
      <Info className='mt-0.5 size-4 shrink-0 text-amber-800' aria-hidden />
      <div>
        <p className='text-sm font-semibold text-amber-900'>
          Lojistik uzmanımız talebinizi inceliyor.
        </p>
        <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
          Talebiniz için uygun taşıyıcı ve araç alternatifleri değerlendiriliyor. Mevcut
          teklifleriniz varsa bunları kullanmaya devam edebilirsiniz.
        </p>
      </div>
    </div>
  )
}
