import { defineConfig } from 'tsup';

export default defineConfig({
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    external: ['meteor/meteor']
})