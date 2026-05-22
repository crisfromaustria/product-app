import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['tests/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
});
