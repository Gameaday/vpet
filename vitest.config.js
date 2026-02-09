import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['pet.js', 'battle.js', 'server.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', '**/node_modules/**', '**/server/**']
    }
  }
});
