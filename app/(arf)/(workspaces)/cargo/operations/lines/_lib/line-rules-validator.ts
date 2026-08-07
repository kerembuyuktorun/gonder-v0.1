import type { LineRuleError, LineStopFormRow, LineType } from "../_types"

function pushError(errors: LineRuleError[], path: string, message: string): void {
  errors.push({ path, message })
}

export function validateLineRules(lineType: LineType, stops: LineStopFormRow[]): LineRuleError[] {
  const errors: LineRuleError[] = []

  if (stops.length < 2) {
    pushError(errors, "stops", "En az 2 durak zorunludur.")
    return errors
  }

  stops.forEach((stop, index) => {
    if (!stop.locationId) {
      pushError(errors, `stops.${index}.locationId`, "Lokasyon seçimi zorunludur.")
    }
    if (!stop.operationType) {
      pushError(errors, `stops.${index}.operationType`, "İşlem tipi seçimi zorunludur.")
    }
  })

  if (lineType === "main") {
    stops.forEach((stop, index) => {
      if (stop.locationType !== "transfer_center") {
        pushError(errors, `stops.${index}.locationType`, "Ana Hat için tüm duraklar Transfer Merkezi olmalıdır.")
      }
    })
  }

  if (lineType === "hub") {
    if (stops[0]?.locationType !== "transfer_center") {
      pushError(errors, "stops.0.locationType", "Merkez Hat için ilk durak Transfer Merkezi olmalıdır.")
    }
    stops.slice(1).forEach((stop, idx) => {
      if (stop.locationType !== "branch") {
        pushError(errors, `stops.${idx + 1}.locationType`, "Merkez Hat için 2. ve sonrası Şube olmalıdır.")
      }
    })
  }

  if (lineType === "feeder") {
    const lastIndex = stops.length - 1
    stops.slice(0, lastIndex).forEach((stop, index) => {
      if (stop.locationType !== "branch") {
        pushError(errors, `stops.${index}.locationType`, "Ara Hat için son durak dışındaki tüm duraklar Şube olmalıdır.")
      }
    })
    if (stops[lastIndex]?.locationType !== "transfer_center") {
      pushError(errors, `stops.${lastIndex}.locationType`, "Ara Hat için son durak Transfer Merkezi olmalıdır.")
    }
  }

  return errors
}
