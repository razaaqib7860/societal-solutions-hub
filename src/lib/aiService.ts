import type { AIAnalysis, Challenge, ComplaintPriority, IndustryPartner, Severity, University, UniversityMatch } from "./types";

export const DOMAINS: Record<string, { subcategories: string[]; keywords: string[]; skills: string[] }> = {
  Healthcare: { subcategories: ["Hospital", "Medicine Availability", "Ambulance", "Medical Staff", "Healthcare Facility", "Maternal Health", "Other"], keywords: ["health", "hospital", "clinic", "doctor", "medicine", "ambulance", "pregnant", "malnutrition"], skills: ["Public Health", "Telemedicine", "Data Science"] },
  "Roads & Infrastructure": { subcategories: ["Pothole", "Damaged Road", "Street Light", "Drainage", "Public Building", "Footpath", "Bridge", "Other"], keywords: ["pothole", "road", "bridge", "footpath", "street light", "building", "drain"], skills: ["Civil Engineering", "GIS", "Operations Research"] },
  "Water & Sanitation": { subcategories: ["Water Supply", "Water Leakage", "Drainage", "Garbage", "Sewage", "Drinking Water", "Other"], keywords: ["water", "contamin", "drink", "well", "handpump", "fluoride", "arsenic", "tap", "sewage", "garbage", "toilet"], skills: ["IoT", "Environmental Science", "Chemistry", "Civil Engineering"] },
  Electricity: { subcategories: ["Power Outage", "Voltage Fluctuation", "Transformer", "Street Electricity", "Grid Connection", "Renewable Energy", "Other"], keywords: ["electric", "power", "outage", "transformer", "voltage", "grid", "solar"], skills: ["Electrical Engineering", "Renewable Energy", "Power Systems"] },
  Education: { subcategories: ["School Attendance", "Teacher Shortage", "Infrastructure", "Digital Access", "Learning Outcomes", "Scholarship", "Other"], keywords: ["school", "student", "teacher", "attendance", "dropout", "education", "learn", "scholarship"], skills: ["EdTech", "Behavioural Science", "Mobile Apps"] },
  Agriculture: { subcategories: ["Crop Disease", "Irrigation", "Soil Health", "Market Access", "Post-harvest Loss", "Seeds & Inputs", "Other"], keywords: ["crop", "farm", "paddy", "disease", "pest", "soil", "seed", "harvest", "irrigat", "canal"], skills: ["Computer Vision", "Agronomy", "Hydrology", "Mobile Apps"] },
  Transport: { subcategories: ["Public Bus Service", "Rural Connectivity", "Road Safety", "Last-mile Mobility", "Traffic Management", "Other"], keywords: ["bus", "transport", "traffic", "commut", "route", "vehicle"], skills: ["Operations Research", "GIS", "Mobile Apps"] },
  Environment: { subcategories: ["Air Pollution", "Water Pollution", "Solid Waste", "Deforestation", "Flooding & Waterlogging", "Climate Risk", "Other"], keywords: ["pollution", "waste", "plastic", "dump", "forest", "flood", "waterlog", "landslide", "smoke"], skills: ["Environmental Science", "GIS", "Circular Economy", "Hydrology"] },
  "Public Safety": { subcategories: ["Fire Hazard", "Unsafe Infrastructure", "Crime Risk", "Disaster Warning", "Women's Safety", "Other"], keywords: ["unsafe", "accident", "fire", "crime", "danger", "collapse", "emergency", "women"], skills: ["GIS", "Early Warning Systems", "Civil Engineering"] },
  Employment: { subcategories: ["Job Access", "Skills Training", "Worker Safety", "Migration", "Livelihood Support", "Other"], keywords: ["job", "employment", "unemployed", "skill", "livelihood", "migrate", "worker"], skills: ["Behavioural Science", "Data Science", "Mobile Apps"] },
  "Government Services": { subcategories: ["Documents & Certificates", "Benefits & Pensions", "Office Access", "Digital Services", "Service Delay", "Other"], keywords: ["certificate", "pension", "ration", "government office", "benefit", "service", "application"], skills: ["Mobile Apps", "Data Science", "Product Design"] },
  Other: { subcategories: ["Other"], keywords: [], skills: ["Product Design", "Data Science"] },
};

const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

export function classifyChallenge(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  let best = "Other";
  let bestScore = 0;
  for (const [domain, meta] of Object.entries(DOMAINS)) {
    const score = meta.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) { best = domain; bestScore = score; }
  }
  const subcategories = DOMAINS[best]?.subcategories ?? ["Other"];
  const preferred = subcategories.find((subcategory) => subcategory !== "Other" && text.includes(subcategory.toLowerCase().split(" ")[0] ?? ""));
  return { category: best, subcategory: preferred ?? (best === "Other" ? "Other" : subcategories[hash(text) % Math.max(1, subcategories.length - 1)] ?? "Other"), confidence: bestScore > 0 ? Math.min(0.97, 0.7 + bestScore * 0.07) : 0.38 };
}

