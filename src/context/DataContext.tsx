import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  CHALLENGES,
  CLUSTER_REPORTS,
  FACULTY,
  INDUSTRY,
  NOTIFICATIONS,
  PROJECTS,
  STUDENTS,
  UNIVERSITIES,
} from "@/lib/seed";
import { analyzeChallenge, findDuplicates, matchUniversities } from "@/lib/aiService";
import type {
  AIAnalysis,
  Challenge,
  ChallengeStatus,
  Collaboration,
  Milestone,
  Notification,
  Project,
  ProjectStatus,
  Proposal,
  Role,
  Severity,
} from "@/lib/types";

/**
 * In-session data store. Each action mirrors one REST endpoint of the
 * reference Express API in /server (see server/README.md).
 */
interface DataValue {
  challenges: Challenge[];
  projects: Project[];
  proposals: Proposal[];
  notifications: Notification[];
  universities: typeof UNIVERSITIES;
  faculty: typeof FACULTY;
  students: typeof STUDENTS;
  industry: typeof INDUSTRY;
  getChallenge: (id: string) => Challenge | undefined;
  getProject: (id: string) => Project | undefined;
  getUniversity: (id?: string) => (typeof UNIVERSITIES)[number] | undefined;
  clusterOf: (challenge: Challenge) => Challenge[];
  submitChallenge: (input: SubmitInput) => { challenge: Challenge; analysis: AIAnalysis };
  setStatus: (id: string, status: ChallengeStatus, by: string, note?: string) => void;
  mergeCluster: (id: string, by: string) => void;
  overrideClassification: (id: string, patch: { category: string; subcategory: string; severity: Severity }, by: string) => void;
  assignUniversity: (id: string, universityId: string, by: string) => void;
  acceptChallenge: (challengeId: string, universityId: string, by: string) => Project;
  setTeam: (projectId: string, team: { facultyMentorId: string; studentIds: string[]; requiredSkills: string[] }) => void;
  submitProposal: (projectId: string, data: Omit<Proposal, "id" | "projectId" | "submittedAt" | "status">) => void;
  addCollaboration: (projectId: string, data: Omit<Collaboration, "id" | "projectId" | "status" | "at">) => void;
  advanceProject: (projectId: string, status: ProjectStatus) => void;
  updateMilestone: (projectId: string, milestoneId: string, patch: Partial<Milestone>) => void;
  addMilestoneComment: (projectId: string, milestoneId: string, author: string, text: string) => void;
  recordImpact: (projectId: string, label: string, value: number, unit: string) => void;
  notify: (n: Omit<Notification, "id" | "at" | "read">) => void;
  markAllRead: (role: Role) => void;
}

export interface SubmitInput {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  district: string;
  block: string;
  village: string;
  lat: number;
  lng: number;
  affectedPopulation: number;
  issueDuration: string;
  frequency: string;
  urgency: string;
  evidenceNames: { type: "photo" | "video" | "document"; name: string }[];
  submittedBy: string;
  submitterName: string;
}

