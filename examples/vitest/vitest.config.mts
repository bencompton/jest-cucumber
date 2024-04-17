// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';
import { resolve } from 'path'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    globals: false,
    setupFiles: resolve(__dirname, './vitest.setup.ts'),
    clearMocks: true,
    css: false,
    reporters: ['basic'],
    include: [resolve(__dirname, './specs/**/*.steps.ts')],
  },
});
