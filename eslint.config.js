// 最简化 ESLint 配置
export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'vendor',
      'build',
      'coverage',
      'src/lib/ubb/**/*',
      'src/types/api/**/*',
      'playwright.config.ts',
      'vitest.config.ts',
      'tests/setup.ts',
      'vite.config.ts',
      'eslint.config.js',
    ],
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
]
