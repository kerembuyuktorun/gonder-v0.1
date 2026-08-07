// TODO: Remove mock when backend API is ready
import { ARF_ROUTES } from '../../../_shared/routes'
import type { LastmileDashboardData, LastmileLiveDashboardData } from '../_types/dashboard'

const R = ARF_ROUTES.lastmile

export function getLastmileDashboardData(): LastmileDashboardData {
  return {
    kpiCards: [
      {
        title: 'Bugünkü Sipariş',
        value: '186',
        change: '+14%',
        changeType: 'positive',
        description: 'düne göre',
      },
      {
        title: 'Teslim Edilen',
        value: '142',
        change: '+9%',
        changeType: 'positive',
        description: 'düne göre',
      },
      {
        title: 'Atama Bekleyen',
        value: '23',
        change: '-4',
        changeType: 'positive',
        description: 'son 1 saat',
      },
      {
        title: 'Aktif Rota',
        value: '18',
        change: '+2',
        changeType: 'positive',
        description: 'şu an',
      },
      {
        title: 'Sahadaki Kurye',
        value: '41',
        change: '12 boşta',
        changeType: 'neutral',
        description: 'yolda + boşta',
      },
      {
        title: 'Teslimat Oranı',
        value: '96,1',
        suffix: '%',
        change: '+1,2%',
        changeType: 'positive',
        description: 'bugün',
      },
    ],

    orderStatusDistribution: [
      { name: 'Teslim Edildi', value: 142, color: '#10b981' },
      { name: 'Yolda', value: 38, color: '#0ea5e9' },
      { name: 'Hazırlanıyor', value: 21, color: '#a855f7' },
      { name: 'Atama Bekliyor', value: 23, color: '#f59e0b' },
      { name: 'Başarısız', value: 7, color: '#f97316' },
      { name: 'İptal', value: 9, color: '#ef4444' },
    ],

    dailyDeliveries: [
      { day: 'Pzt', teslim: 128, iptal: 6 },
      { day: 'Sal', teslim: 141, iptal: 4 },
      { day: 'Çar', teslim: 119, iptal: 8 },
      { day: 'Per', teslim: 156, iptal: 5 },
      { day: 'Cum', teslim: 162, iptal: 7 },
      { day: 'Cmt', teslim: 98, iptal: 3 },
      { day: 'Paz', teslim: 74, iptal: 2 },
    ],

    fleetDistribution: [
      { name: 'Yolda', value: 41, color: '#0ea5e9' },
      { name: 'Boşta', value: 12, color: '#a3e635' },
      { name: 'Pasif', value: 8, color: '#94a3b8' },
    ],

    recentOrders: [
      {
        id: 'lm-1002',
        customer: 'Modanisa',
        district: 'Ümraniye → Kadıköy',
        status: 'yolda',
        time: '8 dk önce',
      },
      {
        id: 'lm-1009',
        customer: 'ABC E-Ticaret',
        district: 'Kadıköy → Beşiktaş',
        status: 'teslim_edildi',
        time: '22 dk önce',
      },
      {
        id: 'lm-1001',
        customer: 'ABC E-Ticaret',
        district: 'Kadıköy → Beşiktaş',
        status: 'atama_bekliyor',
        time: '35 dk önce',
      },
      {
        id: 'lm-1007',
        customer: 'Trendyol Express',
        district: 'Ataşehir → Tuzla',
        status: 'hazirlaniyor',
        time: '48 dk önce',
      },
      {
        id: 'lm-1003',
        customer: 'Hepsiburada',
        district: 'Maltepe → Kartal',
        status: 'basarisiz',
        time: '1 saat önce',
      },
    ],

    quickActions: [
      {
        title: 'Demo Siparişler',
        description: 'Sipariş listesi + iptal/iade/devir',
        href: `${R.orders.list}?demo=1`,
      },
      {
        title: 'Demo Müşteriler',
        description: 'Operasyon müşteri listesi',
        href: `${R.customers.list}?demo=1`,
      },
      {
        title: 'Demo Kuryeler / Araçlar',
        description: 'Kaynak listeleri',
        href: `${R.resources.couriers.list}?demo=1`,
      },
      {
        title: 'Demo Kullanıcılar',
        description: 'Kullanıcı & bağlantı listeleri',
        href: `${R.users.list}?demo=1`,
      },
    ],

    alerts: [
      {
        id: 'a1',
        severity: 'critical',
        title: '23 sipariş atama bekliyor',
        detail: 'Son 45 dk içinde biriken havuz',
      },
      {
        id: 'a2',
        severity: 'warning',
        title: '4 kuryede evrak uyarısı',
        detail: 'SRC / sağlık belgesi süresi',
      },
      {
        id: 'a3',
        severity: 'info',
        title: '12.000 ₺ açık tahsilat',
        detail: '3 müşteri vadeli bakiyesi',
      },
    ],
  }
}

export function getLastmileLiveDashboardData(): LastmileLiveDashboardData {
  return {
    kpis: [
      { label: 'Yolda', value: '41', hint: 'kurye' },
      { label: 'Boşta', value: '12', hint: 'kurye' },
      { label: 'Aktif rota', value: '18' },
      { label: 'İstisna', value: '9', hint: 'dikkat' },
    ],
    activeRouteCount: 18,
    couriers: [
      {
        id: 'seed-courier-1',
        name: 'Ahmet Yılmaz',
        status: 'yolda',
        lat: 40.9923,
        lng: 29.1244,
        activeOrders: 6,
      },
      {
        id: 'seed-courier-2',
        name: 'Ayşe Demir',
        status: 'yolda',
        lat: 40.9812,
        lng: 29.0861,
        activeOrders: 4,
      },
      {
        id: 'c3',
        name: 'Mehmet Kaya',
        status: 'bos',
        lat: 40.9635,
        lng: 29.0612,
        activeOrders: 0,
      },
      {
        id: 'c4',
        name: 'Zeynep Arslan',
        status: 'yolda',
        lat: 40.9351,
        lng: 29.1558,
        activeOrders: 5,
      },
      {
        id: 'c5',
        name: 'Can Öztürk',
        status: 'bos',
        lat: 40.9744,
        lng: 29.112,
        activeOrders: 0,
      },
    ],
    exceptions: [
      {
        id: 'e1',
        kind: 'unassigned',
        title: '23 sipariş atamasız',
        meta: 'Sipariş havuzu',
        href: `${R.orders.list}?demo=1`,
      },
      {
        id: 'e2',
        kind: 'delayed',
        title: 'lm-1002 ETA / ertesi güne devir',
        meta: 'Kadıköy · demo aksiyon',
        href: `${R.orders.detail('lm-1002')}?demo=1`,
      },
      {
        id: 'e3',
        kind: 'doc',
        title: 'Bekleyen iptal talebi',
        meta: 'lm-1007 · onay kuyruğu',
        href: `${R.orders.cancelRequests}`,
      },
      {
        id: 'e4',
        kind: 'overdue',
        title: 'İade örneği lm-1009',
        meta: 'Teslim sonrası iade',
        href: `${R.orders.detail('lm-1009')}?demo=1`,
      },
    ],
  }
}
