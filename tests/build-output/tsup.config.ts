import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['api.ts'],
    dts: true,
    experimentalDts: true,
})