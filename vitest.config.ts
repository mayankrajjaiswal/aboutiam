import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate from vite.config.ts on purpose: the app build config has no reason
// to know about jsdom/coverage/test projects, and this file has no reason to
// know about Tailwind or manualChunks. Three test "projects" split the suite
// by what kind of thing it verifies, not by folder:
//   - unit:        pure logic in src/lib|data|store + scripts, node environment
//   - component:   anything that renders React (colocated *.test.tsx + the
//                   cross-cutting suites in tests/pages), jsdom environment
//   - integration:  cross-file consistency checks (registry sync, SSR safety)
//                    that don't belong to any single source file
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
      // Deliberately modest: set to what the suite already clears after the
      // initial component/page-smoke pass, so this only prevents backsliding
      // rather than demanding a big-bang rewrite of untested pages.
      // Measured after the initial component/page-smoke pass: statements
      // 45.6%, branches 38.1%, functions 33.0%, lines 48.4%. Set a couple
      // points below each so normal fluctuation doesn't fail CI, while still
      // catching a real regression (e.g. deleting tests, or adding a large
      // untested module).
      thresholds: {
        statements: 43,
        branches: 36,
        functions: 31,
        lines: 46,
      },
    },
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx', 'tests/pages/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts', 'tests/ssr/**/*.test.ts'],
        },
      },
    ],
  },
})
