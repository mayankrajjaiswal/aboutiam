import { describe, it, expect } from 'vitest'
import { STANDARDS } from '../../src/data/standardsData'
import { CRYPTO_MIGRATION_WORKSTREAMS } from '../../src/data/cryptoAgilityRoadmap'
import { HSM_ROOT_OF_TRUST_CONCEPTS } from '../../src/data/hsmRootOfTrust'
import { FIDO_FORM_FACTORS } from '../../src/data/fidoFormFactors'
import { BUSINESS_WALLET_USE_CASES } from '../../src/data/businessWalletUseCases'
import { WALLET_PROGRAMMES } from '../../src/data/walletProgrammes'

/**
 * Standards cross-references in the Next-Gen registries must resolve to real
 * entries in `standardsData.ts`.
 *
 * These ids drive the hub pages' "Related Standard" jump links, and a dead one
 * degrades silently -- the link renders nothing, or points at a card that does
 * not exist, with no error anywhere. Renaming a standard is exactly the routine
 * edit that breaks them, so this has to be enforced rather than assumed.
 *
 * This found a real defect on its first run: `businessWalletUseCases`'s KYB entry
 * referenced `'openid4vp'`, which is not an id in this repo -- OID4VP is covered
 * by the `'openid4vc'` entry ("OpenID4VC (OID4VCI / OID4VP)"). Every sibling
 * entry already used `openid4vc`.
 *
 * Complements `searchService.test.ts`'s `relatedLabs`/`relatedTools` → ROUTE_META
 * check: that guards route references, this guards standards references.
 */

const STANDARD_IDS = new Set(STANDARDS.map((s) => s.id))

/**
 * `standardRefs` is a strict id list -- every value must resolve.
 */
const STRICT_ID_REGISTRIES: { name: string; entries: { id: string; standardRefs?: string[] }[] }[] = [
  { name: 'cryptoAgilityRoadmap', entries: CRYPTO_MIGRATION_WORKSTREAMS },
  { name: 'hsmRootOfTrust', entries: HSM_ROOT_OF_TRUST_CONCEPTS },
  { name: 'fidoFormFactors', entries: FIDO_FORM_FACTORS },
]

/**
 * `standardsProfile` is deliberately a MIXED field: it holds `standardsData.ts`
 * ids where a direct match exists, plus real-world scheme names as plain prose
 * ("ISO/IEC 18013-5 (mdoc)", "Trusted Digital Identity Framework (TDIF)").
 *
 * So the rule here cannot be "every value resolves". It is instead: a value that
 * *looks like* one of our ids -- lowercase, no spaces, i.e. written in the id
 * style -- must actually be one, because that is precisely the case where a typo
 * hides (`openid4vp` vs `openid4vc`). Prose entries are skipped by design.
 */
const MIXED_FIELD_REGISTRIES: { name: string; entries: { id: string; standardsProfile: string[] }[] }[] = [
  { name: 'businessWalletUseCases', entries: BUSINESS_WALLET_USE_CASES },
  { name: 'walletProgrammes', entries: WALLET_PROGRAMMES },
]

/** Written in this repo's id style: lowercase, no whitespace, no parentheses. */
const looksLikeAnId = (value: string) => /^[a-z0-9][a-z0-9-]*$/.test(value)

describe('Next-Gen registry standards cross-references', () => {
  it('standardsData is loaded and non-empty', () => {
    expect(STANDARD_IDS.size).toBeGreaterThan(0)
  })

  for (const { name, entries } of STRICT_ID_REGISTRIES) {
    describe(`${name} (strict standardRefs)`, () => {
      it('every standardRefs id resolves to a real standard', () => {
        const dead: string[] = []
        for (const entry of entries) {
          for (const ref of entry.standardRefs ?? []) {
            if (!STANDARD_IDS.has(ref)) dead.push(`${name}/${entry.id} -> '${ref}'`)
          }
        }
        expect(
          dead,
          `these standardRefs match no id in standardsData.ts:\n${dead.join('\n')}`,
        ).toEqual([])
      })

      it('the field is actually populated', () => {
        // Guards the silent pass: an all-empty field would trivially satisfy the
        // check above while cross-linking nothing.
        const total = entries.reduce((n, e) => n + (e.standardRefs?.length ?? 0), 0)
        expect(total).toBeGreaterThan(0)
      })
    })
  }

  for (const { name, entries } of MIXED_FIELD_REGISTRIES) {
    describe(`${name} (mixed standardsProfile)`, () => {
      it('every id-shaped standardsProfile value resolves to a real standard', () => {
        const dead: string[] = []
        for (const entry of entries) {
          for (const value of entry.standardsProfile) {
            if (looksLikeAnId(value) && !STANDARD_IDS.has(value)) {
              dead.push(`${name}/${entry.id} -> '${value}'`)
            }
          }
        }
        expect(
          dead,
          `these values are written in id style but match no id in standardsData.ts -- either fix the typo or rewrite them as prose:\n${dead.join('\n')}`,
        ).toEqual([])
      })

      it('is populated for every entry', () => {
        // No "must resolve at least one id" assertion here on purpose.
        // `walletProgrammes` is legitimately all prose -- its values are
        // real-world scheme names ("eIDAS-notified scheme", "Trusted Digital
        // Identity Framework (TDIF)-accredited scheme") that have no
        // standardsData.ts counterpart, and DigitalWalletsCenter renders them as
        // plain text rather than links. Requiring a resolvable id would push
        // authors to invent fake ids for the sake of a green test.
        for (const entry of entries) {
          expect(entry.standardsProfile.length, `${name}/${entry.id} has an empty standardsProfile`).toBeGreaterThan(0)
        }
      })
    })
  }
})
