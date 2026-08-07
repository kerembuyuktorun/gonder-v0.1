'use client'

import React from 'react'
import type {
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from '@tanstack/react-table'

interface DataTableState {
  pagination: PaginationState
  sorting: SortingState
  globalFilter: string
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: RowSelectionState
  expanded: ExpandedState
}

type DataTableStateAction =
  | { type: 'pagination'; updater: Updater<PaginationState> }
  | { type: 'sorting'; updater: Updater<SortingState> }
  | { type: 'globalFilter'; updater: Updater<string> }
  | { type: 'columnFilters'; updater: Updater<ColumnFiltersState> }
  | { type: 'columnVisibility'; updater: Updater<VisibilityState> }
  | { type: 'rowSelection'; updater: Updater<RowSelectionState> }
  | { type: 'expanded'; updater: Updater<ExpandedState> }

const initialDataTableState: DataTableState = {
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
  expanded: {},
}

function applyUpdater<TValue>(previous: TValue, updater: Updater<TValue>): TValue {
  return typeof updater === 'function' ? (updater as (old: TValue) => TValue)(previous) : updater
}

function dataTableStateReducer(state: DataTableState, action: DataTableStateAction): DataTableState {
  switch (action.type) {
    case 'pagination':
      return { ...state, pagination: applyUpdater(state.pagination, action.updater) }
    case 'sorting':
      return { ...state, sorting: applyUpdater(state.sorting, action.updater) }
    case 'globalFilter':
      return { ...state, globalFilter: applyUpdater(state.globalFilter, action.updater) }
    case 'columnFilters':
      return { ...state, columnFilters: applyUpdater(state.columnFilters, action.updater) }
    case 'columnVisibility':
      return { ...state, columnVisibility: applyUpdater(state.columnVisibility, action.updater) }
    case 'rowSelection':
      return { ...state, rowSelection: applyUpdater(state.rowSelection, action.updater) }
    case 'expanded':
      return { ...state, expanded: applyUpdater(state.expanded, action.updater) }
  }
}

export function useDataTableState() {
  const [state, dispatch] = React.useReducer(dataTableStateReducer, initialDataTableState)

  return {
    state,
    setPagination: React.useCallback((updater: Updater<PaginationState>) => {
      dispatch({ type: 'pagination', updater })
    }, []),
    setSorting: React.useCallback((updater: Updater<SortingState>) => {
      dispatch({ type: 'sorting', updater })
    }, []),
    setGlobalFilter: React.useCallback((updater: Updater<string>) => {
      dispatch({ type: 'globalFilter', updater })
    }, []),
    setColumnFilters: React.useCallback((updater: Updater<ColumnFiltersState>) => {
      dispatch({ type: 'columnFilters', updater })
    }, []),
    setColumnVisibility: React.useCallback((updater: Updater<VisibilityState>) => {
      dispatch({ type: 'columnVisibility', updater })
    }, []),
    setRowSelection: React.useCallback((updater: Updater<RowSelectionState>) => {
      dispatch({ type: 'rowSelection', updater })
    }, []),
    setExpanded: React.useCallback((updater: Updater<ExpandedState>) => {
      dispatch({ type: 'expanded', updater })
    }, []),
  }
}
