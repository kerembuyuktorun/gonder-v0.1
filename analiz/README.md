# Analiz — Frontend / Backend yönlendirme

Bu klasör, Last Mile (ve finans) için **ürün yönlendirme**, **FE rehberi**, **BE sözleşme** ve **API / deploy** analiz dosyalarını toplar.

Kod yolları değişmedi; yalnızca dokümanlar buraya taşındı.

## Last Mile Finans

Klasör: [`lastmile-finans/`](./lastmile-finans/)

| Dosya | İçerik |
|-------|--------|
| [YONLENDIRME.md](./lastmile-finans/YONLENDIRME.md) | Last Mile sayfa yönlendirme (hangi ekranda ne yapılır) |
| [FE_GUIDE.md](./lastmile-finans/FE_GUIDE.md) | Finans UI kısa rehber |
| [BACKEND_PROMPT.md](./lastmile-finans/BACKEND_PROMPT.md) | BE audit + öncelik matrisi |
| [BACKEND_AGENT_PROMPT.md](./lastmile-finans/BACKEND_AGENT_PROMPT.md) | Agent için adım adım BE prompt |
| [STEP0_SCHEMA.md](./lastmile-finans/STEP0_SCHEMA.md) | FK / tenant / mevcut şema notu |
| [FINANCE_API.md](./lastmile-finans/FINANCE_API.md) | Canlı BFF endpoint listesi + sayfa bağlama |
| [FINANCE_DEV.md](./lastmile-finans/FINANCE_DEV.md) | Dev / deploy / checklist |

## Kod kökleri (referans)

- UI: `app/(arf)/(workspaces)/lastmile/finance/`
- BFF: `app/api/lastmile/` (`_lib/finance/*`)
- Tipler: `.../finance/_types/`
- Façade: `.../finance/_api/`

Eski konumlarda (`finance/`, `lastmile/`) kısa yönlendirme stub’ları bırakıldı.
