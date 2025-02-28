import { meteor } from 'meteor-vite/plugin';
import Path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        meteor({
            clientEntry: 'client/entry-meteor.js',
            stubValidation: {
                warnOnly: true,
            }
        })
    ],
    resolve: {
        alias: {
            'meteor-type-validation': Path.join(__dirname, '..', '..', 'packages', 'meteor-type-validation', 'src', 'index.ts'),
        }
    }
})