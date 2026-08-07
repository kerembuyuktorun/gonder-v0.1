import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

const config = [// Base recommended configs
js.configs.recommended, ...tseslint.configs.recommended, prettier, // Global ignores
{
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/out/**',
    '**/build/**',
    '**/.turbo/**',
    '**/coverage/**',
    'playground/**/*.d.ts',
  ],
}, // Custom rules
{
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // React specific
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // Using TypeScript
  },
},
{
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
          properties: false,
        },
      },
    ],
  },
},
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/_shared/logger.ts'],
  rules: {
    'no-console': 'error',
  },
},
{
  files: ['app/**/*.{ts,tsx}'],
  rules: {
    'no-console': 'warn',
  },
},
{
  files: ['src/_shared/logger.ts'],
  rules: {
    'no-console': 'off',
  },
},
{
  files: [
    'src/externals.d.ts',
    'src/form-kit/context/types.ts',
    'src/form-kit/hooks/useSchemaForm.ts',
    'src/form-kit/components/SchemaForm.tsx',
    'src/form-kit/components/WizardForm.tsx',
    'src/form-kit/utils/buildSchema.ts',
    'src/form-kit/utils/create-refine.ts',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
},
{
  files: ['src/externals.d.ts'],
  rules: {
    '@typescript-eslint/no-empty-object-type': 'off',
  },
}];

export default config;
