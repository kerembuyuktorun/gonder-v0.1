# ARF Superapp Frontend

Getarf operasyon uygulamalarının Next.js frontend’i.

Organizasyon reposu: [getarf/arf-superapp-frontend](https://github.com/getarf/arf-superapp-frontend)

## Workspaces

Uygulama `app/(arf)/(workspaces)` altında workspace’lere ayrılır:

| Workspace | Path | Odak |
| --- | --- | --- |
| Last Mile | `/lastmile` | Sipariş, planlama / rota orkestrasyonu, kaynaklar, kullanıcılar, ayarlar |
| Cargo | `/cargo` | Kargo operasyonları, sevkiyat, finans, pazarlama, şube / transfer merkezi ayarları |
| Gönder | `/gonder` | B2B/B2C lojistik / kargo / kurye paneli (foundation) |

Paylaşılan UI ve yardımcı modüller `src/` altındadır. Bu repo bir npm paket yayın reposu değildir.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Leaflet (harita)
- Zod + React Hook Form

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışır.

### Ortam değişkenleri

`.env.local` içinde (değerleri ekibe özel tutun):

```bash
# Server-only auth / BFF
IAM_BASE_URL=
BFF_GRAPHQL_URL=

# Yerel geliştirme yardımcıları (production'da açık olmayın)
DEV_AUTH_BYPASS=false
DEV_DEMO_EMAIL=
DEV_DEMO_PASSWORD=
DEV_DEMO_OTP=
DEV_DEMO_LOGIN_SESSION_ID=
```

Auth akışı: browser → Next BFF (`/api/auth/*`) → `IAM_BASE_URL` + `/api/v1/...`

## Scripts

| Script | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucu |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript kontrolü |
