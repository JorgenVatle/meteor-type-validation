/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
      dir: 'tests',
      typecheck: {
          enabled: true,
      },
  }
})