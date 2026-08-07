import { readFileSync } from 'node:fs'

import { defineConfig, type Options } from 'tsup'

type PackageManifest = {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as PackageManifest

const external = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]

const clientEntries: Record<string, string> = {
  index: 'src/index.ts',
  'auth-kit/index': 'src/auth-kit/index.ts',
  'layout-kit/index': 'src/layout-kit/index.ts',
  'datatable-kit/index': 'src/datatable-kit/index.ts',
  'form-kit/index': 'src/form-kit/index.ts',
  'errors-kit/index': 'src/errors-kit/index.ts',
  'feedback-kit/index': 'src/feedback-kit/index.ts',
  'file-kit/index': 'src/file-kit/index.ts',
  'ui/index': 'src/ui/index.ts',
}

const presetEntry: Record<string, string> = {
  'tailwind.preset': 'src/tailwind.preset.ts',
}

const sharedConfig: Partial<Options> = {
  format: ['esm'] as const,
  dts: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  target: 'es2020',
  platform: 'neutral' as const,
  tsconfig: './tsconfig.build.json',
  external,
  skipNodeModulesBundle: true,
  outExtension: () => ({ js: '.js' }),
}

export default defineConfig((options): Options[] => [
  {
    ...sharedConfig,
    entry: clientEntries,
    clean: !options.watch,
  },
  {
    ...sharedConfig,
    entry: presetEntry,
    clean: false,
  },
])