const DataContext = createContext<DataValue | null>(null);
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function DataProvider({ children }: { children: ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>([...CHALLENGES, ...CLUSTER_REPORTS]);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "prop-1",
      projectId: "prj-1",
      problemUnderstanding:
        "23 reports from Raidih block point to groundwater contamination affecting roughly 850 residents. There is no mechanism for continuous water-quality testing at the source.",
      proposedSolution:
        "A network of low-cost LoRa-connected sensor nodes fitted to handpumps, measuring TDS, turbidity, pH and iron, with a dashboard and SMS alerts for the panchayat and block health officer.",
      technology: "ESP32 + LoRaWAN, calibrated electrochemical sensors, Node.js ingestion service, React dashboard",
      innovation: "Sensor nodes are field-serviceable by trained village volunteers, cutting maintenance cost by ~70% versus commercial units.",
      expectedImpact: "Contamination events detected within hours instead of months; measurable reduction in waterborne illness at the PHC.",
      implementationPlan: "Baseline survey → node prototype → 30-day lab and field testing → 12-node pilot in Raidih → block-wide deployment with district authority.",
      estimatedBudget: "₹4.5 Lakh",
      timeline: "9 months",
      requiredIndustrySupport: ["₹2L funding", "IoT hardware", "Technical mentor", "Pilot partner"],
      expectedBeneficiaries: 850,
      documents: ["proposal-water-quality-iiitr.pdf", "bill-of-materials.xlsx"],
      submittedAt: new Date(Date.now() - 45 * 864e5).toISOString(),
      status: "APPROVED",
    },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);

  const notify = useCallback((n: Omit<Notification, "id" | "at" | "read">) => {
    setNotifications((prev) => [{ ...n, id: uid("n"), at: now(), read: false }, ...prev]);
  }, []);

  const patchChallenge = useCallback((id: string, fn: (c: Challenge) => Challenge) => {
    setChallenges((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const patchProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const submitChallenge = useCallback<DataValue["submitChallenge"]>(
    (input) => {
      const id = uid("ch");
      const base: Challenge = {
        id,
        code: `JH-CH-${Math.floor(2000 + Math.random() * 7999)}`,
        submittedBy: input.submittedBy,
        submitterName: input.submitterName,
        title: input.title,
        description: input.description,
        category: input.category,
        subcategory: input.subcategory,
        location: { district: input.district, block: input.block, village: input.village, lat: input.lat, lng: input.lng },
        affectedPopulation: input.affectedPopulation,
        issueDuration: input.issueDuration,
        frequency: input.frequency,
        urgency: input.urgency,
        severity: "Medium",
        priorityScore: 0,
        innovationScore: 0,
        status: "SUBMITTED",
        evidence: input.evidenceNames.map((e) => ({ id: uid("ev"), type: e.type, name: e.name })),
        similarChallenges: [],
        reportCount: 1,
        recommendedUniversities: [],
        timeline: [{ status: "SUBMITTED", at: now(), by: input.submitterName }],
        createdAt: now(),
      };
      const similar = findDuplicates(base, challenges);
      const analysis = analyzeChallenge(base, similar.length);
      const scored: Challenge = {
        ...base,
        category: analysis.category,
        subcategory: input.subcategory || analysis.subcategory,
        severity: analysis.severity,
        priorityScore: analysis.priorityScore,
        innovationScore: analysis.innovationScore,
        similarChallenges: similar.slice(0, 30).map((s) => s.id),
        reportCount: 1 + similar.length,
        ai: analysis,
        recommendedUniversities: matchUniversities(analysis.category, UNIVERSITIES).slice(0, 3),
      };
      setChallenges((prev) => [scored, ...prev]);
      notify({
        role: "ADMIN",
        title: similar.length > 3 ? `${similar.length} similar challenges detected` : "New challenge submitted",
        body: `${scored.title} — ${scored.location.district}. AI-assisted priority ${scored.priorityScore}/100.`,
        link: `/admin/challenges/${id}`,
      });
      return { challenge: scored, analysis };
    },
    [challenges, notify],
  );

  const setStatus = useCallback<DataValue["setStatus"]>(
    (id, status, by, note) => {
      patchChallenge(id, (c) => ({
        ...c,
        status,
        timeline: [...c.timeline, { status, at: now(), by, ...(note ? { note } : {}) }],
      }));
    },
    [patchChallenge],
  );

  const mergeCluster = useCallback<DataValue["mergeCluster"]>(
    (id, by) => {
      const master = challenges.find((c) => c.id === id);
      if (!master) return;
      const ids = new Set(master.similarChallenges);
      setChallenges((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              isMaster: true,
              clusterId: c.clusterId ?? uid("cl"),
              reportCount: 1 + ids.size,
              affectedPopulation: c.affectedPopulation,
              timeline: [...c.timeline, { status: c.status, at: now(), by, note: `Merged ${ids.size} similar reports into master challenge` }],
            };
          }
          return ids.has(c.id) ? { ...c, status: "MERGED" as ChallengeStatus, clusterId: master.clusterId ?? c.clusterId } : c;
        }),
      );
    },
    [challenges],
  );

  const overrideClassification = useCallback<DataValue["overrideClassification"]>(
    (id, patch, by) => {
      patchChallenge(id, (c) => ({
        ...c,
        ...patch,
        ...(c.ai ? { ai: { ...c.ai, overridden: true } } : {}),
        timeline: [...c.timeline, { status: c.status, at: now(), by, note: `Classification overridden to ${patch.category} › ${patch.subcategory}` }],
      }));
    },
    [patchChallenge],
  );

  const assignUniversity = useCallback<DataValue["assignUniversity"]>(
    (id, universityId, by) => {
      const uni = UNIVERSITIES.find((u) => u.id === universityId);
      patchChallenge(id, (c) => ({
        ...c,
        assignedUniversity: universityId,
        status: "MATCHED",
        timeline: [...c.timeline, { status: "MATCHED", at: now(), by, note: `Assigned to ${uni?.shortName ?? universityId}` }],
      }));
      const ch = challenges.find((c) => c.id === id);
      notify({
        role: "UNIVERSITY",
        title: "New challenge matched your institution",
        body: `${ch?.title ?? "A validated challenge"} was routed to ${uni?.shortName ?? "your institution"} by the state nodal officer.`,
        link: `/university/challenges/${id}`,
      });
      notify({ role: "CITIZEN", title: "Your challenge has been matched", body: `${uni?.shortName} will work on "${ch?.title}".`, link: `/citizen/challenges/${id}` });
    },
    [challenges, notify, patchChallenge],
  );

  const acceptChallenge = useCallback<DataValue["acceptChallenge"]>(
    (challengeId, universityId, by) => {
      const ch = challenges.find((c) => c.id === challengeId);
      const existing = projects.find((p) => p.challengeId === challengeId);
      if (existing) return existing;
      const deadline = (d: number) => new Date(Date.now() + d * 864e5).toISOString();
      const project: Project = {
        id: uid("prj"),
        code: `JH-PRJ-${Math.floor(100 + Math.random() * 899)}`,
        title: ch ? `Solution for: ${ch.title}` : "New project",
        challengeId,
        universityId,
        studentIds: [],
        requiredSkills: [],
        industryPartnerIds: [],
        status: "PROPOSAL",
        requiredSupport: [],
        estimatedBudget: "To be estimated",
        collaborations: [],
        impactMetrics: [],
        createdAt: now(),
        milestones: (["Research", "Prototype", "Testing", "Pilot", "Deployment"] as const).map((n, i) => ({
          id: uid("ms"),
          name: n,
          deadline: deadline(30 * (i + 1)),
          owner: by,
          status: i === 0 ? ("In Progress" as const) : ("Pending" as const),
          documents: [],
          comments: [],
        })),
      };
      setProjects((prev) => [project, ...prev]);
      patchChallenge(challengeId, (c) => ({
        ...c,
        status: "PROJECT_CREATED",
        projectId: project.id,
        assignedUniversity: universityId,
        timeline: [...c.timeline, { status: "PROJECT_CREATED", at: now(), by, note: "Challenge accepted and project workspace created" }],
      }));
      notify({ role: "ADMIN", title: "University accepted a challenge", body: `${ch?.title ?? "Challenge"} accepted; project ${project.code} created.`, link: `/admin/challenges/${challengeId}` });
      notify({ role: "CITIZEN", title: "A project has started on your challenge", body: `${ch?.title ?? "Your challenge"} now has a university project team.`, link: `/citizen/challenges/${challengeId}` });
      return project;
    },
    [challenges, projects, notify, patchChallenge],
  );

  const setTeam = useCallback<DataValue["setTeam"]>(
    (projectId, team) => {
      patchProject(projectId, (p) => ({ ...p, facultyMentorId: team.facultyMentorId, studentIds: team.studentIds, requiredSkills: team.requiredSkills }));
    },
    [patchProject],
  );

  const submitProposal = useCallback<DataValue["submitProposal"]>(
    (projectId, data) => {
      const proposal: Proposal = { ...data, id: uid("prop"), projectId, submittedAt: now(), status: "SUBMITTED" };
      setProposals((prev) => [proposal, ...prev]);
      patchProject(projectId, (p) => ({
        ...p,
        proposalId: proposal.id,
        estimatedBudget: data.estimatedBudget,
        requiredSupport: data.requiredIndustrySupport,
        status: p.status === "PROPOSAL" ? "APPROVED" : p.status,
      }));
      const project = projects.find((p) => p.id === projectId);
      const uni = UNIVERSITIES.find((u) => u.id === project?.universityId);
      notify({
        role: "INDUSTRY",
        title: `${uni?.shortName ?? "A university"} is seeking industry support`,
        body: `${project?.title ?? "Project"} needs ${data.requiredIndustrySupport.join(", ") || "industry collaboration"}.`,
        link: `/industry/projects/${projectId}`,
      });
      notify({ role: "ADMIN", title: "Solution proposal submitted", body: `${uni?.shortName} submitted a proposal for ${project?.code}.`, link: "/admin/projects" });
    },
    [projects, notify, patchProject],
  );

  const addCollaboration = useCallback<DataValue["addCollaboration"]>(
    (projectId, data) => {
      const collab: Collaboration = { ...data, id: uid("col"), projectId, status: "ACCEPTED", at: now() };
      patchProject(projectId, (p) => ({
        ...p,
        collaborations: [collab, ...p.collaborations],
        industryPartnerIds: p.industryPartnerIds.includes(data.partnerId) ? p.industryPartnerIds : [...p.industryPartnerIds, data.partnerId],
        status: p.status === "PROPOSAL" || p.status === "APPROVED" ? "PROTOTYPE" : p.status,
      }));
      const project = projects.find((p) => p.id === projectId);
      notify({ role: "UNIVERSITY", title: "Industry partner joined your project", body: `${data.partnerName} offered ${data.contributionTypes.join(", ")} — ${data.estimatedSupport}.`, link: `/university/projects/${projectId}` });
      notify({ role: "ADMIN", title: "New industry partnership", body: `${data.partnerName} partnered with ${project?.code ?? "a project"}.`, link: "/admin/projects" });
    },
    [projects, notify, patchProject],
  );

  const advanceProject = useCallback<DataValue["advanceProject"]>(
    (projectId, status) => {
      patchProject(projectId, (p) => ({ ...p, status }));
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === project.challengeId
              ? {
                  ...c,
                  status: status === "IMPACT_MEASUREMENT" ? "RESOLVED" : "IN_PROGRESS",
                  timeline: [...c.timeline, { status: status === "IMPACT_MEASUREMENT" ? ("RESOLVED" as ChallengeStatus) : ("IN_PROGRESS" as ChallengeStatus), at: now(), by: "University", note: `Project stage: ${status}` }],
                }
              : c,
          ),
        );
      }
    },
    [projects, patchProject],
  );

  const updateMilestone = useCallback<DataValue["updateMilestone"]>(
    (projectId, milestoneId, patch) => {
      patchProject(projectId, (p) => ({ ...p, milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, ...patch } : m)) }));
    },
    [patchProject],
  );

  const addMilestoneComment = useCallback<DataValue["addMilestoneComment"]>(
    (projectId, milestoneId, author, text) => {
      patchProject(projectId, (p) => ({
        ...p,
        milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, comments: [...m.comments, { author, text, at: now() }] } : m)),
      }));
    },
    [patchProject],
  );

  const recordImpact = useCallback<DataValue["recordImpact"]>(
    (projectId, label, value, unit) => {
      patchProject(projectId, (p) => ({
        ...p,
        impactMetrics: [...p.impactMetrics, { id: uid("im"), projectId, label, value, unit, recordedAt: now() }],
      }));
    },
    [patchProject],
  );

  const markAllRead = useCallback((role: Role) => {
    setNotifications((prev) => prev.map((n) => (n.role === role ? { ...n, read: true } : n)));
  }, []);

  const value = useMemo<DataValue>(
    () => ({
      challenges,
      projects,
      proposals,
      notifications,
      universities: UNIVERSITIES,
      faculty: FACULTY,
      students: STUDENTS,
      industry: INDUSTRY,
      getChallenge: (id) => challenges.find((c) => c.id === id),
      getProject: (id) => projects.find((p) => p.id === id),
      getUniversity: (id) => UNIVERSITIES.find((u) => u.id === id),
      clusterOf: (challenge) =>
        challenges.filter((c) => c.id !== challenge.id && ((challenge.clusterId && c.clusterId === challenge.clusterId) || challenge.similarChallenges.includes(c.id))),
      submitChallenge,
      setStatus,
      mergeCluster,
      overrideClassification,
      assignUniversity,
      acceptChallenge,
      setTeam,
      submitProposal,
      addCollaboration,
      advanceProject,
      updateMilestone,
      addMilestoneComment,
      recordImpact,
      notify,
      markAllRead,
    }),
    [
      challenges,
      projects,
      proposals,
      notifications,
      submitChallenge,
      setStatus,
      mergeCluster,
      overrideClassification,
      assignUniversity,
      acceptChallenge,
      setTeam,
      submitProposal,
      addCollaboration,
      advanceProject,
      updateMilestone,
      addMilestoneComment,
      recordImpact,
      notify,
      markAllRead,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
