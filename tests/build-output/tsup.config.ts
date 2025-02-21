import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/api.ts'],
    clean: true,
})