export function calculatePriority(input: { title?: string; description?: string; affectedPopulation: number; urgency: string; frequency: string; issueDuration: string; category: string }) {
  const text = `${input.title ?? ""} ${input.description ?? ""}`.toLowerCase();
  let score = 25;
  score += Math.min(25, Math.log10(Math.max(1, input.affectedPopulation)) * 7);
  score += { Critical: 26, High: 18, Medium: 9, Low: 2 }[input.urgency] ?? 8;
  score += { Daily: 8, Continuous: 8, Weekly: 5, Recurring: 5, Seasonal: 3, Occasional: 2 }[input.frequency] ?? 3;
  score += { "More than 5 years": 6, "1-5 years": 5, "6-12 months": 3, "Less than 6 months": 1 }[input.issueDuration] ?? 2;
  if (includesAny(text, ["death", "fatal", "collapse", "burst", "contamin", "emergency", "fire", "accident", "unsafe"])) score += 15;
  if (includesAny(text, ["children", "pregnant", "hospital", "drinking water", "vaccine", "essential"])) score += 8;
  const priorityScore = Math.round(Math.min(98, score));
  const priority: ComplaintPriority = priorityScore >= 86 ? "CRITICAL" : priorityScore >= 70 ? "HIGH" : priorityScore >= 50 ? "MEDIUM" : "LOW";
  const severity: Severity = priority === "CRITICAL" ? "Critical" : priority === "HIGH" ? "High" : priority === "MEDIUM" ? "Medium" : "Low";
  const innovationScore = Math.round(Math.min(96, 55 + (hash(input.category + input.urgency) % 30) + (DOMAINS[input.category]?.skills.includes("IoT") ? 8 : 0)));
  return { priority, priorityScore, severity, innovationScore };
}

export function findDuplicates(challenge: Pick<Challenge, "category" | "location" | "id">, all: Challenge[]) {
  const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => { const R = 6371; const dLat = ((b.lat - a.lat) * Math.PI) / 180; const dLng = ((b.lng - a.lng) * Math.PI) / 180; const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  return all.filter((c) => c.id !== challenge.id && c.category === challenge.category && km(c.location, challenge.location) <= 5);
}

export function analyzeChallenge(input: Pick<Challenge, "title" | "description" | "affectedPopulation" | "urgency" | "frequency" | "issueDuration">, similarCount: number): AIAnalysis {
  try {
    const cls = classifyChallenge(input.title, input.description);
    const pr = calculatePriority({ ...input, category: cls.category });
    const reason = cls.category === "Other" ? "The complaint does not clearly fit an existing category and needs officer review." : `${pr.priority} priority reflects the reported risk, duration and impact on ${input.affectedPopulation.toLocaleString("en-IN")} people.`;
    return { ...cls, ...pr, similarCount, reason, summary: reason, aiClassified: cls.category !== "Other", requiresManualReview: cls.category === "Other" };
  } catch {
    return { category: "Other", subcategory: "Other", priority: "MEDIUM", severity: "Medium", priorityScore: 55, innovationScore: 50, confidence: 0, similarCount, reason: "AI classification unavailable. Manual review required.", summary: "AI classification unavailable. Manual review required.", aiClassified: false, requiresManualReview: true };
  }
}

export function matchUniversities(category: string, universities: University[]): UniversityMatch[] {
  const skills = DOMAINS[category]?.skills ?? [];
  return universities.map((u) => { const reasons: string[] = []; let score = 58; const hits = u.expertise.filter((e) => skills.some((s) => e.toLowerCase().includes(s.toLowerCase()))); if (hits.length) { score += hits.length * 9; reasons.push(`${hits.join(", ")} expertise`); } if (u.previousProjects > 5) { score += 4; reasons.push(`${u.previousProjects} previous societal projects`); } reasons.push("Relevant faculty available"); score -= hash(u.id + category) % 7; return { universityId: u.id, score: Math.min(97, Math.round(score)), reasons }; }).sort((a, b) => b.score - a.score);
}

export function matchIndustryPartners(category: string, partners: IndustryPartner[]) { const skills = DOMAINS[category]?.skills ?? []; return partners.map((p) => ({ partnerId: p.id, score: Math.min(95, 60 + p.capabilities.filter((c) => skills.some((s) => c.toLowerCase().includes(s.toLowerCase().split(" ")[0] ?? ""))).length * 12 + (hash(p.id + category) % 9)) })).sort((a, b) => b.score - a.score); }
export function suggestSolutions(category: string): string[] { const map: Record<string, string[]> = { "Water & Sanitation": ["IoT sensor network for continuous water-quality monitoring", "Low-cost point-of-use filtration with community maintenance model", "Mobile alert system for contamination events"], Agriculture: ["Smartphone-based crop disease detection", "Community advisory via agri-extension workers"], Healthcare: ["Telemedicine kiosks at panchayat level", "ASHA worker decision-support app"], Education: ["Attendance analytics with early-warning for dropouts", "Community learning circles"], Environment: ["Route-optimised collection with GPS tracking", "Decentralised composting units"], Electricity: ["Solar microgrid with pay-as-you-go metering", "Battery-backed community charging"] }; return map[category] ?? ["Multi-stakeholder pilot with measurable KPIs", "Community co-design workshops"]; }
