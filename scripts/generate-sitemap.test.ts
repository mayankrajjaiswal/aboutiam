import { describe, it, expect } from 'vitest'
import { buildSitemapXml, buildSitemapUrls } from './generate-sitemap'
import { ROUTE_META } from '../src/routeMeta'

describe('Sitemap Generator', () => {
  it('should build a structurally valid sitemap XML document', () => {
    const buildDate = new Date('2026-07-23T12:00:00Z')
    const { sitemapXml } = buildSitemapXml(ROUTE_META, buildDate)

    expect(sitemapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(sitemapXml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(sitemapXml).toContain('<lastmod>2026-07-23</lastmod>')
    expect(sitemapXml).toContain('<loc>https://www.aboutiam.com/</loc>')
  })

  it('should include exactly one entry for every ROUTE_META path with no duplicates', () => {
    const urls = buildSitemapUrls(ROUTE_META)
    const locs = urls.map(u => u.loc)

    expect(new Set(locs).size).toBe(locs.length)
    expect(urls.length).toBe(ROUTE_META.length)
  })

  it('should give the homepage the highest priority and daily changefreq', () => {
    const urls = buildSitemapUrls(ROUTE_META)
    const home = urls.find(u => u.loc === 'https://www.aboutiam.com/')

    expect(home).toBeDefined()
    expect(home?.priority).toBe('1.0')
    expect(home?.changefreq).toBe('daily')
  })

  it('should give nested tool/playground routes a lower priority than top-level hubs', () => {
    const urls = buildSitemapUrls(ROUTE_META)
    const nested = urls.find(u => u.loc === 'https://www.aboutiam.com/tools/jwt-decoder/')
    const hub = urls.find(u => u.loc === 'https://www.aboutiam.com/tools/')

    expect(nested?.priority).toBe('0.6')
    expect(hub?.priority).toBe('0.8')
  })
})
