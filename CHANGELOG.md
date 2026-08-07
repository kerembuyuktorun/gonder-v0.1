# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Added `src/_shared/logger.ts` as a dev-only kit logger and routed kit diagnostics through it.
- Added `src/datatable-kit/hooks/useDataTableState.ts` to consolidate DataTable internal state while preserving controlled/uncontrolled usage.
- Added size-limit budgets for Feedback-Kit and File-Kit.
- Added shared cargo finance calculation helpers and `FinanceExpenseDialog` for transport/trip expense flows.

### Changed
- Hardened Next.js production configuration by removing ignored TypeScript build errors, enabling strict mode/security headers, disabling the powered-by header, and defining image remote patterns.
- Tightened ESLint with type-aware TypeScript rules, `no-explicit-any`, promise handling checks, and scoped console policies.
- Memoized DataTable subcomponents and extracted FileUploader image previews into a memoized component.
- Updated dependencies within the existing package ranges and adjusted Form-Kit field-array typing for current React Hook Form types.
- Archived stale frontend analysis documents under `docs/_archive/frontend_analiz` and removed obsolete `agent/old` notes.

### Fixed
- Fixed ambient shadcn/toast declarations and pagination prop typing that blocked full Next.js builds.
- Fixed unhandled promise patterns and silent catch block hygiene across kit code.
- Removed duplicate cargo finance expense dialog/calculation logic while preserving transport and trip withholding-base differences.

### Security
- `npm audit` still reports upstream advisories for `next`'s bundled `postcss` range and `xlsx`; `npm audit fix --force` would install a breaking Next version and `xlsx` has no upstream fix available. Excel import usage remains covered by [SECURITY.md](SECURITY.md).

### Planned
- Additional form field types
- Enhanced i18n support

---

## [1.5.0] - 2026-03-24

### Added

#### Cargo — Ayarlar / Entegrasyonlar Modülü
- `app/arf/(workspaces)/cargo/settings/integrations/`: Entegrasyon yönetimi modülü tamamlandı.
  - Marketplace ekranı: kategori ve durum Filtrelerleri (URL state), entegrasyon kartları, sayfalama.
  - 3-adımlı entegrasyon oluşturma wizard'ı (Platform seçimi → Kimlik bilgileri → Bağlantı testi); RHF + Zod.
  - Özel Webhook akışı: checkbox ile `custom-webhook` platformuna geçiş, bağlantı geri yükleme.
  - Entegrasyon detay sayfası: Senkronizasyon, Parametre Eşleştirme ve Log sekmeleri.
  - Senkronizasyon seksi: 4-stat özet kart (bağlantı durumu, son senkronizasyon, hata sayısı, toplam işlem) + Drawer kural editörü.
  - Parametre Eşleştirme seksi: dropdown Select'ler, taslak (draft) state, İptal/Kaydet.
  - Log filtreleri URL state ile (`status`, `action`, `from`, `to`, `q`); DataTable + pagination.
  - Log detay modalı: HTTP durum kodu ve tam hata açıklaması.
  - Kart sağlık özeti: "N işlem başarılı" ve "Son Hata: X" hesaplanan log verisiyle.
  - Oluşturma sonrası yeşil başarı banner'ı.
  - `_mock/`, `_api/`, `_types/`, `_columns/`, `_components/` klasör mimarisi.

#### Cargo — Ayarlar / Diğer Modüller
- `settings/roles/`: Rol ve izin yönetimi sayfaları.
- `settings/users/`: Kullanıcı listesi ve atama sayfaları.
- `settings/system/bank-accounts/`: Banka hesapları yönetimi.
- `settings/system/blocked-interlands/`: Bloke iç hat tanımları.
- `settings/system/branches/`: Şube yönetimi listeleme sayfası.
- `settings/system/distance-definitions/`: Mesafe tanımları.
- `settings/system/distances/`: Mesafe matrisi yönetimi.
- `settings/system/interlands/`: İç hat tanımları.
- `settings/system/system-pricing/`: Sistem fiyatlandırma kuralları.

### Changed

