import { z } from 'zod';
import { env } from '../config/env.js';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, SUBCATEGORIES } from '../utils/constants.js';

const outputSchema = z.object({
  category: z.enum(COMPLAINT_CATEGORIES),
  subcategory: z.string().trim().min(1).max(80),
  priority: z.enum(COMPLAINT_PRIORITIES),
  confidence: z.number().min(0).max(1),
  reason: z.string().trim().min(1).max(240),
}).strict();

export const CLASSIFICATION_FALLBACK = Object.freeze({
  category: 'Other', subcategory: 'Other', priority: 'MEDIUM', confidence: 0,
  reason: 'AI classification unavailable. Manual review required.',
  aiClassified: false, requiresManualReview: true,
});

export const CLASSIFIER_SYSTEM_PROMPT = `You are a civic complaint classification system. Analyze the complete complaint context. Choose only an allowed category and one of its subcategories. Determine priority from safety risk, health risk, affected population, emergency conditions, damage, duration, essential-service disruption and social impact. Allowed categories: ${COMPLAINT_CATEGORIES.join(', ')}. Allowed priorities: ${COMPLAINT_PRIORITIES.join(', ')}. Return only JSON with category, subcategory, priority, confidence and reason. Do not modify the complaint. Use Other with lower confidence when ambiguous.`;

const textIncludes = (text, terms) => terms.some((term) => text.includes(term));
const categoryRules = [
  ['Healthcare', ['hospital', 'doctor', 'medicine', 'ambulance', 'clinic', 'pregnant', 'health']],
  ['Roads & Infrastructure', ['pothole', 'damaged road', 'bridge', 'footpath', 'street light', 'road']],
  ['Water & Sanitation', ['water', 'handpump', 'sewage', 'garbage', 'sanitation', 'toilet', 'drainage']],
  ['Electricity', ['electricity', 'power', 'transformer', 'voltage', 'outage', 'solar']],
  ['Education', ['school', 'teacher', 'student', 'attendance', 'education', 'dropout']],
  ['Agriculture', ['crop', 'farm', 'paddy', 'soil', 'seed', 'irrigation', 'canal']],
  ['Transport', ['bus', 'transport', 'traffic', 'commute', 'vehicle']],
  ['Environment', ['pollution', 'plastic', 'forest', 'flood', 'waterlogging', 'smoke']],
  ['Public Safety', ['unsafe', 'accident', 'fire', 'crime', 'collapse', 'danger']],
  ['Employment', ['job', 'employment', 'worker', 'livelihood', 'migration']],
  ['Government Services', ['certificate', 'pension', 'ration', 'government office', 'benefit']],
];

function heuristic(input) {
  const text = `${input.title || ''} ${input.description || ''}`.toLowerCase();
  let category = 'Other'; let hits = 0;
  for (const [candidate, keywords] of categoryRules) { const count = keywords.filter((word) => text.includes(word)).length; if (count > hits) { category = candidate; hits = count; } }
  const choices = SUBCATEGORIES[category] || ['Other'];
  const subcategory = choices.find((value) => value !== 'Other' && text.includes(value.toLowerCase().split(' ')[0])) || (category === 'Other' ? 'Other' : choices[0]);
  let points = Math.min(25, Math.log10(Math.max(1, Number(input.affectedPopulation) || 1)) * 7);
  points += ({ Critical: 45, High: 30, Medium: 18, Low: 5 })[input.urgency] || 12;
  if (textIncludes(text, ['death', 'fatal', 'collapse', 'burst', 'contamin', 'emergency', 'fire', 'accident'])) points += 22;
  if (textIncludes(text, ['children', 'pregnant', 'drinking water', 'hospital', 'vaccine'])) points += 10;
  const priority = points >= 76 ? 'CRITICAL' : points >= 58 ? 'HIGH' : points >= 38 ? 'MEDIUM' : 'LOW';
  return { category, subcategory, priority, confidence: hits ? Math.min(0.97, 0.7 + hits * 0.07) : 0.35, reason: category === 'Other' ? 'The complaint is ambiguous and needs manual category review.' : `${priority} priority reflects the reported risk and impact on approximately ${Number(input.affectedPopulation) || 0} people.` };
}

async function externalClassification(input) {
  const response = await fetch(`${env.AI_API_URL}/classify`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AI_API_KEY}` }, body: JSON.stringify({ system: CLASSIFIER_SYSTEM_PROMPT, complaint: { title: input.title, description: input.description, affectedPopulation: input.affectedPopulation, issueDuration: input.issueDuration, frequency: input.frequency, urgency: input.urgency } }) });
  if (!response.ok) throw new Error(`AI classification failed with status ${response.status}`);
  return response.json();
}

export function validateClassification(value) {
  const parsed = outputSchema.parse(value);
  if (!(SUBCATEGORIES[parsed.category] || ['Other']).includes(parsed.subcategory)) throw new Error('AI returned an invalid subcategory');
  return parsed;
}

export async function classifyComplaint(input) {
  try {
    const raw = env.AI_API_URL && env.AI_API_KEY ? await externalClassification(input) : heuristic(input);
    const result = validateClassification(raw);
    const needsReview = result.category === 'Other' || result.confidence < 0.5;
    return { ...result, aiClassified: true, requiresManualReview: needsReview };
  } catch (error) {
    console.warn('[aiClassifier] classification unavailable:', error instanceof Error ? error.message : 'Unknown error');
    return { ...CLASSIFICATION_FALLBACK };
  }
}
