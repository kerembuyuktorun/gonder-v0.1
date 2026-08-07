// TODO: Remove when API is ready
import type { KargoDashboardData } from "../_types/kargo-dashboard"

export function getKargoDashboardData(): KargoDashboardData {
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
        title: "Dağıtımda",
        value: "487",
        change: "+24",
        changeType: "neutral",
        description: "anlık",
      },
      {
        title: "Beklemede",
        value: "198",
        change: "-15",
        changeType: "positive",
        description: "düne göre",
      },
      {
        title: "İptal Edilen",
        value: "345",
        change: "+2,1%",
        changeType: "negative",
        description: "geçen aya göre",
      },
      {
        title: "Teslimat Oranı",
        value: "87,3",
        suffix: "%",
        change: "+1,4%",
        changeType: "positive",
        description: "geçen aya göre",
      },
    ],

    statusDistribution: [
      { name: "Teslim Edildi", value: 10871, color: "#10b981" },
      { name: "Dağıtımda", value: 487, color: "#0ea5e9" },
      { name: "Transfer Sürecinde", value: 312, color: "#a855f7" },
      { name: "Varış Şubede", value: 245, color: "#3b82f6" },
      { name: "Oluşturuldu", value: 198, color: "#f59e0b" },
      { name: "İptal", value: 345, color: "#ef4444" },
    ],

    dailyTrend: [
      { date: "1 Nis", toplam: 385, teslim: 342 },
      { date: "2 Nis", toplam: 412, teslim: 378 },
      { date: "3 Nis", toplam: 398, teslim: 351 },
      { date: "4 Nis", toplam: 445, teslim: 402 },
      { date: "5 Nis", toplam: 378, teslim: 340 },
      { date: "6 Nis", toplam: 290, teslim: 265 },
      { date: "7 Nis", toplam: 310, teslim: 280 },
      { date: "8 Nis", toplam: 420, teslim: 385 },
      { date: "9 Nis", toplam: 438, teslim: 398 },
      { date: "10 Nis", toplam: 456, teslim: 412 },
      { date: "11 Nis", toplam: 470, teslim: 425 },
      { date: "12 Nis", toplam: 392, teslim: 356 },
    ],

    branchPerformance: [
      { branchName: "İstanbul Kadıköy", kargoSayisi: 1850, teslimSayisi: 1720, teslimatOrani: 93.0 },
      { branchName: "Ankara Çankaya", kargoSayisi: 1420, teslimSayisi: 1290, teslimatOrani: 90.8 },
      { branchName: "İzmir Konak", kargoSayisi: 1180, teslimSayisi: 1065, teslimatOrani: 90.3 },
      { branchName: "Bursa Osmangazi", kargoSayisi: 980, teslimSayisi: 870, teslimatOrani: 88.8 },
      { branchName: "Antalya Muratpaşa", kargoSayisi: 870, teslimSayisi: 790, teslimatOrani: 90.8 },
      { branchName: "Adana Seyhan", kargoSayisi: 750, teslimSayisi: 670, teslimatOrani: 89.3 },
      { branchName: "Konya Meram", kargoSayisi: 620, teslimSayisi: 560, teslimatOrani: 90.3 },
      { branchName: "Gaziantep Şahinbey", kargoSayisi: 580, teslimSayisi: 510, teslimatOrani: 87.9 },
    ],

    odemeTuruDistribution: [
      { name: "Gönderici Ödemeli", value: 7820, color: "#3b82f6" },
      { name: "Alıcı Ödemeli", value: 4638, color: "#f59e0b" },
    ],

    recentCargos: [
      { id: "1", takipNo: "ARF-10004821", gonderen: "Demir Lojistik", alici: "Ali Dalkılıç", gonderenSube: "Mardin Nusaybin", aliciSube: "Konya Meram", toplam: 395.76, parcaSayisi: 5, durum: "dagitimda", olusturulmaZamani: "12 dk önce" },
      { id: "2", takipNo: "ARF-10004820", gonderen: "Yıldız Tekstil", alici: "Ayşe Kara", gonderenSube: "İstanbul Kadıköy", aliciSube: "Ankara Çankaya", toplam: 1250.00, parcaSayisi: 3, durum: "teslim_edildi", olusturulmaZamani: "28 dk önce" },
      { id: "3", takipNo: "ARF-10004819", gonderen: "Anadolu Gıda", alici: "Mehmet Yıldız", gonderenSube: "İzmir Konak", aliciSube: "Bursa Osmangazi", toplam: 680.40, parcaSayisi: 2, durum: "transfer_surecinde", olusturulmaZamani: "45 dk önce" },
      { id: "4", takipNo: "ARF-10004818", gonderen: "Ege Mobilya", alici: "Zeynep Aksoy", gonderenSube: "Antalya Muratpaşa", aliciSube: "İzmir Konak", toplam: 2100.00, parcaSayisi: 8, durum: "olusturuldu", olusturulmaZamani: "1 saat önce" },
      { id: "5", takipNo: "ARF-10004817", gonderen: "Kuzey Metal", alici: "Can Öztürk", gonderenSube: "Ankara Çankaya", aliciSube: "İstanbul Kadıköy", toplam: 450.20, parcaSayisi: 1, durum: "teslim_edildi", olusturulmaZamani: "1,5 saat önce" },
      { id: "6", takipNo: "ARF-10004816", gonderen: "Güneş Elektronik", alici: "Elif Demir", gonderenSube: "Konya Meram", aliciSube: "Adana Seyhan", toplam: 3200.00, parcaSayisi: 4, durum: "iptal_edildi", olusturulmaZamani: "2 saat önce" },
    ],
  }
}
