'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bulkImportRepository,
  type BulkImportJobsQuery,
  type CreateBulkImportJobInput,
  type StagingRowsQuery,
} from '../_data/bulk-import-repository'
import type { ColumnMapping, StagingRowPayload } from '../_types/bulk-import'

export const BULK_IMPORT_KEY = ['gonder', 'bulk-import'] as const

export function useBulkImportJobs(query: BulkImportJobsQuery) {
  return useQuery({
    queryKey: [...BULK_IMPORT_KEY, 'jobs', query],
    queryFn: () => bulkImportRepository.listJobs(query),
  })
}

export function useBulkImportJob(jobId: string | null) {
  return useQuery({
    queryKey: [...BULK_IMPORT_KEY, 'job', jobId],
    queryFn: () => (jobId ? bulkImportRepository.getJob(jobId) : Promise.resolve(null)),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'parsing' || status === 'uploading' || status === 'approving') return 800
      return false
    },
  })
}

export function useBulkImportRows(jobId: string | null, query: StagingRowsQuery = {}) {
  return useQuery({
    queryKey: [...BULK_IMPORT_KEY, 'rows', jobId, query],
    queryFn: () =>
      jobId ? bulkImportRepository.listRows(jobId, query) : Promise.resolve({ items: [], total: 0 }),
    enabled: Boolean(jobId),
  })
}

export function useCreateBulkImportJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBulkImportJobInput) => bulkImportRepository.createJob(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BULK_IMPORT_KEY })
    },
  })
}

export function useUpdateBulkImportMapping(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (mapping: ColumnMapping) =>
      bulkImportRepository.updateColumnMapping(jobId, mapping),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BULK_IMPORT_KEY })
    },
  })
}

export function useValidateBulkImportJob(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => bulkImportRepository.validateJob(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BULK_IMPORT_KEY })
    },
  })
}

export function useUpdateBulkImportRow(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      rowId,
      payload,
    }: {
      rowId: string
      payload: Partial<StagingRowPayload>
    }) => bulkImportRepository.updateRow(jobId, rowId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BULK_IMPORT_KEY })
    },
  })
}

export function useSkipBulkImportRows(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rowIds: string[]) => bulkImportRepository.skipRows(jobId, rowIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BULK_IMPORT_KEY })
    },
  })
}

export function useApproveBulkImportRows(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rowIds?: string[]) => bulkImportRepository.approveValidRows(jobId, rowIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BULK_IMPORT_KEY })
      void queryClient.invalidateQueries({ queryKey: ['gonder', 'shipments-list'] })
    },
  })
}

export function useCancelBulkImportJob(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => bulkImportRepository.cancelJob(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BULK_IMPORT_KEY })
    },
  })
}
