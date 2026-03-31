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
  async predictColleges({ percentile, rank, stream, state, maxFee, category = 'General', examId, limit = 30 }) {
  const CollegeCourse = require('../models/CollegeCourse');
  const currentYear   = new Date().getFullYear();

  const filter = { deletedAt: null };
  if (stream) filter.collegeType = stream;
  if (state)  filter['contact.state'] = new RegExp(state.trim(), 'i');
  if (maxFee) filter['fees.total'] = { $lte: Number(maxFee) };

  const colleges = await College.find(filter)
    .select('name slug coverImageUrl collegeType fundingType accreditation fees contact placementStats campusInfo hostel cutoffs')
    .lean();

  // Convert rank → approximate percentile (and vice versa)
  const pct = percentile
    ? Number(percentile)
    : rank ? clamp(100 - (Number(rank) / 15000) * 100, 0, 100) : 70;
  const candidateRank = rank
    ? Number(rank)
    : Math.round((1 - pct / 100) * 1500000);

  // Fetch CollegeCourse cutoffs for all these colleges in one query
  const collegeIds = colleges.map(c => c._id);
  const ccRecords  = await CollegeCourse.find({
    college: { $in: collegeIds },
    deletedAt: null,
    isActive: true,
  }).select('college examCutoffs fees').lean();

  // Map: collegeId → latest closing rank
  const ccCutoffMap = {};
  for (const cc of ccRecords) {
    const relevant = (cc.examCutoffs || []).filter(c => {
      const yearOk = c.year >= currentYear - 3;
      const catOk  = c.category === category || c.category === 'General';
      const examOk = !examId || String(c.exam) === String(examId);
      return yearOk && catOk && examOk;
    });
    if (relevant.length > 0) {
      const latest = relevant.sort((a, b) => b.year - a.year)[0];
      const key = String(cc.college);
      if (!ccCutoffMap[key] || latest.year > ccCutoffMap[key].year) {
        ccCutoffMap[key] = latest;
      }
    }
  }

  const results = colleges.map(college => {
    const key     = String(college._id);
    const cutoff  = ccCutoffMap[key];  // from CollegeCourse
    // Also check college.cutoffs[]
    const collegeLevelCutoff = (college.cutoffs || [])
      .filter(c => {
        const yearOk = c.year >= currentYear - 3;
        const catOk  = c.category === category || c.category === 'General';
        const examOk = !examId || String(c.exam) === String(examId);
        return yearOk && catOk && examOk;
      })
      .sort((a, b) => b.year - a.year)[0];

    const activeCutoff = cutoff || collegeLevelCutoff;

    let chance, hasRealData;
    if (activeCutoff?.closingRank && candidateRank) {
      // Real cutoff-based chance
      hasRealData = true;
      const ratio = activeCutoff.closingRank / candidateRank;
      if      (ratio >= 1.5)  chance = 90;
      else if (ratio >= 1.1)  chance = 75;
      else if (ratio >= 0.95) chance = 55;
      else if (ratio >= 0.80) chance = 35;
      else                    chance = 15;
    } else {
      // Fall back to NIRF estimate
      hasRealData = false;
      const nirfRank      = college.accreditation?.nirfRank;
      const reqPct        = getRequiredPercentile(nirfRank);
      const percentileScore = clamp((pct / reqPct) * 100, 0, 100);
      const feeScore        = maxFee ? (college.fees?.total <= Number(maxFee) ? 100 : 25) : 100;
      const locationScore   = state  ? (college.contact?.state?.toLowerCase().includes(state.toLowerCase()) ? 100 : 55) : 100;
      chance = Math.round(percentileScore * 0.70 + feeScore * 0.15 + locationScore * 0.15);
    }

    return {
      ...college,
      chance,
      hasRealData,
      lastYearClosingRank: activeCutoff?.closingRank || null,
      ...getProbability(chance),
    };
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
  async getCollegeDetailedAnalysis({ collegeId, courseId, examId, rank, percentile, category = 'General' }) {
    const CollegeCourse = require('../models/CollegeCourse');

    // 1. Find the CollegeCourse record and populate exam cutoffs for last 3 years
    const cc = await CollegeCourse.findOne({ college: collegeId, course: courseId, deletedAt: null })
      .populate('college', 'name slug accreditation fees contact collegeType placementStats yearWisePlacements')
      .populate('course', 'name slug category discipline')
      .populate('entranceExamRequirement', 'name slug')
      .lean();

    if (!cc) return null;

    // 2. Filter cutoffs: match examId (if provided) and category, last 3 years
    const currentYear = new Date().getFullYear();
    const cutoffData  = (cc.examCutoffs || []).filter(c => {
      const yearOk     = c.year >= currentYear - 3;
      const catOk      = !c.category || c.category === category || c.category === 'General';
      const examOk     = !examId || String(c.exam) === String(examId);
      return yearOk && catOk && examOk;
    }).sort((a, b) => b.year - a.year);

    // Also check college-level cutoffs (College.cutoffs[])
    const College = require('../models/College');
    const college = await College.findById(collegeId).select('cutoffs yearWisePlacements').lean();
    const collegeLevelCutoffs = (college?.cutoffs || []).filter(c => {
      const yearOk = c.year >= currentYear - 3;
      const catOk  = !c.category || c.category === category;
      const examOk = !examId || String(c.exam) === String(examId);
      const courseOk = !courseId || String(c.course) === String(courseId);
      return yearOk && catOk && examOk && courseOk;
    }).sort((a, b) => b.year - a.year);

    // 3. Merge both cutoff sources (CollegeCourse takes priority)
    const allCutoffs = cutoffData.length > 0 ? cutoffData : collegeLevelCutoffs;

    // 4. Convert percentile ↔ rank
    const candidateRank = rank
      ? Number(rank)
      : percentile ? Math.round((1 - Number(percentile) / 100) * 1500000) : null;
    // (1,500,000 = approx JEE total applicants — adjust per exam)

    // 5. Year-wise analysis
    const yearWise = allCutoffs.map(c => {
      let chanceForYear = null;
      if (candidateRank && c.closingRank) {
        // If candidate rank ≤ closing rank → eligible
        chanceForYear = candidateRank <= c.closingRank ? 'eligible' : 'not_eligible';
      }
      return {
        year:         c.year,
        openingRank:  c.openingRank,
        closingRank:  c.closingRank,
        cutoffScore:  c.cutoffScore,
        round:        c.round,
        category:     c.category,
        chanceForYear,
      };
    });

    // 6. Trend analysis — is closing rank getting stricter (lower number = harder)?
    let trend = 'insufficient_data';
    if (yearWise.length >= 2) {
      const ranks = yearWise.filter(y => y.closingRank).map(y => y.closingRank);
      if (ranks.length >= 2) {
        const diff = ranks[0] - ranks[ranks.length - 1]; // latest - oldest
        if (diff < -500)     trend = 'getting_harder';   // closing rank dropping (fewer students qualify)
        else if (diff > 500) trend = 'getting_easier';
        else                 trend = 'stable';
      }
    }

    // 7. Overall chance based on last year's cutoff
    let chance = null, bucket = null, color = null, reasoning = '';
    const latestCutoff = yearWise[0];
    if (latestCutoff && candidateRank && latestCutoff.closingRank) {
      const ratio = latestCutoff.closingRank / candidateRank;
      if      (ratio >= 1.5)  { chance = 90; bucket = 'High Chance';     color = 'green';  reasoning = `Your rank (${candidateRank}) is well within the closing rank (${latestCutoff.closingRank}) of last year.`; }
      else if (ratio >= 1.1)  { chance = 72; bucket = 'Good Chance';     color = 'green';  reasoning = `Your rank is inside last year's closing rank with some margin.`; }
      else if (ratio >= 0.95) { chance = 55; bucket = 'Moderate Chance'; color = 'yellow'; reasoning = `Your rank is right at the cutoff boundary — borderline.`; }
      else if (ratio >= 0.80) { chance = 35; bucket = 'Low Chance';      color = 'orange'; reasoning = `Your rank (${candidateRank}) is slightly beyond the closing rank (${latestCutoff.closingRank}).`; }
      else                    { chance = 15; bucket = 'Very Difficult';   color = 'red';    reasoning = `Your rank is significantly beyond the closing rank of last year.`; }

      // Adjust based on trend
      if (trend === 'getting_easier' && chance < 90)  chance = Math.min(chance + 8,  95);
      if (trend === 'getting_harder' && chance > 15)  chance = Math.max(chance - 8,  10);
    } else if (!latestCutoff) {
      // No cutoff data → fall back to NIRF-based estimate
      const nirfRank = cc.college?.accreditation?.nirfRank;
      const reqPct   = getRequiredPercentile(nirfRank);
      const pct      = percentile ? Number(percentile) : 70;
      chance  = Math.round(clamp((pct / reqPct) * 100, 0, 100));
      bucket  = getProbability(chance).bucket;
      color   = getProbability(chance).color;
      reasoning = 'No historical cutoff data available — estimated from NIRF ranking.';
    }

    // 8. Placement trend from yearWisePlacements
    const placements = (college?.yearWisePlacements || [])
      .filter(p => p.year >= currentYear - 3)
      .sort((a, b) => b.year - a.year);

    return {
      college:         cc.college,
      course:          cc.course,
      seatIntake:      cc.seatIntake,
      fees:            cc.fees,
      eligibility:     cc.eligibility,
      examsRequired:   cc.entranceExamRequirement,
      yearWiseCutoffs: yearWise,
      trend,
      chance,
      bucket,
      color,
      reasoning,
      candidateRank,
      placements,
      hasRealData: allCutoffs.length > 0,
    };
  }

}

module.exports = new PredictorService();
