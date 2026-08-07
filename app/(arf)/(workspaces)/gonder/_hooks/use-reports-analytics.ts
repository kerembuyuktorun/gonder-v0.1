'use client'

import { useQuery } from '@tanstack/react-query'
import {
  defaultAnalyticsRange,
  reportsAnalyticsRepository,
} from '../_data/reports-analytics-repository'
import type { AnalyticsQuery, ReportPeriodPreset } from '../_types/reports'

export const REPORTS_ANALYTICS_KEY = ['gonder', 'reports-analytics'] as const

export function useReportsQueryState(preset: ReportPeriodPreset = '30d'): AnalyticsQuery {
  return defaultAnalyticsRange(preset)
}

export function useReportsOverview(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'overview', query],
    queryFn: () => reportsAnalyticsRepository.getOverview(query),
  })
}

export function useShipmentVolumeReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'shipment-volume', query],
    queryFn: () => reportsAnalyticsRepository.getShipmentVolume(query),
  })
}

export function useCostRevenueReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'cost-revenue', query],
    queryFn: () => reportsAnalyticsRepository.getCostRevenue(query),
  })
}

export function useCarrierPerformanceReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'carrier-performance', query],
    queryFn: () => reportsAnalyticsRepository.getCarrierPerformance(query),
  })
}

export function useDeliveryPerformanceReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'delivery-performance', query],
    queryFn: () => reportsAnalyticsRepository.getDeliveryPerformance(query),
  })
}

export function useReturnsReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'returns', query],
    queryFn: () => reportsAnalyticsRepository.getReturns(query),
  })
}

export function useDesiAdjustmentsReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'desi-adjustments', query],
    queryFn: () => reportsAnalyticsRepository.getDesiAdjustments(query),
  })
}

export function useQuotesReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'quotes', query],
    queryFn: () => reportsAnalyticsRepository.getQuotes(query),
  })
}

export function useIntegrationChannelsReport(query: AnalyticsQuery) {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'integration-channels', query],
    queryFn: () => reportsAnalyticsRepository.getIntegrationChannels(query),
  })
}

export function useSavedReportViews() {
  return useQuery({
    queryKey: [...REPORTS_ANALYTICS_KEY, 'saved'],
    queryFn: () => reportsAnalyticsRepository.listSavedViews(),
  })
}
