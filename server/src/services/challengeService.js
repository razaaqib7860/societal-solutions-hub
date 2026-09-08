import { Challenge } from '../models/index.js';
import { classifyChallenge, calculatePriority, findDuplicates } from './aiService.js';
import { recommendUniversitiesForChallenge } from './matchingService.js';

/**
 * Runs the full AI pipeline on a freshly created challenge: classification,
 * priority scoring, duplicate detection, and university recommendations.
 * Persists the results onto the challenge document.
 */
export async function runAiPipeline(challenge) {
  const [classification, priority] = await Promise.all([
    classifyChallenge(challenge),
    calculatePriority(challenge),
  ]);

  challenge.category = challenge.category || classification.category;
  challenge.subcategory = challenge.subcategory || classification.subcategory;
  challenge.priorityScore = priority.priorityScore;
  challenge.innovationScore = priority.innovationScore;
  challenge.aiAnalysis = {
    category: classification.category,
    subcategory: classification.subcategory,
    severity: challenge.severity,
    priorityScore: priority.priorityScore,
    innovationScore: priority.innovationScore,
    confidence: classification.confidence,
    generatedAt: new Date(),
    aiAssisted: true,
  };

  const candidates = await Challenge.find({
    _id: { $ne: challenge._id },
    status: { $nin: ['REJECTED', 'MERGED'] },
  })
    .limit(100)
    .lean();

  const { duplicates } = await findDuplicates(challenge, candidates);
  challenge.similarChallenges = duplicates.map((d) => d.challenge);

  const { recommendations } = await recommendUniversitiesForChallenge(challenge, 5);
  challenge.recommendedUniversities = recommendations;

  challenge.timeline.push({ status: challenge.status, at: new Date(), note: 'AI pipeline executed' });

  return challenge;
}

export default { runAiPipeline };
