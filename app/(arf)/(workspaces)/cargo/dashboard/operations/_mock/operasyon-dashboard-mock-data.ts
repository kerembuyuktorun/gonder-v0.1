import type { OperasyonDashboardData } from "../_types/operasyon-dashboard"

const operasyonDashboardData: OperasyonDashboardData = {
  kpiCards: [
    {
      label: "Aktif Sefer",
      value: 24,
      change: "+3 bugün",
      changeType: "positive",
    },
    {
      label: "Toplam Hat",
      value: 95,
      change: "12 ana, 45 merkez, 38 ara",
      changeType: "neutral",
    },
    {
      label: "Açık KTF",
      value: 18,
      change: "+4 bugün",
      changeType: "neutral",
    },
    {
      label: "Aktif Tedarikçi",
      value: 6,
      change: "1 pasif",
      changeType: "neutral",
    },
    {
      label: "Toplam Araç",
      value: 29,
      change: "13 seferde",
      changeType: "positive",
    },
    {
      label: "Toplam Parça",
      value: "15.680",
      change: "+1.240 bugün",
      changeType: "positive",
    },
  ],

  tripStatusDistribution: [
    { status: "on_road", label: "Yolda", count: 24, color: "#0ea5e9" },
    { status: "created", label: "Bekliyor", count: 8, color: "#f59e0b" },
    { status: "completed", label: "Tamamlandı", count: 142, color: "#10b981" },
    { status: "cancelled", label: "İptal", count: 6, color: "#ef4444" },
  ],

  dailyTripTrend: [
    { date: "1 Nis", aktifSefer: 18, tamamlanan: 14 },
    { date: "2 Nis", aktifSefer: 22, tamamlanan: 19 },
    { date: "3 Nis", aktifSefer: 20, tamamlanan: 16 },
    { date: "4 Nis", aktifSefer: 25, tamamlanan: 21 },
    { date: "5 Nis", aktifSefer: 19, tamamlanan: 15 },
    { date: "6 Nis", aktifSefer: 28, tamamlanan: 24 },
    { date: "7 Nis", aktifSefer: 24, tamamlanan: 20 },
    { date: "8 Nis", aktifSefer: 30, tamamlanan: 26 },
    { date: "9 Nis", aktifSefer: 27, tamamlanan: 22 },
    { date: "10 Nis", aktifSefer: 32, tamamlanan: 28 },
    { date: "11 Nis", aktifSefer: 26, tamamlanan: 23 },
    { date: "12 Nis", aktifSefer: 24, tamamlanan: 20 },
  ],

  lineTypeDistribution: [
    { type: "main", label: "Ana Hat", count: 12, color: "#3b82f6" },
    { type: "hub", label: "Merkez Hat", count: 45, color: "#a855f7" },
    { type: "feeder", label: "Ara Hat", count: 38, color: "#f59e0b" },
  ],

  supplierTypeDistribution: [
    { type: "ozmal", label: "Özmal", count: 1, color: "#10b981" },
    { type: "logistics", label: "Lojistik", count: 3, color: "#3b82f6" },
    { type: "truck_owner", label: "Kamyon Sahibi", count: 2, color: "#f59e0b" },
    { type: "warehouse", label: "Ambar", count: 1, color: "#a855f7" },
  ],

  recentTrips: [
    {
      id: "1",
      tripNo: "10000164",
      lineName: "Güneydoğu Ana Hat",
      lineType: "main",
      supplierName: "Ekspres Nakliyat A.Ş.",
      vehiclePlate: "34 ABC 123",
      totalPackageCount: 142,
      totalDesi: 4250,
      status: "on_road",
      createdAt: "2026-04-12T08:30:00",
    },
    {
      id: "2",
      tripNo: "10000165",
      lineName: "Doğu Merkez Hat",
      lineType: "hub",
      supplierName: "Lojimod Özmal",
      vehiclePlate: "06 DEF 456",
      totalPackageCount: 96,
      totalDesi: 3110,
      status: "created",
      createdAt: "2026-04-12T07:15:00",
    },
    {
      id: "3",
      tripNo: "10000166",
      lineName: "Mardin Ara Hat",
      lineType: "feeder",
      supplierName: "Güneydoğu Ambarı",
      vehiclePlate: "47 GHI 789",
      totalPackageCount: 58,
      totalDesi: 1890,
      status: "on_road",
      createdAt: "2026-04-12T06:45:00",
    },
    {
      id: "4",
      tripNo: "10000167",
      lineName: "Güneydoğu Ana Hat",
      lineType: "main",
      supplierName: "Yıldırım Nakliye",
      vehiclePlate: "21 JKL 012",
      totalPackageCount: 130,
      totalDesi: 3975,
      status: "completed",
      createdAt: "2026-04-11T22:00:00",
    },
    {
      id: "5",
      tripNo: "10000168",
      lineName: "Doğu Merkez Hat",
      lineType: "hub",
      supplierName: "Hızlı Kargo Lojistik",
      vehiclePlate: "27 MNO 345",
      totalPackageCount: 77,
      totalDesi: 2420,
      status: "on_road",
      createdAt: "2026-04-12T09:00:00",
    },
    {
      id: "6",
      tripNo: "10000169",
      lineName: "Batı Ana Hat",
      lineType: "main",
      supplierName: "Ekspres Nakliyat A.Ş.",
      vehiclePlate: "35 PQR 678",
      totalPackageCount: 185,
      totalDesi: 5230,
      status: "on_road",
      createdAt: "2026-04-12T05:30:00",
    },
  ],
}

export async function getOperasyonDashboardData(): Promise<OperasyonDashboardData> {
  return operasyonDashboardData
}
