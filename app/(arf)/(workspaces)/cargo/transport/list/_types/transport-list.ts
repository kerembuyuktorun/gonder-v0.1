/* ------------------------------------------------------------------ */
/*  Taşıma Listesi – Tip Tanımları                                    */
/* ------------------------------------------------------------------ */

export type TasimaDurum =
  | "planlanmis"
  | "yukleniyor"
  | "yolda"
  | "teslim_edildi"
  | "iptal"

export type GonderiTipi = "FTL" | "LTL"

export interface TasimaListRow {
  id: string
  tasimaNo: string
  yuklemeTarihi: string
  gonderiTipi: GonderiTipi
  gondericiMusteri: string
  aliciMusteri: string
  cikisAdres: string
  varisAdres: string
  tasimaciFirma: string
  aracPlaka: string
  surucu: string
  yukTipleri: string
  toplamAdet: number
  toplamAgirlik: number
  toplamHacim: number
  toplamDesi: number
  alisFiyat: number
  satisFiyat: number
  kar: number
  durum: TasimaDurum
  olusturmaTarihi: string
  olusturan: string
}
