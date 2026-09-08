import { University, IndustryPartner } from '../models/index.js';
import { matchUniversities, matchIndustryPartners } from './aiService.js';

/**
 * Runs the AI university matcher against all universities and returns the
 * top N recommendations for a challenge.
 */
export async function recommendUniversitiesForChallenge(challenge, limit = 5) {
  const universities = await University.find().lean();
  const { recommendations, aiAssisted } = await matchUniversities(challenge, universities);
  return { recommendations: recommendations.slice(0, limit), aiAssisted };
}

/**
 * Runs the AI industry matcher against all industry partners and returns the
 * top N recommendations for a project.
 */
export async function recommendIndustryForProject(project, limit = 5) {
  const partners = await IndustryPartner.find().lean();
  const { recommendations, aiAssisted } = await matchIndustryPartners(project, partners);
  return { recommendations: recommendations.slice(0, limit), aiAssisted };
}

export default { recommendUniversitiesForChallenge, recommendIndustryForProject };
