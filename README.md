# ACG Accessibility Audit Toolkit

**Version:** 1.0.0
**Purpose:** Scan government websites for ADA/WCAG 2.1 AA compliance issues

---

## Quick Setup (For Rengie)

### Step 1: Install Node.js
1. Go to https://nodejs.org
2. Download the **LTS** version (left button)
3. Run the installer, click Next through everything
4. Restart your computer

### Step 2: Download This Tool
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Run these commands:
```bash
# Go to your home folder
cd ~

# Download the toolkit
git clone https://github.com/trungt19/acg-audit-toolkit.git

# Go into the folder
cd acg-audit-toolkit

# Install dependencies (takes 1-2 minutes)
npm install
```

### Step 3: Run Your First Scan
```bash
npm run audit -- https://www.bay.k12.fl.us
```

That's it! The results will appear in the terminal and be saved to the `output/` folder.

---

## What This Tool Does

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   1. You give it a website URL                                  │
│                     ↓                                           │
│   2. It finds all pages via sitemap.xml                         │
│                     ↓                                           │
│   3. It scans each page with axe-core (accessibility checker)   │
│                     ↓                                           │
│   4. It outputs:                                                │
│      • violations.csv  → For Rengie's spreadsheet               │
│      • summary.txt     → Quick overview for you                 │
│      • raw-results.json → Full data                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Run an audit:
```bash
cd /Users/trungthai/Projects/ACG/audit-toolkit
npm run audit -- https://www.wacoisd.org
```

### Scan more pages:
```bash
npm run audit -- https://www.wacoisd.org --pages 25
```

### View help:
```bash
npm run audit -- --help
```

---

## How the Crawler Works

```
STEP 1: Find pages to scan
─────────────────────────
The tool looks for sitemap.xml in these locations:
  • /sitemap.xml
  • /sitemap_index.xml
  • /sitemap/sitemap.xml
  • /wp-sitemap.xml (WordPress)

If no sitemap found → scans homepage only

STEP 2: Filter URLs
───────────────────
Keeps: HTML pages
Skips: PDFs, images, documents

STEP 3: Scan each page
──────────────────────
Uses axe-core to check for WCAG 2.1 AA violations
Waits 2 seconds per page for JavaScript to load
Rate limited: 1 request/second (won't overload servers)

STEP 4: Generate reports
────────────────────────
Creates folder: /output/[domain]-[date]/
```

---

## Understanding the Output

### Severity Levels

| Level | Icon | Meaning | Action |
|-------|------|---------|--------|
| **Critical** | 🔴 | Blocks access completely | Must fix immediately |
| **Serious** | 🟠 | Major barrier to access | Fix before deadline |
| **Moderate** | 🟡 | Significant issue | Should fix |
| **Minor** | 🟢 | Best practice violation | Nice to fix |

### Lead Qualification (automatic)

| Grade | Criteria | Meaning |
|-------|----------|---------|
| **A-Lead** | 10+ critical/serious OR 25+ total | Hot prospect, significant work needed |
| **B-Lead** | 5+ critical/serious OR 15+ total | Warm prospect, moderate work |
| **C-Lead** | Any violations | Lower priority |
| **Skip** | 0 violations | Site appears compliant |

---

## Output Files Explained

### violations.csv
```
Domain,Page URL,Rule ID,Severity,Issue,Description,WCAG Criteria,...
www.example.org,https://...,image-alt,SERIOUS,Images must have alt text,...
```
- **Use this for:** Rengie's spreadsheet tracking
- **Contains:** One row per violation found

### summary.txt
```
ACG ACCESSIBILITY AUDIT SUMMARY
================================
Domain: www.example.org
Pages Scanned: 25
Total Violations: 47
...
```
- **Use this for:** Quick review, client communication
- **Contains:** High-level stats and top issues

### raw-results.json
- **Use this for:** Detailed analysis, custom reports
- **Contains:** All data in machine-readable format

---

## File Structure

```
/audit-toolkit/
│
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config
├── README.md             # This file
│
├── src/
│   ├── index.ts          # Main program (scanner + reporter)
│   └── crawler/
│       └── sitemap-crawler.ts  # Fetches URLs from sitemap
│
├── output/               # Generated reports go here
│   └── www-example-org-2026-01-02/
│       ├── violations.csv
│       ├── summary.txt
│       └── raw-results.json
│
└── node_modules/         # Installed packages
```

---

## Packages Used

| Package | What it does |
|---------|--------------|
| **puppeteer** | Controls Chrome browser to load pages |
| **@axe-core/puppeteer** | Runs accessibility checks on each page |
| **sitemapper** | Parses sitemap.xml to find all pages |
| **csv-stringify** | Converts data to CSV format |
| **typescript** | Adds type safety to JavaScript |

---

## Common Issues

### "No sitemap found"
Some sites don't have a sitemap. The tool will scan the homepage only.
**Solution:** Use `--pages 1` and manually check key pages.

### "Timeout" errors
Some pages are slow or block automated access.
**Solution:** These pages are skipped and marked as errors.

### "0 violations" on a bad site
axe-core only catches ~60% of issues automatically.
**Remember:** Manual testing is still needed for a full audit.

---

## For Rengie

### Daily Workflow
1. Get a list of school districts to scan
2. Run: `npm run audit -- https://district-website.org --pages 10`
3. Open the `violations.csv` file
4. Copy data to the Lead Tracker spreadsheet
5. Note the Lead Grade (A/B/C) in the spreadsheet

### What to Record in Lead Tracker
From the audit output, record:
- Total violations
- Critical + Serious count
- Top 3 issues found
- Lead grade (A/B/C)

---

## Next Features (Coming Soon)
- [ ] PDF report generation
- [ ] Screenshot capture of violations
- [ ] Lighthouse performance scores
- [ ] Batch scanning (multiple sites at once)

---

## Questions?
Ask Teddy on Slack or WhatsApp.
