#!/bin/bash

# ACG Batch Scanner
# Scans multiple school districts and generates lead packages
# Run: ./batch-scan.sh

echo "═══════════════════════════════════════════════════════════════"
echo "           ACG BATCH LEAD PACKAGE GENERATOR"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Starting batch scan of Florida & Texas school districts..."
echo "This will take approximately 2-3 hours."
echo ""

cd /Users/trungthai/Projects/ACG/audit-toolkit

# Florida School Districts
echo "══════════════════════════════════════"
echo "FLORIDA SCHOOL DISTRICTS"
echo "══════════════════════════════════════"

npm run lead-package -- https://www.dadeschools.net "IT Director" "webmaster@dadeschools.net"
npm run lead-package -- https://www.browardschools.com "IT Director" "webmaster@browardschools.com"
npm run lead-package -- https://www.hillsboroughschools.org "IT Director" "webmaster@hillsboroughschools.org"
npm run lead-package -- https://www.ocps.net "IT Director" "webmaster@ocps.net"
npm run lead-package -- https://www.palmbeachschools.org "IT Director" "webmaster@palmbeachschools.org"
npm run lead-package -- https://www.duvalschools.org "IT Director" "webmaster@duvalschools.org"
npm run lead-package -- https://www.pcsb.org "IT Director" "webmaster@pcsb.org"
npm run lead-package -- https://www.polkschoolsfl.com "IT Director" "webmaster@polkschoolsfl.com"
npm run lead-package -- https://www.leeschools.net "IT Director" "webmaster@leeschools.net"
npm run lead-package -- https://www.brevardschools.org "IT Director" "webmaster@brevardschools.org"
npm run lead-package -- https://www.vcsedu.org "IT Director" "webmaster@vcsedu.org"
npm run lead-package -- https://www.pasco.k12.fl.us "IT Director" "webmaster@pasco.k12.fl.us"
npm run lead-package -- https://www.scps.k12.fl.us "IT Director" "webmaster@scps.k12.fl.us"
npm run lead-package -- https://www.osceolaschools.net "IT Director" "webmaster@osceolaschools.net"
npm run lead-package -- https://www.sarasotacountyschools.net "IT Director" "webmaster@sarasotacountyschools.net"

echo ""
echo "══════════════════════════════════════"
echo "TEXAS SCHOOL DISTRICTS"
echo "══════════════════════════════════════"

npm run lead-package -- https://www.houstonisd.org "IT Director" "webmaster@houstonisd.org"
npm run lead-package -- https://www.dallasisd.org "IT Director" "webmaster@dallasisd.org"
npm run lead-package -- https://www.cfisd.net "IT Director" "webmaster@cfisd.net"
npm run lead-package -- https://www.nisd.net "IT Director" "webmaster@nisd.net"
npm run lead-package -- https://www.fwisd.org "IT Director" "webmaster@fwisd.org"
npm run lead-package -- https://www.austinisd.org "IT Director" "webmaster@austinisd.org"
npm run lead-package -- https://www.saisd.net "IT Director" "webmaster@saisd.net"
npm run lead-package -- https://www.katyisd.org "IT Director" "webmaster@katyisd.org"
npm run lead-package -- https://www.neisd.net "IT Director" "webmaster@neisd.net"
npm run lead-package -- https://www.episd.org "IT Director" "webmaster@episd.org"
npm run lead-package -- https://www.fortbendisd.com "IT Director" "webmaster@fortbendisd.com"
npm run lead-package -- https://www.aisd.net "IT Director" "webmaster@aisd.net"
npm run lead-package -- https://www.aldineisd.org "IT Director" "webmaster@aldineisd.org"
npm run lead-package -- https://www.pisd.edu "IT Director" "webmaster@pisd.edu"
npm run lead-package -- https://www.conroeisd.net "IT Director" "webmaster@conroeisd.net"
npm run lead-package -- https://www.lisd.net "IT Director" "webmaster@lisd.net"
npm run lead-package -- https://www.pasadenaisd.org "IT Director" "webmaster@pasadenaisd.org"
npm run lead-package -- https://www.roundrockisd.org "IT Director" "webmaster@roundrockisd.org"
npm run lead-package -- https://www.kleinisd.net "IT Director" "webmaster@kleinisd.net"
npm run lead-package -- https://www.springisd.org "IT Director" "webmaster@springisd.org"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "           BATCH SCAN COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "All lead packages saved to: /audit-toolkit/output/"
echo ""
echo "Next steps:"
echo "1. Open the output folder"
echo "2. Review each lead package"
echo "3. Research actual contact names"
echo "4. Send emails with PDF attachments"
echo ""

open /Users/trungthai/Projects/ACG/audit-toolkit/output/
