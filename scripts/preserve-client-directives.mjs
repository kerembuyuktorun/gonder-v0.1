import { readFile, writeFile } from 'node:fs/promises'

const clientEntryFiles = [
  'dist/index.js',
  'dist/auth-kit/index.js',
  'dist/layout-kit/index.js',
  'dist/datatable-kit/index.js',
  'dist/form-kit/index.js',
  'dist/errors-kit/index.js',
  'dist/feedback-kit/index.js',
  'dist/file-kit/index.js',
  'dist/ui/index.js',
]

const directive = '"use client";\n'

await Promise.all(
  clientEntryFiles.map(async (filePath) => {
    const content = await readFile(filePath, 'utf8')

    if (content.startsWith(directive)) {
      return
    }

    await writeFile(filePath, `${directive}${content}`, 'utf8')
  }),
)