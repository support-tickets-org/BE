import { defineConfig } from 'vitest/config';

try {
  process.loadEnvFile();
} catch {
  // No .env file; rely on variables already set in the environment (e.g. CI).
}

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Integration tests share one database, so files must not run concurrently.
    fileParallelism: false,
  },
});
