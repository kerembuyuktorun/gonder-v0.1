// TODO: Remove when API is ready
import type { DashboardData } from "../_types/dashboard"

export function getDashboardData(): DashboardData {
  return {
    kpiCards: [
      {
        title: "Toplam Kargo",
        value: "12.458",
        change: "+12,5%",
        changeType: "positive",
        description: "geçen aya göre",
      },
      {
        title: "Teslim Edilen",
        value: "10.871",
        change: "+8,2%",
        changeType: "positive",
        description: "geçen aya göre",
      },
      {
        title: "Aktif Müşteriler",
        value: "1.246",
        change: "+5,1%",
        changeType: "positive",
        description: "geçen aya göre",
      },
      {
        title: "Aktif Seferler",
        value: "87",
        change: "+3",
        changeType: "positive",
        description: "düne göre",
      },
      {
        title: "Günlük Ciro",
        value: "248.600",
        suffix: "₺",
        change: "-2,4%",
        changeType: "negative",
        description: "düne göre",
      },
      {
        title: "Tahsilat Oranı",
        value: "94,2",
        suffix: "%",
        change: "+1,8%",
        changeType: "positive",
        description: "geçen aya göre",
      },
    ],

    cargoDistribution: [
      { name: "Teslim Edildi", value: 10871, color: "#10b981" },
      { name: "Dağıtımda", value: 487, color: "#0ea5e9" },
      { name: "Transferde", value: 312, color: "#a855f7" },
      { name: "Teslim Alındı", value: 245, color: "#3b82f6" },
      { name: "Beklemede", value: 198, color: "#f59e0b" },
      { name: "İptal", value: 345, color: "#ef4444" },
    ],

    monthlyRevenue: [
      { month: "Kas", ciro: 1_420_000 },
      { month: "Ara", ciro: 1_580_000 },
      { month: "Oca", ciro: 1_350_000 },
      { month: "Şub", ciro: 1_490_000 },
      { month: "Mar", ciro: 1_720_000 },
      { month: "Nis", ciro: 1_860_000 },
    ],

    recentCargos: [
      { id: "ARF-10004821", customer: "Mehmet Kara", destination: "İstanbul → Ankara", status: "dagitimda", time: "12 dk önce" },
      { id: "ARF-10004820", customer: "Ayşe Demir", destination: "İzmir → Bursa", status: "teslim_edildi", time: "28 dk önce" },
      { id: "ARF-10004819", customer: "Ali Yıldız", destination: "Antalya → Konya", status: "transfer", time: "45 dk önce" },
      { id: "ARF-10004818", customer: "Fatma Çelik", destination: "Ankara → İzmir", status: "beklemede", time: "1 saat önce" },
      { id: "ARF-10004817", customer: "Emre Aydın", destination: "Bursa → Ankara", status: "teslim_edildi", time: "1,5 saat önce" },
    ],

    systemStatuses: [
      { name: "API Servisleri", status: "active" },
      { name: "Veritabanı", status: "active" },
      { name: "Entegrasyonlar", status: "warning" },
    ],
  }
}
