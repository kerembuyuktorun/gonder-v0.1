import type { TmEntitlementRow, TmEntitlementSummary } from "../_types"

// TODO: Remove when API is ready
const rows: TmEntitlementRow[] = [
  {
    transferCenterId: "tm-istanbul-anadolu",
    transferCenterName: "İstanbul Anadolu TM",
    transferCenterCode: "TM-IST-A01",
    commissionModel: "per_piece",
    commissionValue: 5,
    iptalEdilen: 12,
    toplamParcaAdedi: 3700,
    toplamKargoBedeli: 142000,
  },
  {
    transferCenterId: "tm-ankara",
    transferCenterName: "Ankara TM",
    transferCenterCode: "TM-ANK-01",
    commissionModel: "percentage",
    commissionValue: 0.15,
    iptalEdilen: 800,
    toplamParcaAdedi: 2100,
    toplamKargoBedeli: 82000,
  },
  {
    transferCenterId: "tm-istanbul-avrupa",
    transferCenterName: "İstanbul Avrupa TM",
    transferCenterCode: "TM-IST-E01",
    commissionModel: "per_piece",
    commissionValue: 6,
    iptalEdilen: 10,
    toplamParcaAdedi: 4100,
    toplamKargoBedeli: 178000,
  },
  {
    transferCenterId: "tm-izmir",
    transferCenterName: "İzmir TM",
    transferCenterCode: "TM-IZM-01",
    commissionModel: "percentage",
    commissionValue: 0.12,
    iptalEdilen: 600,
    toplamParcaAdedi: 1650,
    toplamKargoBedeli: 81700,
  },
  {
    transferCenterId: "tm-bursa",
    transferCenterName: "Bursa TM",
    transferCenterCode: "TM-BRS-01",
    commissionModel: "per_piece",
    commissionValue: 4.5,
    iptalEdilen: 8,
    toplamParcaAdedi: 1700,
    toplamKargoBedeli: 62000,
  },
  {
    transferCenterId: "tm-antalya",
    transferCenterName: "Antalya TM",
    transferCenterCode: "TM-ANT-01",
    commissionModel: "percentage",
    commissionValue: 0.14,
    iptalEdilen: 500,
    toplamParcaAdedi: 1400,
    toplamKargoBedeli: 60000,
  },
  {
    transferCenterId: "tm-adana",
    transferCenterName: "Adana TM",
    transferCenterCode: "TM-ADN-01",
    commissionModel: "per_piece",
    commissionValue: 4,
    iptalEdilen: 15,
    toplamParcaAdedi: 1600,
    toplamKargoBedeli: 48000,
  },
  {
    transferCenterId: "tm-konya",
    transferCenterName: "Konya TM",
    transferCenterCode: "TM-KON-01",
    commissionModel: "percentage",
    commissionValue: 0.1,
    iptalEdilen: 300,
    toplamParcaAdedi: 1050,
    toplamKargoBedeli: 52000,
  },
]

function cloneRow(row: TmEntitlementRow): TmEntitlementRow {
  return { ...row }
}

export function getTmEntitlementRows(): TmEntitlementRow[] {
  return rows.map(cloneRow).sort((a, b) => b.toplamKargoBedeli - a.toplamKargoBedeli)
}

export function getTmEntitlementSummary(): TmEntitlementSummary {
  const totals = rows.reduce(
    (acc, row) => {
      const isPerPiece = row.commissionModel === "per_piece"
      const grossHakedis = isPerPiece
        ? row.toplamParcaAdedi * row.commissionValue
        : row.toplamKargoBedeli * row.commissionValue
      const netHakedis = isPerPiece
        ? (row.toplamParcaAdedi - row.iptalEdilen) * row.commissionValue
        : (row.toplamKargoBedeli - row.iptalEdilen) * row.commissionValue
      return {
        toplamHakedis: acc.toplamHakedis + grossHakedis,
        parcaBasiToplam: acc.parcaBasiToplam + (isPerPiece ? grossHakedis : 0),
        yuzdelikToplam: acc.yuzdelikToplam + (isPerPiece ? 0 : grossHakedis),
        iptalEdilen: acc.iptalEdilen + (grossHakedis - netHakedis),
        netToplamHakedis: acc.netToplamHakedis + netHakedis,
      }
    },
    {
      toplamHakedis: 0,
      parcaBasiToplam: 0,
      yuzdelikToplam: 0,
      iptalEdilen: 0,
      netToplamHakedis: 0,
    },
  )
  return totals
}
