export const turkeyBanksByCode: Record<string, string> = {
  "00010": "Ziraat Bankası",
  "00012": "Halkbank",
  "00015": "Vakıfbank",
  "00032": "TEB - Türk Ekonomi Bankası",
  "00046": "Akbank",
  "00059": "Şekerbank",
  "00062": "Garanti BBVA",
  "00064": "İş Bankası",
  "00067": "Yapı Kredi",
  "00099": "ING Bank",
  "00111": "QNB Finansbank",
  "00124": "HSBC Türkiye",
  "00134": "DenizBank",
  "00203": "Alternatifbank",
}

export function resolveBankNameByCode(bankCode: string): string {
  return turkeyBanksByCode[bankCode] ?? ""
}
