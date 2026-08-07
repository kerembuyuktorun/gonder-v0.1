import type { CustomerCashregisterRecord, CustomerCashregisterSummary } from "../_types"

// TODO: Remove when API is ready
const rows: CustomerCashregisterRecord[] = [
  {
    customerId: "cust-mehmet-abbar",
    customerName: "Mehmet Abbar",
    vkn: "14527836901",
    contractType: "sozlesmeli",
    vadeGunu: 15,
    currency: "TRY",
    toplamAlacak: 10000,
    faturalanmisTutar: 5000,
    aciktaTutar: 5000,
    tahsilEdilen: 2000,
    kalanBakiye: 3000,
    gecikmisBakiye: 1000,
    gecikenGunSayisi: 5,
    riskLevel: "warning",
    lastActionAt: "2026-03-29T16:45:00",
    accountOwner: "Derya Aydın",
  },
  {
    customerId: "cust-toprak",
    customerName: "TPRK Su Plastik",
    vkn: "12345678901",
    contractType: "sozlesmeli",
    vadeGunu: 10,
    currency: "TRY",
    toplamAlacak: 46000,
    faturalanmisTutar: 35000,
    aciktaTutar: 11000,
    tahsilEdilen: 22000,
    kalanBakiye: 13000,
    gecikmisBakiye: 9000,
    gecikenGunSayisi: 12,
    riskLevel: "critical",
    lastActionAt: "2026-03-30T11:10:00",
    accountOwner: "Serkan Demir",
  },
  {
    customerId: "cust-ahmet-karan",
    customerName: "Ahmet Karan",
    vkn: "11111111111",
    contractType: "sozlesmeli",
    vadeGunu: 7,
    currency: "TRY",
    toplamAlacak: 28000,
    faturalanmisTutar: 28000,
    aciktaTutar: 0,
    tahsilEdilen: 28000,
    kalanBakiye: 0,
    gecikmisBakiye: 0,
    gecikenGunSayisi: 0,
    riskLevel: "normal",
    lastActionAt: "2026-03-28T09:20:00",
    accountOwner: "Nazlı Yaman",
  },
  {
    customerId: "cust-arf-tekstil",
    customerName: "ARF Tekstil Sanayi",
    vkn: "98765432109",
    contractType: "spot",
    vadeGunu: 21,
    currency: "TRY",
    toplamAlacak: 15000,
    faturalanmisTutar: 6000,
    aciktaTutar: 9000,
    tahsilEdilen: 1000,
    kalanBakiye: 5000,
    gecikmisBakiye: 2500,
    gecikenGunSayisi: 7,
    riskLevel: "warning",
    lastActionAt: "2026-03-27T14:05:00",
    accountOwner: "Mevcut Kullanıcı",
  },
]

function cloneRow(row: CustomerCashregisterRecord): CustomerCashregisterRecord {
  return { ...row }
}

export function getCustomerCashregisters(): CustomerCashregisterRecord[] {
  return rows.map(cloneRow).sort((left, right) => right.lastActionAt.localeCompare(left.lastActionAt))
}

export function getCustomerCashregisterSummary(): CustomerCashregisterSummary {
  const data = getCustomerCashregisters()

  const toplamAlacak = data.reduce((sum, row) => sum + row.toplamAlacak, 0)
  const toplamFaturalanmis = data.reduce((sum, row) => sum + row.faturalanmisTutar, 0)
  const toplamAcikta = data.reduce((sum, row) => sum + row.aciktaTutar, 0)
  const toplamGecikmis = data.reduce((sum, row) => sum + row.gecikmisBakiye, 0)
  const toplamTahsilat = data.reduce((sum, row) => sum + row.tahsilEdilen, 0)

  return {
    toplamAlacak,
    toplamFaturalanmis,
    toplamAcikta,
    toplamGecikmis,
    tahsilatPerformansi: toplamFaturalanmis > 0 ? Math.round((toplamTahsilat / toplamFaturalanmis) * 100) : 0,
  }
}
