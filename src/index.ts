/**
 * ACG ACCESSIBILITY AUDIT TOOLKIT
 * ================================
 *
 * This tool scans government websites for WCAG 2.1 AA accessibility violations.
 *
 * HOW IT WORKS:
 * 1. Takes a website URL as input
 * 2. Fetches the sitemap to find all pages
 * 3. Scans each page with axe-core (industry standard)
 * 4. Outputs a summary + CSV file for Rengie to process
 *
 * USAGE:
 *   npm run audit -- https://www.example.gov
 *   npm run audit -- https://www.example.gov --pages 20
 *
 * OUTPUT:
 *   /output/[domain]-[date]/
 *     ├── violations.csv      <- For spreadsheet tracking
 *     ├── summary.txt         <- Quick overview
 *     └── raw-results.json    <- Full data
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';
import * as path from 'path';
import { getUrlsFromSitemap } from './crawler/sitemap-crawler';

// ============================================================================
// TYPES
// ============================================================================

interface PageResult {
  url: string;
  violations: Violation[];
  passes: number;
  incomplete: number;
  scanTime: number;
  error?: string;
}

interface Violation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string;
  nodeCount: number;
  pageUrl: string;
}

interface AuditSummary {
  domain: string;
  scanDate: string;
  pagesScanned: number;
  pagesWithErrors: number;
  totalViolations: number;
  bySeverity: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  topIssues: { rule: string; count: number; impact: string }[];
  allViolations: Violation[];
}

// ============================================================================
// MAIN SCANNER
// ============================================================================

async function scanPage(page: Page, url: string): Promise<PageResult> {
  const startTime = Date.now();

  try {
    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for JavaScript to settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run axe-core accessibility scan
    const results = await new AxePuppeteer(page)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Process violations
    const violations: Violation[] = results.violations.map(v => ({
      id: v.id,
      impact: (v.impact as 'critical' | 'serious' | 'moderate' | 'minor') || 'minor',
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      wcagTags: v.tags.filter(t => t.startsWith('wcag')).join(', '),
      nodeCount: v.nodes.length,
      pageUrl: url
    }));

    return {
      url,
      violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      scanTime: Date.now() - startTime
    };

  } catch (error) {
    return {
      url,
      violations: [],
      passes: 0,
      incomplete: 0,
      scanTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runFullAudit(baseUrl: string, maxPages: number): Promise<AuditSummary> {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           ACG ACCESSIBILITY AUDIT TOOLKIT                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`🎯 Target: ${baseUrl}`);
  console.log(`📄 Max pages: ${maxPages}\n`);

  // Step 1: Get URLs from sitemap
  console.log('STEP 1: Finding pages to scan...\n');
  const crawlResult = await getUrlsFromSitemap(baseUrl, maxPages);

  console.log(`\n📋 Will scan ${crawlResult.urls.length} pages\n`);

  // Step 2: Launch browser
  console.log('STEP 2: Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Step 3: Scan each page
  console.log('STEP 3: Scanning pages for accessibility issues...\n');

  const allResults: PageResult[] = [];
  const allViolations: Violation[] = [];

  for (let i = 0; i < crawlResult.urls.length; i++) {
    const url = crawlResult.urls[i];
    const progress = `[${i + 1}/${crawlResult.urls.length}]`;

    process.stdout.write(`  ${progress} Scanning: ${url.slice(0, 60)}...`);

    const result = await scanPage(page, url);
    allResults.push(result);

    if (result.error) {
      console.log(` ❌ Error`);
    } else if (result.violations.length > 0) {
      console.log(` ⚠️  ${result.violations.length} issues`);
      allViolations.push(...result.violations);
    } else {
      console.log(` ✅ Clean`);
    }

    // Rate limiting: wait 1 second between pages
    if (i < crawlResult.urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  await browser.close();

  // Step 4: Compile summary
  console.log('\nSTEP 4: Compiling results...\n');

  const bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const issueCount: Record<string, { count: number; impact: string }> = {};

  allViolations.forEach(v => {
    bySeverity[v.impact]++;
    if (!issueCount[v.id]) {
      issueCount[v.id] = { count: 0, impact: v.impact };
    }
    issueCount[v.id].count++;
  });

  const topIssues = Object.entries(issueCount)
    .map(([rule, data]) => ({ rule, count: data.count, impact: data.impact }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const domain = new URL(baseUrl).hostname;

  return {
    domain,
    scanDate: new Date().toISOString(),
    pagesScanned: crawlResult.urls.length,
    pagesWithErrors: allResults.filter(r => r.error).length,
    totalViolations: allViolations.length,
    bySeverity,
    topIssues,
    allViolations
  };
}

// ============================================================================
// OUTPUT FUNCTIONS
// ============================================================================

function printSummary(summary: AuditSummary): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    ACCESSIBILITY AUDIT SUMMARY                  ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`  Domain: ${summary.domain}`);
  console.log(`  Scanned: ${summary.scanDate}`);
  console.log(`  Pages scanned: ${summary.pagesScanned}`);
  console.log(`  Pages with errors: ${summary.pagesWithErrors}\n`);

  console.log('  VIOLATIONS BY SEVERITY:');
  console.log(`    🔴 Critical: ${summary.bySeverity.critical}`);
  console.log(`    🟠 Serious:  ${summary.bySeverity.serious}`);
  console.log(`    🟡 Moderate: ${summary.bySeverity.moderate}`);
  console.log(`    🟢 Minor:    ${summary.bySeverity.minor}`);
  console.log(`    ─────────────────────`);
  console.log(`    Total: ${summary.totalViolations}\n`);

  if (summary.topIssues.length > 0) {
    console.log('  TOP ISSUES FOUND:\n');
    summary.topIssues.forEach((issue, i) => {
      const emoji = issue.impact === 'critical' ? '🔴' :
                    issue.impact === 'serious' ? '🟠' :
                    issue.impact === 'moderate' ? '🟡' : '🟢';
      console.log(`    ${i + 1}. ${emoji} ${issue.rule} (${issue.count} instances)`);
    });
    console.log('');
  }

  // Lead qualification
  console.log('  LEAD QUALIFICATION:');
  const totalIssues = summary.totalViolations;
  const criticalSerious = summary.bySeverity.critical + summary.bySeverity.serious;

  if (criticalSerious >= 10 || totalIssues >= 25) {
    console.log('    🅰️  A-LEAD: High priority - significant issues found');
  } else if (criticalSerious >= 5 || totalIssues >= 15) {
    console.log('    🅱️  B-LEAD: Medium priority - moderate issues found');
  } else if (totalIssues > 0) {
    console.log('    🅲  C-LEAD: Low priority - minor issues found');
  } else {
    console.log('    ⏭️  SKIP: Site appears compliant');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

function exportToCSV(summary: AuditSummary, outputPath: string): void {
  const records = summary.allViolations.map(v => ({
    'Domain': summary.domain,
    'Page URL': v.pageUrl,
    'Rule ID': v.id,
    'Severity': v.impact.toUpperCase(),
    'Issue': v.help,
    'Description': v.description,
    'WCAG Criteria': v.wcagTags,
    'Instances on Page': v.nodeCount,
    'Help URL': v.helpUrl
  }));

  if (records.length === 0) {
    // Create empty CSV with headers if no violations
    const csv = 'Domain,Page URL,Rule ID,Severity,Issue,Description,WCAG Criteria,Instances on Page,Help URL\n';
    fs.writeFileSync(outputPath, csv);
  } else {
    const csv = stringify(records, { header: true });
    fs.writeFileSync(outputPath, csv);
  }

  console.log(`📄 CSV exported: ${outputPath}`);
}

function exportSummaryText(summary: AuditSummary, outputPath: string): void {
  let text = `ACG ACCESSIBILITY AUDIT SUMMARY
================================

Domain: ${summary.domain}
Scan Date: ${summary.scanDate}
Pages Scanned: ${summary.pagesScanned}

VIOLATIONS BY SEVERITY
----------------------
Critical: ${summary.bySeverity.critical}
Serious: ${summary.bySeverity.serious}
Moderate: ${summary.bySeverity.moderate}
Minor: ${summary.bySeverity.minor}
TOTAL: ${summary.totalViolations}

TOP ISSUES
----------
`;

  summary.topIssues.forEach((issue, i) => {
    text += `${i + 1}. [${issue.impact.toUpperCase()}] ${issue.rule} - ${issue.count} instances\n`;
  });

  text += `
LEAD QUALIFICATION
------------------
`;
  const criticalSerious = summary.bySeverity.critical + summary.bySeverity.serious;
  if (criticalSerious >= 10 || summary.totalViolations >= 25) {
    text += 'A-LEAD: High priority target\n';
  } else if (criticalSerious >= 5 || summary.totalViolations >= 15) {
    text += 'B-LEAD: Medium priority target\n';
  } else if (summary.totalViolations > 0) {
    text += 'C-LEAD: Low priority target\n';
  } else {
    text += 'SKIP: Site appears compliant\n';
  }

  fs.writeFileSync(outputPath, text);
  console.log(`📄 Summary exported: ${outputPath}`);
}

function exportToJSON(summary: AuditSummary, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`📄 JSON exported: ${outputPath}`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
ACG Accessibility Audit Toolkit
================================

Usage:
  npm run audit -- <url> [options]

Options:
  --pages <number>   Maximum pages to scan (default: 10)
  --help, -h         Show this help

Examples:
  npm run audit -- https://www.wacoisd.org
  npm run audit -- https://www.wacoisd.org --pages 25
  npm run audit -- https://www.highlands.k12.fl.us --pages 50
`);
    process.exit(0);
  }

  const url = args[0];
  let maxPages = 10; // Default

  // Parse --pages option
  const pagesIndex = args.indexOf('--pages');
  if (pagesIndex !== -1 && args[pagesIndex + 1]) {
    maxPages = parseInt(args[pagesIndex + 1], 10);
    if (isNaN(maxPages) || maxPages < 1) {
      console.error('❌ Invalid --pages value. Must be a positive number.');
      process.exit(1);
    }
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    console.error('❌ Invalid URL provided');
    process.exit(1);
  }

  try {
    // Run the audit
    const summary = await runFullAudit(url, maxPages);

    // Print summary to console
    printSummary(summary);

    // Create output directory
    const domain = new URL(url).hostname.replace(/\./g, '-');
    const date = new Date().toISOString().split('T')[0];
    const outputDir = path.join(__dirname, '..', 'output', `${domain}-${date}`);
    fs.mkdirSync(outputDir, { recursive: true });

    // Export all files
    console.log('STEP 5: Exporting results...\n');
    exportToCSV(summary, path.join(outputDir, 'violations.csv'));
    exportSummaryText(summary, path.join(outputDir, 'summary.txt'));
    exportToJSON(summary, path.join(outputDir, 'raw-results.json'));

    console.log(`\n📁 All outputs saved to: ${outputDir}\n`);

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main();
