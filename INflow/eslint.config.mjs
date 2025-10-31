import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gitignorePath = path.resolve(__dirname, '.gitignore');

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.strict,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
    {
        rules: {
            'react/display-name': 'off',
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]);