#### Navigasyon
- `app/arf/(workspaces)/cargo/_data/nav.tsx`: Yeni ayarlar modülleri için navigasyon bağlantıları eklendi.
- `app/arf/_shared/routes.ts`: Yeni rotalar tanımlandı.

#### Release
- Bumped package version from `1.4.5` to `1.5.0` (`package.json`).

### Removed
- `app/arf/(workspaces)/cargo/branches/`: Geçici branches sayfası kaldırıldı; yerine `settings/system/branches/` kullanılıyor.

---

## [1.4.1] - 2026-03-13

### Fixed

#### CI/CD
- `src/externals.d.ts`: Added missing `@/components/ui/hover-card` module declaration to resolve TypeScript build error in CI (`Cannot find module '@/components/ui/hover-card'`).
- `src/layout-kit/utils/navigation-examples.ts`: Removed unused `Plus` import to fix lint warning.

### Changed

#### Release
- Bumped package version from `1.4.0` to `1.4.1` (`package.json`, `package-lock.json`).

---

## [1.3.1] - 2026-03-11

### Changed

#### Documentation
- `README.md`: Added optional `shadcn` setup section (`npx shadcn@latest init`) for teams that also scaffold local app-specific UI components.
- `README.md`: Clarified that ARF UI Kit does not require running `shadcn` CLI to consume package components.

---

## [1.3.0] - 2026-03-11

### Fixed

#### CI/CD
- `publish.yml`: Removed obsolete `Install Playwright browsers` and `npm test -- --run` steps (test infra removed in v1.1.0) that caused publish workflow to fail
- `publish.yml`: Changed trigger from `release: published` to `push: tags: v*` — publish now fires automatically on `git push --tags` without needing a manual GitHub Release
- `ci.yml`: Removed same obsolete Playwright/test steps

#### App — Test Landing Pages
- Added missing commas in `SCENARIOS` array objects across 5 test landing pages (`datatable`, `errors`, `feedback`, `file-uploader`, `form`) — caused Turbopack parse errors on Vercel builds
- Fixed apostrophe inside single-quoted string in `file-uploader/page.tsx`

#### Demo Pages — Lint
- `auth/demo`: Removed unused `Mail`, `Lock`, `Smartphone` imports
- `feedback/demo`: Renamed unused `simulateLongDuration` → `_simulateLongDuration`, unused `t` → `_t`
- `form/demo`: Removed unused `z` import; replaced `any` types with `Record<string, unknown>` in 5 submit handlers
- `errors/demo`: Replaced `any` type with `Record<string, unknown> | Error | undefined`

---

## [1.2.0] - 2026-03-11

### Added

#### App — Shared Utilities (`app/_shared`)
- `entry-policy.ts`: Role-based entry visibility policy (`resolveEntryVisibilityPolicy`) — controls which workspaces appear on the entry chooser. Supports `cargo-operator`, `qa`, `developer` roles; extensible for future RBAC.
- `states.tsx`: Shared UI state components used across both workspaces — `EmptyState`, `ErrorState`, `LoadingState`, `CardSkeleton`.

#### Test Hub — Auth Routes
- Added missing demo target pages under `/test/auth/pages/*`:
  - `signin2`, `otp`, `forgot-password`, `reset-password`
- Added missing demo target pages under `/test/auth/components/*`:
  - `signin-form`, `otp-form`, `forgot-password-form`, `reset-password-form`

### Changed

#### App — Gallery Ownership
- `/test/gallery` now contains the full component gallery (previously at `/cargo/gallery`).
- `/cargo/gallery` redirects to `/test/gallery`.
- Root `/gallery` redirect updated to point to `/test/gallery`.

#### App — Turkish Localization
- Corrected Turkish diacritics and orthography across all demo pages (`feedback/demo`, `errors/demo`, `file-uploader/demo`, `form/advanced`).
- Fixed broken Turkish in core shell files: `app/page.tsx`, `app/layout.tsx`, `app/cargo/layout.tsx`, `app/test/page.tsx`, `app/test/layout.tsx`.
- Kit landing pages (`app/test/*/page.tsx`) updated with proper Turkish descriptions while preserving technical terms in English.
- `app/test/_components/kit-page-template.tsx` UI copy normalized to proper Turkish.

