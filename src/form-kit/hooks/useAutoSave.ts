'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWatch } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'
import type {
  AutoSaveDraft,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
} from '../context/types'

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch (_error) {
    return null
  }
}

function serializeSnapshot<T>(value: T): string {
  return JSON.stringify(value)
}

function normalizeDraft<TValues extends FieldValues>(
  raw: string | null,
  draftVersion?: string
): AutoSaveDraft<TValues> | null {
  const parsed = safeParse<AutoSaveDraft<TValues> | TValues>(raw)
  if (!parsed) return null

  if (typeof parsed === 'object' && parsed !== null && 'values' in parsed && 'savedAt' in parsed) {
    return parsed as AutoSaveDraft<TValues>
  }

  return {
    values: parsed as TValues,
    savedAt: Date.now(),
    version: draftVersion,
  }
}

export function useAutoSave<TValues extends FieldValues = FieldValues>({
  form,
  storageKey,
  mode = 'debounce',
  debounceMs = 800,
  enabled = true,
  restoreOnMount = true,
  draftVersion,
  onAutoSave,
  onRestoreConflict,
}: UseAutoSaveOptions<TValues>): UseAutoSaveReturn {
  const values = useWatch({ control: form.control }) as TValues
  const [hasDraft, setHasDraft] = useState(false)
  const isHydratedRef = useRef(false)
  const lastSavedSnapshotRef = useRef<string>('')

  const save = useCallback(async () => {
    if (!enabled || typeof window === 'undefined') return

    const snapshot = form.getValues()
    const serializedSnapshot = serializeSnapshot(snapshot)
    const payload: AutoSaveDraft<TValues> = {
      values: snapshot,
      savedAt: Date.now(),
      version: draftVersion,
    }

    window.localStorage.setItem(storageKey, JSON.stringify(payload))
    lastSavedSnapshotRef.current = serializedSnapshot
    setHasDraft(true)

    if (onAutoSave) {
      await onAutoSave(snapshot)
    }
  }, [draftVersion, enabled, form, onAutoSave, storageKey])

  useEffect(() => {
    let isCancelled = false

    const restoreDraft = async () => {
      const currentSnapshot = form.getValues()
      const serializedCurrentSnapshot = serializeSnapshot(currentSnapshot)

      if (!enabled || typeof window === 'undefined') {
        lastSavedSnapshotRef.current = serializedCurrentSnapshot
        isHydratedRef.current = true
        return
      }

      if (!restoreOnMount) {
        lastSavedSnapshotRef.current = serializedCurrentSnapshot
        isHydratedRef.current = true
        return
      }

      const draft = normalizeDraft<TValues>(window.localStorage.getItem(storageKey), draftVersion)
      if (!draft) {
        lastSavedSnapshotRef.current = serializedCurrentSnapshot
        isHydratedRef.current = true
        return
      }

      setHasDraft(true)

      let shouldRestoreDraft = true
      if (draftVersion && draft.version && draft.version !== draftVersion) {
        if (onRestoreConflict) {
          const resolution = await onRestoreConflict({
            draft,
            currentValues: currentSnapshot,
          })
          shouldRestoreDraft = resolution === 'draft'
        } else {
          shouldRestoreDraft = false
        }
      } else if (onRestoreConflict && serializeSnapshot(draft.values) !== serializedCurrentSnapshot) {
        const resolution = await onRestoreConflict({
          draft,
          currentValues: currentSnapshot,
        })
        shouldRestoreDraft = resolution === 'draft'
      }

      if (isCancelled) return

      if (shouldRestoreDraft) {
        form.reset(draft.values)
        lastSavedSnapshotRef.current = serializeSnapshot(draft.values)
      } else {
        lastSavedSnapshotRef.current = serializedCurrentSnapshot
      }

      isHydratedRef.current = true
    }

    void restoreDraft()

    return () => {
      isCancelled = true
    }
  }, [draftVersion, enabled, form, onRestoreConflict, restoreOnMount, storageKey])

  const serializedValues = useMemo(() => serializeSnapshot(values), [values])

  useEffect(() => {
    if (!enabled || mode !== 'debounce') return
    if (!isHydratedRef.current) return
    if (serializedValues === lastSavedSnapshotRef.current) return

    const timer = window.setTimeout(() => {
      void save()
    }, debounceMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [debounceMs, enabled, mode, save, serializedValues])

  return {
    saveNow: save,
    onFieldBlur: async () => {
      if (mode !== 'onBlur') return
      if (!isHydratedRef.current) return
      await save()
    },
    clearDraft: () => {
      if (typeof window === 'undefined') return
      window.localStorage.removeItem(storageKey)
      lastSavedSnapshotRef.current = ''
      setHasDraft(false)
    },
    hasDraft,
  }
}
