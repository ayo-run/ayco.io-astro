import { defineConfig } from 'vitest/config'

// Exclude generated files and heavy folders from the watcher to avoid
// continuous re-runs when build output or other tools touch files.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['dist/**', 'public/**', 'node_modules/**'],
  },
  watch: {
    exclude: ['dist/**', 'public/**', 'node_modules/**', '.git/**'],
  },
})
