import type { TripAuditLogEntry } from "../_types"

export const mockTripAuditByTripId: Record<string, TripAuditLogEntry[]> = {
  "trip-10000164": [
    {
      id: "audit-164-1",
      tripId: "trip-10000164",
      action: "trip_created",
      description: "Sefer başlatıldı. (Kullanıcı: Ahmet Can)",
      actorName: "Ahmet Can",
      timestamp: "2026-03-27T11:59:00.000Z",
      ipAddress: "10.10.2.15",
    },
    {
      id: "audit-164-2",
      tripId: "trip-10000164",
      action: "leg_departed",
      description: "Şırnak Silopi Şubesi'nden çıkış yapıldı. (Sistem Otomasyonu)",
      actorName: "Sistem Otomasyonu",
      timestamp: "2026-03-27T12:10:00.000Z",
      ipAddress: "10.10.2.15",
    },
    {
      id: "audit-164-3",
      tripId: "trip-10000164",
      action: "manifest_loaded",
      description: "10004550 takip nolu kargo araca yüklendi. (Kullanıcı: Ahmet Can)",
      actorName: "Ahmet Can",
      timestamp: "2026-03-27T14:00:00.000Z",
      ipAddress: "10.10.2.15",
    },
  ],
  "trip-10000165": [
    {
      id: "audit-165-1",
      tripId: "trip-10000165",
      action: "trip_created",
      description: "Sefer taslak olarak oluşturuldu. Araç çıkışı bekleniyor.",
      actorName: "Ayşe Demir",
      timestamp: "2026-03-27T09:12:00.000Z",
      ipAddress: "10.10.2.15",
    },
  ],
  "trip-10000166": [
    {
      id: "audit-166-1",
      tripId: "trip-10000166",
      action: "trip_created",
      description: "Ambar seferi başlatıldı. Araç ve sürücü bilgileri boş bırakıldı.",
      actorName: "Ceyda Kaya",
      timestamp: "2026-03-27T08:05:00.000Z",
      ipAddress: "10.10.2.15",
    },
  ],
  "trip-10000167": [
    {
      id: "audit-167-1",
      tripId: "trip-10000167",
      action: "trip_status_changed",
      description: "Sefer tamamlandı olarak kapatıldı.",
      actorName: "Onur Çetin",
      timestamp: "2026-03-26T23:55:00.000Z",
      ipAddress: "10.10.2.15",
    },
  ],
  "trip-10000168": [
    {
      id: "audit-168-1",
      tripId: "trip-10000168",
      action: "trip_status_changed",
      description: "Sefer iptal edildi. Tedarikçi kaynaklı gecikme notu düşüldü.",
      actorName: "Ayşe Demir",
      timestamp: "2026-03-26T16:40:00.000Z",
      ipAddress: "10.10.2.15",
    },
  ],
}