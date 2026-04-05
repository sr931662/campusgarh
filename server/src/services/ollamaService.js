/**
 * AI Analysis Service
 *
 * Priority order:
 *   1. Groq API  — if GROQ_API_KEY is set (free, cloud, fast, works on Vercel/any host)
 *   2. Ollama    — local fallback at OLLAMA_URL (default: http://localhost:11434)
 *
 * Setup for production (Groq — recommended):
 *   1. Sign up free at https://console.groq.com
 *   2. Create an API key
 *   3. Add to backend .env:  GROQ_API_KEY=gsk_xxxxxxxxxxxx
 *
 * Setup for local dev (Ollama):
 *   1. Install Ollama: https://ollama.com
 *   2. Run: ollama pull qwen3:1.5b && ollama serve
 *   3. Leave GROQ_API_KEY unset and backend will auto-use Ollama
 */

const GROQ_API_KEY  = process.env.GROQ_API_KEY;
const GROQ_MODEL    = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_BASE     = 'https://api.groq.com/openai/v1';

const OLLAMA_BASE   = process.env.OLLAMA_URL  || 'http://localhost:11434';
const OLLAMA_MODEL  = process.env.OLLAMA_MODEL || 'qwen3:1.5b';

// Strips Qwen3 thinking tags
const stripThinking = (text) => text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

// ─── Custom errors ────────────────────────────────────────────────────────────

class AIUnavailableError extends Error {
  constructor(message = 'AI service is unavailable') {
    super(message);
    this.statusCode = 503;
    this.code = 'OLLAMA_UNAVAILABLE'; // keep same code for frontend compat
  }
}

// ─── Groq provider ───────────────────────────────────────────────────────────

async function callGroq(prompt) {
  const response = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Groq API error ${response.status}: ${err?.error?.message || 'unknown'}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'Analysis unavailable.';
}

// ─── Ollama provider ──────────────────────────────────────────────────────────

async function callOllama(prompt) {
  let response;
  try {
    response = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `/no_think\n${prompt}`,
        stream: false,
        options: { temperature: 0.7, num_predict: 400 },
      }),
      signal: AbortSignal.timeout(35000),
    });
  } catch (err) {
    // Connection refused / network error — Ollama not running
    throw new AIUnavailableError(
      'Ollama is not reachable. Start it with: ollama serve'
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new AIUnavailableError(
        `Ollama model "${OLLAMA_MODEL}" not found. Run: ollama pull ${OLLAMA_MODEL}`
      );
    }
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return stripThinking(data.response || '') || 'Analysis unavailable.';
}

// ─── OllamaService (main export) ─────────────────────────────────────────────

class OllamaService {
  /**
   * Generate AI analysis — tries Groq first if key is set, else Ollama.
   */
  async generateAnalysis(prompt) {
    if (GROQ_API_KEY) {
      return callGroq(prompt);
    }
    return callOllama(prompt);
  }

  /** Health check — returns { available: bool, provider: string } */
  async checkHealth() {
    if (GROQ_API_KEY) return { available: true, provider: 'groq' };
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return { available: res.ok, provider: 'ollama' };
    } catch {
      return { available: false, provider: 'ollama' };
    }
  }

  // ─── Prompt builders (unchanged) ───────────────────────────────────────────

  buildCollegePredictionPrompt(userProfile, topColleges) {
    const top5 = topColleges.slice(0, 5).map((c, i) =>
      `${i + 1}. ${c.name} — ${c.chance}% chance (${c.bucket}), NIRF: ${c.accreditation?.nirfRank || 'N/A'}, Location: ${c.contact?.state || 'N/A'}`
    ).join('\n');
    return `You are a college admission counsellor in India. Give short, practical advice (3-4 sentences, no bullet points, no headings) for this student:
Profile: ${userProfile.rank ? `Rank ${userProfile.rank}` : `${userProfile.percentile}%ile`}, Stream: ${userProfile.stream || 'Any'}, Category: ${userProfile.category || 'General'}, Preferred State: ${userProfile.state || 'Any'}, Budget: ${userProfile.maxFee ? `₹${Number(userProfile.maxFee).toLocaleString()}` : 'Open'}.

Top predicted colleges:
${top5}

Mention 1-2 best colleges by name, advise on safety options if needed, note any important considerations.`;
  }

  buildDetailedAnalysisPrompt(userProfile, analysisData) {
    const { college, course, chance, bucket, reasoning, trendLabel, yearWiseCutoffs } = analysisData;
    const cuts = (yearWiseCutoffs || []).slice(0, 3).map(y =>
      `${y.year}: Closing Rank ${y.closingRank || 'N/A'}`
    ).join(', ');
    return `You are a college admission expert in India. Give a 3-4 sentence expert insight (no bullet points, no headings):
College: ${college?.name}, Course: ${course?.name} (${course?.category})
Student: Rank ${userProfile.rank || 'N/A'} / ${userProfile.percentile || 'N/A'}%ile, Category: ${userProfile.category || 'General'}
Admission chance: ${chance}% (${bucket}), Cutoff trend: ${trendLabel}
Recent 3-year cutoffs: ${cuts || 'No data available'}
System analysis: ${reasoning}

Interpret the cutoff trend, whether to prioritize this college, and give one specific actionable tip.`;
  }

  buildCoursePredictionPrompt(userProfile, topCourses) {
    const top5 = topCourses.slice(0, 5).map((c, i) =>
      `${i + 1}. ${c.name} (${c.discipline || 'General'}, ${c.category}) — ${c.chance}% match`
    ).join('\n');
    return `You are an academic counsellor in India. Give 3-4 sentences of career-oriented course advice (no bullet points, no headings):
Student: Score ${userProfile.cgpa ? `${userProfile.cgpa} CGPA` : `${userProfile.percentage}%`}, Level: ${userProfile.level || 'UG'}, Interests: ${userProfile.interests || 'Not specified'}, Highest qualification: ${userProfile.highestQualification || 'N/A'}.

Top course matches:
${top5}

Name the single best-fit course, explain why it suits this student's profile, and mention realistic career prospects.`;
  }

  buildExamPredictionPrompt(userProfile, topExams) {
    const required = topExams.filter(e => e.isRequired).map(e => e.name).join(', ') || 'None identified';
    const top5 = topExams.slice(0, 5).map((e, i) =>
      `${i + 1}. ${e.name} (${e.examLevel}${e.isRequired ? ', REQUIRED' : ''}) — ${e.chance}% relevance`
    ).join('\n');
    return `You are an entrance exam expert in India. Give 3-4 sentences of practical exam strategy (no bullet points, no headings):
Student target discipline: ${userProfile.discipline || 'Not specified'}, Level: ${userProfile.level || 'UG'}.
Exams required by target colleges: ${required}

Recommended exams:
${top5}

Name the most critical exam(s), advise when to start preparing, and specifically flag any mandatory exams.`;
  }
}

module.exports = new OllamaService();
