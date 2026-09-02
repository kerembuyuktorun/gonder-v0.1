/**
 * ARF Merkezi Route Haritası
 *
 * Tüm sayfa path'leri bu dosyadan yönetilir.
 * Bir path değiştiğinde sadece burayı güncellemeniz yeterlidir.
 */

const CARGO_BASE = '/cargo'
const LASTMILE_BASE = '/lastmile'
const GONDER_BASE = '/gonder'

export const ARF_ROUTES = {
  /** ARF ana workspace seçim ekranı */
  root: '/',

  gonder: {
    root: GONDER_BASE,
    landing: '/landing',
    createOrder: '/siparis',
    support: `${GONDER_BASE}/support`,
    dashboard: {
      root: GONDER_BASE,
    },
    shipments: {
      list: `${GONDER_BASE}/shipments`,
      create: `${GONDER_BASE}/shipments/new`,
      createAlias: `${GONDER_BASE}/create-shipment`,
      active: `${GONDER_BASE}/shipments?view=active`,
      delivered: `${GONDER_BASE}/shipments?view=delivered`,
      detail: (shipmentId: string) => `${GONDER_BASE}/shipments/${shipmentId}`,
    },
    orders: {
      list: `${GONDER_BASE}/orders`,
      needsShipment: `${GONDER_BASE}/orders?view=needs_shipment`,
      detail: (orderId: string) => `${GONDER_BASE}/orders/${orderId}`,
    },
    returns: {
      list: `${GONDER_BASE}/returns`,
      inProgress: `${GONDER_BASE}/returns?view=in_progress`,
      detail: (returnId: string) => `${GONDER_BASE}/returns/${returnId}`,
    },
    desiControl: {
      list: `${GONDER_BASE}/desi-control`,
      unreviewed: `${GONDER_BASE}/desi-control?view=unreviewed`,
      detail: (adjustmentId: string) => `${GONDER_BASE}/desi-control/${adjustmentId}`,
    },
    quotes: {
      list: `${GONDER_BASE}/quotes`,
      open: `${GONDER_BASE}/quotes?view=open`,
      detail: (requestId: string) => `${GONDER_BASE}/quotes/${requestId}`,
    },
    priceCalculation: `${GONDER_BASE}/price-calculation`,
    /** @deprecated Use quotes.list / quotes.detail — kept for redirect compatibility */
    results: `${GONDER_BASE}/results`,
    reports: {
      root: `${GONDER_BASE}/reports`,
      overview: `${GONDER_BASE}/reports/overview`,
      shipmentVolume: `${GONDER_BASE}/reports/shipment-volume`,
      costRevenue: `${GONDER_BASE}/reports/cost-revenue`,
      carrierPerformance: `${GONDER_BASE}/reports/carrier-performance`,
      deliveryPerformance: `${GONDER_BASE}/reports/delivery-performance`,
      integrationChannels: `${GONDER_BASE}/reports/integration-channels`,
      quotes: `${GONDER_BASE}/reports/quotes`,
      returns: `${GONDER_BASE}/reports/returns`,
      desiAdjustments: `${GONDER_BASE}/reports/desi-adjustments`,
      finance: `${GONDER_BASE}/reports/finance`,
      saved: `${GONDER_BASE}/reports/saved`,
    },
    bulkCreate: {
      root: `${GONDER_BASE}/bulk-create`,
      imports: `${GONDER_BASE}/bulk-create/imports`,
      importDetail: (jobId: string) => `${GONDER_BASE}/bulk-create/imports/${jobId}`,
    },
    integrations: {
      root: `${GONDER_BASE}/integrations`,
      /** Excel içe aktarım workspace — bulk-create */
      excel: `${GONDER_BASE}/bulk-create`,
    },
    finance: {
      root: `${GONDER_BASE}/finance`,
      transactions: {
        list: `${GONDER_BASE}/finance/transactions`,
        detail: (transactionId: string) =>
          `${GONDER_BASE}/finance/transactions/${transactionId}`,
      },
      upcoming: {
        list: `${GONDER_BASE}/finance/upcoming`,
        detail: (paymentId: string) => `${GONDER_BASE}/finance/upcoming/${paymentId}`,
      },
      invoices: {
        list: `${GONDER_BASE}/finance/invoices`,
        detail: (invoiceId: string) => `${GONDER_BASE}/finance/invoices/${invoiceId}`,
      },
      wallet: {
        root: `${GONDER_BASE}/finance/wallet`,
        topUp: `${GONDER_BASE}/finance/wallet/top-up`,
        history: `${GONDER_BASE}/finance/wallet/history`,
        historyDetail: (entryId: string) =>
          `${GONDER_BASE}/finance/wallet/history/${entryId}`,
      },
    },
  },

  lastmile: {
    root: LASTMILE_BASE,
    support: `${LASTMILE_BASE}/support`,
    dashboard: {
      kpi: LASTMILE_BASE,
      live: `${LASTMILE_BASE}/dashboard/live`,
    },
    orders: {
      list: `${LASTMILE_BASE}/orders`,
      listByCustomer: (customerId: string, customerName?: string) => {
        const params = new URLSearchParams({ customer: customerId })
        if (customerName?.trim()) params.set('customerName', customerName.trim())
        return `${LASTMILE_BASE}/orders?${params.toString()}`
      },
      create: `${LASTMILE_BASE}/orders/new`,
      detail: (orderId: string) => `${LASTMILE_BASE}/orders/${orderId}`,
      cancelRequests: `${LASTMILE_BASE}/orders/cancel-requests`,
    },
    planning: {
      orchestrator: `${LASTMILE_BASE}/planning/route-orchestrator`,
      /** Open orchestrator focused on an active route (UUID) */
      orchestratorWithRoute: (routeId: string) =>
        `${LASTMILE_BASE}/planning/route-orchestrator?routeId=${encodeURIComponent(routeId)}`,
      /** Mock veri + client-side motorlar — sunum / QA */
      orchestratorDemo: `${LASTMILE_BASE}/planning/route-orchestrator-demo`,
      routes: `${LASTMILE_BASE}/planning/routes`,
      routesByDriver: (driverId: string) => {
        const params = new URLSearchParams({ driverId })
        return `${LASTMILE_BASE}/planning/routes?${params.toString()}`
      },
      routesByVehicle: (vehicleId: string) => {
        const params = new URLSearchParams({ vehicleId })
        return `${LASTMILE_BASE}/planning/routes?${params.toString()}`
      },
      routeDetail: (routeId: string) => `${LASTMILE_BASE}/planning/routes/${routeId}`,
    },
    customers: {
      create: `${LASTMILE_BASE}/customers/new`,
      list: `${LASTMILE_BASE}/customers`,
      detail: (customerId: string) => `${LASTMILE_BASE}/customers/${customerId}`,
    },
    connections: {
      list: `${LASTMILE_BASE}/connections`,
    },
    resources: {
      vehicles: {
        create: `${LASTMILE_BASE}/resources/vehicles/new`,
        list: `${LASTMILE_BASE}/resources/vehicles`,
        detail: (vehicleId: string) => `${LASTMILE_BASE}/resources/vehicles/${vehicleId}`,
      },
      couriers: {
        list: `${LASTMILE_BASE}/resources/couriers`,
        detail: (courierId: string) => `${LASTMILE_BASE}/resources/couriers/${courierId}`,
        create: `${LASTMILE_BASE}/resources/couriers/new`,
      },
    },
    users: {
      create: `${LASTMILE_BASE}/users/new`,
      list: `${LASTMILE_BASE}/users`,
      detail: (userId: string) => `${LASTMILE_BASE}/users/${userId}`,
    },
    reports: {
      root: `${LASTMILE_BASE}/reports`,
    },
    finance: {
      root: `${LASTMILE_BASE}/finance`,
      customers: {
        list: `${LASTMILE_BASE}/finance/customers`,
      },
      suppliers: {
        list: `${LASTMILE_BASE}/finance/suppliers`,
        create: `${LASTMILE_BASE}/finance/suppliers/new`,
        detail: (supplierId: string) => `${LASTMILE_BASE}/finance/suppliers/${supplierId}`,
      },
      payouts: {
        list: `${LASTMILE_BASE}/finance/payouts`,
        courier: (courierId: string) =>
          `${LASTMILE_BASE}/finance/payouts?courier=${encodeURIComponent(courierId)}`,
      },
      courierBalances: {
        list: `${LASTMILE_BASE}/finance/courier-balances`,
        detail: (courierId: string) =>
          `${LASTMILE_BASE}/finance/courier-balances/${encodeURIComponent(courierId)}`,
      },
      income: {
        list: `${LASTMILE_BASE}/finance/income`,
      },
      invoices: {
        list: `${LASTMILE_BASE}/finance/invoices`,
        create: `${LASTMILE_BASE}/finance/invoices/new`,
        detail: (invoiceId: string) => `${LASTMILE_BASE}/finance/invoices/${invoiceId}`,
      },
      uninvoicedOrders: {
        list: `${LASTMILE_BASE}/finance/uninvoiced-orders`,
      },
      expenses: {
        list: `${LASTMILE_BASE}/finance/expenses`,
      },
      /** @deprecated Prefer settings.pricing — kept for redirects */
      priceLists: {
        list: `${LASTMILE_BASE}/finance/price-lists`,
        create: `${LASTMILE_BASE}/finance/price-lists/new`,
        detail: (priceListId: string) => `${LASTMILE_BASE}/finance/price-lists/${priceListId}`,
      },
      zones: {
        list: `${LASTMILE_BASE}/finance/zones`,
      },
      /** @deprecated Prefer finance.income / expenses in Faz 2 */
      collections: {
        list: `${LASTMILE_BASE}/finance/collections`,
        customer: (customerId: string) =>
          `${LASTMILE_BASE}/finance/collections?customer=${encodeURIComponent(customerId)}`,
      },
      courierCostLists: {
        list: `${LASTMILE_BASE}/finance/courier-cost-lists`,
        create: `${LASTMILE_BASE}/finance/courier-cost-lists/new`,
        detail: (costListId: string) =>
          `${LASTMILE_BASE}/finance/courier-cost-lists/${costListId}`,
      },
      /** @deprecated Prefer finance.payouts */
      courierPayouts: {
        list: `${LASTMILE_BASE}/finance/courier-payouts`,
        courier: (courierId: string) =>
          `${LASTMILE_BASE}/finance/courier-payouts?courier=${encodeURIComponent(courierId)}`,
      },
    },
    settings: {
      roles: {
        list: `${LASTMILE_BASE}/settings/roles`,
        detail: (roleId: string) => `${LASTMILE_BASE}/settings/roles/${roleId}`,
      },
      globalOperationRegions: `${LASTMILE_BASE}/settings/global-operation-regions`,
      definitions: `${LASTMILE_BASE}/settings/definitions`,
      pricing: {
        priceLists: {
          list: `${LASTMILE_BASE}/finance/price-lists`,
          create: `${LASTMILE_BASE}/finance/price-lists/new`,
          detail: (priceListId: string) => `${LASTMILE_BASE}/finance/price-lists/${priceListId}`,
        },
        zones: {
          list: `${LASTMILE_BASE}/finance/zones`,
        },
        courierCostLists: {
          list: `${LASTMILE_BASE}/finance/courier-cost-lists`,
          create: `${LASTMILE_BASE}/finance/courier-cost-lists/new`,
          detail: (costListId: string) =>
            `${LASTMILE_BASE}/finance/courier-cost-lists/${costListId}`,
        },
      },
    },
  },

  auth: {
    signIn: '/signin',
    otp: '/otp',
    forgotPassword: '/forgot-password',
    /** Must match IAM PASSWORD_RESET_PATH; email links use /reset-password?token=... */
    resetPassword: '/reset-password',
    /** IAM invite email links use /accept-invite?token=... */
    acceptInvite: '/accept-invite',
  },

  cargo: {
    /** Kargo dashboard (operasyon) */
    root: CARGO_BASE,
    support: `${CARGO_BASE}/support`,

    dashboard: {
      /** Genel dashboard (ana sayfa) */
      genel: CARGO_BASE,
      /** Kargo dashboard'ı */
      kargo: `${CARGO_BASE}/dashboard/cargo`,
      /** Operasyon dashboard'ı */
      operasyon: `${CARGO_BASE}/dashboard/operations`,
      /** Finans dashboard'ı */
      finans: `${CARGO_BASE}/dashboard/finance`,
    },

    shipments: {
      list: `${CARGO_BASE}/shipments`,
      new: `${CARGO_BASE}/shipments/new`,
      track: `${CARGO_BASE}/shipments/track`,
      canceled: `${CARGO_BASE}/shipments/canceled`,
      pieces: `${CARGO_BASE}/shipments/pieces`,
    },

    operations: {
      routes: `${CARGO_BASE}/operations/trips`,
      trips: `${CARGO_BASE}/operations/trips`,
      suppliers: `${CARGO_BASE}/operations/suppliers`,
      supplierDetail: (supplierId: string) => `${CARGO_BASE}/operations/suppliers/${supplierId}`,
      lines: `${CARGO_BASE}/operations/lines`,
      ktf: `${CARGO_BASE}/operations/transfer-forms`,
      interlandUnits: `${CARGO_BASE}/operations/interland-units`,
    },

    transport: {
      new: `${CARGO_BASE}/transport/new`,
      track: `${CARGO_BASE}/transport/track`,
      list: `${CARGO_BASE}/transport/list`,
      detail: (tasimaNo: string) => `${CARGO_BASE}/transport/${tasimaNo}`,
    },

    sales: {
      customers: `${CARGO_BASE}/marketing/customers`,
      customerDetail: (customerId: string) => `${CARGO_BASE}/marketing/customers/${customerId}`,
      contracts: `${CARGO_BASE}/marketing/contracts`,
      priceLists: `${CARGO_BASE}/marketing/price-lists`,
    },

    definitions: {
      suppliers: `${CARGO_BASE}/operations/suppliers`,
      drivers: `${CARGO_BASE}/definitions/drivers`,
      vehicles: `${CARGO_BASE}/definitions/vehicles`,
    },

    finance: {
      branchTransferCenter: {
        root: `${CARGO_BASE}/finance/branch-transfer-center`,
        invoices: `${CARGO_BASE}/finance/branch-transfer-center/invoices`,
        branchCash: `${CARGO_BASE}/finance/branch-transfer-center/branch-cash`,
        branchCashSummary: `${CARGO_BASE}/finance/branch-transfer-center/branch-cash-summary`,
        branchEntitlementDetail: `${CARGO_BASE}/finance/branch-transfer-center/branch-entitlement-detail`,
        transferCenterEntitlementDetail: `${CARGO_BASE}/finance/branch-transfer-center/transfer-center-entitlement-detail`,
      },
      headquarters: {
        root: `${CARGO_BASE}/finance/headquarters`,
        bankAccounts: `${CARGO_BASE}/finance/headquarters/bank-accounts`,
        invoices: `${CARGO_BASE}/finance/headquarters/invoices`,
        incomingEInvoices: `${CARGO_BASE}/finance/headquarters/incoming-e-invoices`,
        expenseList: `${CARGO_BASE}/finance/headquarters/expense-list`,
        branchEntitlementList: `${CARGO_BASE}/finance/headquarters/branch-entitlement-list`,
        transferCenterEntitlementList: `${CARGO_BASE}/finance/headquarters/transfer-center-entitlement-list`,
      },
      headOffice: {
        root: `${CARGO_BASE}/finance/head-office`,
        customerCash: `${CARGO_BASE}/finance/head-office/customer-cash`,
        customerCashList: `${CARGO_BASE}/finance/head-office/customer-cash-list`,
        collectionStatement: `${CARGO_BASE}/finance/head-office/collection-statement`,
        branchCashes: `${CARGO_BASE}/finance/head-office/branch-cashes`,
        branchCashLists: `${CARGO_BASE}/finance/head-office/branch-cash-lists`,
        approvalQueue: `${CARGO_BASE}/finance/head-office/approval-queue`,

      },
    },

    settings: {
      root: `${CARGO_BASE}/settings`,
      roles: `${CARGO_BASE}/settings/roles`,
      integrations: `${CARGO_BASE}/settings/integrations`,
      system: {
        root: `${CARGO_BASE}/settings`,
        roles: `${CARGO_BASE}/settings/roles`,
        integrations: `${CARGO_BASE}/settings/integrations`,
        transferCenters: `${CARGO_BASE}/settings/transfer-centers`,
        branches: `${CARGO_BASE}/settings/branches`,
        interlands: `${CARGO_BASE}/settings/interlands`,
        blockedInterlands: `${CARGO_BASE}/settings/blocked-interlands`,
        bankAccounts: `${CARGO_BASE}/finance/headquarters/bank-accounts`,
        systemPricing: `${CARGO_BASE}/settings/system-pricing`,
        lines: `${CARGO_BASE}/settings/lines`,
        neighborhoods: `${CARGO_BASE}/settings/neighborhoods`,
        distances: `${CARGO_BASE}/settings/distance-definitions`,
        users: `${CARGO_BASE}/settings/users`,
        userDetail: (userId: string) => `${CARGO_BASE}/settings/users/${userId}`,
        permissions: `${CARGO_BASE}/settings/permissions`,
      },
      user: {
        root: `${CARGO_BASE}/settings/user`,
        changePassword: `${CARGO_BASE}/settings/user/change-password`,
      },
    },
  },
} as const
