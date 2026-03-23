/**
 * generate-college-data.js
 *
 * Generates 50 rows of real Indian college data using Claude API
 * and saves it as colleges_generated.xlsx ready for bulk import.
 *
 * Setup:
 *   cd server && npm install @anthropic-ai/sdk
 *   set ANTHROPIC_API_KEY=your_key_here   (Windows)
 *   node ../scripts/generate-college-data.js
 *
 * Or from project root:
 *   cd scripts
 *   ANTHROPIC_API_KEY=your_key node generate-college-data.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const XLSX = require('xlsx');
const path = require('path');

// ── Column headers (must match importExportService.js mapCollege) ─────────
const HEADERS = [
  'College Name',
  'Short Name',
  'Logo URL',
  'Description',
  'Established Year',
  'Discipline (College Type)',
  'Institute Type (Funding Type)',
  'Affiliation',
  'NAAC Grade',
  'NIRF Rank',
  'NBA Status (Yes/No)',
  'Phone',
  'Email',
  'Website',
  'Address',
  'City',
  'State',
  'Pincode',
  'Admission Mode',
  'Application Fee (₹)',
  'Application Link',
  'Average Package (LPA)',
  'Highest Package (LPA)',
  'Placement Rate (%)',
  'Tuition Fee (₹/yr)',
  'Hostel Fee (₹/yr)',
  'Total Fees (₹/yr)',
  'Hostel Available (Yes/No)',
  'Boys Capacity',
  'Girls Capacity',
  'Total Area (Acres)',
  'Campus Type',
  'Total Students',
  'Total Faculty',
  'Top Recruiters',
  'Approved By',
  'Featured (Yes/No)',
  'Verified (Yes/No)',
  'Facebook',
  'Twitter',
  'Instagram',
  'LinkedIn',
  'YouTube',
];

// ── Prompt builder ────────────────────────────────────────────────────────
function buildPrompt(batchIndex, count) {
  const categories = [
    'IITs (Indian Institutes of Technology)',
    'NITs (National Institutes of Technology)',
    'IIMs (Indian Institutes of Management)',
    'Central Universities',
    'State Universities',
    'Private Deemed Universities',
    'Autonomous Engineering Colleges',
    'Medical Colleges',
    'Law Colleges / National Law Universities',
    'Arts & Science Colleges',
  ];
  const category = categories[batchIndex % categories.length];

  return `Generate ${count} realistic Indian college/university records focusing on ${category}.

Return ONLY a valid JSON array of ${count} objects. No markdown, no explanation, just the JSON array.

Each object must have EXACTLY these fields (use empty string "" if data is unknown, never use null):

{
  "College Name": "full official name",
  "Short Name": "abbreviation like IIT-B, NIT-W",
  "Logo URL": "https://upload.wikimedia.org/wikipedia/en/thumb/... (use real Wikipedia logo URLs for famous colleges, or empty string)",
  "Description": "2-3 sentence realistic description of the college",
  "Established Year": "year as number e.g. 1959",
  "Discipline (College Type)": "one of: Engineering, Medical, Management, Law, Arts & Science, Pharmacy, Architecture, Agriculture, Multidisciplinary",
  "Institute Type (Funding Type)": "one of: Government, Private, Deemed, Autonomous, Central Government",
  "Affiliation": "e.g. UGC Autonomous, Anna University, VTU, Affiliated to state university name",
  "NAAC Grade": "one of: A++, A+, A, B++, B+, B, C, or empty string",
  "NIRF Rank": "number like 5 or empty string if not ranked",
  "NBA Status (Yes/No)": "Yes or No",
  "Phone": "Indian phone number like +91-22-25767000",
  "Email": "official email like info@iitb.ac.in",
  "Website": "official website URL",
  "Address": "street address",
  "City": "city name",
  "State": "Indian state name",
  "Pincode": "6-digit pincode",
  "Admission Mode": "one of: JEE Main, JEE Advanced, NEET, CAT, CLAT, State CET, Direct, Management Quota",
  "Application Fee (₹)": "number like 500 or 1000",
  "Application Link": "URL to admission portal",
  "Average Package (LPA)": "number like 8.5 or 12",
  "Highest Package (LPA)": "number like 25 or 60",
  "Placement Rate (%)": "number like 85 or 95",
  "Tuition Fee (₹/yr)": "number like 200000",
  "Hostel Fee (₹/yr)": "number like 60000",
  "Total Fees (₹/yr)": "number like 260000",
  "Hostel Available (Yes/No)": "Yes or No",
  "Boys Capacity": "number like 2000",
  "Girls Capacity": "number like 500",
  "Total Area (Acres)": "number like 550",
  "Campus Type": "one of: Urban, Semi-Urban, Rural",
  "Total Students": "number like 8000",
  "Total Faculty": "number like 600",
  "Top Recruiters": "comma-separated companies like Microsoft, Google, Infosys, TCS",
  "Approved By": "comma-separated like AICTE, UGC, MCI, Bar Council",
  "Featured (Yes/No)": "Yes or No",
  "Verified (Yes/No)": "Yes",
  "Facebook": "Facebook page URL or empty string",
  "Twitter": "Twitter/X profile URL or empty string",
  "Instagram": "Instagram URL or empty string",
  "LinkedIn": "LinkedIn URL or empty string",
  "YouTube": "YouTube channel URL or empty string"
}

Important:
- Use REAL college names that actually exist in India
- Use accurate data for well-known institutions (IITs, NITs, etc.)
- For less-known colleges, use plausible realistic data
- All numeric fields must be plain numbers, not strings with units
- Return ONLY the JSON array, nothing else`;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable not set.');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const TOTAL = 50;
  const BATCH_SIZE = 10;
  const NUM_BATCHES = TOTAL / BATCH_SIZE; // 5 batches

  const allColleges = [];

  for (let b = 0; b < NUM_BATCHES; b++) {
    console.log(`Generating batch ${b + 1}/${NUM_BATCHES} (colleges ${b * BATCH_SIZE + 1}–${(b + 1) * BATCH_SIZE})...`);

    let colleges = null;
    let attempts = 0;

    while (!colleges && attempts < 3) {
      attempts++;
      try {
        const response = await client.messages.create({
          model: 'claude-opus-4-6',
          max_tokens: 8000,
          thinking: { type: 'adaptive' },
          messages: [
            {
              role: 'user',
              content: buildPrompt(b, BATCH_SIZE),
            },
          ],
        });

        // Extract text content
        const textBlock = response.content.find((c) => c.type === 'text');
        if (!textBlock) throw new Error('No text block in response');

        let raw = textBlock.text.trim();

        // Strip markdown code fences if present
        raw = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

        colleges = JSON.parse(raw);

        if (!Array.isArray(colleges)) throw new Error('Response is not an array');
        console.log(`  ✓ Got ${colleges.length} colleges`);
      } catch (err) {
        console.warn(`  Attempt ${attempts} failed: ${err.message}`);
        if (attempts >= 3) {
          console.error(`  Giving up on batch ${b + 1}`);
          colleges = []; // empty — don't crash
        }
      }
    }

    allColleges.push(...(colleges || []));

    // Small delay between batches to be polite to the API
    if (b < NUM_BATCHES - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log(`\nTotal colleges collected: ${allColleges.length}`);

  // ── Map to rows matching HEADERS order ──────────────────────────────────
  const rows = allColleges.map((c) => {
    const row = {};
    for (const h of HEADERS) {
      const val = c[h];
      row[h] = val !== undefined && val !== null ? String(val) : '';
    }
    return row;
  });

  // ── Write Excel ──────────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });

  // Set column widths for readability
  ws['!cols'] = HEADERS.map((h) => ({
    wch: Math.max(h.length, 18),
  }));

  XLSX.utils.book_append_sheet(wb, ws, 'Colleges');

  const outPath = path.resolve(__dirname, 'colleges_generated.xlsx');
  XLSX.writeFile(wb, outPath);

  console.log(`\n✅ Done! File saved to:\n   ${outPath}`);
  console.log(`\nUpload it via Admin → Import/Export → Import from Excel`);
  console.log(`Select "Colleges" as the data type and choose the file.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
