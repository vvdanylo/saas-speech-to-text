import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'always', children: 'ignore' },
      ],
    },
  },
];
