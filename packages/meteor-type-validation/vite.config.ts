/// <reference types="vitest" />
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [
        viteTsConfigPaths(),
        {
            name: 'meteor-import-stubs',
            resolveId(id) {
                if (id.startsWith('meteor/')) {
                    return id;
                }
            },
            load(id) {
                if (id.startsWith('meteor/meteor')) {
                    // This should probably be refactored if we build with Vite instead of tsup
                    // Currently serves as stubs for the test environment.
                    return `export const Meteor = globalThis.Meteor || { Error: Error }`;
                }
            }
        }
    ],
    test: {
        dir: 'tests',
        typecheck: {
            enabled: true,
        },
    },
});