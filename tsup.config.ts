import { defineConfig } from 'tsup';

export default defineConfig({
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    external: ['meteor/meteor'],
    platform: 'node',
    target: ['es2022'],
    skipNodeModulesBundle: true,
    sourcemap: true,
    clean: true,
})