const College = require('../models/College');
const Course  = require('../models/Course');
const Exam    = require('../models/Exam');

// NIRF rank → minimum percentile needed for a realistic chance
const getRequiredPercentile = (nirfRank) => {
  if (!nirfRank)       return 65;
  if (nirfRank <= 5)   return 99.5;
  if (nirfRank <= 25)  return 99;
  if (nirfRank <= 50)  return 97;
  if (nirfRank <= 100) return 95;
  if (nirfRank <= 200) return 90;
  if (nirfRank <= 500) return 80;
  return 65;
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const getProbability = (chance) => {
  if (chance >= 80) return { bucket: 'High Chance',      color: 'green'  };
  if (chance >= 60) return { bucket: 'Moderate Chance',  color: 'yellow' };
  if (chance >= 40) return { bucket: 'Low Chance',       color: 'orange' };
  return             { bucket: 'Difficult',               color: 'red'    };
};

class PredictorService {

  /* ─── COLLEGE PREDICTOR ─────────────────────────── */
  async predictColleges({ percentile, rank, stream, state, maxFee, category, limit = 30 }) {
    const filter = { deletedAt: null };
    if (stream)  filter.collegeType = stream;
    if (state)   filter['contact.state'] = new RegExp(state.trim(), 'i');
    if (maxFee)  filter['fees.total']    = { $lte: Number(maxFee) };

    const colleges = await College.find(filter)
      .select('name slug coverImageUrl collegeType fundingType accreditation fees contact placementStats campusInfo hostel')
      .lean();

    // Convert rank → percentile if percentile not given
    const pct = percentile
      ? Number(percentile)
      : rank
        ? clamp(100 - (Number(rank) / 15000) * 100, 0, 100)
        : 70;

    const results = colleges.map(college => {
      const nirfRank = college.accreditation?.nirfRank;
      const reqPct   = getRequiredPercentile(nirfRank);

      // Weighted scoring: percentile match 70%, fee fit 15%, location fit 15%
      const percentileScore = clamp((pct / reqPct) * 100, 0, 100);
      const feeScore        = maxFee
        ? (college.fees?.total <= Number(maxFee) ? 100 : 25) : 100;
      const locationScore   = state
        ? (college.contact?.state?.toLowerCase().includes(state.toLowerCase()) ? 100 : 55) : 100;

      const chance = Math.round(percentileScore * 0.70 + feeScore * 0.15 + locationScore * 0.15);
      return { ...college, chance, ...getProbability(chance) };
    });

    results.sort((a, b) => b.chance - a.chance);
    return results.slice(0, Number(limit));
  }

  /* ─── COURSE PREDICTOR ──────────────────────────── */
  async predictCourses({ percentage, level, discipline, limit = 30 }) {
    const filter = { deletedAt: null };
    if (level)      filter.category   = level;
    if (discipline) filter.discipline = new RegExp(discipline.trim(), 'i');

    const courses = await Course.find(filter)
      .select('name slug category discipline duration mode feeRange eligibility careerProspects admissionType')
      .lean();

    const pct = Number(percentage) || 60;

    const results = courses.map(course => {
      // Eligibility-based scoring
      let score = 60;
      if      (pct >= 85) score = 100;
      else if (pct >= 75) score = 90;
      else if (pct >= 60) score = 75;
      else if (pct >= 50) score = 55;
      else                score = 35;

      // PG courses need a graduation degree — penalise if percentage very low
      if (level === 'PG' && pct < 50) score = Math.min(score, 30);

      return { ...course, chance: score, ...getProbability(score) };
    });

    results.sort((a, b) => b.chance - a.chance);
    return results.slice(0, Number(limit));
  }

  /* ─── EXAM PREDICTOR ────────────────────────────── */
  async predictExams({ discipline, level, limit = 20 }) {
    const filter = { deletedAt: null };
    if (level) filter.category = level;

    const exams = await Exam.find(filter)
      .select('name slug category examLevel conductingBody registrationFee examMode frequency overview officialWebsite importantDates')
      .lean();

    const results = exams.map(exam => {
      let relevance = 55;
      if (discipline) {
        const haystack = `${exam.name} ${exam.overview || ''}`.toLowerCase();
        const needle   = discipline.toLowerCase();
        if (haystack.includes(needle))         relevance = 95;
        else if (exam.examLevel === 'National') relevance = 70;
        else                                   relevance = 50;
      } else {
        // No discipline → rank nationals higher
        if (exam.examLevel === 'National') relevance = 80;
      }
      return { ...exam, chance: relevance, ...getProbability(relevance) };
    });

    results.sort((a, b) => b.chance - a.chance);
    return results.slice(0, Number(limit));
  }
}

module.exports = new PredictorService();
