import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  // Global ignores
  {
    name: 'cc98/global-ignores',
    ignores: [
      'dist',
      '.next',
      '.next',
      'node_modules',
      'vendor',
      'build',
      'coverage',
      'src/lib/ubb/**/*',
      'src/types/api/**/*',
      'playwright.config.ts',
      'vitest.config.ts',
      'tests/setup.ts',
      'eslint.config.js',
    ],
  },
  // Base ESLint recommended config
  eslint.configs.recommended,
  // TypeScript ESLint recommended config
  ...tseslint.configs.recommended,
  // React + TypeScript files
  {
    name: 'cc98/react-typescript',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      ...pluginReactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  }
)
