import { Challenge } from '../models/index.js';
import { calculatePriority, findDuplicates } from './aiService.js';
import { classifyComplaint } from './aiClassifier.js';
import { recommendUniversitiesForChallenge } from './matchingService.js';

/**
 * Runs the full AI pipeline on a freshly created challenge: classification,
 * priority scoring, duplicate detection, and university recommendations.
 * Persists the results onto the challenge document.
 */
export async function runAiPipeline(challenge) {
  const [classification, scoring] = await Promise.all([
    classifyComplaint(challenge),
    calculatePriority(challenge).catch(() => ({ priorityScore: 55, innovationScore: 50 })),
  ]);

  challenge.category = challenge.category || classification.category;
  challenge.subcategory = challenge.subcategory || classification.subcategory;
  challenge.priority = classification.priority;
  challenge.severity = ({ LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' })[classification.priority];
  challenge.priorityScore = scoring.priorityScore;
  challenge.innovationScore = scoring.innovationScore;
  challenge.aiAnalysis = {
    category: classification.category,
    subcategory: classification.subcategory,
    severity: challenge.severity,
    priority: classification.priority,
    priorityScore: scoring.priorityScore,
    innovationScore: scoring.innovationScore,
    confidence: classification.confidence,
    reason: classification.reason,
    aiClassified: classification.aiClassified,
    requiresManualReview: classification.requiresManualReview,
    original: {
      category: classification.category,
      subcategory: classification.subcategory,
      priority: classification.priority,
      confidence: classification.confidence,
      reason: classification.reason,
    },
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
