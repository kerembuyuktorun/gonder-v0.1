import type { LineAuditLogEntry } from "../_types"

export const mockLineAuditLogsByLineId: Record<string, LineAuditLogEntry[]> = {
  "line-main-1": [
    {
      id: "line-audit-001",
      lineId: "line-main-1",
      actorName: "Mehmet Kaya",
      action: "line_created",
      description: "Hat oluşturuldu: Diyarbakır TM - Anadolu TM Hattı",
      timestamp: "2026-03-10T08:30:00.000Z",
      ipAddress: "192.168.1.5",
    },
    {
      id: "line-audit-002",
      lineId: "line-main-1",
      actorName: "Mehmet Kaya",
      action: "stop_added",
      description: "Güzergaha durak eklendi: Gaziantep TM",
      timestamp: "2026-03-11T10:20:00.000Z",
      ipAddress: "192.168.1.5",
    },
    {
      id: "line-audit-003",
      lineId: "line-main-1",
      actorName: "Mehmet Kaya",
      action: "schedule_updated",
      description: "Planlanan çıkış/varış saatleri güncellendi",
      timestamp: "2026-03-12T09:40:00.000Z",
      ipAddress: "192.168.1.5",
    },
  ],
  "line-hub-1": [
    {
      id: "line-audit-101",
      lineId: "line-hub-1",
      actorName: "Fatma Demir",
      action: "line_created",
      description: "Hat oluşturuldu: Adana TM - Çukurova Şubesi Hattı",
      timestamp: "2026-02-18T11:15:00.000Z",
      ipAddress: "192.168.1.6",
    },
    {
      id: "line-audit-102",
      lineId: "line-hub-1",
      actorName: "Fatma Demir",
      action: "line_updated",
      description: "Hat bilgileri düzenlendi",
      timestamp: "2026-03-01T16:10:00.000Z",
      ipAddress: "192.168.1.6",
    },
  ],
  "line-feeder-1": [
    {
      id: "line-audit-201",
      lineId: "line-feeder-1",
      actorName: "Ali Çelik",
      action: "line_created",
      description: "Hat oluşturuldu: Bağlar Şubesi - Diyarbakır TM Hattı",
      timestamp: "2026-01-22T07:00:00.000Z",
      ipAddress: "192.168.1.7",
    },
    {
      id: "line-audit-202",
      lineId: "line-feeder-1",
      actorName: "Ali Çelik",
      action: "line_status_changed",
      description: "Hat durumu Pasif olarak güncellendi",
      timestamp: "2026-03-05T10:00:00.000Z",
      ipAddress: "192.168.1.7",
    },
  ],
}