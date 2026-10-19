import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import-x'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  [
    globalIgnores(['dist', 'storybook-static']),
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        reactHooks.configs.flat['recommended-latest'],
        reactRefresh.configs.vite
      ],
      plugins: {
        react: reactPlugin,
        import: importPlugin
      },
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser
      },
      rules: {
        'react-hooks/set-state-in-effect': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { vars: 'all', args: 'after-used', ignoreRestSiblings: true }
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports' }
        ],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'react/jsx-no-useless-fragment': 'warn',
        'import/first': 'error',
        'import/no-duplicates': 'error',
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              ['parent', 'sibling', 'index'],
              'type'
            ],
            alphabetize: { order: 'asc', caseInsensitive: true },
            'newlines-between': 'always'
          }
        ]
      }
    },
    {
      files: ['**/*.stories.{ts,tsx}'],
      rules: {
        'no-console': 'off'
      }
    }
  ],
  storybook.configs['flat/recommended']
)
