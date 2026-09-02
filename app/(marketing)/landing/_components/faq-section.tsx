import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ = [
  {
    q: 'Kargo ile lojistik arasında nasıl seçim yaparım?',
    a: 'Paket ve koli gönderileri için Kargo sekmesini kullan. Palet, parsiyel veya komple araç ihtiyacın varsa Lojistik sekmesine geç. Form, seçimine göre yalnızca ilgili alanları gösterir.',
  },
  {
    q: 'Parsiyel ve komple taşıma arasındaki fark nedir?',
    a: 'Parsiyel taşımada araçta yükün kadar yer kullanırsın; maliyet hacme göre paylaşılır. Komple taşımada tüm aracı yüküne ayırırsın; tek seferde büyük veya ağır yükler için uygundur.',
  },
  {
    q: 'Paket ölçülerimi bilmiyorsam ne yapabilirim?',
    a: 'Hazır boyut seçeneklerinden (Küçük, Orta, Büyük) yaklaşık bir başlangıç seçebilir veya “Ölçülerimi gireceğim” ile tahmini değerlerle devam edebilirsin. Kesin ölçü gönderi oluşturma aşamasında da güncellenebilir.',
  },
  {
    q: 'Fiyatı etkileyen bilgiler nelerdir?',
    a: 'Güzergâh, parça adedi, desi/ağırlık, yükleme tarihi ve ek ihtiyaçlar (lift, forklift, sıcaklık kontrolü vb.) fiyatı etkiler. Taşıyıcı kurallarına göre desi veya ağırlıktan büyük olanı esas alınabilir.',
  },
  {
    q: 'Her gönderi için anında fiyat alabilir miyim?',
    a: 'Birçok standart gönderide anlık teklif sunulur. İlk tekliflerinizi hemen değerlendirebilirsiniz. Gönder ağı talebinizi işlemeye devam ederken farklı bir taşıyıcı veya fiyat alternatifi de oluşabilir. FTL, LTL ve standart dışı yüklerde lojistik uzmanı da sürece dahil olabilir.',
  },
  {
    q: 'Gönderimi nasıl takip ederim?',
    a: 'Giriş yaptıktan sonra Gönder panelinden tüm gönderilerini, durum güncellemelerini ve taşıyıcı takip numaralarını tek yerden izleyebilirsin.',
  },
  {
    q: 'Düzenli gönderimlerimi nasıl yönetebilirim?',
    a: 'Entegrasyonlar, toplu gönderi ve Excel aktarımı ile düzenli siparişlerini panele alabilirsin. Yüksek hacimli işletmeler için “İşletmem İçin Görüşelim” formu üzerinden özel destek talep edebilirsin.',
  },
]

export function FaqSection() {
  return (
    <section id='sss' className='gl-section scroll-mt-16 bg-[var(--gl-bg-soft)]'>
      <div className='gl-container max-w-3xl'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold sm:text-4xl'>Sık sorulan sorular</h2>
          <p className='mt-3 text-[var(--gl-muted)]'>Merak ettiklerinin kısa yanıtları.</p>
        </div>

        <Accordion type='single' collapsible className='mt-10'>
          {FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className='text-left text-base hover:no-underline'>
                {item.q}
              </AccordionTrigger>
              <AccordionContent className='text-[var(--gl-muted)]'>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
