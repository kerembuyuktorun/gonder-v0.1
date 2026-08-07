import { z } from "zod"
import type { TripStartFormState } from "../_types"

export const tripStartSchema = z
  .object({
    lineType: z.enum(["main", "hub", "feeder"], { message: "Hat türü seçilmelidir." }),
    lineId: z.string().min(1, "Hat seçimi zorunludur."),
    supplierType: z.enum(["company", "warehouse", "truck_owner", "logistics"], { message: "Tedarikçi tipi seçilmelidir." }),
    supplierId: z.string().min(1, "Tedarikçi seçimi zorunludur."),
    vehicleId: z.string().optional(),
    driverId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.supplierType !== "warehouse" && !value.vehicleId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["vehicleId"], message: "Araç seçimi zorunludur." })
    }
    if (value.supplierType !== "warehouse" && !value.driverId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["driverId"], message: "Sürücü seçimi zorunludur." })
    }
  })

export function validateTripStartForm(values: TripStartFormState) {
  return tripStartSchema.safeParse(values)
}

export function isWarehouseSupplier(supplierType: TripStartFormState["supplierType"]) {
  return supplierType === "warehouse"
}