#### App — Sidebar & Navigation
- Test Hub sidebar restructured with full demo navigation links for each kit.
- Auth section expanded with granular `pages/*` and `components/*` links.

#### Documentation
- `README.md`: Removed Storybook badge and Interactive Documentation section (Storybook infrastructure removed in v1.1.0).
- `README.md`: Fixed broken Turkish text in Architecture section.
- `README.md`: Architecture section title and workspace guides updated with proper Turkish.

### Removed
- Storybook badge from `README.md` header.
- MIGRATION.md root reference from `README.md` (file lives in `agent/` folder, excluded from distribution).

---

## [1.1.0] - 2026-03-10

### Added

#### Feedback Kit (new)
- `FeedbackProvider` and `useFeedback` hook for app-wide feedback/toast management
- Exported types: `FeedbackType`, `FeedbackPayload`, `FeedbackContextValue`, `FeedbackProviderProps`

#### File Kit (new)
- `FileUploader` component for drag-and-drop / browse file uploads
- `RHFFileUploader` — React Hook Form integrated file uploader
- Exported types: `FileUploaderProps`, `RHFFileUploaderProps`

#### DataTable Kit
- `useDataTableSync` hook for state synchronization across table instances
- `GlobalErrorBoundary` exported from errors-kit
- Extended `DataTable` component with column visibility improvements
- New type exports via `datatable-kit/index.ts`

#### Form Kit
- `WizardForm` multi-step form component
- `useAutoSave` hook for automatic draft persistence
- New field types in `FieldRenderer` (extended schema support)
- Extended `types.ts` with new form context types and `buildSchema` utilities

#### Errors Kit
- `GlobalErrorBoundary` component
- Improved `useErrorHandler` with additional error lifecycle callbacks

#### Layout Kit
- `AppSidebar` collapsible/responsive enhancements
- Added `activeVariant` to navigation context types

### Changed
- `src/index.ts` — re-exports for new kits (feedback, file) added to root barrel
- `app/test/*` pages updated to showcase new kit functionality
- `playground/components/ui/dropdown-menu.tsx` minor style fix

### Removed
- `ACCESSIBILITY.md` and `PERFORMANCE.md` moved to `agent/` documentation folder

---

## [1.0.1] - 2026-03-10

### Changed
- Package scope migrated from `@arftech/arf-ui-kit` to `@hascanb/arf-ui-kit` for publish ownership alignment.
- Release pipeline standardized to run validation first (`workflow_dispatch` with `publish=false`) and publish only on explicit release or `publish=true`.

### Verified
- GitHub Actions publish workflow passes with Playwright browser installation and green test/build/package checks.
- npm distribution confirmed under the new scope.

---

## [1.0.0] - 2026-03-10

### Added - First Stable Public Release

#### Phase 5 Quality & Documentation
- Storybook setup with 40+ stories across all kits
- Dark mode and responsive preview support in Storybook
- Comprehensive project documentation (`README.md`, `SECURITY.md`, `PERFORMANCE.md`, `ACCESSIBILITY.md`)
- MIT license file and maintained changelog workflow

#### Release Infrastructure
- npm publish workflow (`.github/workflows/publish.yml`)
- Provenance-enabled npm publish configuration
- Release preflight script (`npm run release:check`)

### Verified
- Library build output with type declarations for all kits
- Test suite passes for Storybook and kit scenarios
- Package publish contents validated via `npm pack --dry-run`

### Notes
- This version marks the production-ready baseline for public npm distribution.

---

## [0.2.0] - 2026-03-09

### Added - DataTable-Kit Production Release

#### Core Features
- **DataTable Component**: Full TanStack Table v8 integration
- **9 Core Components**:
  - DataTable (main component)
  - DataTablePagination (full control)
  - DataTableColumnHeader (sortable)
  - DataTableToolbar (search, filters, actions)
  - DataTableViewOptions (column visibility)
  - DataTableBulkActions (mass operations)
  - DataTableFacetedFilter (multi-select filters)
  - DataTableExcelActions (import/export)
  - SelectionColumn (checkbox helper)

#### Advanced Features
- URL state synchronization (bookmarkable tables)
- Excel import/export functionality
- Faceted filtering with counts
- Multi-column sorting
- Row selection (single + bulk)
- Server-side pagination support
- Responsive design

