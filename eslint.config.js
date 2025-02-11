import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      'no-console': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      'consistent-return': 'off',
      'react/require-default-props': 'off',
      'no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-empty-function': [
        'error',
        {
          'allow': ['arrowFunctions']
        }
      ],
      // 'import/no-extraneous-dependencies': [
      //   'error',
      //   {
      //     'devDependencies': true
      //   }
      // ],

      'class-methods-use-this': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'linebreak-style': [0, 'unix'],
      'quotes': ['error', 'single'],
      'semi': 'off',
      'default-param-last': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/default-param-last': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-param-reassign': [
        'error',
        {
          'props': true,
          'ignorePropertyModificationsFor': ['state', 'config']
        }
      ],
      'no-plusplus': [
        'error',
        {
          'allowForLoopAfterthoughts': true
        }
      ],
      'react/prop-types': 'off',
      'no-unused-expressions': 0,
      'no-nested-ternary': 'off',
      'no-restricted-syntax': [1, 'always'],
      // 'react/jsx-filename-extension': [
      //   1,
      //   {
      //     'extensions': ['.jsx', '.tsx']
      //   }
      // ],
      'react/jsx-props-no-spreading': 'off',
      'react/function-component-definition': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/static-property-placement': 'off',

    }
  }
)
