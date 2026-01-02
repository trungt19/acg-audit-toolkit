const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 50, bottom: 50, left: 50, right: 50 }
});

const outputPath = path.join(__dirname, '..', 'docs', 'Rengie-Training-Complete-Guide.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Helper functions
const title = (text) => {
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a1a1a').text(text);
  doc.moveDown(0.5);
};

const h1 = (text) => {
  doc.moveDown(1);
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#2c3e50').text(text);
  doc.moveDown(0.3);
  doc.strokeColor('#3498db').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
};

const h2 = (text) => {
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#34495e').text(text);
  doc.moveDown(0.3);
};

const p = (text) => {
  doc.fontSize(11).font('Helvetica').fillColor('#333').text(text, { align: 'justify' });
  doc.moveDown(0.3);
};

const bullet = (text) => {
  doc.fontSize(11).font('Helvetica').fillColor('#333').text(`  \u2022  ${text}`, { indent: 10 });
};

const code = (text) => {
  doc.moveDown(0.3);
  doc.fontSize(10).font('Courier').fillColor('#c0392b').text(text, { indent: 20 });
  doc.moveDown(0.3);
};

const tableRow = (cols, isHeader = false) => {
  const startY = doc.y;
  const colWidth = 500 / cols.length;

  doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);

  cols.forEach((col, i) => {
    doc.fillColor(isHeader ? '#2c3e50' : '#333');
    doc.text(col, 50 + (i * colWidth), startY, { width: colWidth - 10, align: 'left' });
  });

  doc.y = startY + 20;
};

// Cover Page
doc.fontSize(32).font('Helvetica-Bold').fillColor('#2c3e50');
doc.text('ACG Lead Prospecting', { align: 'center' });
doc.text('Training Guide', { align: 'center' });
doc.moveDown(2);

doc.fontSize(16).font('Helvetica').fillColor('#7f8c8d');
doc.text('Complete Guide to Website Accessibility Auditing', { align: 'center' });
doc.text('& Lead Generation', { align: 'center' });
doc.moveDown(3);

doc.fontSize(12).fillColor('#333');
doc.text('Prepared for: Rengie De Fiesta', { align: 'center' });
doc.text('Prepared by: Teddy Thai, CPACC', { align: 'center' });
doc.text('Date: January 2, 2026', { align: 'center' });
doc.moveDown(4);

doc.fontSize(14).font('Helvetica-Bold').fillColor('#e74c3c');
doc.text('ACCESSIBLE COMPLIANCE GROUP', { align: 'center' });
doc.fontSize(10).font('Helvetica').fillColor('#7f8c8d');
doc.text('Making Government Websites Accessible to All', { align: 'center' });

// New page for content
doc.addPage();

// PART 1: OVERVIEW
h1('PART 1: OVERVIEW');

h2('What We Do');
p('Accessible Compliance Group (ACG) helps government entities (cities, counties, school districts) make their websites accessible to people with disabilities.');
doc.moveDown(0.5);
p('The Opportunity: The DOJ has mandated that all government websites must be accessible by April 24, 2026. Most aren\'t compliant. We find them, show them their problems, and offer to fix them.');
doc.moveDown(0.5);
p('Your Role: Find leads (non-compliant websites), qualify them, and set up calls for Teddy.');

// PART 2: TOOLS
h1('PART 2: TOOLS YOU NEED');

h2('Required Software');
bullet('Google Chrome - Web browser (already installed)');
bullet('Terminal - Run scan commands (built into Mac: Cmd+Space, type "Terminal")');
bullet('Node.js - Runs the toolkit (download from nodejs.org)');
bullet('The Audit Toolkit - Scans websites (already installed in /audit-toolkit)');

h2('Browser Extensions (Backup)');
bullet('WAVE - Quick accessibility check (Chrome Web Store)');
bullet('axe DevTools - Detailed issue scanning (Chrome Web Store)');

// PART 3: THE TOOLKIT
doc.addPage();
h1('PART 3: THE AUDIT TOOLKIT');

