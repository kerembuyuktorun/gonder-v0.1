import type { UserRole } from '../../_types/user'
import type {
  UserActivityEvent,
  UserPermissionGroup,
  UserSession,
} from '../_types/user-detail'

const ROLE_PERMISSIONS: Record<UserRole, UserPermissionGroup[]> = {
  super_admin: [
    {
      id: 'ops',
      label: 'Operasyon',
      items: [
        { id: 'orders', label: 'Sipariş yönetimi', allowed: true },
        { id: 'routes', label: 'Rota planlama', allowed: true },
        { id: 'live', label: 'Canlı izleme', allowed: true },
      ],
    },
    {
      id: 'resources',
      label: 'Kaynaklar',
      items: [
        { id: 'vehicles', label: 'Araç yönetimi', allowed: true },
        { id: 'couriers', label: 'Kurye yönetimi', allowed: true },
      ],
    },
    {
      id: 'admin',
      label: 'Yönetim',
      items: [
        { id: 'users', label: 'Kullanıcı yönetimi', allowed: true },
        { id: 'roles', label: 'Rol ve yetki tanımları', allowed: true },
        { id: 'settings', label: 'Sistem ayarları', allowed: true },
      ],
    },
  ],
  bolge_planlamacisi: [
    {
      id: 'ops',
      label: 'Operasyon',
      items: [
        { id: 'orders', label: 'Sipariş yönetimi', allowed: true },
        { id: 'routes', label: 'Rota planlama', allowed: true },
        { id: 'live', label: 'Canlı izleme', allowed: true },
      ],
    },
    {
      id: 'resources',
      label: 'Kaynaklar',
      items: [
        { id: 'vehicles', label: 'Araç yönetimi', allowed: true },
        { id: 'couriers', label: 'Kurye yönetimi', allowed: true },
      ],
    },
    {
      id: 'admin',
      label: 'Yönetim',
      items: [
        { id: 'users', label: 'Kullanıcı yönetimi', allowed: false },
        { id: 'roles', label: 'Rol ve yetki tanımları', allowed: false },
        { id: 'settings', label: 'Sistem ayarları', allowed: false },
      ],
    },
  ],
  operasyon_yoneticisi: [
    {
      id: 'ops',
      label: 'Operasyon',
      items: [
        { id: 'orders', label: 'Sipariş yönetimi', allowed: true },
        { id: 'routes', label: 'Rota planlama', allowed: false },
        { id: 'live', label: 'Canlı izleme', allowed: true },
      ],
    },
    {
      id: 'resources',
      label: 'Kaynaklar',
      items: [
        { id: 'vehicles', label: 'Araç yönetimi', allowed: true },
        { id: 'couriers', label: 'Kurye yönetimi', allowed: true },
      ],
    },
    {
      id: 'admin',
      label: 'Yönetim',
      items: [
        { id: 'users', label: 'Kullanıcı yönetimi', allowed: false },
        { id: 'roles', label: 'Rol ve yetki tanımları', allowed: false },
        { id: 'settings', label: 'Sistem ayarları', allowed: false },
      ],
    },
  ],
  musteri_depo_yoneticisi: [
    {
      id: 'portal',
      label: 'Müşteri Portalı',
      items: [
        { id: 'create_orders', label: 'Sipariş oluşturma', allowed: true },
        { id: 'view_orders', label: 'Sipariş görüntüleme', allowed: true },
        { id: 'track', label: 'Sevkiyat takibi', allowed: true },
        { id: 'reports', label: 'Raporlar', allowed: true },
      ],
    },
    {
      id: 'admin',
      label: 'Yönetim',
      items: [
        { id: 'users', label: 'Kullanıcı yönetimi', allowed: false },
        { id: 'settings', label: 'Sistem ayarları', allowed: false },
      ],
    },
  ],
  musteri_izleyici: [
    {
      id: 'portal',
      label: 'Müşteri Portalı',
      items: [
        { id: 'create_orders', label: 'Sipariş oluşturma', allowed: false },
        { id: 'view_orders', label: 'Sipariş görüntüleme', allowed: true },
        { id: 'track', label: 'Sevkiyat takibi', allowed: true },
        { id: 'reports', label: 'Raporlar', allowed: true },
      ],
    },
  ],
  sadece_izleyici: [
    {
      id: 'ops',
      label: 'Operasyon',
      items: [
        { id: 'orders', label: 'Sipariş görüntüleme', allowed: true },
        { id: 'routes', label: 'Rota görüntüleme', allowed: true },
        { id: 'live', label: 'Canlı izleme', allowed: true },
      ],
    },
    {
      id: 'admin',
      label: 'Yönetim',
      items: [
        { id: 'users', label: 'Kullanıcı yönetimi', allowed: false },
        { id: 'settings', label: 'Sistem ayarları', allowed: false },
      ],
    },
  ],
}

