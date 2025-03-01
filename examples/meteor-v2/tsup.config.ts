// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
    target: 'node14',
    entry: ['./server/entry-tsup.ts'],
    outDir: 'server/_bundle',
    skipNodeModulesBundle: true,
    sourcemap: true,
    platform: 'node',
    format: "cjs",
    loader: {
        // Omit any Vue components from the server bundle.
        '.vue': 'empty',
    },
    external: ['meteor'],
    noExternal: ['meteor-type-validation']
})