h2('What It Does');
p('The audit toolkit automatically scans government websites and identifies accessibility issues. It:');
bullet('Visits the website');
bullet('Checks every element against WCAG 2.1 AA standards');
bullet('Counts and categorizes violations');
bullet('Grades the lead (A, B, C, or Skip)');
bullet('Creates reports you can send to prospects');

h2('How to Run a Scan');
p('Step 1: Open Terminal');
p('Press Cmd + Space, type "Terminal", press Enter');
doc.moveDown(0.3);
p('Step 2: Navigate to the Toolkit');
code('cd /Users/trungthai/Projects/ACG/audit-toolkit');
doc.moveDown(0.3);
p('Step 3: Run the Scan');
code('npm run audit -- https://www.WEBSITE-URL.com');
p('Important: Notice the space after "--" before the URL!');
doc.moveDown(0.3);
p('Step 4: Read the Results');
p('The tool displays violations by severity (Critical, Serious, Moderate, Minor) and assigns a lead grade (A, B, C, or Skip).');

h2('Output Files');
p('Results are saved to: /audit-toolkit/output/[domain]-[date]/');
bullet('violations.csv - spreadsheet of all issues');
bullet('summary.txt - quick summary');
bullet('raw-results.json - detailed technical data');

// PART 4: LEAD GRADING
doc.addPage();
h1('PART 4: LEAD GRADING');

h2('How to Grade Leads');
doc.moveDown(0.3);
tableRow(['Grade', 'Criteria', 'Action'], true);
tableRow(['A-Lead', '10+ Critical/Serious OR 25+ total', 'Priority - call within 24 hours']);
tableRow(['B-Lead', '5-9 Critical/Serious OR 15-24 total', 'Regular - email first']);
tableRow(['C-Lead', '1-4 Critical/Serious', 'Low priority - batch outreach']);
tableRow(['Skip', '0 issues', 'Don\'t pursue']);

h2('Common Issues Explained');
doc.moveDown(0.3);
tableRow(['Issue ID', 'Problem', 'Why It Matters'], true);
tableRow(['link-name', 'Links have no text', 'Screen readers can\'t describe links']);
tableRow(['color-contrast', 'Text is hard to read', 'People with low vision can\'t see']);
tableRow(['label', 'Form fields have no labels', 'Blind users can\'t fill out forms']);
tableRow(['aria-allowed-attr', 'Broken accessibility code', 'Assistive technology crashes']);
tableRow(['image-alt', 'Images have no descriptions', 'Blind users don\'t know what\'s there']);

// PART 5: BAY COUNTY EXAMPLE
doc.addPage();
h1('PART 5: REAL EXAMPLE - BAY COUNTY SCHOOLS');

h2('The Scan');
p('Command run:');
code('npm run audit -- https://bay.k12.fl.us --pages 10');
doc.moveDown(0.5);

h2('Results Summary');
doc.moveDown(0.3);
tableRow(['Metric', 'Value'], true);
tableRow(['Domain', 'bay.k12.fl.us']);
tableRow(['Pages Scanned', '10']);
tableRow(['Critical Issues', '2']);
tableRow(['Serious Issues', '12']);
tableRow(['Moderate Issues', '1']);
tableRow(['TOTAL VIOLATIONS', '15']);
tableRow(['Lead Grade', 'A-LEAD (High Priority)']);

h2('Why This Is an A-Lead');
bullet('15 total violations - Well above the threshold');
bullet('2 critical issues - Serious legal exposure');
bullet('27,000 students - Large district with budget');
bullet('April 2026 deadline - Only 113 days away');
bullet('Issues across 9 of 10 pages - Site-wide problem');

h2('Decision Makers Found');
p('Primary Contact:');
bullet('Name: Tamra Hogue');
bullet('Title: Supervisor, Instructional Technology & Media Services');
bullet('Phone: (850) 767-5269');
bullet('Email: hogueta@bay.k12.fl.us');
doc.moveDown(0.3);
p('Secondary Contact (Escalation):');
bullet('Name: Mark McQueen (Superintendent)');
bullet('Phone: (850) 767-4100');
bullet('Email: mcquemt@bay.k12.fl.us');

