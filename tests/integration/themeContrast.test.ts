import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * WCAG AA contrast floor for the theme tokens in `src/index.css`.
 *
 * Both themes are first-class here (README "system-matching Light & Dark"), so a
 * token that only reads well in one of them is a real defect. This was not a
 * hypothetical: `--color-text-muted` shipped as slate-500 (#64748b), which is
 * applied at 10-12px across the site but only reached 3.59:1 against
 * `--color-bg-nested` -- below the 4.5:1 that small text requires.
 *
 * `jest-axe` does not catch this. It cannot resolve a CSS custom property to a
 * computed color in jsdom, so every colour-contrast rule it would run is
 * skipped as "incomplete" rather than failed. Parsing the tokens and doing the
 * arithmetic directly is the only way to hold this line in the unit suite.
 */

const CSS = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8')

/** Relative luminance per WCAG 2.1 §relative-luminance. */
function luminance(hex: string): number {
  const channels = hex.replace('#', '').match(/../g)
  if (!channels || channels.length !== 3) throw new Error(`not a 6-digit hex color: ${hex}`)
  const [r, g, b] = channels.map((pair) => {
    const v = parseInt(pair, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio per WCAG 2.1 §contrast-ratio. */
function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)]
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/**
 * Reads a token out of a specific selector block, so the light `:root` values
 * and the dark `.dark` values can be told apart -- both define the same names.
 */
function tokensInBlock(startPattern: RegExp): Record<string, string> {
  const start = CSS.search(startPattern)
  if (start === -1) throw new Error(`could not find CSS block: ${startPattern}`)
  const end = CSS.indexOf('}', start)
  const block = CSS.slice(start, end)
  const out: Record<string, string> = {}
  for (const m of block.matchAll(/(--color-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    out[m[1]] = m[2]
  }
  return out
}

// `.dark` tokens live in their own block; the bare `:root` block holds light.
const light = tokensInBlock(/:root\s*\{/)
const dark = tokensInBlock(/\.dark\s*\{/)

const SURFACES = ['--color-bg-base', '--color-bg-card', '--color-bg-sidebar', '--color-bg-nested']

/**
 * Foreground tokens that are applied to small text (<=14px / not bold 18px+)
 * somewhere in the app, so they owe the full 4.5:1 rather than the 3:1 that
 * large text and non-text UI can use.
 */
const SMALL_TEXT_FOREGROUNDS = [
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-muted',
]

/** Status colors also carry small text (badges, inline labels). */
const STATUS_FOREGROUNDS = [
  '--color-status-success',
  '--color-status-warning',
  '--color-status-danger',
]

const AA_SMALL_TEXT = 4.5

describe('theme token contrast (WCAG AA)', () => {
  for (const [themeName, tokens] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    describe(themeName, () => {
      it('defines every surface and foreground token it is checked against', () => {
        for (const name of [...SURFACES, ...SMALL_TEXT_FOREGROUNDS, ...STATUS_FOREGROUNDS]) {
          expect(tokens[name], `${themeName} is missing ${name}`).toMatch(/^#[0-9a-fA-F]{6}$/)
        }
      })

      for (const fg of [...SMALL_TEXT_FOREGROUNDS, ...STATUS_FOREGROUNDS]) {
        for (const bg of SURFACES) {
          it(`${fg} on ${bg} meets ${AA_SMALL_TEXT}:1`, () => {
            const ratio = contrastRatio(tokens[fg], tokens[bg])
            expect(
              Number(ratio.toFixed(2)),
              `${themeName}: ${fg} (${tokens[fg]}) on ${bg} (${tokens[bg]}) is ${ratio.toFixed(2)}:1, below the ${AA_SMALL_TEXT}:1 AA floor for small text`,
            ).toBeGreaterThanOrEqual(AA_SMALL_TEXT)
          })
        }
      }

      it('keeps text-muted visually distinct from text-secondary', () => {
        // Guards the obvious wrong fix for the above: raising muted until it is
        // simply the same color as secondary, collapsing the hierarchy.
        const ratio = contrastRatio(tokens['--color-text-muted'], tokens['--color-text-secondary'])
        expect(ratio).toBeGreaterThan(1.1)
      })
    })
  }
})

/**
 * The accessibility *variants* need the same floor -- arguably more so, since a
 * user who turns one on has told us they need the help. Both shipped failing it:
 * `.colorblind-safe` defined a single set of values for both themes, so its
 * orange read at 2.03:1 on white (worse than the default palette it replaces),
 * and reading mode's warm backgrounds are a third surface set that nothing was
 * checking against.
 */
describe('accessibility variant contrast (WCAG AA)', () => {
  const colorblindLight = tokensInBlock(/\.colorblind-safe\s*\{/)
  const colorblindDark = tokensInBlock(/\.dark\.colorblind-safe\s*\{/)
  const readingModeSurfaces = tokensInBlock(/\.reading-mode:not\(\.dark\)\s*\{/)

  const LIGHT_SURFACES = SURFACES.map((s) => light[s])
  const DARK_SURFACES = SURFACES.map((s) => dark[s])
  const WARM_SURFACES = Object.values(readingModeSurfaces)

  function assertAll(label: string, fg: string, backgrounds: string[]) {
    for (const bg of backgrounds) {
      const ratio = contrastRatio(fg, bg)
      expect(
        Number(ratio.toFixed(2)),
        `${label}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, below the ${AA_SMALL_TEXT}:1 AA floor`,
      ).toBeGreaterThanOrEqual(AA_SMALL_TEXT)
    }
  }

  it('reading mode defines its warm background overrides', () => {
    expect(WARM_SURFACES.length).toBeGreaterThan(0)
  })

  for (const token of STATUS_FOREGROUNDS) {
    it(`colorblind-safe (light) ${token} clears AA on light and warm surfaces`, () => {
      assertAll('colorblind-safe light', colorblindLight[token], [...LIGHT_SURFACES, ...WARM_SURFACES])
    })

    it(`colorblind-safe (dark) ${token} clears AA on dark surfaces`, () => {
      assertAll('colorblind-safe dark', colorblindDark[token], DARK_SURFACES)
    })

    it(`default ${token} clears AA on reading-mode warm surfaces`, () => {
      assertAll('reading mode', light[token], WARM_SURFACES)
    })
  }

  for (const token of SMALL_TEXT_FOREGROUNDS) {
    it(`default ${token} clears AA on reading-mode warm surfaces`, () => {
      assertAll('reading mode', light[token], WARM_SURFACES)
    })
  }

  /**
   * The actual promise of the colorblind-safe palette: success/warning/danger
   * must stay TELLABLE APART for a deuteranopic or protanopic viewer.
   *
   * A contrast ratio cannot check this -- it only measures luminance, and two
   * colors can differ wildly in hue while sitting at identical luminance (which
   * is exactly the failure mode here). So the deficiency is simulated and the
   * result compared perceptually.
   *
   * This caught a real defect: the palette shipped as blue/orange/vermillion,
   * where warning and danger differ almost purely along the red-green axis. When
   * simulated they measured dE 14.3 / 11.1 apart -- effectively one color, in the
   * one feature whose entire purpose is to keep them distinct.
   */
  const CVD_MATRICES = {
    // Viénot/Brettel-style linear-RGB approximations.
    deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  } as const

  function toLinear(hex: string): [number, number, number] {
    const ch = hex.replace('#', '').match(/../g)!
    const [r, g, b] = ch.map((p) => {
      const v = parseInt(p, 16) / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return [r, g, b]
  }

  function simulate(hex: string, kind: keyof typeof CVD_MATRICES): [number, number, number] {
    const [r, g, b] = toLinear(hex)
    const m = CVD_MATRICES[kind]
    return [0, 1, 2].map((i) =>
      Math.min(1, Math.max(0, m[i][0] * r + m[i][1] * g + m[i][2] * b)),
    ) as [number, number, number]
  }

  /** CIE L*a*b* — adequate for "would a viewer read these as different colors". */
  function toLab([R, G, B]: [number, number, number]): [number, number, number] {
    // D65 white-point normalization: X and Z are scaled, Y is already 1.0.
    const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047
    const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
    const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
    const [fx, fy, fz] = [f(X), f(Y), f(Z)]
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
  }

  function deltaE(a: [number, number, number], b: [number, number, number]): number {
    const [l1, a1, b1] = toLab(a)
    const [l2, a2, b2] = toLab(b)
    return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
  }

  // dE ~2.3 is "just noticeable"; 20 is a comfortable margin for status colors
  // a user must distinguish at a glance in a small badge.
  const MIN_DELTA_E = 20

  for (const [themeName, set] of [['light', colorblindLight], ['dark', colorblindDark]] as const) {
    for (const kind of ['deuteranopia', 'protanopia'] as const) {
      it(`colorblind-safe (${themeName}) stays separable under ${kind}`, () => {
        const [success, warning, danger] = STATUS_FOREGROUNDS.map((t) => set[t])
        const pairs: [string, string, string][] = [
          ['success/warning', success, warning],
          ['warning/danger', warning, danger],
          ['success/danger', success, danger],
        ]
        for (const [label, a, b] of pairs) {
          const d = deltaE(simulate(a, kind), simulate(b, kind))
          expect(
            Number(d.toFixed(1)),
            `${themeName}/${kind}: ${label} (${a} vs ${b}) are only dE ${d.toFixed(1)} apart under simulation — below the ${MIN_DELTA_E} needed to read as different status colors`,
          ).toBeGreaterThanOrEqual(MIN_DELTA_E)
        }
      })
    }
  }
})
