const College       = require('../models/College');
const Course        = require('../models/Course');
const Exam          = require('../models/Exam');
const CollegeCourse = require('../models/CollegeCourse');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// NIRF rank → minimum percentile needed (fallback when no real cutoff data)
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

const getProbability = (chance) => {
  if (chance >= 80) return { bucket: 'High Chance',     color: 'green'  };
  if (chance >= 60) return { bucket: 'Good Chance',     color: 'green'  };
  if (chance >= 45) return { bucket: 'Moderate Chance', color: 'yellow' };
  if (chance >= 25) return { bucket: 'Low Chance',      color: 'orange' };
  return             { bucket: 'Very Difficult',         color: 'red'    };
};

// Approximate conversions (JEE-scale; good enough for general use)
const rankToPercentile = (rank, total = 1200000) =>
  clamp(((total - rank) / total) * 100, 0, 100);

const percentileToRank = (pct, total = 1200000) =>
  Math.round((1 - pct / 100) * total);

// Score candidate rank vs a college's closing rank
const chanceFromRanks = (candidateRank, closingRank) => {
  if (!candidateRank || !closingRank) return null;
  const ratio = closingRank / candidateRank;
  if (ratio >= 2.0)  return 92;
  if (ratio >= 1.5)  return 85;
  if (ratio >= 1.2)  return 75;
  if (ratio >= 1.05) return 62;
  if (ratio >= 0.95) return 48;  // borderline
  if (ratio >= 0.80) return 30;
  if (ratio >= 0.65) return 18;
  return 8;
};

// Pick the most relevant cutoff entry from an array
const pickBestCutoff = (cutoffs, category, examId, currentYear) => {
  if (!cutoffs || cutoffs.length === 0) return null;
  const recent = cutoffs.filter(c => c.year >= currentYear - 3);
  const score = (c) => {
    let s = 0;
    if (c.year === currentYear - 1) s += 30;
    else if (c.year === currentYear - 2) s += 20;
    else if (c.year === currentYear - 3) s += 10;
    if (examId && String(c.exam) === String(examId)) s += 20;
    if (c.category === category) s += 15;
    else if (c.category === 'General') s += 5;
    return s;
  };
  const sorted = [...recent].sort((a, b) => score(b) - score(a));
  return sorted[0] || null;
};

// ─── Service ─────────────────────────────────────────────────────────────────

class PredictorService {

