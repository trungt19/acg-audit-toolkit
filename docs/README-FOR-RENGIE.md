# Welcome to ACG Audit Toolkit

## Hey Rengie! Here's everything you need to get started.

This toolkit helps you scan school district websites for accessibility issues and generate lead packages for outreach.

---

## What's Already Done

Teddy has pre-scanned 35 Florida and Texas school districts. The results are in the `/output/` folder, ready for you to send.

---

## Your First Day Workflow

### Step 1: See All the Leads

Run this command to see a summary of all scanned leads:

```bash
cd /path/to/audit-toolkit
npm run summary
```

This shows you:
- **A-LEADS (Hot)** - Contact these FIRST (10+ critical/serious violations)
- **B-LEADS (Warm)** - Contact within 48 hours
- **C-LEADS (Cool)** - Lower priority
- **Skip** - Already compliant, don't contact

### Step 2: Pick an A-Lead

Start with the A-lead that has the MOST violations. That's your hottest prospect.

### Step 3: Research the Contact

Before sending, find the actual IT Director or Webmaster name:

1. Go to the district website
2. Find their Staff Directory
3. Look for "Technology" or "IT" department
4. Note the actual name and email

**Pro tip:** Google `site:districtwebsite.com "IT Director"` to find contact info fast.

### Step 4: Open the Lead Folder

```bash
open output/www-districtname-date/
```

Inside you'll find:
- `accessibility-report.pdf` - **ATTACH THIS TO EMAIL**
- `email-draft.txt` - Copy/paste for your email
- `violations.csv` - Detailed data (optional)

### Step 5: Customize the Email

Open `email-draft.txt` and replace "IT Director" with the actual contact name.

### Step 6: Send the Email

**From:** team@accessiblecompliancegroup.com
**To:** [Their email]
**Subject:** [From email-draft.txt]
**Body:** [From email-draft.txt]
**Attachment:** accessibility-report.pdf

### Step 7: Log It

Update the Lead Tracker spreadsheet:
- District name
- Contact name and email
- Date sent
- Lead grade (A, B, or C)
- Violation count

### Step 8: Repeat

Move to the next A-lead. Finish all A-leads before moving to B-leads.

---

## Follow-Up Schedule

| Day | What to Do |
|-----|------------|
| 0 | Send initial email with PDF |
| 3 | Send follow-up if no response |
| 7 | Escalate to superintendent (A-leads only) |
| 14 | Final follow-up, then move on |

---

## When to Scan a New Site

If a prospect isn't in the pre-scanned list:

```bash
npm run lead-package -- https://www.newdistrict.com "Contact Name" "email@district.com"
```

This creates a new folder in `/output/` with all the files you need.

---

## Common Questions

### "What do I say if they respond?"

**If they ask about the issues:**
> "The scan found [X] violations including [Y] critical issues. The most common issue is [top issue]. These affect users who rely on screen readers."

**If they ask why it matters:**
> "The DOJ requires all public school districts to meet WCAG 2.1 AA standards by April 24, 2026. Non-compliance can result in complaints, lawsuits, and federal funding impacts."

**If they ask about cost:**
> "It depends on the site size. Typical projects range from $25,000 to $100,000. We can give you a detailed quote after a 30-minute discovery call. Would you like to schedule?"

### "What if someone wants to schedule a call?"

CC Teddy on the email and propose specific times. Update the tracker to "Meeting Scheduled."

---

## Troubleshooting

**"npm: command not found"**
Install Node.js from https://nodejs.org/

**Scan hangs or takes forever**
Wait up to 5 minutes. Some sites are slow. If it still hangs, skip it.

**No violations found**
The site is compliant. Mark as "Skip" and move on.

---

## Files You'll Use Daily

| File | What It Is |
|------|------------|
| `/output/` folder | All scan results |
| `/docs/ACG-Lead-Package-SOP.pdf` | Full training document |
| `/docs/Quick-Reference-Card.md` | Cheat sheet |

---

## Need Help?

Contact Teddy:
- Email: teddy@accessiblecompliancegroup.com
- Phone: (253) 732-3963

---

**You got this! Start with the A-leads and work your way down.**
