import type { ModuleCategory, PermissionDefinition } from '../_types/role'

export const MODULE_CATEGORIES: ModuleCategory[] = [
  { id: 'operation', name: 'Operasyon', code: 'OPERATION', order: 1 },
  { id: 'resources', name: 'Kaynaklar', code: 'RESOURCES', order: 2 },
  { id: 'relations', name: 'İlişki Yönetimi', code: 'RELATIONS', order: 3 },
  { id: 'reports', name: 'Raporlar', code: 'REPORTS', order: 4 },
  { id: 'admin', name: 'Yönetim', code: 'ADMIN', order: 5 },
]

function crud(
  moduleCode: string,
  moduleName: string,
  categoryId: string,
  specials: Array<{ id: string; label: string }> = []
): PermissionDefinition[] {
  const base: PermissionDefinition[] = [
    {
      id: `${moduleCode}.read`,
      moduleCategoryId: categoryId,
      moduleName,
      moduleCode,
      permissionType: 'read',
      label: 'Listele',
    },
    {
      id: `${moduleCode}.create`,
      moduleCategoryId: categoryId,
      moduleName,
      moduleCode,
      permissionType: 'create',
      label: 'Oluştur',
    },
    {
      id: `${moduleCode}.update`,
      moduleCategoryId: categoryId,
      moduleName,
      moduleCode,
      permissionType: 'update',
      label: 'Güncelle',
    },
    {
      id: `${moduleCode}.delete`,
      moduleCategoryId: categoryId,
      moduleName,
      moduleCode,
      permissionType: 'delete',
      label: 'Sil',
    },
  ]

  return [
    ...base,
    ...specials.map((item) => ({
      id: item.id,
      moduleCategoryId: categoryId,
      moduleName,
      moduleCode,
      permissionType: 'special' as const,
      label: item.label,
    })),
  ]
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  ...crud('orders', 'Siparişler', 'operation', [
    { id: 'orders.special.cancel', label: 'Sipariş iptal edebilir' },
    { id: 'orders.special.export', label: 'Excel çıktısı alabilir' },
  ]),
  ...crud('planning', 'Rota Planlama', 'operation', [
    { id: 'planning.special.orchestrate', label: 'Orkestratör çalıştırabilir' },
    { id: 'planning.special.close', label: 'Rota kapatabilir' },
  ]),
  ...crud('live', 'Canlı İzleme', 'operation', [
    { id: 'live.special.intervene', label: 'Rotaya müdahale edebilir' },
  ]),
  ...crud('vehicles', 'Araçlar', 'resources', [
    { id: 'vehicles.special.assign', label: 'Sürücü zimmetleyebilir' },
  ]),
  ...crud('couriers', 'Kuryeler', 'resources', [
    { id: 'couriers.special.assign', label: 'Araç zimmetleyebilir' },
  ]),
  ...crud('customers', 'Müşteriler', 'relations'),
  ...crud('connections', 'Bağlantılar', 'relations'),
  ...crud('reports', 'Raporlar', 'reports', [
    { id: 'reports.special.ops', label: 'Operasyon raporlarını görebilir' },
    { id: 'reports.special.all', label: 'Tüm sistem raporlarını görebilir' },
  ]),
  ...crud('users', 'Kullanıcılar', 'admin', [
    { id: 'users.special.invite', label: 'Kullanıcı davet edebilir' },
    { id: 'users.special.suspend', label: 'Erişimi askıya alabilir' },
  ]),
  ...crud('roles', 'Roller ve Yetkiler', 'admin'),
  ...crud('settings', 'Ayarlar', 'admin', [
    { id: 'settings.special.regions', label: 'Operasyon bölgelerini yönetebilir' },
  ]),
]
