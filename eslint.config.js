// eslint.config.js (ESM / ESLint v9 flat config)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import pluginImport from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // Replaces .eslintignore
  { ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'] },

  // Base JS + TS recommended
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React/TS app files (browser)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
      // If you use TS path aliases (@/*), uncomment and install resolver:
      // npm i -D eslint-import-resolver-typescript
      // 'import/resolver': { typescript: true },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: pluginImport,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // Project conventions
      'import/no-default-export': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Remove unused imports/vars on --fix
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Deterministic import ordering
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Optional tighten-ups you can enable later:
      // '@typescript-eslint/no-explicit-any': 'warn',
      // '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Node CLI / scripts (e.g., scripts/*.mjs, tool configs)
  {
    files: [
      'scripts/**/*.{js,mjs,ts}',
      'vite.config.*',
      'vitest.config.*',
      'eslint.config.*',
      'postcss.config.*',
      'tailwind.config.*',
      '*.config.{js,ts,mjs,cjs}',
    ],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,        // process, console, __dirname (CJS note), etc.
        structuredClone: 'readonly',
      },
    },
    rules: {
      // Allow default export in tool configs; allow console in CLI
      'import/no-default-export': 'off',
      'no-console': 'off',
    },
  },

  // Keep last to disable rules that conflict with Prettier
  eslintConfigPrettier,
];
