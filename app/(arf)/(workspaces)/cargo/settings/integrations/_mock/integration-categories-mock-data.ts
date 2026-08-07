// TODO: Remove when API is ready

import type { IntegrationCategoryOption } from "../_types"

export const mockIntegrationCategories: IntegrationCategoryOption[] = [
  {
    id: "accounting_erp",
    label: "Muhasebe / ERP",
    description: "Fatura, cari ve muhasebe süreçleri",
    icon: "ChartNoAxesColumn",
  },
  {
    id: "ecommerce",
    label: "E-Ticaret / Pazaryeri",
    description: "Sipariş, stok ve pazar yeri köprüleri",
    icon: "ShoppingCart",
  },
  {
    id: "communication",
    label: "İletişim / SMS",
    description: "Bildirim ve mesajlaşma sağlayıcıları",
    icon: "MessagesSquare",
  },
  {
    id: "custom_webhook",
    label: "Özel Webhook / API",
    description: "Kendi yazılımınızı generic endpoint ile bağlayın",
    icon: "Webhook",
  },
]
