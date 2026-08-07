// TODO: Remove when API is ready

import type { IntegrationPlatform } from "../_types"

function logoDataUri(label: string, color: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='12' fill='${color}'/><text x='32' y='39' text-anchor='middle' font-size='24' font-family='Arial' fill='white'>${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const mockIntegrationPlatforms: IntegrationPlatform[] = [
  {
    id: "arf",
    name: "Arf",
    code: "ARF",
    category: "accounting_erp",
    logoUrl: logoDataUri("P", "#22c55e"),
    description: "Fatura ve cari süreçlerinizi otomatikleştirin.",
    docsUrl: "https://www.parasut.com",
    requiredCredentials: [
      { key: "clientId", label: "Müşteri Anahtarı", type: "text", required: true },
      { key: "clientSecret", label: "Kimlik Doğrulama Anahtarı", type: "password", required: true, masked: true },
    ],
  },
  {
    id: "trendyol",
    name: "Trendyol",
    code: "TRENDYOL",
    category: "ecommerce",
    logoUrl: logoDataUri("T", "#f97316"),
    description: "Siparişleri ve stokları Trendyol ile senkron edin.",
    docsUrl: "https://www.trendyol.com",
    requiredCredentials: [
      { key: "storeCode", label: "Mağaza Kodu", type: "text", required: true },
      { key: "apiUser", label: "API Kullanıcı Adı", type: "text", required: true },
      { key: "apiPassword", label: "API Şifresi", type: "password", required: true, masked: true },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    code: "TWILIO",
    category: "communication",
    logoUrl: logoDataUri("W", "#f43f5e"),
    description: "SMS bildirimlerini Twilio ile gönderin.",
    docsUrl: "https://www.twilio.com/docs",
    requiredCredentials: [
      { key: "accountSid", label: "Account SID", type: "text", required: true },
      { key: "authToken", label: "Auth Token", type: "password", required: true, masked: true },
      { key: "fromNumber", label: "Gönderen Numara", type: "text", required: true },
    ],
  },
  {
    id: "custom-webhook",
    name: "Özel Webhook",
    code: "CUSTOM_WEBHOOK",
    category: "custom_webhook",
    logoUrl: logoDataUri("C", "#6b7280"),
    description: "Kendi API endpoint'inizle iki yönlü iletişim kurun.",
    docsUrl: "https://docs.example.com/webhook",
    requiredCredentials: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", required: true },
      { key: "apiKey", label: "API Anahtarı", type: "password", required: true, masked: true },
    ],
  },
]
