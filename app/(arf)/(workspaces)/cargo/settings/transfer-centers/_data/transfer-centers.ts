export type TransferCenterStatus = "active" | "passive" | "maintenance"

export interface TransferCenterStaff {
  id: string
  name: string
  role: "kurye" | "operator" | "yonetici"
  phone: string
  email: string
  joinedAt: string
  status: "active" | "passive"
}

export interface TransferCenterVehicle {
  id: string
  plate: string
  type: "kamyon" | "minivan" | "motosiklet"
  driver: string
  status: "rampada" | "rotada" | "bakimda" | "bos"
}

export interface TransferCenterShipment {
  id: string
  trackingNo: string
  origin: string
  destination: string
  weight: number
  status: "bekliyor" | "yuklendi" | "teslim_edildi"
  arrivedAt: string
}

export interface HourlyVolume {
  hour: string
  count: number
}

// --- Detay Sayfası Tipleri ---
// TODO: Remove mock when API is ready
export interface TransferCenterDocument {
  id: string
  type: "vergi_levhasi" | "sozlesme" | "imza_sirkuleri" | "diger"
  fileName: string
  fileSize: number // bytes
  uploadedAt: string
  uploadedBy: string
  url: string
}

export interface TransferCenterBranch {
  id: string
  branchCode: string
  branchName: string
  city: string
  district: string
  managerName: string
  phone: string
  connectedAt: string
  status: "active" | "passive"
}

export type RouteType = "ana" | "merkez" | "ara"
export type RouteFrequency = "gunluk" | "haftalik" | "belirli_gunler"

export interface TransferCenterRoute {
  id: string
  routeCode: string
  routeName: string
  routeType: RouteType
  destinationCity: string
  destinationName: string
  departureTime: string
  arrivalTime: string
  frequency: RouteFrequency
  frequencyDays?: string[]
  avgDailyVolume: number
  status: "active" | "passive"
}

export interface TransferCenterUser {
  id: string
  firstName: string
  lastName: string
  role: "yonetici" | "operator" | "kurye"
  phone: string
  email: string
  status: "active" | "passive"
  createdAt: string
  lastActivity?: string
}

export interface TransferCenterNote {
  id: string
  content: string
  category: "genel" | "operasyon" | "finans" | "teknik" | "diger"
  visibility: "internal" | "public"
  createdAt: string
  createdBy: string
  createdByName: string
  createdByRole: string
  centerId: string
  centerName: string
}

export type CommissionStatus = "confirmed" | "pending" | "cancelled"

export interface CommissionRecord {
  id: string
  processDate: string
  trackingNo: string
  pieceCount: number
  cargoValue: number
  calculationDetail: string
  netEarning: number
  status: CommissionStatus
}

export interface TransferCenter {
  id: string
  code: string
  name: string
  city: string
  district: string
  address: string
  managerName: string
  managerPhone: string
  managerEmail: string
  capacity: number
  currentOccupancy: number
  status: TransferCenterStatus
  createdAt: string
  todayIncomingVehicles: number
  todayOutgoingVehicles: number
  pendingShipments: number
  errorRate: number
  staff: TransferCenterStaff[]
  vehicles: TransferCenterVehicle[]
  inventory: TransferCenterShipment[]
  hourlyVolume: HourlyVolume[]
  // Konum
  latitude?: number
  longitude?: number
  workingHours?: string
  // Acente Bilgileri
  taxOffice?: string
  taxNumber?: string
  agencyOwner?: string
  agencyOwnerPhone?: string
  agencyOwnerEmail?: string
  // Hakediş
  commissionModel?: "per_piece" | "percentage"
  commissionValue?: number
  bankName?: string
  iban?: string
  accountHolder?: string
  // İlişkili listeler
  documents: TransferCenterDocument[]
  branches: TransferCenterBranch[]
  routes: TransferCenterRoute[]
  users: TransferCenterUser[]
  notes: TransferCenterNote[]
  commissionRecords: CommissionRecord[]
}

