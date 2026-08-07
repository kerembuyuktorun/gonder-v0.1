import type {
  AddressOption,
  PriceListRule,
  PriceListSimulationInput,
  PriceListSimulationResult,
  PriceListSummary,
} from "../_types"

interface EngineSource {
  priceLists: PriceListSummary[]
  rules: PriceListRule[]
  cities: AddressOption[]
  districts: AddressOption[]
  neighborhoods: AddressOption[]
  extraServiceCatalog: {
    pickup: number
    mobileDelivery: number
    cod: number
  }
}

function inRange(value: number, start: number, end: number): boolean {
  return value >= start && value <= end
}

function findAddressName(options: AddressOption[], id: string): string {
  return options.find((opt) => opt.id === id)?.name ?? "-"
}

function resolveDistanceType(input: PriceListSimulationInput): {
  type: "city_inner" | "city_outer"
  name: string
} {
  return input.senderAddress.cityId === input.receiverAddress.cityId
    ? { type: "city_inner", name: "Şehir İçi" }
    : { type: "city_outer", name: "Şehirler Arası" }
}

function getActivePriceList(lists: PriceListSummary[]): PriceListSummary | undefined {
  const now = Date.now()
  return lists.find((list) => {
    if (list.status !== "active") return false
    const start = new Date(list.validFrom).valueOf()
    const end = new Date(list.validTo).valueOf()
    return now >= start && now <= end
  })
}

export function simulatePriceWithEngine(
  input: PriceListSimulationInput,
  source: EngineSource,
): PriceListSimulationResult | null {
  const activePriceList = getActivePriceList(source.priceLists)
  if (!activePriceList) return null

  const distance = resolveDistanceType(input)

  const senderCity = findAddressName(source.cities, input.senderAddress.cityId)
  const senderDistrict = findAddressName(source.districts, input.senderAddress.districtId)
  const senderNeighborhood = findAddressName(source.neighborhoods, input.senderAddress.neighborhoodId)

  const receiverCity = findAddressName(source.cities, input.receiverAddress.cityId)
  const receiverDistrict = findAddressName(source.districts, input.receiverAddress.districtId)
  const receiverNeighborhood = findAddressName(source.neighborhoods, input.receiverAddress.neighborhoodId)

  const totalDesi = input.totalDesi

  const matchingRule = source.rules.find((rule) => {
    if (rule.priceListId !== activePriceList.id) return false
    if (rule.distanceDefinitionType !== distance.type) return false
    return inRange(totalDesi, rule.desiStart, rule.desiEnd)
  })

  if (!matchingRule) return null

  const transportFee =
    matchingRule.pricingModel === "desi_dynamic"
      ? matchingRule.basePrice +
        Math.max(totalDesi - matchingRule.desiStart, 0) * (matchingRule.dynamicIncrement ?? 0)
      : matchingRule.basePrice

  const extraServiceTotal =
    (input.extraServices?.pickup ? source.extraServiceCatalog.pickup : 0) +
    (input.extraServices?.mobileDelivery ? source.extraServiceCatalog.mobileDelivery : 0) +
    (input.extraServices?.cod ? source.extraServiceCatalog.cod : 0)

  const kdvRate = 0.2
  const kdvAmount = Number((transportFee * kdvRate).toFixed(2))
  const grandTotal = Number((transportFee + kdvAmount + extraServiceTotal).toFixed(2))

  return {
    matchedPriceList: activePriceList,
    matchedRule: {
      id: matchingRule.id,
      distanceDefinitionId: matchingRule.distanceDefinitionType,
      distanceDefinitionName: matchingRule.distanceDefinitionName,
      originLabel: `${senderCity} / ${senderDistrict} / ${senderNeighborhood}`,
      destinationLabel: `${receiverCity} / ${receiverDistrict} / ${receiverNeighborhood}`,
      shipmentType: matchingRule.shipmentType,
      desiStart: matchingRule.desiStart,
      desiEnd: matchingRule.desiEnd,
      pricingModel: matchingRule.pricingModel,
      basePrice: matchingRule.basePrice,
      dynamicIncrement: matchingRule.dynamicIncrement,
      distanceDefinitionType: matchingRule.distanceDefinitionType,
    },
    input,
    transportFee: Number(transportFee.toFixed(2)),
    kdvRate,
    kdvAmount,
    extraServiceTotal,
    grandTotal,
    breakdown: [
      { label: "Taşıma Ücreti", amount: Number(transportFee.toFixed(2)) },
      { label: "KDV (%20)", amount: kdvAmount },
      { label: "Ek Hizmetler", amount: Number(extraServiceTotal.toFixed(2)) },
      { label: "Genel Toplam", amount: grandTotal, highlight: true },
    ],
    notes: [
      `${distance.name} mesafe tanımı kullanıldı.`,
      `${totalDesi.toFixed(2)} desi için ${matchingRule.desiStart}-${matchingRule.desiEnd} aralığı eşleşti.`,
    ],
  }
}