#### Hooks & Utils
- `useTableUrlState` - URL query synchronization
- `excel.ts` - 4 functions (export, import, template, validate)
- `get-page-numbers.ts` - 3 pagination helpers

#### Test Infrastructure
- 3 test pages (basic, advanced, server-side)
- Interactive demos
- Props documentation

### Changed
- Improved type safety across datatable components
- Enhanced filtering performance
- Optimized re-render behavior

---

## [0.1.0] - 2026-03-10

### Added - Initial Release

#### Form-Kit (Production Ready)
- **3 Core Components**:
  - SchemaForm (main component)
  - FieldRenderer (auto field type mapping)
  - FormKitProvider (global config - optional)
  
- **10 Field Types**:
  - text, email, password, number
  - textarea, select, combobox (NEW)
  - checkbox, radio, date
  - file, custom
  
- **Advanced Features**:
  - Schema-driven form generation
  - Zod validation integration
  - Type-safe field configurations
  - Cross-field validation (6 refinement functions)
  - Layout system (columns: 1-12, gap, spacing)
  - Calendar date picker (upgraded from native input)
  
- **Cross-Field Validations**:
  - `createPasswordStrengthRefine`
  - `createPasswordConfirmRefine`
  - `createDateRangeRefine`
  - `createConditionalRequiredRefine`
  - `createFieldComparisonRefine`
  - `createMinMaxRefine`

#### Errors-Kit (Production Ready)
- **2 Core Components**:
  - ErrorRenderer (dynamic error page rendering)
  - ErrorsKitProvider (context provider)
  
- **Advanced Features**:
  - 4 error levels (low, medium, high, critical)
  - Level-based actions (toast, redirect, reload, modal)
  - Error normalization (Axios, Fetch, Custom)
  - Status to level mapping (400, 401, 403, 404, 500, etc.)
  - Status to slug mapping for routing
  - Special 401 handling for auth flows
  - Custom error message extraction
  
- **Hooks & Utils**:
  - `useErrorHandler` (React hook)
  - `createErrorHandler` (factory function)

#### Auth-Kit (Complete)
- 4 form components (SignIn, ForgotPassword, ResetPassword, OTP)
- 5 page layouts (single/split column)
- OAuth integration (Google, Apple)
- i18n support (en/tr)
- Zod validation
- Brand icons (GoogleIcon, AppleIcon)

#### Layout-Kit (Complete)
- DashboardLayout (main wrapper)
- AppHeader (sticky, breadcrumb support)
- AppSidebar (navigation, collapsible)
- AppFooter (links, social media)
- Navigation utils (7 presets)
- Responsive design

#### Infrastructure
- TypeScript build configuration
- ESM build with tree-shaking
- Type declarations (.d.ts)
- Sub-path exports for all kits
- Source maps
- 12 test pages with interactive demos
- 40+ unit tests
- CI/CD with GitHub Actions

### Fixed
- **Form-Kit**:
  - Zod validation order (`.optional()` must be last)
  - DateField upgraded from native input to Calendar component
  - Combobox field type added
  
- **Errors-Kit**:
  - Import paths corrected in test files
  - TypeScript type annotations for callbacks

### Changed
- ESLint v9 → v10 migration (flat config)
- Improved Turkish localization
- Enhanced type safety across all kits

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| [1.0.0] | 2026-03-10 | First stable public release with Phase 5 completion |
| [0.2.0] | 2026-03-09 | DataTable-Kit production release |
| [0.1.0] | 2026-03-10 | Initial release with 5 kits |

---

## Migration Guides

### Upgrading to v1.0.0 from v0.2.0

No breaking changes. Simply update the package:

```bash
npm install @hascanb/arf-ui-kit@latest
```

New features are additive and don't affect existing code.

---

## Breaking Changes

None yet! This is the initial public release.

---

## Deprecations

None.

---

## Security Updates

All dependencies are up to date as of March 10, 2026. Run `npm audit` for the latest security status.

---

For detailed commit history, see [GitHub Commits](https://github.com/hascanb/arf-superapp-frontend/commits/main).
