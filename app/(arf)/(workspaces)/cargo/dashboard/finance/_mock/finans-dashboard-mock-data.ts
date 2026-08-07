import type { FinansDashboardData } from "../_types/finans-dashboard"

const finansDashboardData: FinansDashboardData = {
  kpiCards: [
    {
      label: "Toplam Gelir",
      value: "₺2.845.000",
      change: "+12.4% geçen aya göre",
      changeType: "positive",
    },
    {
      label: "Tahsil Edilen",
      value: "₺2.120.000",
      change: "%74.5 tahsilat oranı",
      changeType: "positive",
    },
    {
      label: "Açık Bakiye",
      value: "₺725.000",
      change: "142 açık fatura",
      changeType: "neutral",
    },
    {
      label: "Geciken Alacak",
      value: "₺318.500",
      change: "+₺45.000 bu hafta",
      changeType: "negative",
    },
    {
      label: "Toplam Gider",
      value: "₺1.680.000",
      change: "-3.2% geçen aya göre",
      changeType: "positive",
    },
    {
      label: "Net Nakit Akışı",
      value: "₺440.000",
      change: "+₺85.000 bu ay",
      changeType: "positive",
    },
  ],

  gelirGiderTrend: [
    { month: "Kas", gelir: 2150000, gider: 1420000 },
    { month: "Ara", gelir: 2380000, gider: 1550000 },
    { month: "Oca", gelir: 2050000, gider: 1380000 },
    { month: "Şub", gelir: 2420000, gider: 1490000 },
    { month: "Mar", gelir: 2530000, gider: 1620000 },
    { month: "Nis", gelir: 2845000, gider: 1680000 },
  ],

  faturaDurumDistribution: [
    { status: "odendi", label: "Ödendi", amount: 1820000, count: 245, color: "#10b981" },
    { status: "kismi", label: "Kısmi Ödendi", amount: 300000, count: 38, color: "#3b82f6" },
    { status: "bekliyor", label: "Bekliyor", amount: 407000, count: 104, color: "#f59e0b" },
    { status: "gecikti", label: "Gecikmiş", amount: 318500, count: 52, color: "#ef4444" },
  ],

  giderKategoriDistribution: [
    { category: "tedarikciFatura", label: "Tedarikçi Faturaları", amount: 680000, color: "#3b82f6" },
    { category: "yakit", label: "Yakıt & Araç", amount: 420000, color: "#f59e0b" },
    { category: "personel", label: "Personel", amount: 310000, color: "#a855f7" },
    { category: "kira", label: "Kira & Altyapı", amount: 180000, color: "#10b981" },
    { category: "diger", label: "Diğer", amount: 90000, color: "#64748b" },
  ],

  bankaHesaplari: [
    {
      id: "1",
      bankName: "Ziraat Bankası",
      accountType: "collection",
      iban: "TR33 0006 1005 1234 5678 9012 34",
      balance: 1245000,
      currency: "TRY",
      status: "active",
    },
    {
      id: "2",
      bankName: "İş Bankası",
      accountType: "collection",
      iban: "TR76 0006 4000 0011 2345 6789 01",
      balance: 892000,
      currency: "TRY",
      status: "active",
    },
    {
      id: "3",
      bankName: "Garanti BBVA",
      accountType: "expense",
      iban: "TR58 0006 2000 0098 7654 3210 01",
      balance: 345000,
      currency: "TRY",
      status: "active",
    },
    {
      id: "4",
      bankName: "Yapı Kredi",
      accountType: "collection",
      iban: "TR12 0006 7010 0001 2345 6789 01",
      balance: 28500,
      currency: "USD",
      status: "active",
    },
  ],

  recentTransactions: [
    {
      id: "1",
      type: "fatura",
      description: "ABC Lojistik - Nisan faturası",
      amount: 45200,
      status: "bekliyor",
      statusLabel: "Bekliyor",
      statusColor: "border-amber-500/20 bg-amber-500/10 text-amber-600",
      date: "2026-04-12",
    },
    {
      id: "2",
      type: "gider",
      description: "Ekspres Nakliyat - Sefer ödemesi",
      amount: 18750,
      status: "paid",
      statusLabel: "Ödendi",
      statusColor: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
      date: "2026-04-12",
    },
    {
      id: "3",
      type: "hakedis",
      description: "İstanbul Anadolu Şubesi - Mart hakedişi",
      amount: 32400,
      status: "odendi",
      statusLabel: "Ödendi",
      statusColor: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
      date: "2026-04-11",
    },
    {
      id: "4",
      type: "fatura",
      description: "DEF Ticaret - Kargo teslimatı",
      amount: 12800,
      status: "gecikti",
      statusLabel: "Gecikmiş",
      statusColor: "border-red-500/20 bg-red-500/10 text-red-600",
      date: "2026-04-11",
    },
    {
      id: "5",
      type: "transfer",
      description: "Ankara Merkez Şubesi - Kasa transferi",
      amount: 75000,
      status: "beklemede",
      statusLabel: "Onay Bekliyor",
      statusColor: "border-amber-500/20 bg-amber-500/10 text-amber-600",
      date: "2026-04-11",
    },
    {
      id: "6",
      type: "gider",
      description: "Yıldırım Nakliye - Araç yakıt",
      amount: 8400,
      status: "paid",
      statusLabel: "Ödendi",
      statusColor: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
      date: "2026-04-10",
    },
  ],
}

export async function getFinansDashboardData(): Promise<FinansDashboardData> {
  return finansDashboardData
}
