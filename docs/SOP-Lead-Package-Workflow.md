# ACG Lead Package Workflow SOP

## Standard Operating Procedure for Rengie De Fiesta

**Version:** 1.0
**Last Updated:** January 2, 2026
**Author:** Teddy Thai, CPACC

---

## Overview

This SOP explains how to use the ACG Audit Toolkit to:
1. Run accessibility scans on target websites
2. Generate professional PDF reports
3. Create customized outreach emails
4. Qualify leads (A, B, or C grade)
5. Send outreach and track responses

---

## Quick Reference Commands

```bash
# Navigate to the toolkit
cd /path/to/audit-toolkit

# Scan a single website and generate lead package
npm run lead-package -- <URL> "Contact Name" "contact@email.com"

# View summary of all scanned leads
npm run summary

# Run batch scan of all school districts
npm run batch-scan
```

---

## Part 1: Setup (One-Time)

### Prerequisites
- Node.js 18 or higher
- Git installed
- Terminal/Command line access

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/trungt19/acg-audit-toolkit.git

# 2. Navigate to the folder
cd acg-audit-toolkit

# 3. Install dependencies
npm install

# 4. Verify installation
npm run lead-package -- https://example.com "Test" "test@test.com"
```

If successful, you'll see a folder created in `/output/` with the scan results.

---

## Part 2: Generating a Lead Package

### Step 1: Run the Scan

```bash
npm run lead-package -- <URL> "Contact Name" "contact@email.com"
```

**Example:**
```bash
npm run lead-package -- https://www.bay.k12.fl.us "Tamra Hogue" "hogueta@bay.k12.fl.us"
```

### Step 2: Understanding the Output

The command creates a folder in `/output/` with:

| File | Description |
|------|-------------|
| `accessibility-report.pdf` | Professional PDF to attach to emails |
| `email-draft.txt` | Ready-to-send email content |
| `violations.csv` | Detailed violation data |
| `raw-results.json` | Full scan data (for reference) |

### Step 3: Check the Lead Grade

The tool automatically grades leads:

| Grade | Criteria | Priority |
|-------|----------|----------|
| **A-LEAD** | 10+ critical/serious OR 25+ total violations | HIGH - Contact immediately |
| **B-LEAD** | 5-9 critical/serious OR 15-24 total | MEDIUM - Contact within 48 hours |
| **C-LEAD** | Less than 5 critical/serious AND under 15 total | LOW - Batch outreach |
| **SKIP** | 0 violations found | Do not contact |

---

## Part 3: Sending Outreach Emails

### Step 1: Open the Output Folder

```bash
open output/<folder-name>
```

Or navigate manually in Finder/Explorer.

### Step 2: Review and Customize the Email

1. Open `email-draft.txt`
2. **IMPORTANT:** Research the actual contact name and email before sending
3. Update the greeting with their actual name
4. Review the content for accuracy

### Step 3: Compose the Email

**From:** team@accessiblecompliancegroup.com
**To:** [Prospect's email]
**Subject:** [Copy from email-draft.txt]

**Body:** Copy the content from email-draft.txt

**Attachment:** Attach `accessibility-report.pdf`

### Step 4: Send and Log

1. Send the email
2. Log in the Lead Tracker spreadsheet:
   - District name
   - Contact name/email
   - Date sent
   - Lead grade
   - Violation count

---

## Part 4: Viewing Lead Summary

After scanning multiple sites, view a summary:

```bash
npm run summary
```

This shows:
- Total sites scanned
- A-Leads (hot) - prioritize these
- B-Leads (warm)
- C-Leads (cool)
- Skip (compliant sites)

**Example Output:**
```
OVERVIEW
   Total Scanned: 35
   A-Leads (Hot):  12
   B-Leads (Warm): 8
   C-Leads (Cool): 10
   Skip (Clean):   5

A-LEADS (HIGH PRIORITY)
   1. www.dadeschools.net
      Violations: 85 (15 critical, 70 serious)
      Folder: www-dadeschools-net-2026-01-02
```

---

## Part 5: Follow-Up Sequence

### Day 0: Initial Outreach
- Send email with PDF attachment
- Log in tracker as "Sent"

### Day 3: First Follow-Up
- If no response, send follow-up
- Subject: "RE: [Original Subject]"
- Keep brief: "Following up on my email from earlier this week..."

### Day 7: Escalation (Optional)
- For A-leads only
- CC the superintendent or higher contact
- More formal tone
- Reference the compliance deadline

### Day 14: Final Follow-Up
- Last attempt
- Mention "closing the loop"
- Leave door open for future contact

---

## Part 6: Research Tips for Finding Contacts

### Where to Find IT Director/Webmaster Info

1. **Staff Directory:** Look for "Technology" or "IT" department
2. **Contact Page:** Often lists department contacts
3. **Footer:** Check for webmaster email
4. **Google Search:** `site:domain.com "IT Director" OR "webmaster"`

### Ideal Contact Titles (in order of preference)

1. Director of Technology / IT Director
2. Chief Information Officer (CIO)
3. Webmaster / Web Administrator
4. Communications Director
5. Superintendent (escalation only)

### Common Email Patterns

- `firstname.lastname@district.org`
- `flastname@district.org`
- `webmaster@district.org`
- `technology@district.org`

---

## Part 7: Talking Points for Responses

### If They Ask: "What are the issues?"

Reference the PDF report:
- "The scan found [X] violations including [Y] critical issues"
- "The most common issue is [top issue from report]"
- "These affect users with screen readers and other assistive technology"

### If They Ask: "Why should we care?"

- "The DOJ's ADA Title II rule requires all public school districts to be WCAG 2.1 AA compliant by April 24, 2026"
- "Non-compliance can result in OCR complaints, lawsuits, and impacts to federal funding"
- "We've already seen districts in [state] receive complaints"

### If They Ask: "How much does remediation cost?"

- "It depends on the size and complexity of the site"
- "Typical projects range from $25,000 to $100,000"
- "We can provide a detailed quote after a 30-minute discovery call"
- "Would you like to schedule a time to discuss?"

### If They Want to Schedule

- Use Calendly or propose specific times
- Offer: "How does [Day] at [Time] work for you?"
- CC Teddy on scheduling emails

---

## Part 8: Quality Checklist

Before sending any email, verify:

- [ ] Contact name is correct (not "IT Director")
- [ ] Email address is valid
- [ ] Domain name is correct in subject/body
- [ ] Violation count matches the PDF
- [ ] PDF is attached
- [ ] Sent from team@accessiblecompliancegroup.com
- [ ] Logged in Lead Tracker

---

## Troubleshooting

### "npm: command not found"
Node.js is not installed. Download from https://nodejs.org/

### "Permission denied"
Run: `chmod +x batch-scan.sh`

### Scan takes too long
Some sites are slow. Wait up to 5 minutes per site.

### No violations found
Site may be compliant. Mark as "Skip" in tracker.

### Error during scan
- Check if the URL is correct
- Try with www or without www
- Some sites block automated access

---

## Contact

**Questions?** Contact Teddy Thai:
- Email: teddy@accessiblecompliancegroup.com
- Phone: (253) 732-3963

---

*This SOP is confidential and for ACG team use only.*
