#!/usr/bin/env node

/**
 * ACG SOP PDF Generator
 * Generates PDF versions of all documentation for Rengie
 *
 * Run: node generate-sop-pdf.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'docs', 'ACG-Lead-Package-SOP.pdf');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 60, left: 60, right: 60 }
});

doc.pipe(fs.createWriteStream(outputPath));

// Colors
const PRIMARY = '#1e3a5f';
const ACCENT = '#2563eb';
const DARK = '#1f2937';
const GRAY = '#6b7280';

// Helper functions
function heading(text, size = 18) {
  doc.fontSize(size).fillColor(PRIMARY).font('Helvetica-Bold').text(text);
  doc.moveDown(0.5);
}

function subheading(text) {
  doc.fontSize(14).fillColor(ACCENT).font('Helvetica-Bold').text(text);
  doc.moveDown(0.3);
}

function body(text) {
  doc.fontSize(11).fillColor(DARK).font('Helvetica').text(text);
  doc.moveDown(0.3);
}

function bullet(text) {
  doc.fontSize(11).fillColor(DARK).font('Helvetica').text(`  •  ${text}`, { indent: 10 });
}

function code(text) {
  doc.fontSize(10).fillColor('#374151').font('Courier').text(`  ${text}`, { indent: 20 });
  doc.moveDown(0.2);
}

function divider() {
  doc.moveDown(0.5);
  doc.strokeColor('#e5e7eb').lineWidth(1)
     .moveTo(60, doc.y)
     .lineTo(552, doc.y)
     .stroke();
  doc.moveDown(0.5);
}

function newPage() {
  doc.addPage();
}

// ============================================
// COVER PAGE
// ============================================
doc.fontSize(32).fillColor(PRIMARY).font('Helvetica-Bold')
   .text('ACG Lead Package', { align: 'center' });
doc.moveDown(0.3);
doc.fontSize(32).fillColor(PRIMARY).font('Helvetica-Bold')
   .text('Workflow SOP', { align: 'center' });

doc.moveDown(2);

doc.fontSize(16).fillColor(GRAY).font('Helvetica')
   .text('Standard Operating Procedure', { align: 'center' });
doc.fontSize(16).fillColor(GRAY)
   .text('for Lead Prospecting', { align: 'center' });

doc.moveDown(3);

doc.fontSize(14).fillColor(DARK).font('Helvetica')
   .text('Prepared for: Rengie De Fiesta', { align: 'center' });
doc.moveDown(0.3);
doc.fontSize(14).fillColor(DARK)
   .text('Lead Prospector', { align: 'center' });

doc.moveDown(3);

doc.fontSize(12).fillColor(GRAY).font('Helvetica')
   .text('Accessible Compliance Group', { align: 'center' });
doc.fontSize(12)
   .text('Version 1.0 | January 2026', { align: 'center' });

// ============================================
// PAGE 2: QUICK START
// ============================================
newPage();
heading('Quick Start Guide', 24);
doc.moveDown(0.5);

body('This guide will help you generate and send lead packages for school district outreach.');
doc.moveDown(0.5);

subheading('Your Daily Workflow');
doc.moveDown(0.3);

const steps = [
  { num: '1', title: 'Check Leads', desc: 'Run npm run summary to see all scanned leads' },
  { num: '2', title: 'Pick A-Lead', desc: 'Start with highest priority (most violations)' },
  { num: '3', title: 'Research', desc: 'Find the actual IT Director name and email' },
  { num: '4', title: 'Open Folder', desc: 'Navigate to the output folder for that lead' },
  { num: '5', title: 'Customize', desc: 'Update email-draft.txt with real contact name' },
  { num: '6', title: 'Send Email', desc: 'Attach PDF, send from team@accessiblecompliancegroup.com' },
  { num: '7', title: 'Log', desc: 'Update the Lead Tracker spreadsheet' },
  { num: '8', title: 'Repeat', desc: 'Move to the next A-lead' }
];

steps.forEach(step => {
  doc.fontSize(12).fillColor(ACCENT).font('Helvetica-Bold').text(`${step.num}. ${step.title}`, { continued: true });
  doc.fontSize(11).fillColor(DARK).font('Helvetica').text(`  -  ${step.desc}`);
  doc.moveDown(0.2);
});

divider();

subheading('Essential Commands');
doc.moveDown(0.3);

body('Open Terminal and navigate to the audit-toolkit folder, then run:');
doc.moveDown(0.3);

code('npm run summary              # See all leads');
code('npm run lead-package -- URL "Name" "email"   # Scan new site');
code('open output/                 # Open output folder');

divider();

subheading('Lead Grades Explained');
doc.moveDown(0.3);

const grades = [
  { grade: 'A-LEAD', criteria: '10+ critical/serious violations', action: 'Contact TODAY' },
  { grade: 'B-LEAD', criteria: '5-9 critical/serious violations', action: 'Contact within 48 hours' },
  { grade: 'C-LEAD', criteria: 'Under 5 critical/serious', action: 'Batch outreach' },
  { grade: 'SKIP', criteria: '0 violations (compliant)', action: 'Do not contact' }
];

grades.forEach(g => {
  doc.fontSize(11).fillColor(ACCENT).font('Helvetica-Bold').text(g.grade, { continued: true });
  doc.fontSize(11).fillColor(DARK).font('Helvetica').text(`: ${g.criteria} → ${g.action}`);
  doc.moveDown(0.15);
});

// ============================================
// PAGE 3: SENDING EMAILS
// ============================================
newPage();
heading('Sending Outreach Emails', 24);
doc.moveDown(0.5);

subheading('Step 1: Open the Lead Folder');
body('Navigate to the output folder for the lead you want to contact.');
body('Each folder contains 4 files:');
doc.moveDown(0.3);
bullet('accessibility-report.pdf  -  ATTACH THIS to your email');
bullet('email-draft.txt  -  Copy/paste for email body');
bullet('violations.csv  -  Detailed data (optional reference)');
bullet('raw-results.json  -  Raw scan data (you don\'t need this)');

doc.moveDown(0.5);

subheading('Step 2: Research the Contact');
body('Before sending, find the actual IT Director or Webmaster:');
doc.moveDown(0.3);
bullet('Check the district\'s Staff Directory');
bullet('Look for "Technology" or "IT" department');
bullet('Google: site:domain.com "IT Director"');
bullet('Check the website footer for webmaster email');

doc.moveDown(0.3);
body('Common job titles to look for:');
bullet('Director of Technology / IT Director');
bullet('Chief Information Officer (CIO)');
bullet('Webmaster / Web Administrator');
bullet('Communications Director');

doc.moveDown(0.5);

subheading('Step 3: Customize the Email');
body('Open email-draft.txt and update:');
doc.moveDown(0.3);
bullet('Replace "IT Director" with actual name');
bullet('Verify the domain name is correct');
bullet('Double-check the violation count matches');

doc.moveDown(0.5);

subheading('Step 4: Send the Email');
body('Compose your email:');
doc.moveDown(0.3);
bullet('FROM: team@accessiblecompliancegroup.com');
bullet('TO: [Prospect\'s email address]');
bullet('SUBJECT: [Copy from email-draft.txt]');
bullet('BODY: [Copy from email-draft.txt]');
bullet('ATTACHMENT: accessibility-report.pdf');

doc.moveDown(0.5);

subheading('Step 5: Log in Tracker');
body('After sending, update the Lead Tracker spreadsheet with:');
bullet('District name and contact info');
bullet('Date sent and lead grade');
bullet('Total violation count');

// ============================================
// PAGE 4: FOLLOW-UP SEQUENCE
// ============================================
newPage();
heading('Follow-Up Sequence', 24);
doc.moveDown(0.5);

body('Following up is critical. Most responses come after the first or second follow-up.');
doc.moveDown(0.5);

subheading('Day 0: Initial Outreach');
bullet('Send personalized email with PDF attachment');
bullet('Log as "Sent" in tracker');
bullet('Set reminder for Day 3 follow-up');

doc.moveDown(0.5);

subheading('Day 3: First Follow-Up');
body('If no response, send a brief follow-up:');
doc.moveDown(0.3);
body('Subject: RE: [Original Subject]');
doc.moveDown(0.2);
body('"Hi [Name], just following up on my email from earlier this week. I know you\'re busy, so I\'ll keep this brief. We found [X] accessibility violations on your website. Would a 15-minute call this week work? Best, Teddy"');

doc.moveDown(0.5);

subheading('Day 7: Escalation (A-Leads Only)');
body('For high-priority leads with no response:');
bullet('CC the original contact');
bullet('Send to Superintendent or higher authority');
bullet('Use more formal tone');
bullet('Reference the April 2026 compliance deadline');

doc.moveDown(0.5);

subheading('Day 14: Final Follow-Up');
body('Last attempt before moving on:');
bullet('Mention "closing the loop"');
bullet('Leave door open for future contact');
bullet('Mark as "No Response" in tracker after this');

divider();

subheading('Email Checklist (Before Every Send)');
doc.moveDown(0.3);
const checklist = [
  'Real contact name (not generic "IT Director")',
  'Correct email address verified',
  'Domain name correct in subject and body',
  'Violation count matches the PDF report',
  'PDF file attached',
  'Sent from team@accessiblecompliancegroup.com',
  'Logged in Lead Tracker'
];
checklist.forEach(item => {
  doc.fontSize(11).fillColor(DARK).font('Helvetica').text(`[ ]  ${item}`);
  doc.moveDown(0.1);
});

// ============================================
// PAGE 5: TALKING POINTS
// ============================================
newPage();
heading('Talking Points for Responses', 24);
doc.moveDown(0.5);

body('When prospects respond, here\'s how to handle common questions:');
doc.moveDown(0.5);

subheading('"What exactly are the issues?"');
bullet('Reference the PDF report you attached');
bullet('"The scan found [X] violations including [Y] critical issues"');
bullet('"The most common issue is [top issue from report]"');
bullet('"These affect users who rely on screen readers and assistive technology"');

doc.moveDown(0.5);

subheading('"Why should we care about this?"');
bullet('"The DOJ\'s ADA Title II rule requires all public school districts to meet WCAG 2.1 AA standards by April 24, 2026"');
bullet('"Non-compliance can result in OCR complaints, lawsuits, and impacts to federal funding"');
bullet('"We\'ve already seen districts receive formal complaints"');

doc.moveDown(0.5);

subheading('"How much does remediation cost?"');
bullet('"It depends on the size and complexity of your site"');
bullet('"Typical projects range from $25,000 to $100,000"');
bullet('"We can provide a detailed quote after a 30-minute discovery call"');
bullet('"Would you like to schedule a time to discuss?"');

doc.moveDown(0.5);

subheading('If They Want to Schedule');
bullet('Offer specific times: "How does Tuesday at 2pm work?"');
bullet('CC Teddy on all scheduling emails');
bullet('Update tracker with "Meeting Scheduled" status');

divider();

subheading('Key Facts to Remember');
doc.moveDown(0.3);

const facts = [
  'Deadline: April 24, 2026 for districts with 50,000+ population',
  'Standard: WCAG 2.1 Level AA (required by DOJ)',
  'Risk: OCR complaints, lawsuits, federal funding impacts',
  'Typical project: 7-13 weeks for full remediation',
  'Our price range: $25,000 - $100,000 depending on scope'
];
facts.forEach(fact => {
  bullet(fact);
});

// ============================================
// PAGE 6: TROUBLESHOOTING
// ============================================
newPage();
heading('Troubleshooting', 24);
doc.moveDown(0.5);

subheading('"npm: command not found"');
body('Node.js is not installed. Download and install from https://nodejs.org/');
doc.moveDown(0.5);

subheading('"Permission denied" when running scripts');
body('Run this command to fix permissions:');
code('chmod +x batch-scan.sh');
doc.moveDown(0.5);

subheading('Scan takes too long');
body('Some websites are slow to respond. Wait up to 5 minutes per site. If it hangs longer, try again or skip that site.');
doc.moveDown(0.5);

subheading('No violations found');
body('The site may already be compliant. Mark as "Skip" in the tracker and move to the next lead.');
doc.moveDown(0.5);

subheading('Error during scan');
bullet('Check if the URL is typed correctly');
bullet('Try with www or without www (https://www.example.com vs https://example.com)');
bullet('Some sites block automated access - skip these');

divider();

heading('Contact Information', 18);
doc.moveDown(0.5);

body('Questions? Contact Teddy Thai:');
doc.moveDown(0.3);
bullet('Email: teddy@accessiblecompliancegroup.com');
bullet('Phone: (253) 732-3963');

doc.moveDown(1);

doc.fontSize(10).fillColor(GRAY).font('Helvetica')
   .text('This document is confidential and for ACG team use only.', { align: 'center' });
doc.fontSize(10)
   .text('Accessible Compliance Group | January 2026', { align: 'center' });

// Finalize
doc.end();

console.log(`
===================================================
  ACG SOP PDF Generated Successfully!
===================================================

  Output: ${outputPath}

  This PDF contains:
  - Quick Start Guide
  - Daily Workflow Steps
  - Email Sending Instructions
  - Follow-Up Sequence
  - Talking Points for Responses
  - Troubleshooting Guide

  Share this with Rengie for reference.

===================================================
`);
