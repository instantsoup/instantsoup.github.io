// eslint.config.js (ESM / ESLint v9 flat config)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import pluginImport from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // ignore replaces .eslintignore
  { ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'] },

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
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: pluginImport,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'import/no-default-export': 'error', // named exports everywhere
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // '@typescript-eslint/no-explicit-any': 'warn', // optional
    },
  },

  // Node CLI / scripts (your .mjs under /scripts)
  {
    files: ['scripts/**/*.{js,mjs,ts}'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node, // enables process, console, etc.
        structuredClone: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // allow console in CLI scripts
    },
  },
  {
    files: [
      'vite.config.*',
      'vitest.config.*',
      'eslint.config.*',
      'postcss.config.*',
      'tailwind.config.*',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // keep last
  eslintConfigPrettier,
];
