import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prefer-const': 'warn',
      'no-regex-spaces': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          //argsIgnorePattern: '^_', // Ignores function arguments starting with "_"
          //varsIgnorePattern: '^_', // Ignores variables starting with "_"
          destructuredArrayIgnorePattern: '^_', // (If supported) Ignores destructured variables
        },
      ],
    },
  }
);