h2('Estimated Contract Value');
doc.moveDown(0.3);
tableRow(['Service', 'Low', 'High'], true);
tableRow(['Full Accessibility Audit', '$5,000', '$15,000']);
tableRow(['Website Remediation', '$25,000', '$75,000']);
tableRow(['PDF Remediation', '$10,000', '$40,000']);
tableRow(['Staff Training', '$2,500', '$5,000']);
tableRow(['TOTAL POTENTIAL', '$42,500', '$135,000']);

// PART 6: OUTREACH
doc.addPage();
h1('PART 6: OUTREACH TEMPLATES');

h2('Initial Email (Day 1)');
p('To: hogueta@bay.k12.fl.us');
p('Subject: Found 15 Accessibility Issues on bay.k12.fl.us - April 2026 Deadline');
doc.moveDown(0.3);
p('Hi Tamra,');
doc.moveDown(0.2);
p('I\'m reaching out because I ran an accessibility scan on the Bay District Schools website and found 15 WCAG violations, including 2 critical issues that could expose the district to legal risk.');
doc.moveDown(0.2);
p('What we found on bay.k12.fl.us:');
bullet('9 links missing accessible text');
bullet('Form fields without labels');
bullet('Color contrast problems');
bullet('ARIA coding errors');
doc.moveDown(0.2);
p('The DOJ\'s ADA Title II Final Rule requires compliance by April 24, 2026 - about 113 days away.');
doc.moveDown(0.2);
p('I\'d like to offer Bay District Schools a free 30-minute consultation to walk through the issues and discuss solutions.');
doc.moveDown(0.2);
p('Would you have time for a quick call next week?');

h2('Follow-Up (Day 3)');
p('Subject: RE: Found 15 Accessibility Issues on bay.k12.fl.us');
doc.moveDown(0.2);
p('Just following up - would a 15-minute call this week work?');

h2('Escalation (Day 7)');
p('To Superintendent with CC to primary contact. Reference the compliance deadline and offer to present findings to the technology team.');

// PART 7: DAILY WORKFLOW
doc.addPage();
h1('PART 7: DAILY WORKFLOW');

h2('Morning Routine (2 hours)');
bullet('Open Lead Tracker Google Sheet');
bullet('Pick 10 school districts from target list');
bullet('Run scans using the toolkit');
bullet('Record results in spreadsheet');
bullet('Mark A/B leads for follow-up');

h2('Afternoon Routine (2 hours)');
bullet('Scan 10 more districts');
bullet('Research decision-maker contacts for A/B leads');
bullet('Update Lead Tracker with contact info');
bullet('Post summary in Slack #leads channel');

h2('Weekly Goals');
doc.moveDown(0.3);
tableRow(['Metric', 'Target'], true);
tableRow(['Sites Scanned', '50-100']);
tableRow(['A/B Leads Found', '10-20']);
tableRow(['Contacts Researched', '10-20']);
tableRow(['Outreach Emails Sent', '10-20']);

// PART 8: QUICK REFERENCE
h1('PART 8: QUICK REFERENCE');

h2('Commands Cheat Sheet');
code('cd /Users/trungthai/Projects/ACG/audit-toolkit');
code('npm run audit -- https://www.example.org           # Homepage only');
code('npm run audit -- https://www.example.org --pages 10  # Multiple pages');

h2('Lead Grade Thresholds');
doc.moveDown(0.3);
tableRow(['Grade', 'Critical+Serious', 'OR Total'], true);
tableRow(['A-Lead', '10+', '25+']);
tableRow(['B-Lead', '5-9', '15-24']);
tableRow(['C-Lead', '1-4', 'Under 15']);
tableRow(['Skip', '0', '0']);

// Footer
doc.moveDown(2);
doc.fontSize(10).font('Helvetica-Bold').fillColor('#e74c3c');
doc.text('Remember: Every A-lead you find could become a $50,000-$100,000 contract!', { align: 'center' });
doc.moveDown(1);
doc.fontSize(9).font('Helvetica').fillColor('#7f8c8d');
doc.text('Document Version 1.0 - January 2, 2026', { align: 'center' });
doc.text('Prepared for Rengie De Fiesta by Teddy Thai', { align: 'center' });

doc.end();

console.log('PDF generated successfully!');
console.log('Location: ' + outputPath);
