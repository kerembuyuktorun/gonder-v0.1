// TODO: Remove when API is ready

import type { PermissionDefinition } from "../_types"

export const mockPermissionDefinitions: PermissionDefinition[] = [
  { id: "cargo.read", moduleCategoryId: "operation", moduleName: "Kargo Yönetimi", moduleCode: "cargo", permissionType: "read", label: "Listele" },
  { id: "cargo.create", moduleCategoryId: "operation", moduleName: "Kargo Yönetimi", moduleCode: "cargo", permissionType: "create", label: "Oluştur" },
  { id: "cargo.update", moduleCategoryId: "operation", moduleName: "Kargo Yönetimi", moduleCode: "cargo", permissionType: "update", label: "Güncelle" },
  { id: "cargo.delete", moduleCategoryId: "operation", moduleName: "Kargo Yonetimi", moduleCode: "cargo", permissionType: "delete", label: "Sil" },
  { id: "cargo.special.price", moduleCategoryId: "operation", moduleName: "Kargo Yönetimi", moduleCode: "cargo", permissionType: "special", label: "Kargo Fiyatını Değiştirebilir" },
  { id: "cargo.special.cancel", moduleCategoryId: "operation", moduleName: "Kargo Yönetimi", moduleCode: "cargo", permissionType: "special", label: "Kargo İptal Edebilir" },
  { id: "cargo.special.export", moduleCategoryId: "operation", moduleName: "Kargo Yönetimi", moduleCode: "cargo", permissionType: "special", label: "Excel Çıktısı Alabilir" },

  { id: "route.read", moduleCategoryId: "operation", moduleName: "Rota Planlama", moduleCode: "route", permissionType: "read", label: "Listele" },
  { id: "route.create", moduleCategoryId: "operation", moduleName: "Rota Planlama", moduleCode: "route", permissionType: "create", label: "Oluştur" },
  { id: "route.update", moduleCategoryId: "operation", moduleName: "Rota Planlama", moduleCode: "route", permissionType: "update", label: "Güncelle" },
  { id: "route.delete", moduleCategoryId: "operation", moduleName: "Rota Planlama", moduleCode: "route", permissionType: "delete", label: "Sil" },
  { id: "route.special.close", moduleCategoryId: "operation", moduleName: "Rota Planlama", moduleCode: "route", permissionType: "special", label: "Sefer Kapatabilir" },

  { id: "finance.read", moduleCategoryId: "finance", moduleName: "Hakediş", moduleCode: "finance", permissionType: "read", label: "Listele" },
  { id: "finance.create", moduleCategoryId: "finance", moduleName: "Hakediş", moduleCode: "finance", permissionType: "create", label: "Oluştur" },
  { id: "finance.update", moduleCategoryId: "finance", moduleName: "Hakediş", moduleCode: "finance", permissionType: "update", label: "Güncelle" },
  { id: "finance.delete", moduleCategoryId: "finance", moduleName: "Hakediş", moduleCode: "finance", permissionType: "delete", label: "Sil" },
  { id: "finance.special.approve", moduleCategoryId: "finance", moduleName: "Hakediş", moduleCode: "finance", permissionType: "special", label: "Hakediş Onaylayabilir" },
  { id: "finance.special.match", moduleCategoryId: "finance", moduleName: "Hakediş", moduleCode: "finance", permissionType: "special", label: "Manuel Banka Eşleştirmesi Yapabilir" },

  { id: "logistics.read", moduleCategoryId: "logistics", moduleName: "Hat Planlama", moduleCode: "logistics", permissionType: "read", label: "Listele" },
  { id: "logistics.create", moduleCategoryId: "logistics", moduleName: "Hat Planlama", moduleCode: "logistics", permissionType: "create", label: "Oluştur" },
  { id: "logistics.update", moduleCategoryId: "logistics", moduleName: "Hat Planlama", moduleCode: "logistics", permissionType: "update", label: "Güncelle" },
  { id: "logistics.delete", moduleCategoryId: "logistics", moduleName: "Hat Planlama", moduleCode: "logistics", permissionType: "delete", label: "Sil" },
  { id: "logistics.special.optimize", moduleCategoryId: "logistics", moduleName: "Hat Planlama", moduleCode: "logistics", permissionType: "special", label: "Rota Optimizasyonu Yapabilir" },

  { id: "reports.read", moduleCategoryId: "reports", moduleName: "Raporlar", moduleCode: "reports", permissionType: "read", label: "Listele" },
  { id: "reports.create", moduleCategoryId: "reports", moduleName: "Raporlar", moduleCode: "reports", permissionType: "create", label: "Oluştur" },
  { id: "reports.update", moduleCategoryId: "reports", moduleName: "Raporlar", moduleCode: "reports", permissionType: "update", label: "Güncelle" },
  { id: "reports.delete", moduleCategoryId: "reports", moduleName: "Raporlar", moduleCode: "reports", permissionType: "delete", label: "Sil" },
  { id: "reports.special.finance", moduleCategoryId: "reports", moduleName: "Raporlar", moduleCode: "reports", permissionType: "special", label: "Finansal Raporları Görebilir" },
  { id: "reports.special.all", moduleCategoryId: "reports", moduleName: "Raporlar", moduleCode: "reports", permissionType: "special", label: "Tüm Sistem Raporlarını Görebilir" },

  { id: "users.read", moduleCategoryId: "hr", moduleName: "Kullanıcı Yönetimi", moduleCode: "users", permissionType: "read", label: "Listele" },
  { id: "users.create", moduleCategoryId: "hr", moduleName: "Kullanıcı Yönetimi", moduleCode: "users", permissionType: "create", label: "Oluştur" },
  { id: "users.update", moduleCategoryId: "hr", moduleName: "Kullanıcı Yönetimi", moduleCode: "users", permissionType: "update", label: "Güncelle" },
  { id: "users.delete", moduleCategoryId: "hr", moduleName: "Kullanıcı Yönetimi", moduleCode: "users", permissionType: "delete", label: "Sil" },
  { id: "roles.read", moduleCategoryId: "hr", moduleName: "Rol Yönetimi", moduleCode: "roles", permissionType: "read", label: "Listele" },
  { id: "roles.create", moduleCategoryId: "hr", moduleName: "Rol Yönetimi", moduleCode: "roles", permissionType: "create", label: "Oluştur" },
  { id: "roles.update", moduleCategoryId: "hr", moduleName: "Rol Yönetimi", moduleCode: "roles", permissionType: "update", label: "Güncelle" },
  { id: "roles.delete", moduleCategoryId: "hr", moduleName: "Rol Yonetimi", moduleCode: "roles", permissionType: "delete", label: "Sil" },
]
