/**
 * SITEMAP CRAWLER
 * ================
 * This module fetches URLs from a website's sitemap.xml
 *
 * HOW IT WORKS:
 * 1. Tries to find sitemap at /sitemap.xml or /sitemap_index.xml
 * 2. Parses all URLs from the sitemap
 * 3. Filters to only HTML pages (skips PDFs, images, etc.)
 * 4. Returns a list of URLs to scan
 *
 * WHY SITEMAP FIRST:
 * - Faster than crawling links recursively
 * - Gets ALL pages, not just linked ones
 * - Respects what the site wants indexed
 */

import Sitemapper from 'sitemapper';

export interface CrawlResult {
  urls: string[];
  source: 'sitemap' | 'fallback';
  totalFound: number;
  filtered: number;
}

/**
 * Fetches URLs from a website's sitemap
 *
 * @param baseUrl - The website URL (e.g., https://www.wacoisd.org)
 * @param maxPages - Maximum number of pages to return (default: 50)
 * @returns List of URLs to scan
 */
export async function getUrlsFromSitemap(
  baseUrl: string,
  maxPages: number = 50
): Promise<CrawlResult> {

  const sitemap = new Sitemapper({
    url: '', // Will be set below
    timeout: 30000,
    requestHeaders: {
      'User-Agent': 'ACG-Accessibility-Auditor/1.0'
    }
  });

  // Clean up the base URL
  const url = new URL(baseUrl);
  const domain = `${url.protocol}//${url.host}`;

  // Try common sitemap locations
  const sitemapLocations = [
    `${domain}/sitemap.xml`,
    `${domain}/sitemap_index.xml`,
    `${domain}/sitemap/sitemap.xml`,
    `${domain}/wp-sitemap.xml`,  // WordPress
  ];

  let allUrls: string[] = [];

  for (const sitemapUrl of sitemapLocations) {
    try {
      console.log(`  ▸ Checking ${sitemapUrl}...`);
      sitemap.url = sitemapUrl;
      const { sites } = await sitemap.fetch();

      if (sites && sites.length > 0) {
        allUrls = sites;
        console.log(`  ✓ Found sitemap with ${sites.length} URLs`);
        break;
      }
    } catch (error) {
      // Sitemap not found at this location, try next
      continue;
    }
  }

  // If no sitemap found, return just the homepage
  if (allUrls.length === 0) {
    console.log('  ⚠ No sitemap found, will scan homepage only');
    return {
      urls: [baseUrl],
      source: 'fallback',
      totalFound: 1,
      filtered: 1
    };
  }

  // Filter to HTML pages only (skip PDFs, images, etc.)
  const htmlUrls = allUrls.filter(u => {
    const lower = u.toLowerCase();
    // Skip non-HTML resources
    if (lower.endsWith('.pdf')) return false;
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return false;
    if (lower.endsWith('.png') || lower.endsWith('.gif')) return false;
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return false;
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return false;
    if (lower.endsWith('.zip') || lower.endsWith('.rar')) return false;
    return true;
  });

  // Limit to maxPages
  const limitedUrls = htmlUrls.slice(0, maxPages);

  console.log(`  ▸ Filtered to ${htmlUrls.length} HTML pages, using first ${limitedUrls.length}`);

  return {
    urls: limitedUrls,
    source: 'sitemap',
    totalFound: allUrls.length,
    filtered: limitedUrls.length
  };
}

/**
 * Simple URL validator
 */
export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}
