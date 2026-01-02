/**
 * ACG Proposal Generator
 * Generates a pricing proposal based on scan results
 */

const PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';

interface ScanResult {
  domain: string;
  totalViolations: number;
  pagesScanned: number;
  bySeverity: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

interface ProposalConfig {
  organizationName: string;
  contactName: string;
  contactTitle?: string;
  contactEmail: string;
  estimatedPages?: number;
  estimatedPDFs?: number;
}

// Pricing tiers based on complexity
function calculatePricing(result: ScanResult, config: ProposalConfig) {
  const totalIssues = result.totalViolations;
  const criticalSerious = result.bySeverity.critical + result.bySeverity.serious;
  const pages = config.estimatedPages || 50;
  const pdfs = config.estimatedPDFs || 50;

  // Base audit pricing
  let auditPrice = 5000;
  if (pages > 100) auditPrice = 10000;
  if (pages > 500) auditPrice = 15000;

  // Remediation pricing (based on issues found)
  let remediationPrice = 15000;
  if (totalIssues > 20) remediationPrice = 25000;
  if (totalIssues > 50) remediationPrice = 40000;
  if (criticalSerious > 10) remediationPrice += 10000;

  // PDF remediation ($75/document average)
  const pdfPrice = pdfs * 75;

  // Training
  const trainingPrice = 2500;

  // Monitoring (annual)
  const monitoringPrice = 6000;

  return {
    audit: { price: auditPrice, description: 'Comprehensive WCAG 2.1 AA Audit' },
    remediation: { price: remediationPrice, description: 'Website Remediation & Code Fixes' },
    pdf: { price: pdfPrice, description: `PDF Remediation (est. ${pdfs} documents)` },
    training: { price: trainingPrice, description: 'Staff Accessibility Training' },
    monitoring: { price: monitoringPrice, description: 'Annual Compliance Monitoring' },
    total: auditPrice + remediationPrice + pdfPrice + trainingPrice,
    totalWithMonitoring: auditPrice + remediationPrice + pdfPrice + trainingPrice + monitoringPrice,
  };
}

export function generateProposal(
  result: ScanResult,
  config: ProposalConfig,
  outputPath: string
): void {
  const pricing = calculatePricing(result, config);
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  doc.pipe(fs.createWriteStream(outputPath));

  const navy = '#1e3a5f';
  const teal = '#0d9488';
  const gray = '#6b7280';

  // ===== PAGE 1: COVER =====
  doc.rect(0, 0, 612, 792).fill(navy);

  doc.fillColor('white').fontSize(32).font('Helvetica-Bold')
     .text('Website Accessibility', 50, 200, { align: 'center' })
     .text('Compliance Proposal', 50, 240, { align: 'center' });

  doc.fontSize(16).font('Helvetica')
     .text('Prepared for', 50, 320, { align: 'center' });

  doc.fontSize(24).font('Helvetica-Bold')
     .text(config.organizationName, 50, 350, { align: 'center' });

  doc.fontSize(14).font('Helvetica')
     .text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 50, 420, { align: 'center' });

  doc.fontSize(12)
     .text('Accessible Compliance Group', 50, 650, { align: 'center' })
     .text('team@accessiblecompliancegroup.com | (253) 732-3963', 50, 670, { align: 'center' });

  // ===== PAGE 2: EXECUTIVE SUMMARY =====
  doc.addPage();

  doc.fillColor(navy).fontSize(24).font('Helvetica-Bold')
     .text('Executive Summary', 50, 50);

  doc.moveTo(50, 80).lineTo(200, 80).strokeColor(teal).lineWidth(3).stroke();

  doc.fillColor('#333').fontSize(11).font('Helvetica')
     .text(`Dear ${config.contactName},`, 50, 110)
     .moveDown()
     .text(`Thank you for the opportunity to present this proposal for achieving ADA Title II website accessibility compliance for ${config.organizationName}.`, 50, 140, { width: 512 })
     .moveDown()
     .text('Our recent accessibility audit of your website identified the following:', 50, 180);

  // Findings box
  doc.rect(50, 210, 512, 80).fill('#f8fafc').stroke('#e2e8f0');

  doc.fillColor(navy).fontSize(36).font('Helvetica-Bold')
     .text(result.totalViolations.toString(), 80, 225);
  doc.fillColor('#333').fontSize(11).font('Helvetica')
     .text('Total Accessibility', 80, 265)
     .text('Violations Found', 80, 278);

