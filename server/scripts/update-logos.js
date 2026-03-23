/**
 * update-logos.js
 * Reads your Excel file and directly updates logoUrl in MongoDB for each college.
 *
 * Usage:
 *   node scripts/update-logos.js path/to/your-excel.xlsx
 *
 * Example:
 *   node scripts/update-logos.js ../colleges_with_logos.xlsx
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const XLSX     = require('xlsx');
const path     = require('path');
const College  = require('../src/models/College');
const slugify  = require('slugify');

// ── helpers (same as importExportService) ────────────────────────────────────

function normalizeRow(row) {
  const out = {};
  for (const k of Object.keys(row)) {
    const normalized = k
      .replace(/^\uFEFF/, '')
      .replace(/[\u00a0\u200b\u200c\u200d\u2060\ufeff]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    out[normalized] = row[k];
  }
  return out;
}

function makeGet(n) {
  return (...keys) => {
    for (const k of keys) {
      const v = n[k.toLowerCase().trim()];
      if (v !== undefined && String(v).trim() !== '') return String(v).trim();
    }
    return undefined;
  };
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const excelPath = process.argv[2];
  if (!excelPath) {
    console.error('❌  Usage: node scripts/update-logos.js <path-to-excel.xlsx>');
    process.exit(1);
  }

  const absPath = path.resolve(excelPath);
  console.log(`\n📂  Reading: ${absPath}`);

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  MongoDB connected\n');

  // Parse Excel
  const wb   = XLSX.readFile(absPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  console.log(`📊  Total rows: ${rows.length}\n`);

  let updated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const n   = normalizeRow(rows[i]);
    const get = makeGet(n);

    const name    = get('college name', 'name', 'institution name', 'college');
    const logoUrl = get(
      'logo url', 'logourl', 'logo', 'college logo',
      'logo url (png/jpg/webp)', 'logo_url', 'logo-url',
      'college logo url', 'image url', 'logo link'
    );

    if (!name) {
      console.warn(`  [Row ${i + 2}] ⚠️  No college name — skipped`);
      skipped++;
      continue;
    }

    if (!logoUrl) {
      console.warn(`  [Row ${i + 2}] ⚠️  "${name}" — no logo URL found — skipped`);
      skipped++;
      continue;
    }

    const slug = slugify(name, { lower: true, strict: true });

    try {
      const result = await College.updateOne(
        { $or: [{ slug }, { name: new RegExp(`^${name.trim()}$`, 'i') }] },
        { $set: { logoUrl } }
      );

      if (result.matchedCount === 0) {
        console.warn(`  [Row ${i + 2}] ❓  "${name}" — not found in DB — skipped`);
        skipped++;
      } else {
        console.log(`  [Row ${i + 2}] ✅  "${name}" → ${logoUrl}`);
        updated++;
      }
    } catch (err) {
      console.error(`  [Row ${i + 2}] ❌  "${name}" — Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅  Updated : ${updated}`);
  console.log(`⚠️  Skipped : ${skipped}`);
  console.log(`❌  Failed  : ${failed}`);
  console.log(`${'─'.repeat(50)}\n`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
