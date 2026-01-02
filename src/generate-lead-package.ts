#!/usr/bin/env npx ts-node

/**
 * ACG Lead Package Generator
 *
 * Generates a complete outreach package for a school district:
 * 1. Runs accessibility scan
 * 2. Generates professional PDF report
 * 3. Creates email draft (ready to copy/paste)
 * 4. Outputs everything to a folder
 *
 * Usage: npm run lead-package -- https://www.example.org "Contact Name" "contact@email.com"
 */

import puppeteer from 'puppeteer';
import AxePuppeteer from '@axe-core/puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { stringify } from 'csv-stringify/sync';

const PDFDocument = require('pdfkit');

// ============ CONFIGURATION ============
const MAX_PAGES = 10;
const DEADLINE_DATE = 'April 24, 2026';

// ============ TYPES ============
interface Violation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
  pageUrl: string;
}

interface ScanResult {
  domain: string;
  scanDate: string;
  pagesScanned: number;
  totalViolations: number;
  bySeverity: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  topIssues: Array<{
    rule: string;
    count: number;
    impact: string;
  }>;
  allViolations: Violation[];
  leadGrade: string;
}

// ============ SCANNER ============
async function runScan(baseUrl: string): Promise<ScanResult> {
  console.log('\n📡 STEP 1: Starting accessibility scan...\n');

  const url = new URL(baseUrl);
  const domain = url.hostname;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const allViolations: Violation[] = [];
  const pagesScanned: string[] = [];

  // For simplicity, scan homepage + a few key pages
  const pagesToScan = [
    baseUrl,
    `${baseUrl}/contact`,
    `${baseUrl}/about`,
    `${baseUrl}/calendar`,
    `${baseUrl}/staff`,
  ];

  for (const pageUrl of pagesToScan.slice(0, MAX_PAGES)) {
    try {
      console.log(`  Scanning: ${pageUrl}`);
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1000));

      const results = await new AxePuppeteer(page)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      for (const violation of results.violations) {
        allViolations.push({
          id: violation.id,
          impact: violation.impact || 'minor',
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.length,
          pageUrl: pageUrl,
        });
      }

      pagesScanned.push(pageUrl);
      console.log(`    ✓ Found ${results.violations.length} issues`);
    } catch (err) {
      console.log(`    ✗ Error scanning ${pageUrl}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  await browser.close();

  // Aggregate results
  const bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const issueCount: Record<string, { count: number; impact: string }> = {};

  for (const v of allViolations) {
    const severity = v.impact as keyof typeof bySeverity;
    if (severity in bySeverity) bySeverity[severity] += v.nodes;

    if (!issueCount[v.id]) {
      issueCount[v.id] = { count: 0, impact: v.impact };
    }
    issueCount[v.id].count += v.nodes;
  }

  const topIssues = Object.entries(issueCount)
    .map(([rule, data]) => ({ rule, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalViolations = bySeverity.critical + bySeverity.serious + bySeverity.moderate + bySeverity.minor;

  // Determine lead grade
  const criticalSerious = bySeverity.critical + bySeverity.serious;
  let leadGrade = 'C';
  if (criticalSerious >= 10 || totalViolations >= 25) leadGrade = 'A';
  else if (criticalSerious >= 5 || totalViolations >= 15) leadGrade = 'B';

  return {
    domain,
    scanDate: new Date().toISOString(),
    pagesScanned: pagesScanned.length,
    totalViolations,
    bySeverity,
    topIssues,
    allViolations,
    leadGrade,
  };
}

// ============ PDF GENERATOR ============
function generatePDF(result: ScanResult, outputPath: string): void {
  console.log('\n📄 STEP 2: Generating PDF report...\n');

  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  doc.pipe(fs.createWriteStream(outputPath));

  const navy = '#1e3a5f';
  const red = '#dc2626';
  const orange = '#ea580c';
  const yellow = '#ca8a04';
  const gray = '#6b7280';

  // Header
  doc.rect(0, 0, 612, 100).fill(navy);
  doc.fillColor('white').fontSize(24).font('Helvetica-Bold')
     .text('Website Accessibility Audit Report', 50, 35);
  doc.fontSize(12).font('Helvetica')
     .text('Prepared by Accessible Compliance Group', 50, 65);

  // Summary
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold').text('Audit Summary', 50, 120);
  doc.rect(50, 145, 512, 100).stroke(gray);

  doc.fontSize(11).font('Helvetica').fillColor('#333');
  doc.text('Website:', 60, 155);
  doc.font('Helvetica-Bold').text(result.domain, 150, 155);

  doc.font('Helvetica').text('Scan Date:', 60, 175);
  doc.font('Helvetica-Bold').text(new Date(result.scanDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }), 150, 175);

  doc.font('Helvetica').text('Pages Scanned:', 60, 195);
  doc.font('Helvetica-Bold').text(result.pagesScanned.toString(), 150, 195);

  doc.font('Helvetica').text('Total Violations:', 60, 215);
  doc.font('Helvetica-Bold').fillColor(red).text(result.totalViolations.toString(), 150, 215);

  // Severity breakdown
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold').text('Violations by Severity', 50, 270);

  const severities = [
    { label: 'Critical', count: result.bySeverity.critical, color: red },
    { label: 'Serious', count: result.bySeverity.serious, color: orange },
    { label: 'Moderate', count: result.bySeverity.moderate, color: yellow },
    { label: 'Minor', count: result.bySeverity.minor, color: gray },
  ];

  let yPos = 295;
  severities.forEach(sev => {
    doc.rect(50, yPos, 10, 25).fill(sev.color);
    doc.fontSize(18).font('Helvetica-Bold').fillColor(sev.color).text(sev.count.toString(), 70, yPos + 3);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text(sev.label, 110, yPos + 5);
    yPos += 35;
  });

  // Top issues
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold').text('Top Issues Found', 50, 450);

  const issueDescriptions: Record<string, string> = {
    'link-name': 'Links must have discernible text for screen readers',
    'color-contrast': 'Text must meet minimum color contrast ratio',
    'label': 'Form inputs must have associated labels',
    'aria-allowed-attr': 'ARIA attributes must be valid for the element',
    'meta-viewport': 'Page must allow zooming for accessibility',
    'role-img-alt': 'Images with roles must have alternative text',
    'image-alt': 'Images must have alternative text',
    'button-name': 'Buttons must have discernible text',
    'html-has-lang': 'HTML element must have a lang attribute',
    'landmark-one-main': 'Page must have one main landmark',
  };

  yPos = 480;
  result.topIssues.slice(0, 5).forEach(issue => {
    const sevColor = issue.impact === 'critical' ? red : issue.impact === 'serious' ? orange : yellow;
    doc.rect(50, yPos, 60, 16).fill(sevColor);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('white').text(issue.impact.toUpperCase(), 55, yPos + 4);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text(issue.rule, 120, yPos + 2);
    doc.fontSize(9).font('Helvetica').fillColor(gray).text(`${issue.count} instances`, 400, yPos + 2);
    yPos += 28;
  });

  // Page 2 - Compliance warning
  doc.addPage();

  doc.rect(50, 50, 512, 70).fill('#fff3cd');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#856404').text('Compliance Deadline Warning', 70, 65);
  doc.fontSize(10).font('Helvetica').fillColor('#856404')
     .text(`Government websites must meet WCAG 2.1 AA standards by ${DEADLINE_DATE}.`, 70, 85)
     .text('Non-compliance can result in federal complaints, lawsuits, and funding impacts.', 70, 100);

  // Next steps
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold').text('Recommended Next Steps', 50, 150);

  const steps = [
    'Schedule a consultation to review the full audit findings',
    'Prioritize critical and serious issues for immediate remediation',
    'Develop a remediation timeline to meet the deadline',
    'Implement fixes and conduct follow-up testing',
  ];

  yPos = 180;
  steps.forEach((step, i) => {
    doc.fontSize(11).font('Helvetica-Bold').fillColor(navy).text(`${i + 1}.`, 50, yPos);
    doc.fontSize(11).font('Helvetica').fillColor('#333').text(step, 70, yPos);
    yPos += 22;
  });

  // Contact
  doc.rect(50, 300, 512, 80).fill('#f5f5f5');
  doc.fontSize(14).font('Helvetica-Bold').fillColor(navy).text('Ready to Get Compliant?', 70, 315);
  doc.fontSize(11).font('Helvetica').fillColor('#333')
     .text('Contact us for a free 30-minute consultation.', 70, 335);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(navy).text('Teddy Thai, CPACC', 70, 355);
  doc.fontSize(10).font('Helvetica').fillColor('#333')
     .text('teddy@accessiblecompliancegroup.com | (253) 732-3963', 70, 368);

  doc.end();
  console.log(`  ✓ PDF saved: ${outputPath}`);
}

// ============ EMAIL GENERATOR ============
function generateEmail(result: ScanResult, contactName: string, contactEmail: string): string {
  const firstName = contactName.split(' ')[0];
  const orgName = result.domain.replace('www.', '').replace('.org', '').replace('.com', '').replace('.net', '').replace('.edu', '');

  // Format top issues for email
  const issuesList = result.topIssues.slice(0, 4).map(issue => {
    const descriptions: Record<string, string> = {
      'link-name': 'links missing accessible text (screen readers can\'t describe them)',
      'color-contrast': 'color contrast problems (text hard to read)',
      'label': 'form fields without labels (blocks users with disabilities)',
      'aria-allowed-attr': 'ARIA coding errors (breaks assistive technology)',
      'image-alt': 'images missing alt text (invisible to screen readers)',
      'button-name': 'buttons without labels (unclear for assistive tech)',
    };
    return `• ${issue.count} ${descriptions[issue.rule] || issue.rule}`;
  }).join('\n');

  const email = `To: ${contactEmail}
Subject: Found ${result.totalViolations} Accessibility Issues on ${result.domain} - ${DEADLINE_DATE} Deadline

---

Hi ${firstName},

I'm reaching out because I ran an accessibility scan on your website and found **${result.totalViolations} WCAG violations**, including ${result.bySeverity.critical} critical and ${result.bySeverity.serious} serious issues that could expose your organization to legal risk.

**What we found on ${result.domain}:**
${issuesList}

**Why this matters now:**
The DOJ's ADA Title II Final Rule requires all public entity websites to meet WCAG 2.1 AA standards by **${DEADLINE_DATE}**. Non-compliance can result in federal complaints, lawsuits, and impacts to funding.

I run Accessible Compliance Group, and we specialize in helping organizations meet this deadline.

**I'd like to offer a free 30-minute consultation** to walk through the specific issues we found and discuss what it would take to get compliant before the deadline.

Would you have time for a quick call this week? I'm flexible and happy to work around your schedule.

Best regards,

Teddy Thai, CPACC
Principal Consultant
Accessible Compliance Group
teddy@accessiblecompliancegroup.com
(253) 732-3963

P.S. I've attached a detailed accessibility report. Happy to provide even more detail on our call.
`;

  return email;
}

// ============ MAIN ============
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           ACG LEAD PACKAGE GENERATOR                          ║
╠═══════════════════════════════════════════════════════════════╣
║  Generates a complete outreach package:                       ║
║  • Accessibility scan                                         ║
║  • Professional PDF report                                    ║
║  • Ready-to-send email draft                                  ║
╚═══════════════════════════════════════════════════════════════╝

Usage:
  npm run lead-package -- <url> "<contact name>" "<email>"

Example:
  npm run lead-package -- https://www.bay.k12.fl.us "Tamra Hogue" "hogueta@bay.k12.fl.us"
`);
    process.exit(1);
  }

  const url = args[0];
  const contactName = args[1] || 'Administrator';
  const contactEmail = args[2] || 'info@example.org';

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           ACG LEAD PACKAGE GENERATOR                          ║
╚═══════════════════════════════════════════════════════════════╝
`);
  console.log(`  URL: ${url}`);
  console.log(`  Contact: ${contactName} <${contactEmail}>`);

  // Create output directory
  const domain = new URL(url).hostname.replace(/\./g, '-');
  const date = new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, '..', 'output', `${domain}-${date}`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Run scan
  const result = await runScan(url);

  // Save raw results
  fs.writeFileSync(path.join(outputDir, 'raw-results.json'), JSON.stringify(result, null, 2));

  // Generate PDF
  const pdfPath = path.join(outputDir, 'accessibility-report.pdf');
  generatePDF(result, pdfPath);

  // Generate email
  console.log('\n✉️  STEP 3: Generating email draft...\n');
  const email = generateEmail(result, contactName, contactEmail);
  const emailPath = path.join(outputDir, 'email-draft.txt');
  fs.writeFileSync(emailPath, email);
  console.log(`  ✓ Email saved: ${emailPath}`);

  // Generate CSV
  const csvData = result.allViolations.map(v => ({
    'Rule ID': v.id,
    'Severity': v.impact.toUpperCase(),
    'Description': v.help,
    'Page URL': v.pageUrl,
    'Instances': v.nodes,
  }));
  const csv = stringify(csvData, { header: true });
  fs.writeFileSync(path.join(outputDir, 'violations.csv'), csv);

  // Summary
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    LEAD PACKAGE COMPLETE                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Domain: ${result.domain.padEnd(47)}║
║  Lead Grade: ${result.leadGrade}-LEAD${result.leadGrade === 'A' ? ' (HIGH PRIORITY)' : result.leadGrade === 'B' ? ' (WARM)' : ' (LOW PRIORITY)'}${' '.repeat(30 - (result.leadGrade === 'A' ? 16 : result.leadGrade === 'B' ? 6 : 14))}║
║                                                               ║
║  Violations: ${result.totalViolations.toString().padEnd(44)}║
║    • Critical: ${result.bySeverity.critical.toString().padEnd(41)}║
║    • Serious: ${result.bySeverity.serious.toString().padEnd(42)}║
║    • Moderate: ${result.bySeverity.moderate.toString().padEnd(41)}║
╠═══════════════════════════════════════════════════════════════╣
║  Output Files:                                                ║
║    📄 accessibility-report.pdf  (attach to email)             ║
║    ✉️  email-draft.txt           (copy/paste to send)          ║
║    📊 violations.csv            (detailed data)               ║
║    📁 raw-results.json          (full scan data)              ║
╠═══════════════════════════════════════════════════════════════╣
║  Folder: ${outputDir.split('/').pop()?.padEnd(47)}║
╚═══════════════════════════════════════════════════════════════╝

Next: Open the folder and send the email!
  open "${outputDir}"
`);

  // Auto-open the folder
  const { exec } = require('child_process');
  exec(`open "${outputDir}"`);
}

main().catch(console.error);
