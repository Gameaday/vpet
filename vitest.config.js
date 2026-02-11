import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['js/pet.js', 'js/battle.js', 'js/server.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', '**/node_modules/**', '**/server/**']
    }
  }
});
