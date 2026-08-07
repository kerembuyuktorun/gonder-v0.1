import type {
  DefinitionsState,
  NotificationTemplate,
  OperationalTag,
  OrderTypeDefinition,
  PodRule,
  ReasonCode,
  RoutingSkill,
} from '../_types/definitions'

const ORDER_TYPES: OrderTypeDefinition[] = [
  {
    id: 'ot-dagitim',
    code: 'dagitim',
    label: 'Dağıtım',
    description: 'Standart B2C / B2B teslimat siparişleri.',
    enabled: true,
    system: true,
  },
  {
    id: 'ot-toplama',
    code: 'toplama',
    label: 'Toplama',
    description: 'Müşteri veya depodan paket toplama.',
    enabled: true,
    system: true,
  },
  {
    id: 'ot-iade',
    code: 'iade',
    label: 'İade',
    description: 'Alıcıdan iade alımı ve depoya dönüş.',
    enabled: true,
    system: true,
  },
  {
    id: 'ot-transfer',
    code: 'transfer',
    label: 'Transfer',
    description: 'Depo / hub arası transfer görevleri.',
    enabled: true,
    system: false,
  },
  {
    id: 'ot-degisim',
    code: 'degisim',
    label: 'Değişim',
    description: 'Giden paket + dönen paket swap operasyonu.',
    enabled: true,
    system: false,
  },
  {
    id: 'ot-gel-al',
    code: 'gel_al',
    label: 'Gel-Al',
    description: 'Noktadan teslim / gel-al dolap akışları.',
    enabled: false,
    system: false,
  },
  {
    id: 'ot-kurulum',
    code: 'kurulumlu_teslimat',
    label: 'Kurulumlu Teslimat',
    description: 'Teslimat + montaj / kurulum gerektiren siparişler.',
    enabled: false,
    system: false,
  },
]

const TAGS: OperationalTag[] = [
  {
    id: 'tag-1',
    name: 'Kırılabilir',
    color: '#FEF3C7',
    textColor: '#92400E',
    icon: 'alert',
    usages: ['order'],
    active: true,
  },
  {
    id: 'tag-2',
    name: 'Zile Basma',
    color: '#E0E7FF',
    textColor: '#3730A3',
    usages: ['order', 'customer'],
    active: true,
  },
  {
    id: 'tag-3',
    name: 'VIP Müşteri',
    color: '#FCE7F3',
    textColor: '#9D174D',
    usages: ['customer', 'order'],
    active: true,
  },
  {
    id: 'tag-4',
    name: 'İkinci Deneme',
    color: '#FFEDD5',
    textColor: '#9A3412',
    usages: ['order'],
    active: true,
  },
  {
    id: 'tag-5',
    name: 'Acil',
    color: '#FEE2E2',
    textColor: '#991B1B',
    usages: ['order'],
    active: true,
  },
]

const SKILLS: RoutingSkill[] = [
  {
    id: 'sk-1',
    name: 'Soğuk Zincir',
    description: 'Soğutmalı araç / paket zorunluluğu.',
    vroomSkillId: 1,
    appliesTo: ['order', 'vehicle', 'courier'],
    active: true,
  },
  {
    id: 'sk-2',
    name: 'Montaj Yetkinliği',
    description: 'Kurulum / montaj ekibi gerektirir.',
    vroomSkillId: 2,
    appliesTo: ['order', 'courier'],
    active: true,
  },
  {
    id: 'sk-3',
    name: 'ADR',
    description: 'Tehlikeli madde taşıma yetkinliği.',
    vroomSkillId: 3,
    appliesTo: ['order', 'vehicle', 'courier'],
    active: true,
  },
  {
    id: 'sk-4',
    name: 'Asansörlü Kasa',
    description: 'Araçta asansör / lift gereksinimi.',
    vroomSkillId: 4,
    appliesTo: ['order', 'vehicle'],
    active: true,
  },
  {
    id: 'sk-5',
    name: '+50 kg Kapasite',
    description: 'Ağır paket taşıma kapasitesi.',
    vroomSkillId: 5,
    appliesTo: ['order', 'vehicle', 'courier'],
    active: false,
  },
]

const POD_RULES: PodRule[] = [
  {
    kind: 'photo',
    label: 'Fotoğraf Çekimi',
    description: 'Teslimat anında paket / kapı fotoğrafı.',
    defaultMode: 'required',
    byOrderType: {
      gel_al: 'optional',
      transfer: 'off',
    },
  },
  {
    kind: 'tc_last4',
    label: 'T.C. Kimlik Son 4 Hane',
    description: 'Alıcı kimlik doğrulaması.',
    defaultMode: 'optional',
    byOrderType: {
      kurulumlu_teslimat: 'required',
      gel_al: 'off',
    },
  },
  {
    kind: 'signature',
    label: 'Müşteri İmzası',
    description: 'Mobil uygulamada dijital imza.',
    defaultMode: 'optional',
    byOrderType: {
      transfer: 'off',
    },
  },
  {
    kind: 'otp',
    label: 'OTP (SMS Şifresi)',
    description: 'Alıcıya giden tek kullanımlık kod.',
    defaultMode: 'off',
    byOrderType: {
      gel_al: 'required',
    },
  },
]

