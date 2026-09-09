/**
 * AI service abstraction.
 * Every function here returns AI-assisted suggestions that must be reviewed by an
 * administrator. Replace the mock implementations with calls to a real ML service
 * (see /server/src/services/aiService.js for the Express equivalent).
 */
import type { AIAnalysis, Challenge, IndustryPartner, Severity, University, UniversityMatch } from "./types";

export const DOMAINS: Record<string, { subcategories: string[]; keywords: string[]; skills: string[] }> = {
  "Water Management": {
    subcategories: ["Drinking Water Quality", "Groundwater Depletion", "Water Supply Infrastructure"],
    keywords: ["water", "contamin", "drink", "well", "handpump", "fluoride", "arsenic", "tap"],
    skills: ["IoT", "Environmental Science", "Chemistry", "Civil Engineering"],
  },
  Agriculture: {
    subcategories: ["Crop Disease", "Soil Health", "Market Access", "Post-harvest Loss"],
    keywords: ["crop", "farm", "paddy", "disease", "pest", "soil", "seed", "harvest"],
    skills: ["Computer Vision", "Agronomy", "Mobile Apps"],
  },
  Irrigation: {
    subcategories: ["Canal Maintenance", "Micro-irrigation", "Rainwater Harvesting"],
    keywords: ["irrigat", "canal", "rainfed", "drip", "pond"],
    skills: ["Civil Engineering", "Hydrology", "IoT"],
  },
  Healthcare: {
    subcategories: ["Primary Care Access", "Maternal Health", "Telemedicine", "Malnutrition"],
    keywords: ["health", "clinic", "doctor", "hospital", "medicine", "phc", "anaemia", "malnutrition"],
    skills: ["Telemedicine", "Public Health", "Data Science"],
  },
  Education: {
    subcategories: ["School Attendance", "Digital Literacy", "Learning Outcomes", "Teacher Shortage"],
    keywords: ["school", "student", "teacher", "attendance", "dropout", "education", "learn"],
    skills: ["EdTech", "Behavioural Science", "Mobile Apps"],
  },
  "Waste Management": {
    subcategories: ["Solid Waste Collection", "Plastic Waste", "Sanitation", "Drain Blockage"],
    keywords: ["waste", "garbage", "plastic", "dump", "sanitation", "toilet", "litter"],
    skills: ["Environmental Engineering", "Logistics", "Circular Economy"],
  },
  Energy: {
    subcategories: ["Rural Electrification", "Solar Microgrid", "Clean Cooking"],
    keywords: ["solar", "electric", "power", "light", "energy", "grid", "fuel"],
    skills: ["Electrical Engineering", "Renewable Energy", "Power Systems"],
  },
  Accessibility: {
    subcategories: ["Public Infrastructure", "Assistive Technology", "Inclusive Mobility"],
    keywords: ["disab", "wheelchair", "ramp", "access", "blind", "elderly"],
    skills: ["Product Design", "Civil Engineering", "Assistive Tech"],
  },
  "Disaster Management": {
    subcategories: ["Flooding", "Waterlogging", "Landslide", "Heatwave"],
    keywords: ["flood", "waterlog", "rain", "landslide", "heat", "storm"],
    skills: ["GIS", "Hydrology", "Early Warning Systems"],
  },
  Transport: {
    subcategories: ["Rural Connectivity", "Public Bus Service", "Road Safety", "Last-mile Mobility"],
    keywords: ["bus", "transport", "road", "traffic", "commut", "route"],
    skills: ["Operations Research", "GIS", "Mobile Apps"],
  },
};

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export function classifyChallenge(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  let best = "Water Management";
  let bestScore = 0;
  for (const [domain, meta] of Object.entries(DOMAINS)) {
    const score = meta.keywords.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0);
    if (score > bestScore) {
      best = domain;
      bestScore = score;
    }
  }
  const subs = DOMAINS[best]!.subcategories;
  return {
    category: best,
    subcategory: subs[hash(text) % subs.length]!,

    confidence: bestScore > 0 ? Math.min(0.97, 0.72 + bestScore * 0.06) : 0.61,
  };
}

