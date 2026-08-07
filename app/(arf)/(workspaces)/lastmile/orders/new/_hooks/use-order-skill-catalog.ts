'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchSkillCatalog } from '../../../_api/skill-catalog'
import {
  FALLBACK_ORDER_SKILLS,
  type SkillCatalogItem,
} from '../../../_lib/skill-catalog'

export function useOrderSkillCatalog() {
  const [skills, setSkills] = useState<SkillCatalogItem[]>(FALLBACK_ORDER_SKILLS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    fetchSkillCatalog('order').then((result) => {
      if (cancelled) return
      setIsLoading(false)
      if (!result.success) {
        toast.error(result.error ?? 'Gereksinim kataloğu yüklenemedi.')
        return
      }
      if (result.data.length > 0) {
        setSkills(result.data)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { skills, isLoading }
}
