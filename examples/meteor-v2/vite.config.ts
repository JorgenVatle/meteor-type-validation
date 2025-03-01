import vue from '@vitejs/plugin-vue';
import { meteor } from 'meteor-vite/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        meteor({
            clientEntry: 'client/entry-vite.ts',
            stubValidation: {
                warnOnly: true,
            }
        }),
        vue(),
    ],
})