export function calculatePriority(input: {
  affectedPopulation: number;
  urgency: string;
  frequency: string;
  issueDuration: string;
  category: string;
}) {
  let score = 40;
  score += Math.min(30, Math.log10(Math.max(1, input.affectedPopulation)) * 8);
  score += { Critical: 20, High: 14, Medium: 7, Low: 2 }[input.urgency] ?? 7;
  score += { Daily: 8, Weekly: 5, Seasonal: 4, Occasional: 2 }[input.frequency] ?? 4;
  score += { "More than 5 years": 6, "1-5 years": 4, "6-12 months": 2, "Less than 6 months": 1 }[input.issueDuration] ?? 2;
  if (["Water Management", "Healthcare"].includes(input.category)) score += 4;
  const priorityScore = Math.round(Math.min(98, score));
  const severity: Severity =
    priorityScore >= 88 ? "Critical" : priorityScore >= 75 ? "High" : priorityScore >= 55 ? "Medium" : "Low";
  const innovationScore = Math.round(Math.min(96, 55 + (hash(input.category + input.urgency) % 30) + (DOMAINS[input.category]?.skills.includes("IoT") ? 8 : 0)));
  return { priorityScore, severity, innovationScore };
}

export function findDuplicates(challenge: Pick<Challenge, "category" | "location" | "id">, all: Challenge[]) {
  const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };
  return all.filter(
    (c) => c.id !== challenge.id && c.category === challenge.category && km(c.location, challenge.location) <= 5,
  );
}

export function analyzeChallenge(
  input: Pick<Challenge, "title" | "description" | "affectedPopulation" | "urgency" | "frequency" | "issueDuration">,
  similarCount: number,
): AIAnalysis {
  const cls = classifyChallenge(input.title, input.description);
  const pr = calculatePriority({ ...input, category: cls.category });
  return {
    ...cls,
    ...pr,
    similarCount,
    summary: `Classified under ${cls.category} › ${cls.subcategory}. Priority reflects ${input.affectedPopulation.toLocaleString("en-IN")} affected residents, ${input.urgency.toLowerCase()} urgency and ${similarCount} related reports nearby.`,
  };
}

export function matchUniversities(category: string, universities: University[]): UniversityMatch[] {
  const skills = DOMAINS[category]?.skills ?? [];
  return universities
    .map((u) => {
      const reasons: string[] = [];
      let score = 58;
      const expertiseHits = u.expertise.filter((e) => skills.some((s) => e.toLowerCase().includes(s.toLowerCase())));
      if (expertiseHits.length) {
        score += expertiseHits.length * 9;
        reasons.push(`${expertiseHits.join(", ")} expertise`);
      }
      const research = u.researchAreas.filter((r) => r.toLowerCase().includes(category.split(" ")[0]!.toLowerCase()));
      if (research.length) {
        score += 8;
        reasons.push(`Active research: ${research[0]}`);
      }
      const labs = u.laboratories.filter((l) => skills.some((s) => l.toLowerCase().includes(s.toLowerCase().split(" ")[0]!)));

      if (labs.length) {
        score += 6;
        reasons.push(`Suitable laboratory: ${labs[0]}`);
      }
      if (u.previousProjects > 5) {
        score += 4;
        reasons.push(`${u.previousProjects} previous societal projects`);
      }
      reasons.push("Relevant faculty available");
      score -= hash(u.id + category) % 7;
      return { universityId: u.id, score: Math.min(97, Math.round(score)), reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export function matchIndustryPartners(category: string, partners: IndustryPartner[]) {
  const skills = DOMAINS[category]?.skills ?? [];
  return partners
    .map((p) => {
      const hits = p.capabilities.filter((c) => skills.some((s) => c.toLowerCase().includes(s.toLowerCase().split(" ")[0]!)));
      return { partnerId: p.id, score: Math.min(95, 60 + hits.length * 12 + (hash(p.id + category) % 9)) };
    })
    .sort((a, b) => b.score - a.score);
}

export function suggestSolutions(category: string): string[] {
  const map: Record<string, string[]> = {
    "Water Management": [
      "IoT sensor network for continuous water-quality monitoring",
      "Low-cost point-of-use filtration with community maintenance model",
      "Mobile alert system for contamination events",
    ],
    Agriculture: ["Smartphone-based crop disease detection", "Community advisory via agri-extension workers"],
    Healthcare: ["Telemedicine kiosks at panchayat level", "ASHA worker decision-support app"],
    Education: ["Attendance analytics with early-warning for dropouts", "Community learning circles"],
    "Waste Management": ["Route-optimised collection with GPS tracking", "Decentralised composting units"],
    Energy: ["Solar microgrid with pay-as-you-go metering", "Battery-backed community charging"],
  };
  return map[category] ?? ["Multi-stakeholder pilot with measurable KPIs", "Community co-design workshops"];
}
