import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react/configs/recommended.js'

export default [
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    rules: { ...js.configs.recommended.rules },
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: { ...react.plugins },
    rules: { ...react.rules, 'react/react-in-jsx-scope': 0 },
    languageOptions: {
      ...react.languageOptions,
    },
  },
]
