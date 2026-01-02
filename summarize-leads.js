#!/usr/bin/env node

/**
 * ACG Lead Summary Generator
 * Analyzes all scanned districts and creates a summary report
 *
 * Run: node summarize-leads.js
 */

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'output');

// Get all scan folders
const folders = fs.readdirSync(outputDir).filter(f => {
  const stat = fs.statSync(path.join(outputDir, f));
  return stat.isDirectory() && f.includes('-202');
});

const leads = { A: [], B: [], C: [], skip: [] };

folders.forEach(folder => {
  const resultsPath = path.join(outputDir, folder, 'raw-results.json');
  if (!fs.existsSync(resultsPath)) return;

  const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

  const criticalSerious = (data.bySeverity?.critical || 0) + (data.bySeverity?.serious || 0);
  const total = data.totalViolations || 0;

  let grade = 'C';
  if (criticalSerious >= 10 || total >= 25) grade = 'A';
  else if (criticalSerious >= 5 || total >= 15) grade = 'B';
  else if (total === 0) grade = 'skip';

  leads[grade].push({
    domain: data.domain,
    folder: folder,
    total: total,
    critical: data.bySeverity?.critical || 0,
    serious: data.bySeverity?.serious || 0,
    topIssue: data.topIssues?.[0]?.rule || 'N/A',
  });
});

// Sort each grade by total violations (descending)
Object.keys(leads).forEach(grade => {
  leads[grade].sort((a, b) => b.total - a.total);
});

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                        ACG LEAD SUMMARY REPORT                            ║
║                        ${new Date().toLocaleDateString()}                                       ║
╚═══════════════════════════════════════════════════════════════════════════╝

📊 OVERVIEW
   Total Scanned: ${folders.length}
   A-Leads (Hot):  ${leads.A.length}
   B-Leads (Warm): ${leads.B.length}
   C-Leads (Cool): ${leads.C.length}
   Skip (Clean):   ${leads.skip.length}

═══════════════════════════════════════════════════════════════════════════════
🔴 A-LEADS (HIGH PRIORITY) - ${leads.A.length} found
═══════════════════════════════════════════════════════════════════════════════
`);

if (leads.A.length === 0) {
  console.log('   No A-leads found yet.\n');
} else {
  leads.A.forEach((lead, i) => {
    console.log(`   ${i + 1}. ${lead.domain}`);
    console.log(`      Violations: ${lead.total} (${lead.critical} critical, ${lead.serious} serious)`);
    console.log(`      Top Issue: ${lead.topIssue}`);
    console.log(`      Folder: ${lead.folder}\n`);
  });
}

console.log(`
═══════════════════════════════════════════════════════════════════════════════
🟠 B-LEADS (WARM) - ${leads.B.length} found
═══════════════════════════════════════════════════════════════════════════════
`);

if (leads.B.length === 0) {
  console.log('   No B-leads found yet.\n');
} else {
  leads.B.forEach((lead, i) => {
    console.log(`   ${i + 1}. ${lead.domain}`);
    console.log(`      Violations: ${lead.total} (${lead.critical} critical, ${lead.serious} serious)`);
    console.log(`      Folder: ${lead.folder}\n`);
  });
}

console.log(`
═══════════════════════════════════════════════════════════════════════════════
🟡 C-LEADS (LOW PRIORITY) - ${leads.C.length} found
═══════════════════════════════════════════════════════════════════════════════
`);

if (leads.C.length === 0) {
  console.log('   No C-leads found yet.\n');
} else {
  leads.C.forEach((lead, i) => {
    console.log(`   ${i + 1}. ${lead.domain} - ${lead.total} violations`);
  });
}

console.log(`
═══════════════════════════════════════════════════════════════════════════════
✅ SKIP (COMPLIANT) - ${leads.skip.length} found
═══════════════════════════════════════════════════════════════════════════════
`);

if (leads.skip.length === 0) {
  console.log('   No compliant sites found.\n');
} else {
  leads.skip.forEach((lead, i) => {
    console.log(`   ${i + 1}. ${lead.domain} - Already compliant`);
  });
}

console.log(`
═══════════════════════════════════════════════════════════════════════════════
📋 NEXT STEPS FOR RENGIE
═══════════════════════════════════════════════════════════════════════════════

1. Start with A-LEADS first (highest conversion potential)
2. For each lead:
   - Open the folder
   - Research the actual contact name/email
   - Update email-draft.txt with correct contact
   - Attach accessibility-report.pdf
   - Send email from team@accessiblecompliancegroup.com
3. Log all outreach in the Lead Tracker spreadsheet
4. Follow up on Day 3 if no response

═══════════════════════════════════════════════════════════════════════════════
`);

// Save summary to file
const summaryPath = path.join(outputDir, 'lead-summary.txt');
// Could also save as CSV for spreadsheet import
