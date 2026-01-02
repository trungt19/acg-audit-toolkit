const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get domain from command line args
const domain = process.argv[2] || 'www-bay-k12-fl-us-2026-01-02';
const outputDir = path.join(__dirname, 'output', domain);

// Read the raw results
const data = JSON.parse(fs.readFileSync(path.join(outputDir, 'raw-results.json'), 'utf8'));

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 50, bottom: 50, left: 50, right: 50 }
});

const pdfPath = path.join(outputDir, 'accessibility-report.pdf');
doc.pipe(fs.createWriteStream(pdfPath));

// Colors
const navy = '#1e3a5f';
const red = '#dc2626';
const orange = '#ea580c';
const yellow = '#ca8a04';
const gray = '#6b7280';

// Header
doc.rect(0, 0, 612, 100).fill(navy);
doc.fillColor('white')
   .fontSize(24)
   .font('Helvetica-Bold')
   .text('Website Accessibility Audit Report', 50, 35);
doc.fontSize(12)
   .font('Helvetica')
   .text('Prepared by Accessible Compliance Group', 50, 65);

// Summary Box
doc.fillColor(navy)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('Audit Summary', 50, 120);

doc.rect(50, 145, 512, 100).stroke(gray);

doc.fontSize(11).font('Helvetica').fillColor('#333');

doc.text(`Website:`, 60, 155);
doc.font('Helvetica-Bold').text(data.domain, 150, 155);

doc.font('Helvetica').text(`Scan Date:`, 60, 175);
doc.font('Helvetica-Bold').text(new Date(data.scanDate).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
}), 150, 175);

doc.font('Helvetica').text(`Pages Scanned:`, 60, 195);
doc.font('Helvetica-Bold').text(data.pagesScanned.toString(), 150, 195);

doc.font('Helvetica').text(`Total Violations:`, 60, 215);
doc.font('Helvetica-Bold').fillColor(red).text(data.totalViolations.toString(), 150, 215);

// Severity Breakdown
doc.fillColor(navy)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('Violations by Severity', 50, 270);

const severities = [
  { label: 'Critical', count: data.bySeverity.critical, color: red, desc: 'Blocks access completely' },
  { label: 'Serious', count: data.bySeverity.serious, color: orange, desc: 'Major barrier to access' },
  { label: 'Moderate', count: data.bySeverity.moderate, color: yellow, desc: 'Causes difficulty' },
  { label: 'Minor', count: data.bySeverity.minor, color: gray, desc: 'Best practice issue' },
];

let yPos = 295;
severities.forEach(sev => {
  // Color bar
  doc.rect(50, yPos, 10, 25).fill(sev.color);

  // Count
  doc.fontSize(18).font('Helvetica-Bold').fillColor(sev.color)
     .text(sev.count.toString(), 70, yPos + 3);

  // Label and description
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#333')
     .text(sev.label, 110, yPos + 2);
  doc.fontSize(10).font('Helvetica').fillColor(gray)
     .text(sev.desc, 110, yPos + 16);

  yPos += 35;
});

// Top Issues
doc.fillColor(navy)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('Top Issues Found', 50, 450);

yPos = 480;
const topIssues = data.topIssues.slice(0, 6);

// Issue descriptions lookup
const issueDescriptions = {
  'link-name': 'Links must have discernible text for screen readers',
  'color-contrast': 'Text must meet minimum color contrast ratio',
  'label': 'Form inputs must have associated labels',
  'aria-allowed-attr': 'ARIA attributes must be valid for the element',
  'meta-viewport': 'Page must allow zooming for accessibility',
  'role-img-alt': 'Images with roles must have alternative text',
};

topIssues.forEach((issue, index) => {
  const sevColor = issue.impact === 'critical' ? red :
                   issue.impact === 'serious' ? orange :
                   issue.impact === 'moderate' ? yellow : gray;

  // Severity badge
  doc.rect(50, yPos, 60, 18).fill(sevColor);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
     .text(issue.impact.toUpperCase(), 55, yPos + 4);

  // Issue ID
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#333')
     .text(issue.rule, 120, yPos + 2);

  // Count
  doc.fontSize(10).font('Helvetica').fillColor(gray)
     .text(`${issue.count} instance${issue.count > 1 ? 's' : ''}`, 450, yPos + 2);

  // Description
  const desc = issueDescriptions[issue.rule] || 'Accessibility violation detected';
  doc.fontSize(9).font('Helvetica').fillColor('#666')
     .text(desc, 120, yPos + 18, { width: 380 });

  yPos += 45;
});