const REASONS: ReasonCode[] = [
  {
    id: 'r-1',
    kind: 'undelivered',
    label: 'Müşteri adreste bulunamadı',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'r-2',
    kind: 'undelivered',
    label: 'Adres yetersiz / yanlış',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'r-3',
    kind: 'undelivered',
    label: 'Alıcı kabul etmedi',
    active: true,
    sortOrder: 3,
  },
  {
    id: 'r-4',
    kind: 'undelivered',
    label: 'Kutu hasarlı',
    active: true,
    sortOrder: 4,
  },
  {
    id: 'r-5',
    kind: 'cancel',
    label: 'Müşteri iptal etti',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'r-6',
    kind: 'cancel',
    label: 'Stok yetersiz',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'r-7',
    kind: 'cancel',
    label: 'Operasyonel gecikme',
    active: false,
    sortOrder: 3,
  },
]

const TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-1',
    eventKey: 'on_the_way',
    eventLabel: 'Sipariş Yola Çıktı',
    channel: 'sms',
    body: 'Sayın {{alici_adi}}, {{siparis_no}} numaralı paketiniz {{kurye_adi}} tarafından yola çıkarılmıştır. Tahmini varış: {{eta}}.',
    active: true,
  },
  {
    id: 'tpl-2',
    eventKey: 'delivered',
    eventLabel: 'Teslim Edildi',
    channel: 'sms',
    body: 'Sayın {{alici_adi}}, {{siparis_no}} numaralı paketiniz teslim edilmiştir.',
    active: true,
  },
  {
    id: 'tpl-3',
    eventKey: 'failed',
    eventLabel: 'Teslim Edilemedi',
    channel: 'sms',
    body: 'Sayın {{alici_adi}}, {{siparis_no}} numaralı paketiniz teslim edilemedi. Sebep: {{neden}}. Yeni deneme planlanacaktır.',
    active: true,
  },
  {
    id: 'tpl-4',
    eventKey: 'delivered',
    eventLabel: 'Teslim Edildi',
    channel: 'email',
    body: 'Merhaba {{alici_adi}},\n\n{{siparis_no}} numaralı siparişiniz başarıyla teslim edildi.\n\nTeşekkürler,\n{{tenant_adi}}',
    active: false,
  },
]

function cloneState(state: DefinitionsState): DefinitionsState {
  return structuredClone(state)
}

let store: DefinitionsState = {
  orderTypes: ORDER_TYPES,
  tags: TAGS,
  skills: SKILLS,
  podRules: POD_RULES,
  reasons: REASONS,
  templates: TEMPLATES,
  updatedAt: '2026-07-20T14:30:00',
  updatedBy: 'Ayşe Demir',
}

function touch(updatedBy = 'UI Operator') {
  store.updatedAt = new Date().toISOString()
  store.updatedBy = updatedBy
}

export function getDefinitionsState(): DefinitionsState {
  return cloneState(store)
}

export function setOrderTypeEnabled(id: string, enabled: boolean) {
  store.orderTypes = store.orderTypes.map((item) =>
    item.id === id ? { ...item, enabled } : item
  )
  touch()
  return getDefinitionsState()
}

export function upsertTag(tag: OperationalTag) {
  const exists = store.tags.some((item) => item.id === tag.id)
  store.tags = exists
    ? store.tags.map((item) => (item.id === tag.id ? tag : item))
    : [tag, ...store.tags]
  touch()
  return getDefinitionsState()
}

export function deleteTag(id: string) {
  store.tags = store.tags.filter((item) => item.id !== id)
  touch()
  return getDefinitionsState()
}

export function upsertSkill(skill: RoutingSkill) {
  const exists = store.skills.some((item) => item.id === skill.id)
  store.skills = exists
    ? store.skills.map((item) => (item.id === skill.id ? skill : item))
    : [skill, ...store.skills]
  touch()
  return getDefinitionsState()
}

export function deleteSkill(id: string) {
  store.skills = store.skills.filter((item) => item.id !== id)
  touch()
  return getDefinitionsState()
}

export function updatePodRule(rule: PodRule) {
  store.podRules = store.podRules.map((item) =>
    item.kind === rule.kind ? rule : item
  )
  touch()
  return getDefinitionsState()
}

export function upsertReason(reason: ReasonCode) {
  const exists = store.reasons.some((item) => item.id === reason.id)
  store.reasons = exists
    ? store.reasons.map((item) => (item.id === reason.id ? reason : item))
    : [...store.reasons, reason]
  touch()
  return getDefinitionsState()
}

export function deleteReason(id: string) {
  store.reasons = store.reasons.filter((item) => item.id !== id)
  touch()
  return getDefinitionsState()
}

export function upsertTemplate(template: NotificationTemplate) {
  const exists = store.templates.some((item) => item.id === template.id)
  store.templates = exists
    ? store.templates.map((item) => (item.id === template.id ? template : item))
    : [template, ...store.templates]
  touch()
  return getDefinitionsState()
}
