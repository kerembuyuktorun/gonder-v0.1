import type {
  CourierDocumentType,
  CourierEmploymentType,
  CourierSkill,
  CourierSkillOption,
} from '../_types/courier'

export const COURIER_EMPLOYMENT_LABELS: Record<CourierEmploymentType, string> = {
  sirket: 'Şirket Personeli',
  esnaf: 'Esnaf Kurye',
}

export const COURIER_SKILL_LABELS: Record<CourierSkill, string> = {
  soguk_zincir: 'Soğuk Zincir',
  hizli_teslimat: 'Hızlı Teslimat',
  adr: 'ADR',
  agir_yuk: 'Ağır Yük',
  motosiklet: 'Motosiklet',
  panelvan: 'Panelvan',
}

export const COURIER_DOCUMENT_TYPE_LABELS: Record<CourierDocumentType, string> = {
  ehliyet: 'Ehliyet',
  src: 'SRC Belgesi',
  saglik: 'Sağlık Raporu',
  diger: 'Diğer',
}

export function buildCourierSkillLabelMap(
  options: CourierSkillOption[]
): Record<string, string> {
  return Object.fromEntries(options.map((option) => [option.code, option.name]))
}

export function resolveCourierSkillLabel(
  code: string,
  labelMap: Record<string, string>
): string {
  return labelMap[code] ?? COURIER_SKILL_LABELS[code as CourierSkill] ?? code
}

export function formatDocWarningText(daysRemaining: number, label: string): string {
  if (daysRemaining < 0) {
    return `${label} ${Math.abs(daysRemaining)} gün gecikti`
  }
  if (daysRemaining === 0) {
    return `${label} bugün bitiyor`
  }
  return `${label} ${daysRemaining} gün kaldı`
}

export function formatTckn(value: string | null | undefined) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return value
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
}