export const transferCenters: TransferCenter[] = [
  {
    id: "tc-001",
    code: "KNY",
    name: "Konya Transfer Merkezi",
    city: "Konya",
    district: "Selçuklu",
    address: "Organize Sanayi Bölgesi, 1. Cadde No:12, Selçuklu / Konya",
    managerName: "Ahmet Yıldız",
    managerPhone: "0332 555 11 22",
    managerEmail: "ahmet.yildiz@kargom.com",
    capacity: 1200,
    currentOccupancy: 780,
    status: "active",
    createdAt: "2022-03-15",
    todayIncomingVehicles: 14,
    todayOutgoingVehicles: 11,
    pendingShipments: 143,
    errorRate: 1.2,
    staff: [
      { id: "s1", name: "Mehmet Kaya", role: "yonetici", phone: "0555 100 01 01", email: "mkaya@kargom.com", joinedAt: "2022-04-01", status: "active" },
      { id: "s2", name: "Fatma Demir", role: "operator", phone: "0555 100 01 02", email: "fdemir@kargom.com", joinedAt: "2022-06-15", status: "active" },
      { id: "s3", name: "Ali Çelik", role: "kurye", phone: "0555 100 01 03", email: "acelik@kargom.com", joinedAt: "2023-01-10", status: "active" },
      { id: "s4", name: "Zeynep Arslan", role: "kurye", phone: "0555 100 01 04", email: "zarslan@kargom.com", joinedAt: "2023-03-22", status: "passive" },
    ],
    vehicles: [
      { id: "v1", plate: "42 ABC 001", type: "kamyon", driver: "Ali Çelik", status: "rampada" },
      { id: "v2", plate: "42 DEF 002", type: "minivan", driver: "Zeynep Arslan", status: "rotada" },
      { id: "v3", plate: "42 GHI 003", type: "kamyon", driver: "—", status: "bakimda" },
      { id: "v4", plate: "42 JKL 004", type: "motosiklet", driver: "—", status: "bos" },
    ],
    inventory: [
      { id: "i1", trackingNo: "10003556", origin: "Ankara", destination: "İstanbul", weight: 2.5, status: "bekliyor", arrivedAt: "2026-03-18 08:30" },
      { id: "i2", trackingNo: "10003557", origin: "İzmir", destination: "Konya", weight: 1.2, status: "bekliyor", arrivedAt: "2026-03-18 09:10" },
      { id: "i3", trackingNo: "10003558", origin: "Konya", destination: "Bursa", weight: 4.0, status: "yuklendi", arrivedAt: "2026-03-18 07:00" },
      { id: "i4", trackingNo: "10003559", origin: "Gaziantep", destination: "Konya", weight: 0.8, status: "teslim_edildi", arrivedAt: "2026-03-17 15:00" },
    ],
    hourlyVolume: [
      { hour: "08:00", count: 42 },
      { hour: "09:00", count: 68 },
      { hour: "10:00", count: 95 },
      { hour: "11:00", count: 110 },
      { hour: "12:00", count: 87 },
      { hour: "13:00", count: 72 },
      { hour: "14:00", count: 103 },
      { hour: "15:00", count: 118 },
      { hour: "16:00", count: 94 },
      { hour: "17:00", count: 61 },
    ],
    latitude: 37.8714,
    longitude: 32.4846,
    workingHours: "07:00 - 22:00",
    taxOffice: "Konya Büyük Mükellefler VD",
    taxNumber: "1234567890",
    agencyOwner: "Hasan Çelik",
    agencyOwnerPhone: "0555 200 30 40",
    agencyOwnerEmail: "hasancelik@kargom.com",
    commissionModel: "per_piece",
    commissionValue: 5,
    bankName: "Türkiye İş Bankası",
    iban: "TR12 0001 2345 6789 0123 4567 89",
    accountHolder: "Hasan Çelik",
    documents: [
      { id: "d1", type: "vergi_levhasi", fileName: "vergi-levhasi-2026.pdf", fileSize: 245760, uploadedAt: "2026-01-05", uploadedBy: "Mehmet Kaya", url: "/mock/vergi-levhasi.pdf" },
      { id: "d2", type: "sozlesme", fileName: "acente-sozlesmesi-2026.pdf", fileSize: 1048576, uploadedAt: "2026-01-10", uploadedBy: "Fatma Demir", url: "/mock/sozlesme.pdf" },
    ],
    branches: [
      { id: "br1", branchCode: "KNY-01", branchName: "Konya Merkez Şube", city: "Konya", district: "Meram", managerName: "Serkan Polat", phone: "0332 444 55 66", connectedAt: "2022-04-01", status: "active" },
      { id: "br2", branchCode: "KNY-02", branchName: "Konya Karatay Şube", city: "Konya", district: "Karatay", managerName: "Hülya Arslan", phone: "0332 444 77 88", connectedAt: "2023-01-15", status: "active" },
      { id: "br3", branchCode: "ERG-01", branchName: "Ereğli Şube", city: "Konya", district: "Ereğli", managerName: "Mustafa Çevik", phone: "0332 810 11 22", connectedAt: "2023-06-01", status: "passive" },
    ],
    routes: [
      { id: "rt1", routeCode: "KNY-ANK", routeName: "Konya → Ankara Ana Hat", routeType: "ana", destinationCity: "Ankara", destinationName: "Ankara Transfer Merkezi", departureTime: "07:00", arrivalTime: "10:30", frequency: "gunluk", avgDailyVolume: 450, status: "active" },
      { id: "rt2", routeCode: "KNY-IST", routeName: "Konya → İstanbul Ana Hat", routeType: "ana", destinationCity: "İstanbul", destinationName: "İstanbul Transfer Merkezi", departureTime: "08:00", arrivalTime: "14:30", frequency: "gunluk", avgDailyVolume: 620, status: "active" },
      { id: "rt3", routeCode: "KNY-ERG", routeName: "Konya → Ereğli Merkez Hattı", routeType: "merkez", destinationCity: "Ereğli", destinationName: "Ereğli Şubesi", departureTime: "09:00", arrivalTime: "11:30", frequency: "gunluk", avgDailyVolume: 85, status: "active" },
      { id: "rt4", routeCode: "KNY-AKS", routeName: "Konya → Aksaray Ara Hattı", routeType: "ara", destinationCity: "Aksaray", destinationName: "Aksaray Dağıtım Noktası", departureTime: "11:00", arrivalTime: "13:00", frequency: "belirli_gunler", frequencyDays: ["Pazartesi", "Çarşamba", "Cuma"], avgDailyVolume: 42, status: "active" },
    ],
    users: [
      { id: "u1", firstName: "Mehmet", lastName: "Kaya", role: "yonetici", phone: "0555 100 01 01", email: "mkaya@kargom.com", status: "active", createdAt: "2022-04-01", lastActivity: "2026-03-21T08:45:00" },
      { id: "u2", firstName: "Fatma", lastName: "Demir", role: "operator", phone: "0555 100 01 02", email: "fdemir@kargom.com", status: "active", createdAt: "2022-06-15", lastActivity: "2026-03-21T07:30:00" },
      { id: "u3", firstName: "Ali", lastName: "Çelik", role: "kurye", phone: "0555 100 01 03", email: "acelik@kargom.com", status: "active", createdAt: "2023-01-10", lastActivity: "2026-03-20T17:15:00" },
      { id: "u4", firstName: "Zeynep", lastName: "Arslan", role: "kurye", phone: "0555 100 01 04", email: "zarslan@kargom.com", status: "passive", createdAt: "2023-03-22", lastActivity: "2025-12-10T14:00:00" },
    ],
    notes: [
      { id: "n1", content: "Rampa kapısı no:3 bakım nedeniyle geçici olarak kapatıldı. Araç girişleri kapı 1-2 üzerinden yapılacak.", category: "operasyon", visibility: "public", createdAt: "2026-03-21T09:00:00", createdBy: "u1", createdByName: "Mehmet Kaya", createdByRole: "Yönetici", centerId: "tc-001", centerName: "Konya Transfer Merkezi" },
      { id: "n2", content: "Şubat ayı hakediş ödemesi banka transferiyle gerçekleştirildi. Takip amaçlı kayıt.", category: "finans", visibility: "internal", createdAt: "2026-03-15T14:30:00", createdBy: "u2", createdByName: "Fatma Demir", createdByRole: "Operatör", centerId: "tc-001", centerName: "Konya Transfer Merkezi" },
      { id: "n3", content: "Yeni kurye aracı teslim alındı: 42 MNO 005. Sisteme kaydedildi.", category: "genel", visibility: "public", createdAt: "2026-03-10T11:00:00", createdBy: "u1", createdByName: "Mehmet Kaya", createdByRole: "Yönetici", centerId: "tc-001", centerName: "Konya Transfer Merkezi" },
    ],
    commissionRecords: [
      { id: "cr1", processDate: "2026-03-21T08:00:00", trackingNo: "10003556", pieceCount: 5, cargoValue: 250, calculationDetail: "5 parça × 5₺", netEarning: 25, status: "confirmed" },
      { id: "cr2", processDate: "2026-03-21T09:15:00", trackingNo: "10003557", pieceCount: 3, cargoValue: 120, calculationDetail: "3 parça × 5₺", netEarning: 15, status: "confirmed" },
      { id: "cr3", processDate: "2026-03-20T15:30:00", trackingNo: "10003520", pieceCount: 8, cargoValue: 480, calculationDetail: "8 parça × 5₺", netEarning: 40, status: "pending" },
      { id: "cr4", processDate: "2026-03-19T10:00:00", trackingNo: "10003500", pieceCount: 2, cargoValue: 90, calculationDetail: "2 parça × 5₺", netEarning: 10, status: "cancelled" },
    ],
  },
  {
    id: "tc-002",
    code: "ANK",
    name: "Ankara Transfer Merkezi",
    city: "Ankara",
    district: "Sincan",
    address: "Sincan Sanayi Sitesi, 3. Blok No:8, Sincan / Ankara",
    managerName: "Elif Şahin",
    managerPhone: "0312 444 22 33",
    managerEmail: "elif.sahin@kargom.com",
    capacity: 2000,
    currentOccupancy: 1540,
    status: "active",
    createdAt: "2021-07-01",
    todayIncomingVehicles: 21,
    todayOutgoingVehicles: 18,
    pendingShipments: 287,
    errorRate: 0.8,
    staff: [
      { id: "s5", name: "Oğuz Güneş", role: "yonetici", phone: "0555 200 02 01", email: "ogunes@kargom.com", joinedAt: "2021-07-01", status: "active" },
      { id: "s6", name: "Selin Korkmaz", role: "operator", phone: "0555 200 02 02", email: "skorkmaz@kargom.com", joinedAt: "2022-02-14", status: "active" },
    ],
    vehicles: [
      { id: "v5", plate: "06 XYZ 010", type: "kamyon", driver: "Oğuz Güneş", status: "rotada" },
      { id: "v6", plate: "06 PQR 011", type: "kamyon", driver: "Selin Korkmaz", status: "rampada" },
    ],
    inventory: [
      { id: "i5", trackingNo: "10004001", origin: "İstanbul", destination: "Ankara", weight: 3.5, status: "bekliyor", arrivedAt: "2026-03-18 06:45" },
      { id: "i6", trackingNo: "10004002", origin: "Ankara", destination: "Konya", weight: 2.1, status: "yuklendi", arrivedAt: "2026-03-18 07:30" },
    ],
    hourlyVolume: [
      { hour: "08:00", count: 65 },
      { hour: "09:00", count: 102 },
      { hour: "10:00", count: 148 },
      { hour: "11:00", count: 175 },
      { hour: "12:00", count: 130 },
      { hour: "13:00", count: 110 },
      { hour: "14:00", count: 162 },
      { hour: "15:00", count: 188 },
      { hour: "16:00", count: 144 },
      { hour: "17:00", count: 95 },
    ],
    documents: [],
    branches: [],
    routes: [],
    users: [],
    notes: [],
    commissionRecords: [],
  },
  {
    id: "tc-003",
    code: "IST",
    name: "İstanbul Transfer Merkezi",
    city: "İstanbul",
    district: "Esenyurt",
    address: "Esenyurt Lojistik Park, B Kapısı, Esenyurt / İstanbul",
    managerName: "Burak Tekin",
    managerPhone: "0212 888 33 44",
    managerEmail: "burak.tekin@kargom.com",
    capacity: 3500,
    currentOccupancy: 1050,
    status: "maintenance",
    createdAt: "2020-11-20",
    todayIncomingVehicles: 5,
    todayOutgoingVehicles: 3,
    pendingShipments: 62,
    errorRate: 3.1,
    staff: [],
    vehicles: [],
    inventory: [],
    hourlyVolume: [
      { hour: "08:00", count: 10 },
      { hour: "09:00", count: 15 },
      { hour: "10:00", count: 12 },
      { hour: "11:00", count: 8 },
      { hour: "12:00", count: 6 },
      { hour: "13:00", count: 5 },
      { hour: "14:00", count: 9 },
      { hour: "15:00", count: 11 },
      { hour: "16:00", count: 7 },
      { hour: "17:00", count: 4 },
    ],
    documents: [],
    branches: [],
    routes: [],
    users: [],
    notes: [],
    commissionRecords: [],
  },
]

export function getTransferCenterById(id: string): TransferCenter | undefined {
  return transferCenters.find((tc) => tc.id === id)
}