  /* ═══════════════════════════════════════════════════════════════════════════
     COLLEGE PREDICTOR — browsing mode
     Uses real CollegeCourse.examCutoffs when available,
     falls back to NIRF + fee + location heuristic otherwise.
  ══════════════════════════════════════════════════════════════════════════════*/
  async predictColleges({
    percentile, rank, cgpa,
    stream, state, maxFee,
    category = 'General',
    examId, examRank,
    highestQualification,  // '10th','12th','UG','PG','Diploma'
    yearOfPassing,         // e.g. 2023
    instituteName,         // previous school/college name
    limit = 30
  })
 {
  // Recency penalty: older passouts get slight disadvantage for freshness
  const passingYear = Number(yearOfPassing) || new Date().getFullYear();
  const yearsGap = new Date().getFullYear() - passingYear;
  const recencyMultiplier = yearsGap <= 1 ? 1.0 : yearsGap <= 3 ? 0.97 : yearsGap <= 5 ? 0.93 : 0.88;

    const currentYear = new Date().getFullYear();

    const filter = { deletedAt: null };
    if (stream) filter.collegeType      = stream;
    if (state)  filter['contact.state'] = new RegExp(state.trim(), 'i');
    if (maxFee) filter['fees.total']    = { $lte: Number(maxFee) };

    const colleges = await College.find(filter)
      .select('name slug coverImageUrl collegeType fundingType accreditation fees contact placementStats campusInfo hostel cutoffs admissionProcess')
      .lean();

    // Normalise candidate score
    const pct = cgpa
    ? Math.min(Number(cgpa) * 9.5, 100)
    : percentile
      ? Number(percentile)
      : rank ? rankToPercentile(Number(rank)) : 70;


    const candidateRank = rank
      ? Number(rank)
      : percentileToRank(pct);

    // Batch-fetch CollegeCourse cutoffs for all matched colleges in one query
    const collegeIds = colleges.map(c => c._id);
    const ccRecords  = await CollegeCourse.find({
      college:   { $in: collegeIds },
      deletedAt: null,
      isActive:  true,
    }).select('college examCutoffs fees cutoff').lean();

    // Build map: collegeId → best cutoff entry
    const ccCutoffMap = {};
    for (const cc of ccRecords) {
      const best = pickBestCutoff(cc.examCutoffs, category, examId, currentYear);
      const key  = String(cc.college);
      if (best) {
        if (!ccCutoffMap[key] || (best.closingRank > (ccCutoffMap[key].closingRank || 0))) {
          ccCutoffMap[key] = { ...best, simpleCutoff: cc.cutoff };
        }
      } else if (cc.cutoff && !ccCutoffMap[key]) {
        ccCutoffMap[key] = { simpleCutoff: cc.cutoff };
      }
    }

    // Score each college
    const results = colleges.map(college => {
      const key          = String(college._id);
      const ccEntry      = ccCutoffMap[key];
      const collegeLevelCutoff = pickBestCutoff(college.cutoffs || [], category, examId, currentYear);
      const activeCutoff = ccEntry || collegeLevelCutoff;

      let chance, hasRealData, dataNote, lastYearClosingRank = null;

      if (activeCutoff?.closingRank) {
        hasRealData         = true;
        lastYearClosingRank = activeCutoff.closingRank;
        chance  = chanceFromRanks(candidateRank, activeCutoff.closingRank);
        dataNote = `Cutoff (${activeCutoff.year || 'recent'}, ${activeCutoff.category || category})`;
      } else if (activeCutoff?.simpleCutoff) {
        hasRealData = true;
        dataNote    = 'Cutoff score data';
        const ratio = pct / activeCutoff.simpleCutoff;
        chance = Math.round(clamp(ratio * 70, 0, 90));
      } else {
        hasRealData = false;
        dataNote    = 'NIRF estimate';
        const nirfRank        = college.accreditation?.nirfRank;
        const reqPct          = getRequiredPercentile(nirfRank);
        const percentileScore = clamp((pct / reqPct) * 100, 0, 100);
        const feeScore        = maxFee ? (college.fees?.total <= Number(maxFee) ? 100 : 25) : 100;
        const locationScore   = state  ? (college.contact?.state?.toLowerCase().includes(state.toLowerCase()) ? 100 : 55) : 100;
        chance = Math.round(percentileScore * 0.70 + feeScore * 0.15 + locationScore * 0.15);
      }

      // Apply recency modifier
      chance = Math.round(clamp((chance || 0) * recencyMultiplier, 0, 100));

      // If examRank is provided, prefer it over percentile-derived rank
      if (examRank && activeCutoff?.closingRank) {
        chance = chanceFromRanks(Number(examRank), activeCutoff.closingRank);
        chance = Math.round(clamp(chance * recencyMultiplier, 0, 100));
      }

      return {
        ...college,
        chance:             clamp(chance || 0, 0, 100),
        hasRealData,
        dataNote,
        lastYearClosingRank,
        candidateRank,
        ...getProbability(clamp(chance || 0, 0, 100)),
      };
    });

    results.sort((a, b) => b.chance - a.chance);
    return results.slice(0, Number(limit));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     DETAILED COLLEGE ANALYSIS — specific college + course
     Uses last 3 years of real cutoff data, computes trend & reasoning.
  ══════════════════════════════════════════════════════════════════════════════*/
  async getCollegeDetailedAnalysis({ collegeId, courseId, examId, rank, percentile, category = 'General' }) {
    const currentYear = new Date().getFullYear();

    const cc = await CollegeCourse.findOne({ college: collegeId, course: courseId, deletedAt: null })
      .populate('college', 'name slug accreditation fees contact collegeType placementStats yearWisePlacements cutoffs admissionProcess')
      .populate('course',  'name slug category discipline duration mode feeRange eligibility')
      .populate('entranceExamRequirement', 'name slug category examLevel')
      .lean();

    if (!cc) return null;

    // Gather cutoffs from both sources
    const ccCutoffs = (cc.examCutoffs || []).filter(c => {
      const yearOk = c.year >= currentYear - 3;
      const catOk  = !c.category || c.category === category || c.category === 'General';
      const examOk = !examId || String(c.exam) === String(examId);
      return yearOk && catOk && examOk;
    });

    const collegeLevelCutoffs = ((cc.college?.cutoffs) || []).filter(c => {
      const yearOk   = c.year >= currentYear - 3;
      const catOk    = !c.category || c.category === category || c.category === 'General';
      const examOk   = !examId || String(c.exam) === String(examId);
      const courseOk = !courseId || String(c.course) === String(courseId);
      return yearOk && catOk && examOk && courseOk;
    });

    // Merge (prefer cc, avoid year duplicates)
    const ccYears   = new Set(ccCutoffs.map(c => c.year));
    const allCutoffs = [
      ...ccCutoffs,
      ...collegeLevelCutoffs.filter(c => !ccYears.has(c.year)),
    ].sort((a, b) => b.year - a.year);

    // Normalise candidate score
    const pct = percentile
      ? Number(percentile)
      : rank ? rankToPercentile(Number(rank)) : null;

    const candidateRank = rank
      ? Number(rank)
      : pct ? percentileToRank(pct) : null;

    // Year-wise breakdown
    const yearWise = allCutoffs.map(c => {
      let result = null;
      if (candidateRank && c.closingRank) {
        result = candidateRank <= c.closingRank ? 'Would have qualified' : 'Would NOT have qualified';
      }
      return {
        year:        c.year,
        openingRank: c.openingRank  || null,
        closingRank: c.closingRank  || null,
        cutoffScore: c.cutoffScore  || null,
        round:       c.round        || null,
        category:    c.category     || category,
        result,
      };
    });

    // Trend
    let trend = 'insufficient_data', trendLabel = 'Not enough data';
    const rankedYears = yearWise.filter(y => y.closingRank);
    if (rankedYears.length >= 2) {
      const latest = rankedYears[0].closingRank;
      const oldest = rankedYears[rankedYears.length - 1].closingRank;
      const diff   = latest - oldest;
      if      (diff < -1000) { trend = 'getting_harder'; trendLabel = 'Getting Harder ↑'; }
      else if (diff >  1000) { trend = 'getting_easier'; trendLabel = 'Getting Easier ↓'; }
      else                   { trend = 'stable';          trendLabel = 'Stable →';          }
    }

    // Overall chance
    let chance = null, bucket = null, color = null, reasoning = 'No cutoff data available — showing estimate.';
    const latestCutoff = yearWise[0];

    if (latestCutoff?.closingRank && candidateRank) {
      chance = chanceFromRanks(candidateRank, latestCutoff.closingRank);
      const margin = latestCutoff.closingRank - candidateRank;
      reasoning = margin >= 0
        ? `Your rank (${candidateRank.toLocaleString()}) is ${margin.toLocaleString()} ranks better than last year's closing rank (${latestCutoff.closingRank.toLocaleString()}).`
        : `Your rank (${candidateRank.toLocaleString()}) exceeds last year's closing rank (${latestCutoff.closingRank.toLocaleString()}) by ${Math.abs(margin).toLocaleString()} places.`;

      if (trend === 'getting_easier') { chance = Math.min(chance + 7, 95); reasoning += ' Cutoff relaxing — slightly better odds.'; }
      if (trend === 'getting_harder') { chance = Math.max(chance - 7,  5); reasoning += ' Cutoff tightening — factor in extra competition.'; }
      if (trend === 'stable')         { reasoning += ' Cutoff has been stable in recent years.'; }
    } else if (latestCutoff?.cutoffScore && pct) {
      const ratio = pct / latestCutoff.cutoffScore;
      chance  = Math.round(clamp(ratio * 70, 5, 90));
      reasoning = `Based on cutoff score. Your score (${pct}) vs cutoff (${latestCutoff.cutoffScore}).`;
    } else {
      const nirfRank  = cc.college?.accreditation?.nirfRank;
      const reqPct    = getRequiredPercentile(nirfRank);
      const cpct      = pct || 70;
      chance = Math.round(clamp((cpct / reqPct) * 100, 0, 100));
      reasoning = `No historical cutoff data found. Estimated from NIRF rank (${nirfRank || 'unranked'}).`;
    }

    const prob = getProbability(clamp(chance || 0, 0, 100));
    bucket = prob.bucket; color = prob.color;

    // Placement trend
    const placements = (cc.college?.yearWisePlacements || [])
      .filter(p => p.year >= currentYear - 3)
      .sort((a, b) => b.year - a.year);

    return {
      college:             cc.college,
      course:              cc.course,
      seatIntake:          cc.seatIntake  || null,
      fees:                cc.fees        || null,
      eligibility:         cc.eligibility || null,
      examsRequired:       cc.entranceExamRequirement || [],
      yearWiseCutoffs:     yearWise,
      trend,
      trendLabel,
      chance:              clamp(chance || 0, 0, 100),
      bucket,
      color,
      reasoning,
      candidateRank,
      candidatePercentile: pct,
      placements,
      hasRealData:         allCutoffs.length > 0,
      dataSource:          allCutoffs.length > 0 ? 'Historical cutoff data' : 'NIRF estimate',
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     COURSE PREDICTOR
  ══════════════════════════════════════════════════════════════════════════════*/
  async predictCourses({
    percentage, cgpa,
    level,          // 'UG','PG','Diploma','Certificate','PhD'
    discipline,
    interests = '', // comma-separated: 'coding,design,finance'
    highestQualification, // '10th','12th','UG','PG'
    limit = 30
  })
 {
    const filter = { deletedAt: null };
    if (level)      filter.category   = level;
    if (discipline) filter.discipline = new RegExp(discipline.trim(), 'i');

    const courses = await Course.find(filter)
      .select('name slug category discipline duration mode feeRange eligibility careerProspects admissionType')
      .lean();

    const pct = cgpa ? Math.min(Number(cgpa) * 9.5, 100) : Number(percentage) || 60;
    const interestList = interests ? interests.toLowerCase().split(',').map(s => s.trim()) : [];

    const results = courses.map(course => {
      let score;

      // Base score from percentage/CGPA
      if      (pct >= 85) score = 88;
      else if (pct >= 75) score = 78;
      else if (pct >= 60) score = 65;
      else if (pct >= 50) score = 50;
      else                score = 28;

      // Qualification gate: PG courses need UG degree
      if (level === 'PG' && ['10th','12th'].includes(highestQualification)) score = Math.min(score, 20);
      if (level === 'PhD' && !['PG','UG'].includes(highestQualification))  score = Math.min(score, 15);

      // Interest matching bonus (checks course name, discipline, careerProspects)
      if (interestList.length > 0) {
        const haystack = [
          course.name, course.discipline, course.category,
          ...(course.careerProspects || [])
        ].join(' ').toLowerCase();

        const matchCount = interestList.filter(i => haystack.includes(i)).length;
        const interestBonus = Math.min(matchCount * 12, 20); // max +20 pts
        score = Math.min(score + interestBonus, 98);
      }

      // Discipline filter exact-match bonus
      if (discipline && course.discipline?.toLowerCase().includes(discipline.toLowerCase())) {
        score = Math.min(score + 8, 98);
      }

      return { ...course, chance: score, ...getProbability(score) };
    });


    results.sort((a, b) => b.chance - a.chance);
    return results.slice(0, Number(limit));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     EXAM PREDICTOR
  ══════════════════════════════════════════════════════════════════════════════*/
  async predictExams({
    discipline,
    level,
    targetCollegeIds = '',   // comma-separated college IDs
    targetCourseIds  = '',   // comma-separated course IDs
    limit = 20
  })
 {

    // Look up required exams for targeted colleges/courses
    let requiredExamIds = new Set();

    if (targetCollegeIds || targetCourseIds) {
      const ccFilter = { deletedAt: null, isActive: true };
      if (targetCollegeIds) {
        const ids = targetCollegeIds.split(',').map(id => id.trim()).filter(Boolean);
        if (ids.length) ccFilter.college = { $in: ids };
      }
      if (targetCourseIds) {
        const ids = targetCourseIds.split(',').map(id => id.trim()).filter(Boolean);
        if (ids.length) ccFilter.course = { $in: ids };
      }
      const ccRecords = await CollegeCourse.find(ccFilter)
        .select('entranceExamRequirement')
        .lean();
      ccRecords.forEach(cc => {
        (cc.entranceExamRequirement || []).forEach(eid => requiredExamIds.add(String(eid)));
      });
    }

    // const filter = { deletedAt: null };
    // if (level) filter.category = level;

    // const exams = await Exam.find(filter)
    //   .select('name slug category examLevel conductingBody registrationFee examMode frequency overview officialWebsite importantDates eligibilityDetails')
    //   .lean();

    const results = exams.map(exam => {
      let relevance = 50;
      const examIdStr = String(exam._id);

      // Highest priority: exam directly required by target college/course
      if (requiredExamIds.has(examIdStr)) {
        relevance = 98;
      } else if (discipline) {
        const haystack = `${exam.name} ${exam.overview || ''}`.toLowerCase();
        if (haystack.includes(discipline.toLowerCase())) relevance = 88;
        else if (exam.examLevel === 'National')           relevance = 68;
        else                                              relevance = 45;
      } else {
        if (exam.examLevel === 'National')     relevance = 78;
        else if (exam.examLevel === 'State')   relevance = 65;
        else                                   relevance = 52;
      }

      // Level filter alignment
      if (level && exam.category && exam.category.toLowerCase() !== level.toLowerCase()) {
        relevance = Math.max(relevance - 20, 10);
      }

      return { ...exam, chance: relevance, isRequired: requiredExamIds.has(examIdStr), ...getProbability(relevance) };
    });


    results.sort((a, b) => b.chance - a.chance);
    return results.slice(0, Number(limit));
  }
}

module.exports = new PredictorService();
