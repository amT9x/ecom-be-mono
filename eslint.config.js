// import js from '@eslint/js';
// import { en, no } from 'zod/locales';

// export default [
//   js.configs.recommended,
//   {
//     ignores: ['dist'],
//     env: {
//       node: true,
//     },
//   },
// ];

import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist'],
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
];