const ACTIVITY_BY_USER: Record<string, UserActivityEvent[]> = {
  'u-001': [
    {
      id: 'a1',
      kind: 'login',
      title: 'Başarılı giriş',
      detail: 'Chrome · İstanbul',
      at: '2026-07-17T09:15:00',
      actor: 'Ayşe Demir',
      ip: '176.240.112.44',
    },
    {
      id: 'a2',
      kind: 'profile_update',
      title: 'Profil bilgileri güncellendi',
      detail: 'Telefon numarası değişti',
      at: '2026-07-10T11:40:00',
      actor: 'Ayşe Demir',
      ip: '176.240.112.44',
    },
    {
      id: 'a3',
      kind: 'role_change',
      title: 'Rol güncellendi',
      detail: 'Operasyon Yöneticisi → Süper Admin',
      at: '2026-06-01T14:20:00',
      actor: 'Sistem',
      ip: '10.0.0.1',
    },
    {
      id: 'a4',
      kind: 'invite',
      title: 'Hesap daveti kabul edildi',
      at: '2025-11-02T10:05:00',
      actor: 'Ayşe Demir',
      ip: '185.92.14.10',
    },
  ],
  'u-004': [
    {
      id: 'a1',
      kind: 'status_change',
      title: 'Erişim askıya alındı',
      detail: 'Güvenlik incelemesi',
      at: '2026-05-20T16:00:00',
      actor: 'Ayşe Demir',
      ip: '10.0.0.1',
    },
    {
      id: 'a2',
      kind: 'login',
      title: 'Başarılı giriş',
      detail: 'Safari · Ankara',
      at: '2026-05-12T11:20:00',
      actor: 'Can Öztürk',
      ip: '88.255.12.40',
    },
    {
      id: 'a3',
      kind: 'invite',
      title: 'Davet gönderildi',
      at: '2026-02-14T09:00:00',
      actor: 'Ayşe Demir',
      ip: '176.240.112.44',
    },
  ],
  'u-005': [
    {
      id: 'a1',
      kind: 'invite',
      title: 'Davet gönderildi',
      detail: 'Aktivasyon bekleniyor',
      at: '2026-07-28T15:30:00',
      actor: 'Mehmet Kaya',
      ip: '176.240.112.44',
    },
  ],
  'u-006': [
    {
      id: 'a1',
      kind: 'login',
      title: 'Başarılı giriş',
      detail: 'Chrome · İstanbul',
      at: '2026-07-29T16:30:00',
      actor: 'Burak Şahin',
      ip: '185.92.14.22',
    },
    {
      id: 'a2',
      kind: 'password_reset',
      title: 'Şifre sıfırlama bağlantısı gönderildi',
      at: '2026-06-15T08:12:00',
      actor: 'Sistem',
      ip: '10.0.0.1',
    },
    {
      id: 'a3',
      kind: 'invite',
      title: 'Davet kabul edildi',
      at: '2026-03-01T12:00:00',
      actor: 'Burak Şahin',
      ip: '185.92.14.22',
    },
  ],
}

const SESSIONS_BY_USER: Record<string, UserSession[]> = {
  'u-001': [
    {
      id: 's1',
      device: 'MacBook Pro',
      browser: 'Chrome 126',
      location: 'İstanbul',
      ip: '176.240.112.44',
      lastActiveAt: '2026-07-17T09:15:00',
      current: true,
    },
    {
      id: 's2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'İstanbul',
      ip: '176.240.112.51',
      lastActiveAt: '2026-07-15T18:40:00',
      current: false,
    },
  ],
  'u-004': [
    {
      id: 's1',
      device: 'Windows PC',
      browser: 'Safari 17',
      location: 'Ankara',
      ip: '88.255.12.40',
      lastActiveAt: '2026-05-12T11:20:00',
      current: false,
    },
  ],
  'u-006': [
    {
      id: 's1',
      device: 'MacBook Air',
      browser: 'Chrome 126',
      location: 'İstanbul',
      ip: '185.92.14.22',
      lastActiveAt: '2026-07-29T16:30:00',
      current: true,
    },
  ],
}

export function getUserPermissions(role: UserRole): UserPermissionGroup[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function getUserActivity(userId: string): UserActivityEvent[] {
  return ACTIVITY_BY_USER[userId] ?? [
    {
      id: 'fallback-1',
      kind: 'invite',
      title: 'Kullanıcı kaydı oluşturuldu',
      at: '2026-01-01T09:00:00',
      actor: 'Sistem',
      ip: '10.0.0.1',
    },
  ]
}

export function getUserSessions(userId: string): UserSession[] {
  return SESSIONS_BY_USER[userId] ?? []
}
