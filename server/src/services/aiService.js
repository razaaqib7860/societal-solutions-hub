import { env } from '../config/env.js';
import { DOMAINS } from '../utils/constants.js';

const KEYWORD_MAP = [
  { domain: 'Water Management', keywords: ['water', 'drinking', 'contamina', 'pond', 'well', 'borewell', 'hand pump', 'supply'] },
  { domain: 'Irrigation', keywords: ['irrigation', 'canal', 'crop water', 'field water', 'drip'] },
  { domain: 'Agriculture', keywords: ['crop', 'farm', 'pest', 'disease', 'harvest', 'soil', 'seed', 'yield'] },
  { domain: 'Healthcare', keywords: ['health', 'hospital', 'clinic', 'doctor', 'medicine', 'disease outbreak', 'maternal'] },
  { domain: 'Education', keywords: ['school', 'attendance', 'student', 'teacher', 'dropout', 'literacy'] },
  { domain: 'Waste Management', keywords: ['waste', 'garbage', 'sewage', 'sanitation', 'landfill', 'dump'] },
  { domain: 'Energy', keywords: ['electricity', 'power', 'solar', 'energy', 'outage', 'grid'] },
  { domain: 'Accessibility', keywords: ['disab', 'wheelchair', 'ramp', 'accessib', 'elderly'] },
  { domain: 'Disaster Management', keywords: ['flood', 'landslide', 'drought', 'disaster', 'earthquake', 'fire'] },
  { domain: 'Transport', keywords: ['bus', 'road', 'transport', 'traffic', 'vehicle', 'commute'] },
];

function hasAiApi() {
  return Boolean(env.AI_API_URL && env.AI_API_KEY);
}

