// TODO: Remove when API is ready
import type {
  BlockedInterlandRecord,
  InterlandAuditLog,
  InterlandDetail,
  InterlandNote,
  InterlandRecord,
  InterlandScopeRow,
} from "../_types"

const scopeRows: Record<string, InterlandScopeRow[]> = {
  "int-1": [
    { id: "s-1", city: "Bursa", district: "Nilüfer", neighborhood: "Görükle" },
    { id: "s-2", city: "Bursa", district: "Nilüfer", neighborhood: "İhsaniye" },
    { id: "s-3", city: "Bursa", district: "Osmangazi", neighborhood: "Altıparmak" },
  ],
  "int-2": [
    { id: "s-4", city: "Ankara", district: "Çankaya", neighborhood: "Kavaklıdere" },
    { id: "s-5", city: "Ankara", district: "Yenimahalle", neighborhood: "Batıkent" },
  ],
  "int-3": [
    { id: "s-6", city: "İzmir", district: "Konak", neighborhood: "Alsancak" },
    { id: "s-7", city: "İzmir", district: "Bornova", neighborhood: "Kazımdirik" },
    { id: "s-8", city: "İzmir", district: "Karşıyaka", neighborhood: "Mavişehir" },
  ],
}

const notes: Record<string, InterlandNote[]> = {
  "int-1": [
    {
      id: "n-1",
      content: "Bursa Nilüfer bölgesindeki yol çalışması nedeniyle akşam teslimatları aksayabilir.",
      category: "operasyon",
      visibility: "public",
      createdAt: "2026-03-21T14:12:00",
      createdBy: "u-1",
      createdByName: "Derya Aydın",
      createdByRole: "Operatör",
      sourceName: "Bursa Şube",
    },
  ],
  "int-2": [
    {
      id: "n-2",
      content: "Akşam vardiyası için ek dağıtım planlaması gerekiyor.",
      category: "finans",
      visibility: "internal",
      createdAt: "2026-03-18T11:45:00",
      createdBy: "u-2",
      createdByName: "Serkan Demir",
      createdByRole: "Genel Merkez Finans",
      sourceName: "Genel Merkez",
    },
  ],
  "int-3": [],
}

const audits: Record<string, InterlandAuditLog[]> = {
  "int-1": [
    {
      id: "a-1",
      createdAt: "2026-03-20T10:32:00",
      actionType: "scope_add",
      oldValue: "-",
      newValue: "Bursa / Nilüfer / İhsaniye",
      actorId: "u-1",
      actorName: "Derya Aydın",
    },
    {
      id: "a-2",
      createdAt: "2026-03-22T09:10:00",
      actionType: "edit",
      oldValue: "Bursa İnterland",
      newValue: "Bursa Ana İnterland",
      actorId: "u-3",
      actorName: "Seda Yalın",
    },
  ],
  "int-2": [
    {
      id: "a-3",
      createdAt: "2026-03-19T16:05:00",
      actionType: "status_change",
      oldValue: "active",
      newValue: "passive",
      actorId: "u-4",
      actorName: "Merve Aksu",
    },
  ],
  "int-3": [],
}

export const mockInterlands: InterlandRecord[] = [
  {
    id: "int-1",
    name: "Bursa Ana İnterland",
    branchId: "1",
    branchName: "Bursa Şube",
    status: "active",
    cityCount: 1,
    districtCount: 2,
    neighborhoodCount: 3,
    updatedAt: "2026-03-22T09:10:00",
  },
  {
    id: "int-2",
    name: "Ankara Batıkent İnterland",
    branchId: "2",
    branchName: "Ankara Merkez Şube",
    status: "passive",
    cityCount: 1,
    districtCount: 2,
    neighborhoodCount: 2,
    updatedAt: "2026-03-19T16:05:00",
  },
  {
    id: "int-3",
    name: "İzmir Sahil İnterland",
    branchId: "3",
    branchName: "İzmir Merkez Şube",
    status: "active",
    cityCount: 1,
    districtCount: 3,
    neighborhoodCount: 3,
    updatedAt: "2026-03-17T13:25:00",
  },
]

export const mockBranches = [
  { id: "1", name: "Bursa Şube", transferCenterId: "tc-1", transferCenterName: "Ankara Aktarma", managerName: "Ömer Koç", managerPhone: "0532 555 11 22" },
  { id: "2", name: "Ankara Merkez Şube", transferCenterId: "tc-2", transferCenterName: "Ankara Transfer Merkezi", managerName: "Nazlı Yaman", managerPhone: "0532 777 99 11" },
  { id: "3", name: "İzmir Merkez Şube", transferCenterId: "tc-3", transferCenterName: "İzmir Transfer Merkezi", managerName: "Emre Kaya", managerPhone: "0532 999 88 77" },
]

export const blockedInterlandStore: BlockedInterlandRecord[] = [
  {
    id: "blocked-1",
    name: "İstanbul Esenyurt / Saadetdere",
    branchId: "1",
    branchName: "Bursa Şube",
  },
  {
    id: "blocked-2",
    name: "Ankara Mamak / Abidinpaşa",
    branchId: "2",
    branchName: "Ankara Merkez Şube",
  },
]

export function getInterlandDetailById(id: string): InterlandDetail | undefined {
  const base = mockInterlands.find((item) => item.id === id)
  if (base) {
    const branch = mockBranches.find((item) => item.id === base.branchId)

    return {
      ...base,
      branchManagerName: branch?.managerName,
      branchManagerPhone: branch?.managerPhone,
      transferCenterId: branch?.transferCenterId,
      transferCenterName: branch?.transferCenterName,
      scopeRows: scopeRows[id] ?? [],
      notes: notes[id] ?? [],
      auditLogs: audits[id] ?? [],
    }
  }

  if (!id.startsWith("blocked-")) {
    return undefined
  }

  const blocked = blockedInterlandStore.find((item) => item.id === id)
  if (!blocked) {
    return undefined
  }

  const branch = mockBranches.find((item) => item.id === blocked.branchId)
  const [locationPart, neighborhoodPart] = blocked.name.split("/").map((part) => part.trim())
  const [city = blocked.name, ...districtParts] = (locationPart ?? blocked.name).split(" ")
  const district = districtParts.join(" ") || "Merkez"
  const neighborhood = neighborhoodPart || "Genel"

  return {
    id,
    name: blocked.name,
    branchId: blocked.branchId,
    branchName: blocked.branchName,
    status: "passive",
    cityCount: 1,
    districtCount: 1,
    neighborhoodCount: 1,
    updatedAt: new Date().toISOString(),
    branchManagerName: branch?.managerName,
    branchManagerPhone: branch?.managerPhone,
    transferCenterId: branch?.transferCenterId,
    transferCenterName: branch?.transferCenterName,
    scopeRows: [
      {
        id: `${id}-scope-1`,
        city,
        district,
        neighborhood,
      },
    ],
    notes: [],
    auditLogs: [
      {
        id: `${id}-audit-1`,
        createdAt: new Date().toISOString(),
        actionType: "scope_add",
        oldValue: "-",
        newValue: blocked.name,
        actorId: "current-user",
        actorName: "Mevcut Kullanıcı",
      },
    ],
  }
}

export function withDerivedCounts(detail: InterlandDetail): InterlandDetail {
  const cities = new Set(detail.scopeRows.map((item) => item.city))
  const districts = new Set(detail.scopeRows.map((item) => `${item.city}-${item.district}`))

  return {
    ...detail,
    cityCount: cities.size,
    districtCount: districts.size,
    neighborhoodCount: detail.scopeRows.length,
  }
}
