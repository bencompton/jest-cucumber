// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    globals: false,
    setupFiles: 'vitest.setup.ts',
    clearMocks: true,
    css: false,
    reporters: ['basic'],
    include: ['examples/**/*.steps.vitest.ts'],
  },
});