  doc.fillColor('#dc2626').fontSize(24).font('Helvetica-Bold')
     .text(result.bySeverity.critical.toString(), 220, 235);
  doc.fillColor('#333').fontSize(10).font('Helvetica')
     .text('Critical', 220, 265);

  doc.fillColor('#ea580c').fontSize(24).font('Helvetica-Bold')
     .text(result.bySeverity.serious.toString(), 320, 235);
  doc.fillColor('#333').fontSize(10).font('Helvetica')
     .text('Serious', 320, 265);

  doc.fillColor('#ca8a04').fontSize(24).font('Helvetica-Bold')
     .text(result.bySeverity.moderate.toString(), 420, 235);
  doc.fillColor('#333').fontSize(10).font('Helvetica')
     .text('Moderate', 420, 265);

  // Deadline warning
  doc.rect(50, 310, 512, 60).fill('#fef3c7').stroke('#f59e0b');
  doc.fillColor('#92400e').fontSize(12).font('Helvetica-Bold')
     .text('COMPLIANCE DEADLINE: April 24, 2026', 70, 325);
  doc.fillColor('#92400e').fontSize(10).font('Helvetica')
     .text('Under the DOJ ADA Title II Final Rule, non-compliance can result in federal complaints, lawsuits, and funding impacts.', 70, 345, { width: 470 });

  doc.fillColor('#333').fontSize(11).font('Helvetica')
     .text('We are prepared to partner with you to achieve full WCAG 2.1 Level AA compliance before the federal deadline.', 50, 400, { width: 512 });

  // ===== PAGE 3: SCOPE & PRICING =====
  doc.addPage();

  doc.fillColor(navy).fontSize(24).font('Helvetica-Bold')
     .text('Scope of Work & Investment', 50, 50);
  doc.moveTo(50, 80).lineTo(250, 80).strokeColor(teal).lineWidth(3).stroke();

  // Pricing table
  const services = [
    { name: pricing.audit.description, price: pricing.audit.price, included: true },
    { name: pricing.remediation.description, price: pricing.remediation.price, included: true },
    { name: pricing.pdf.description, price: pricing.pdf.price, included: true },
    { name: pricing.training.description, price: pricing.training.price, included: true },
  ];

  let yPos = 110;

  // Header
  doc.rect(50, yPos, 512, 30).fill(navy);
  doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
     .text('Service', 60, yPos + 10)
     .text('Investment', 450, yPos + 10);
  yPos += 30;

  // Rows
  services.forEach((service, i) => {
    const bgColor = i % 2 === 0 ? '#f8fafc' : 'white';
    doc.rect(50, yPos, 512, 35).fill(bgColor);
    doc.fillColor('#333').fontSize(11).font('Helvetica')
       .text(service.name, 60, yPos + 12, { width: 350 });
    doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
       .text(`$${service.price.toLocaleString()}`, 450, yPos + 12);
    yPos += 35;
  });

  // Total
  doc.rect(50, yPos, 512, 40).fill(teal);
  doc.fillColor('white').fontSize(14).font('Helvetica-Bold')
     .text('Total Investment', 60, yPos + 13)
     .text(`$${pricing.total.toLocaleString()}`, 440, yPos + 13);
  yPos += 50;

  // Optional monitoring
  doc.fillColor('#333').fontSize(11).font('Helvetica')
     .text('Optional: Annual Compliance Monitoring', 50, yPos + 20);
  doc.fillColor(navy).font('Helvetica-Bold')
     .text(`$${pricing.monitoring.price.toLocaleString()}/year`, 450, yPos + 20);

  // Payment terms
  doc.fillColor(navy).fontSize(14).font('Helvetica-Bold')
     .text('Payment Terms', 50, yPos + 70);
  doc.fillColor('#333').fontSize(10).font('Helvetica')
     .text('• 50% due upon contract signing', 50, yPos + 90)
     .text('• 25% due at remediation midpoint', 50, yPos + 105)
     .text('• 25% due upon project completion and final testing', 50, yPos + 120);

  // ===== PAGE 4: TIMELINE =====
  doc.addPage();