// Compliance Warning Box
doc.addPage();

doc.rect(50, 50, 512, 80).fill('#fff3cd');
doc.rect(50, 50, 512, 80).stroke('#ffc107');

doc.fontSize(14).font('Helvetica-Bold').fillColor('#856404')
   .text('Compliance Deadline Warning', 70, 65);
doc.fontSize(11).font('Helvetica').fillColor('#856404')
   .text('Under the DOJ\'s ADA Title II Final Rule, all public school district websites must meet', 70, 85);
doc.text('WCAG 2.1 AA standards by April 24, 2026. Non-compliance can result in federal', 70, 100);
doc.text('complaints, lawsuits, and impacts to Title II funding.', 70, 115);

// What These Issues Mean
doc.fillColor(navy)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('What These Issues Mean', 50, 160);

const explanations = [
  {
    issue: 'link-name',
    title: 'Links Missing Accessible Text',
    desc: 'Screen reader users hear "link" but cannot determine where the link goes. This prevents blind users from navigating the site effectively.'
  },
  {
    issue: 'color-contrast',
    title: 'Insufficient Color Contrast',
    desc: 'Text does not have enough contrast against the background, making it difficult or impossible to read for users with low vision.'
  },
  {
    issue: 'label',
    title: 'Form Fields Without Labels',
    desc: 'Form inputs are not properly labeled, preventing screen reader users from understanding what information to enter.'
  },
  {
    issue: 'aria-allowed-attr',
    title: 'Invalid ARIA Attributes',
    desc: 'Incorrect ARIA code causes assistive technologies to malfunction, potentially crashing screen readers or providing wrong information.'
  },
];

yPos = 190;
explanations.forEach(exp => {
  doc.fontSize(12).font('Helvetica-Bold').fillColor(navy)
     .text(exp.title, 50, yPos);
  doc.fontSize(10).font('Helvetica').fillColor('#333')
     .text(exp.desc, 50, yPos + 16, { width: 512 });
  yPos += 55;
});

// Next Steps
doc.fillColor(navy)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('Recommended Next Steps', 50, 420);

const steps = [
  'Schedule a consultation to review the full audit findings',
  'Prioritize critical and serious issues for immediate remediation',
  'Develop a remediation timeline to meet the April 2026 deadline',
  'Implement fixes and conduct follow-up testing',
  'Document compliance for federal reporting requirements',
];

yPos = 450;
steps.forEach((step, i) => {
  doc.fontSize(11).font('Helvetica-Bold').fillColor(navy)
     .text(`${i + 1}.`, 50, yPos);
  doc.fontSize(11).font('Helvetica').fillColor('#333')
     .text(step, 70, yPos);
  yPos += 22;
});

// Footer / Contact
doc.rect(50, 580, 512, 100).fill('#f5f5f5');

doc.fontSize(14).font('Helvetica-Bold').fillColor(navy)
   .text('Ready to Get Compliant?', 70, 595);
doc.fontSize(11).font('Helvetica').fillColor('#333')
   .text('Contact us for a free 30-minute consultation to discuss your remediation options.', 70, 615);

doc.fontSize(11).font('Helvetica-Bold').fillColor(navy)
   .text('Teddy Thai, CPACC', 70, 645);
doc.fontSize(10).font('Helvetica').fillColor('#333')
   .text('Principal Consultant, Accessible Compliance Group', 70, 658);
doc.text('teddy@accessiblecompliancegroup.com  |  (253) 732-3963', 70, 671);

// Page numbers
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.fontSize(9).font('Helvetica').fillColor(gray)
     .text(`Page ${i + 1} of ${range.count}`, 50, 750, { align: 'center' });
  doc.text('Accessible Compliance Group  |  accessiblecompliancegroup.com', 50, 762, { align: 'center' });
}

doc.end();

console.log('PDF generated:', pdfPath);
