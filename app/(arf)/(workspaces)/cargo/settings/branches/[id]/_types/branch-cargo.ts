export type CargoDirection = "gonderici" | "alici"
export type CargoStatus =
  | "olusturuldu"
  | "transfer_surecinde"
  | "varis_subede"
  | "dagitimda"
  | "teslim_edildi"
  | "devredildi"
  | "iptal_edildi"
  | "iade"

export interface BranchCargoRecord {
  id: string
  takipNo: string
  yon: CargoDirection
  gondericiSubeId?: string
  gondericiSubeAdi?: string
  aliciSubeId?: string
  aliciSubeAdi?: string
  gondericiAdSoyad: string
  aliciAdSoyad: string
  aliciTelefon?: string
  odemeTuru?: string
  faturaTuru?: string
  matrah?: number
  kdv?: number
  toplam: number
  tAdet?: number
  tDesi?: number
  parcaListesi?: string
  irsaliyeNo?: string
  atfNo?: string
  durum: CargoStatus
  parcaDurumu?: string
  faturaDurumu?: string
  tahsilatDurumu?: string
  olusturan?: string
  tarih: string
  varisTarihi?: string
  teslimTarihi?: string
  sonIslemZamani?: string
}
