export interface AddressSelection {
  city: string
  district: string
  neighborhood: string
}

export interface DistrictOption {
  name: string
  neighborhoods: string[]
}

export interface CityOption {
  name: string
  districts: DistrictOption[]
}
