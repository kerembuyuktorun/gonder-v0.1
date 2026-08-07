import type { BrandSwitcherItem } from '@hascanb/arf-ui-kit/layout-kit'

export type WorkspaceModuleCode =
  | 'CARGO'
  | 'LAST_MILE'
  | 'GONDER'
  | 'FLEET'
  | 'DELIVERY'
  | 'LOGISTIC'
  | 'TESTHUB'

export const WORKSPACE_MODULE_CODES: WorkspaceModuleCode[] = [
  'CARGO',
  'LAST_MILE',
  'GONDER',
  'FLEET',
  'DELIVERY',
  'LOGISTIC',
  'TESTHUB',
]

const BRAND_TO_MODULE: Record<string, WorkspaceModuleCode | null> = {
  cargo: 'CARGO',
  lastmile: 'LAST_MILE',
  gonder: 'GONDER',
  logistics: 'LOGISTIC',
  fleet: 'FLEET',
  warehouse: 'DELIVERY',
  test: 'TESTHUB',
}

/**
 * Marks workspace switcher items as disabled when the tenant module is not Active
 * (or when the item is still "Yakında"). Test hub is omitted unless TESTHUB is Active.
 */
export function withBrandAccess(
  options: BrandSwitcherItem[],
  allowedModules: WorkspaceModuleCode[],
  extras?: { allowTest?: boolean }
): BrandSwitcherItem[] {
  const allowTest = extras?.allowTest ?? allowedModules.includes('TESTHUB')

  return options
    .filter((item) => {
      if (item.id === 'test') return allowTest
      return true
    })
    .map((item) => {
      if (item.subtitle === 'Yakında') {
        return { ...item, disabled: true }
      }

      if (item.id === 'test') {
        return { ...item, disabled: false }
      }

      const moduleCode = BRAND_TO_MODULE[item.id]
      if (!moduleCode) {
        return { ...item, disabled: true }
      }

      return {
        ...item,
        disabled: !allowedModules.includes(moduleCode),
      }
    })
}