async function callExternalAi(endpoint, payload) {
  const res = await fetch(`${env.AI_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`AI API request failed: ${res.status}`);
  return res.json();
}

function textOf(challenge) {
  return `${challenge.title || ''} ${challenge.description || ''} ${challenge.category || ''}`.toLowerCase();
}

/**
 * Classifies a challenge into a domain/category using keyword heuristics
 * (or a configured external AI service when available).
 * @param {object} challenge - plain object with title/description/category.
 * @returns {Promise<object>} classification with aiAssisted: true.
 */
export async function classifyChallenge(challenge) {
  if (hasAiApi()) {
    try {
      const result = await callExternalAi('/classify', challenge);
      return { ...result, aiAssisted: true };
    } catch (err) {
      console.warn('[aiService] external classify failed, falling back to mock:', err.message);
    }
  }

  const text = textOf(challenge);
  let best = { domain: 'Other', hits: 0 };
  for (const entry of KEYWORD_MAP) {
    const hits = entry.keywords.filter((kw) => text.includes(kw)).length;
    if (hits > best.hits) best = { domain: entry.domain, hits };
  }

  const category = best.hits > 0 ? best.domain : DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  const confidence = best.hits > 0 ? Math.min(0.6 + best.hits * 0.12, 0.97) : 0.4;

  return {
    category,
    subcategory: challenge.subcategory || `${category} - General`,
    confidence: Number(confidence.toFixed(2)),
    generatedAt: new Date(),
    aiAssisted: true,
  };
}

/**
 * Calculates a 0-100 priority score and innovation score for a challenge
 * based on affected population, urgency, severity and frequency.
 * @returns {Promise<object>} { priorityScore, innovationScore, aiAssisted }
 */
export async function calculatePriority(challenge) {
  if (hasAiApi()) {
    try {
      const result = await callExternalAi('/priority', challenge);
      return { ...result, aiAssisted: true };
    } catch (err) {
      console.warn('[aiService] external priority failed, falling back to mock:', err.message);
    }
  }

  const urgencyWeight = { Low: 10, Medium: 25, High: 40, Critical: 55 };
  const severityWeight = { Low: 5, Medium: 15, High: 25, Critical: 35 };
  const frequencyWeight = { 'One-time': 2, Occasional: 5, Recurring: 8, Continuous: 10 };
  const population = Number(challenge.affectedPopulation) || 0;
  const populationScore = Math.min(Math.log10(population + 1) * 8, 20);

  const priorityScore = Math.round(
    Math.min(
      (urgencyWeight[challenge.urgency] || 20) +
        (severityWeight[challenge.severity] || 15) +
        (frequencyWeight[challenge.frequency] || 5) +
        populationScore,
      100
    )
  );

  const innovationScore = Math.round(40 + Math.random() * 40);

  return { priorityScore, innovationScore, aiAssisted: true };
}

/**
 * Finds potential duplicate/similar challenges by comparing category, district,
 * and text overlap against a candidate pool.
 * @param {object} challenge - the new challenge.
 * @param {object[]} candidates - existing challenges (lean objects) to compare against.
 * @returns {Promise<object>} { duplicates: [{ challenge, score }], aiAssisted }
 */
export async function findDuplicates(challenge, candidates = []) {
  if (hasAiApi()) {
    try {
      const result = await callExternalAi('/duplicates', { challenge, candidates });
      return { ...result, aiAssisted: true };
    } catch (err) {
      console.warn('[aiService] external duplicates failed, falling back to mock:', err.message);
    }
  }

  const text = textOf(challenge);
  const words = new Set(text.split(/\W+/).filter((w) => w.length > 3));

  const scored = candidates
    .map((c) => {
      let score = 0;
      if (c.category && challenge.category && c.category === challenge.category) score += 0.35;
      if (c.location?.district && challenge.location?.district && c.location.district === challenge.location.district) score += 0.25;
      const cWords = new Set(textOf(c).split(/\W+/).filter((w) => w.length > 3));
      const overlap = [...words].filter((w) => cWords.has(w)).length;
      const overlapScore = words.size ? overlap / words.size : 0;
      score += overlapScore * 0.4;
      return { challenge: c._id || c.id, score: Number(score.toFixed(2)) };
    })
    .filter((entry) => entry.score >= 0.4)
    .sort((a, b) => b.score - a.score);

  return { duplicates: scored, aiAssisted: true };
}

/**
 * Recommends universities best suited to solve a given challenge based on
 * expertise tag / research area overlap with the challenge category.
 * @param {object} challenge - challenge with category/subcategory.
 * @param {object[]} universities - candidate university documents (lean).
 * @returns {Promise<object>} { recommendations: [{ university, score, reasons }], aiAssisted }
 */
export async function matchUniversities(challenge, universities = []) {
  if (hasAiApi()) {
    try {
      const result = await callExternalAi('/match-universities', { challenge, universities });
      return { ...result, aiAssisted: true };
    } catch (err) {
      console.warn('[aiService] external university match failed, falling back to mock:', err.message);
    }
  }

  const category = (challenge.category || '').toLowerCase();
  const recommendations = universities
    .map((u) => {
      const tags = [...(u.expertiseTags || []), ...(u.researchAreas || [])].map((t) => t.toLowerCase());
      const reasons = [];
      let score = 10;

      if (tags.some((t) => t.includes(category))) {
        score += 45;
        reasons.push(`Strong research alignment with ${challenge.category}`);
      }
      if (u.district && challenge.location?.district && u.district === challenge.location.district) {
        score += 20;
        reasons.push('Located in the same district as the reported issue');
      }
      if ((u.previousProjects || []).length > 0) {
        score += 10;
        reasons.push('Track record of prior societal-impact projects');
      }
      score += Math.round(Math.random() * 10);
      if (reasons.length === 0) reasons.push('General institutional capability match');

      return { university: u._id || u.id, score: Math.min(score, 100), reasons };
    })
    .sort((a, b) => b.score - a.score);

  return { recommendations, aiAssisted: true };
}

/**
 * Recommends industry partners capable of supporting a project based on
 * sector/capability overlap with the challenge domain.
 * @returns {Promise<object>} { recommendations: [{ industryPartner, score, reasons }], aiAssisted }
 */
export async function matchIndustryPartners(project, industryPartners = []) {
  if (hasAiApi()) {
    try {
      const result = await callExternalAi('/match-industry', { project, industryPartners });
      return { ...result, aiAssisted: true };
    } catch (err) {
      console.warn('[aiService] external industry match failed, falling back to mock:', err.message);
    }
  }

  const domain = (project.category || project.title || '').toLowerCase();
  const recommendations = industryPartners
    .map((p) => {
      const caps = [...(p.capabilities || []), p.sector || ''].map((c) => c.toLowerCase());
      const reasons = [];
      let score = 15;

      if (caps.some((c) => domain.includes(c) || c.includes(domain))) {
        score += 40;
        reasons.push(`Sector/capability match with project domain`);
      }
      if ((p.supportTypes || []).includes('CSR')) {
        score += 15;
        reasons.push('CSR budget available for societal projects');
      }
      score += Math.round(Math.random() * 15);
      if (reasons.length === 0) reasons.push('Potential general support partner');

      return { industryPartner: p._id || p.id, score: Math.min(score, 100), reasons };
    })
    .sort((a, b) => b.score - a.score);

  return { recommendations, aiAssisted: true };
}

/**
 * Suggests candidate solution directions for a challenge/proposal stage,
 * as inspiration only — humans must validate feasibility.
 * @returns {Promise<object>} { suggestions: string[], aiAssisted }
 */
export async function suggestSolutions(challenge) {
  if (hasAiApi()) {
    try {
      const result = await callExternalAi('/suggest-solutions', challenge);
      return { ...result, aiAssisted: true };
    } catch (err) {
      console.warn('[aiService] external suggestion failed, falling back to mock:', err.message);
    }
  }

  const category = challenge.category || 'General';
  const templates = {
    'Water Management': [
      'IoT-based water quality monitoring with real-time alerts',
      'Low-cost community filtration units',
      'Mobile app for reporting contamination hotspots',
    ],
    Agriculture: [
      'AI-based crop disease detection via smartphone imagery',
      'SMS/IVR advisory system for pest outbreaks',
      'Community soil-testing kiosks',
    ],
    Healthcare: [
      'Telemedicine kiosks in primary health centres',
      'Drone-based medicine delivery for remote villages',
      'Community health worker mobile diagnostics app',
    ],
  };

  const suggestions = templates[category] || [
    `Community-driven monitoring solution for ${category}`,
    `Low-cost sensor/IoT pilot addressing ${category}`,
    `Mobile-first citizen engagement tool for ${category}`,
  ];

  return { suggestions, aiAssisted: true };
}

export default {
  classifyChallenge,
  calculatePriority,
  findDuplicates,
  matchUniversities,
  matchIndustryPartners,
  suggestSolutions,
};
