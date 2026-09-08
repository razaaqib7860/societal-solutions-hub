export type Role = "CITIZEN" | "ADMIN" | "UNIVERSITY" | "INDUSTRY";

export type ChallengeStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VALIDATED"
  | "MATCHED"
  | "PROJECT_CREATED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "MERGED";

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type ProjectStatus =
  | "PROPOSAL"
  | "APPROVED"
  | "PROTOTYPE"
  | "TESTING"
  | "PILOT"
  | "DEPLOYMENT"
  | "IMPACT_MEASUREMENT";

export type MilestoneStatus = "Pending" | "In Progress" | "Completed" | "Delayed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization?: string;
  organizationId?: string;
  district?: string;
  title?: string;
}

export interface Location {
  district: string;
  block: string;
  village: string;
  lat: number;
  lng: number;
}

export interface Evidence {
  id: string;
  type: "photo" | "video" | "document";
  name: string;
  caption?: string;
}

export interface AIAnalysis {
  category: string;
  subcategory: string;
  severity: Severity;
  priorityScore: number;
  innovationScore: number;
  confidence: number;
  similarCount: number;
  summary: string;
  overridden?: boolean;
}

export interface UniversityMatch {
  universityId: string;
  score: number;
  reasons: string[];
}

export interface TimelineEntry {
  status: ChallengeStatus;
  at: string;
  by: string;
  note?: string;
}

export interface Challenge {
  id: string;
  code: string;
  submittedBy: string;
  submitterName: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  location: Location;
  affectedPopulation: number;
  issueDuration: string;
  frequency: string;
  urgency: string;
  severity: Severity;
  priorityScore: number;
  innovationScore: number;
  status: ChallengeStatus;
  evidence: Evidence[];
  similarChallenges: string[];
  reportCount: number;
  clusterId?: string;
  isMaster?: boolean;
  recommendedUniversities: UniversityMatch[];
  assignedUniversity?: string;
  projectId?: string;
  ai?: AIAnalysis;
  timeline: TimelineEntry[];
  createdAt: string;
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  expertise: string[];
  universityId: string;
}

export interface Student {
  id: string;
  name: string;
  department: string;
  year: string;
  universityId: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  district: string;
  departments: string[];
  researchAreas: string[];
  laboratories: string[];
  expertise: string[];
  previousProjects: number;
  activeProjects: number;
}

export interface IndustryPartner {
  id: string;
  name: string;
  sector: string;
  district: string;
  supportTypes: string[];
  capabilities: string[];
  csrBudgetLakh: number;
}

export interface Proposal {
  id: string;
  projectId: string;
  problemUnderstanding: string;
  proposedSolution: string;
  technology: string;
  innovation: string;
  expectedImpact: string;
  implementationPlan: string;
  estimatedBudget: string;
  timeline: string;
  requiredIndustrySupport: string[];
  expectedBeneficiaries: number;
  documents: string[];
  submittedAt: string;
  status: "SUBMITTED" | "APPROVED";
}

export interface MilestoneComment {
  author: string;
  text: string;
  at: string;
}

export interface Milestone {
  id: string;
  name: "Research" | "Prototype" | "Testing" | "Pilot" | "Deployment";
  deadline: string;
  owner: string;
  status: MilestoneStatus;
  documents: string[];
  comments: MilestoneComment[];
}

export interface Collaboration {
  id: string;
  projectId: string;
  partnerId: string;
  partnerName: string;
  contributionTypes: string[];
  estimatedSupport: string;
  message: string;
  status: "PENDING" | "ACCEPTED";
  at: string;
}

export interface ImpactMetric {
  id: string;
  projectId: string;
  label: string;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  challengeId: string;
  universityId: string;
  facultyMentorId?: string;
  studentIds: string[];
  requiredSkills: string[];
  industryPartnerIds: string[];
  proposalId?: string;
  milestones: Milestone[];
  status: ProjectStatus;
  requiredSupport: string[];
  estimatedBudget: string;
  collaborations: Collaboration[];
  impactMetrics: ImpactMetric[];
  createdAt: string;
}

export interface Notification {
  id: string;
  role: Role;
  userId?: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  link?: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}
