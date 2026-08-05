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
      // Deliberately a regression floor, not an aspirational target: getting
      // this app to 95% would mean deep interaction tests (not just
      // render-smoke) across ~150 interactive pages/playgrounds — a
      // multi-session undertaking, not something to fake by loosening what
      // "covered" means. Re-measured after adding tests for the last batch of
      // zero-coverage shared components (Header, App, BreadcrumbNav,
      // ScrollToTop, AirplaneSelector, breadcrumbs.ts): statements 60.5%,
      // branches 52.0%, functions 50.0%, lines 63.1%. Set a few points below
      // each so normal fluctuation doesn't fail CI, while still catching a
      // real regression (e.g. deleting tests, or adding a large untested
      // module). Ratchet these up incrementally as coverage improves — don't
      // lower them to make a failing build pass.
      thresholds: {
        statements: 57,
        branches: 49,
        functions: 47,
        lines: 60,
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
