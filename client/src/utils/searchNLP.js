// ── Synonym / abbreviation map ─────────────────────────────────────────────
const SYNONYMS = {
  'btech': 'B.Tech', 'b tech': 'B.Tech', 'b.tech': 'B.Tech',
  'mtech': 'M.Tech', 'm tech': 'M.Tech',
  'be': 'B.E', 'me': 'M.E',
  'bsc': 'B.Sc', 'b sc': 'B.Sc', 'msc': 'M.Sc',
  'bba': 'BBA', 'mba': 'MBA',
  'bca': 'BCA', 'mca': 'MCA',
  'bcom': 'B.Com', 'mcom': 'M.Com',
  'ba': 'B.A', 'ma': 'M.A',
  'llb': 'LLB', 'llm': 'LLM',
  'barch': 'B.Arch',
  'bpharm': 'B.Pharm', 'mpharm': 'M.Pharm',
  'mbbs': 'MBBS', 'md': 'MD', 'ms': 'MS',
  'phd': 'Ph.D', 'ph.d': 'Ph.D',
  'iit': 'IIT', 'nit': 'NIT', 'iiit': 'IIIT',
  'du': 'Delhi University', 'bhu': 'Banaras Hindu University',
  'jnu': 'Jawaharlal Nehru University', 'amu': 'Aligarh Muslim University',
};

// ── College type keywords ──────────────────────────────────────────────────
const TYPE_KEYWORDS = {
  engineering: 'Engineering', technology: 'Engineering',
  medical: 'Medical', medicine: 'Medical', dental: 'Medical', nursing: 'Medical', pharmacy: 'Medical',
  management: 'Management', business: 'Management', commerce: 'Management',
  law: 'Law', legal: 'Law',
  design: 'Design', arts: 'Arts', humanities: 'Arts',
  science: 'Science', agriculture: 'Agriculture', architecture: 'Architecture',
};

// ── Funding type ────────────────────────────────────────────────────────────
const FUNDING_KEYWORDS = {
  government: 'Government', govt: 'Government', central: 'Government',
  private: 'Private', deemed: 'Deemed',
};

// ── Indian cities ───────────────────────────────────────────────────────────
const CITIES = [
  'delhi', 'mumbai', 'bangalore', 'bengaluru', 'pune', 'chennai', 'hyderabad',
  'kolkata', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'noida', 'gurgaon',
  'gurugram', 'bhopal', 'indore', 'nagpur', 'surat', 'coimbatore', 'kochi',
  'thiruvananthapuram', 'patna', 'ranchi', 'bhubaneswar', 'dehradun', 'guwahati',
  'visakhapatnam', 'vadodara', 'agra', 'varanasi', 'allahabad', 'prayagraj',
  'amritsar', 'jalandhar', 'jodhpur', 'udaipur', 'mysuru', 'mysore', 'mangaluru',
];

// ── Noise words to strip from final text query ──────────────────────────────
const NOISE = new Set([
  'college', 'colleges', 'university', 'universities', 'institute', 'institutes',
  'school', 'top', 'best', 'good', 'famous', 'popular', 'find', 'search',
  'show', 'list', 'all', 'for', 'me', 'give', 'want', 'need', 'looking',
]);

// ── Fee pattern: "under 5 lakhs", "below 2 lakh" ───────────────────────────
const FEE_RE = /(?:under|below|less than|within|upto|up to)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|l\b)/i;

// ── Course level ────────────────────────────────────────────────────────────
const UG_RE = /\b(ug|undergraduate|bachelor|btech|b\.tech|bsc|b\.sc|bba|bca|llb|mbbs|barch|bpharm|bcom|b\.com|ba|b\.a)\b/i;
const PG_RE = /\b(pg|postgraduate|master|mtech|m\.tech|mba|msc|m\.sc|mca|llm|ma|m\.a|mcom|phd|ph\.d)\b/i;

function safeEscape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse a raw search query into structured params.
 * @param {string} raw - user's input
 * @returns {{ q: string, city?: string, state?: string, collegeType?: string,
 *             fundingType?: string, feesMax?: number, category?: string }}
 */
export function parseQuery(raw) {
  if (!raw || !raw.trim()) return { q: '' };

  const input = raw.trim().toLowerCase();
  const tokens = input.split(/\s+/);
  const result = { q: raw.trim() };

  // 1. Synonym expansion on the query text
  let normalized = input;
  for (const [abbr, full] of Object.entries(SYNONYMS)) {
    normalized = normalized.replace(new RegExp(`\\b${safeEscape(abbr)}\\b`, 'gi'), full);
  }

  // 2. Detect "in <place>" pattern
  const inMatch = input.match(/\bin\s+([a-z ]+?)(?:\s+(?:college|university|institute|for|with|under|below|and)|\s*$)/i);
  const placeHint = inMatch ? inMatch[1].trim() : null;

  if (placeHint) {
    const matchedCity = CITIES.find(c => placeHint === c || placeHint.startsWith(c));
    if (matchedCity) result.city = matchedCity;
  }

  // Token-level city detection (if not found via "in" pattern)
  if (!result.city) {
    for (const city of CITIES) {
      if (city.includes(' ') ? input.includes(city) : tokens.includes(city)) {
        result.city = city;
        break;
      }
    }
  }

  // 3. Detect college type
  for (const [kw, type] of Object.entries(TYPE_KEYWORDS)) {
    if (tokens.includes(kw) || input.includes(kw)) {
      result.collegeType = type;
      break;
    }
  }

  // 4. Detect funding type
  for (const [kw, type] of Object.entries(FUNDING_KEYWORDS)) {
    if (tokens.includes(kw)) {
      result.fundingType = type;
      break;
    }
  }

  // 5. Fee extraction
  const feeMatch = input.match(FEE_RE);
  if (feeMatch) result.feesMax = Math.round(parseFloat(feeMatch[1]) * 100000);

  // 6. Course level
  if (UG_RE.test(input)) result.category = 'UG';
  else if (PG_RE.test(input)) result.category = 'PG';

  // 7. Build clean text query — strip location, noise, fee phrases
  let cleanQ = normalized;

  // remove "in <city>"
  if (result.city) cleanQ = cleanQ.replace(new RegExp(`\\bin\\s+${safeEscape(result.city)}\\b`, 'gi'), '');
  // remove fee phrases
  cleanQ = cleanQ.replace(FEE_RE, '');
  // remove noise words
  cleanQ = cleanQ.split(/\s+/).filter(w => !NOISE.has(w.toLowerCase())).join(' ').trim();

  result.q = cleanQ || raw.trim(); // fallback to original if everything stripped

  return result;
}

/**
 * Build a human-readable summary of what was detected.
 * e.g. "B.Tech • Engineering • Bangalore"
 */
export function describeIntent(parsed) {
  const parts = [];
  if (parsed.q && parsed.q !== parsed._raw) parts.push(parsed.q);
  if (parsed.collegeType) parts.push(parsed.collegeType);
  if (parsed.fundingType) parts.push(parsed.fundingType);
  if (parsed.city) parts.push(parsed.city.charAt(0).toUpperCase() + parsed.city.slice(1));
  if (parsed.category) parts.push(parsed.category === 'UG' ? 'Undergraduate' : 'Postgraduate');
  if (parsed.feesMax) parts.push(`Fees under ₹${(parsed.feesMax / 100000).toFixed(1)}L`);
  return parts.join(' · ');
}