  doc.fillColor(navy).fontSize(24).font('Helvetica-Bold')
     .text('Project Timeline', 50, 50);
  doc.moveTo(50, 80).lineTo(180, 80).strokeColor(teal).lineWidth(3).stroke();

  const phases = [
    { phase: 'Phase 1: Discovery & Audit', duration: '1-2 weeks', tasks: ['Full site inventory', 'Automated & manual testing', 'Detailed findings report'] },
    { phase: 'Phase 2: Remediation', duration: '4-6 weeks', tasks: ['Priority issue fixes', 'Code updates', 'Content remediation'] },
    { phase: 'Phase 3: Testing & Validation', duration: '1-2 weeks', tasks: ['Assistive technology testing', 'Regression testing', 'User acceptance testing'] },
    { phase: 'Phase 4: Documentation', duration: '1 week', tasks: ['VPAT documentation', 'Accessibility statement', 'Staff training'] },
  ];

  yPos = 110;
  phases.forEach((p, i) => {
    doc.rect(50, yPos, 512, 80).stroke(gray);
    doc.rect(50, yPos, 8, 80).fill(teal);

    doc.fillColor(navy).fontSize(14).font('Helvetica-Bold')
       .text(p.phase, 70, yPos + 10);
    doc.fillColor(teal).fontSize(11).font('Helvetica')
       .text(p.duration, 450, yPos + 10);

    doc.fillColor('#333').fontSize(10).font('Helvetica');
    p.tasks.forEach((task, j) => {
      doc.text(`• ${task}`, 80, yPos + 35 + (j * 14));
    });

    yPos += 95;
  });

  doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
     .text('Estimated Total Duration: 7-11 weeks', 50, yPos + 10);

  // ===== PAGE 5: WHY ACG =====
  doc.addPage();

  doc.fillColor(navy).fontSize(24).font('Helvetica-Bold')
     .text('Why Accessible Compliance Group', 50, 50);
  doc.moveTo(50, 80).lineTo(320, 80).strokeColor(teal).lineWidth(3).stroke();

  const benefits = [
    { title: 'Certified Expertise', desc: 'Our team holds CPACC certification and specializes exclusively in government accessibility compliance.' },
    { title: 'Deadline Focused', desc: 'We understand the April 2026 deadline and structure every project to achieve compliance before it.' },
    { title: 'Full-Service Solution', desc: 'From audit to remediation to training, we handle everything so your team can focus on serving constituents.' },
    { title: '90-Day Warranty', desc: 'We stand behind our work with a 90-day warranty on all remediation services.' },
  ];

  yPos = 110;
  benefits.forEach(b => {
    doc.fillColor(navy).fontSize(13).font('Helvetica-Bold')
       .text(b.title, 50, yPos);
    doc.fillColor('#333').fontSize(11).font('Helvetica')
       .text(b.desc, 50, yPos + 18, { width: 512 });
    yPos += 55;
  });

  // Call to action
  doc.rect(50, 400, 512, 100).fill('#f0fdfa').stroke(teal);
  doc.fillColor(navy).fontSize(16).font('Helvetica-Bold')
     .text('Ready to Get Started?', 70, 420);
  doc.fillColor('#333').fontSize(11).font('Helvetica')
     .text('Contact us to schedule a kickoff call and begin your path to compliance.', 70, 445);
  doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
     .text('Teddy Thai, CPACC', 70, 475)
     .font('Helvetica')
     .text('team@accessiblecompliancegroup.com | (253) 732-3963', 70, 490);

  // Footer on all pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    if (i > 0) { // Skip cover page
      doc.fontSize(9).font('Helvetica').fillColor(gray)
         .text(`Page ${i} of ${range.count - 1}`, 50, 750, { align: 'center' });
    }
  }

  doc.end();
}

// If run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const resultsPath = args[0];
  const orgName = args[1] || 'Organization';
  const contactName = args[2] || 'Administrator';
  const contactEmail = args[3] || 'admin@example.org';

  if (!resultsPath) {
    console.log('Usage: ts-node generate-proposal.ts <results.json> "Org Name" "Contact Name" "email@example.org"');
    process.exit(1);
  }

  const result = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const outputPath = resultsPath.replace('raw-results.json', 'proposal.pdf');

  generateProposal(result, {
    organizationName: orgName,
    contactName: contactName,
    contactEmail: contactEmail,
  }, outputPath);

  console.log(`Proposal generated: ${outputPath}`);
}
