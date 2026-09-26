import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileText, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/PortalLayout";
import { LifecycleBar, PROJECT_STAGES } from "@/components/LifecycleBar";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { EmptyState, Field, MilestoneBadge, Panel, PanelHeader, fmtDate } from "@/components/kit";
import type { MilestoneStatus, ProjectStatus } from "@/lib/types";

export const Route = createFileRoute("/university/projects/$id")({
  head: () => ({ meta: [
    { title: "Project workspace — University portal" },
    { name: "description", content: "Build a multidisciplinary team, submit the solution proposal, manage milestones and collaborate with industry." },
    { property: "og:title", content: "Project workspace — University portal" },
    { property: "og:description", content: "Team, proposal, lifecycle and milestone workspace." },
    { name: "robots", content: "noindex" },
  ] }),
  component: ProjectWorkspace,
});

const SUPPORT = ["Mentorship", "Funding", "Technology", "Hardware", "Prototyping", "Testing", "Deployment", "Pilot partner"];

function ProjectWorkspace() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { getProject, getChallenge, getUniversity, faculty, students, industry, proposals, setTeam, submitProposal, advanceProject, updateMilestone, addMilestoneComment } = useData();
  const project = getProject(id);
  const [tab, setTab] = useState<"overview" | "team" | "proposal" | "milestones">("overview");
  const [mentor, setMentor] = useState(project?.facultyMentorId ?? "");
  const [members, setMembers] = useState<string[]>(project?.studentIds ?? []);
  const [skills, setSkills] = useState(project?.requiredSkills.join(", ") ?? "");
  const [comment, setComment] = useState("");
  const [proposal, setProposal] = useState({ problemUnderstanding: "", proposedSolution: "", technology: "", innovation: "", expectedImpact: "", implementationPlan: "", estimatedBudget: "", timeline: "", requiredIndustrySupport: [] as string[], expectedBeneficiaries: "", documents: [] as string[] });

  if (!project) return <PortalLayout role="UNIVERSITY" title="Project not found"><EmptyState title="Project not found" action={<Link to="/university/projects" className="btn btn-outline btn-sm">Back to projects</Link>} /></PortalLayout>;
  const challenge = getChallenge(project.challengeId);
  const uni = getUniversity(project.universityId);
  const uniFaculty = faculty.filter((f) => f.universityId === project.universityId);
  const uniStudents = students.filter((s) => s.universityId === project.universityId);
  const existingProposal = proposals.find((p) => p.id === project.proposalId);
  const partners = industry.filter((i) => project.industryPartnerIds.includes(i.id));
  const tabs = [{ id: "overview", label: "Overview" }, { id: "team", label: "Team" }, { id: "proposal", label: "Proposal" }, { id: "milestones", label: "Milestones" }] as const;

  const saveTeam = () => {
    if (!mentor || members.length === 0) {
      toast.error("Choose a faculty mentor and at least one student.");
      return;
    }
    setTeam(project.id, { facultyMentorId: mentor, studentIds: members, requiredSkills: skills.split(",").map((s) => s.trim()).filter(Boolean) });
    toast.success("Multidisciplinary team saved.");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProposal(project.id, { ...proposal, expectedBeneficiaries: Number(proposal.expectedBeneficiaries) || challenge?.affectedPopulation || 0 });
    toast.success("Solution proposal submitted. Industry partners have been notified.");
    setTab("overview");
  };

  return <PortalLayout role="UNIVERSITY" title={project.title} subtitle={`${project.code} · ${uni?.shortName ?? "University"}`}>
    <div className="space-y-6">
      <Panel>
        <div className="px-5 py-5"><LifecycleBar status={project.status} /></div>
        <div className="flex flex-wrap border-t border-border px-3 py-2" role="tablist">
          {tabs.map((t) => <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`btn btn-sm ${tab === t.id ? "btn-primary" : "btn-ghost"}`}>{t.label}</button>)}
        </div>
      </Panel>

      {tab === "overview" && <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Panel><PanelHeader title="Project brief" subtitle={challenge?.category} />
          <div className="space-y-4 px-5 py-5">
            <p className="text-[13.5px] leading-relaxed text-ink">{challenge?.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><div className="eyebrow">Team</div><p className="mt-1 text-[13px] text-ink">{project.facultyMentorId ? "Faculty assigned" : "Needs faculty mentor"} · {project.studentIds.length} students</p></div>
              <div><div className="eyebrow">Industry support</div><p className="mt-1 text-[13px] text-ink">{partners.length ? partners.map((p) => p.name).join(", ") : "Seeking partners"}</p></div>
              <div><div className="eyebrow">Budget</div><p className="mt-1 text-[13px] text-ink">{project.estimatedBudget || "Pending proposal"}</p></div>
              <div><div className="eyebrow">Beneficiaries</div><p className="mt-1 text-[13px] text-ink">{challenge?.affectedPopulation.toLocaleString("en-IN") ?? "—"} people</p></div>
            </div>
            {!project.proposalId && <button className="btn btn-primary btn-sm" onClick={() => setTab("proposal")}><FileText className="size-4" /> Draft proposal</button>}
          </div>
        </Panel>
        <Panel><PanelHeader title="Next action" subtitle="Keep the project moving" />
          <div className="space-y-4 px-5 py-5">
            {!project.facultyMentorId && <button className="btn btn-outline w-full justify-start" onClick={() => setTab("team")}><Users className="size-4" /> Assemble project team</button>}
            {!project.proposalId && <button className="btn btn-outline w-full justify-start" onClick={() => setTab("proposal")}><FileText className="size-4" /> Submit solution proposal</button>}
            <Field label="Advance project stage"><select className="field" value={project.status} onChange={(e) => { advanceProject(project.id, e.target.value as ProjectStatus); toast.success("Project stage updated."); }}>{PROJECT_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></Field>
            {project.collaborations.map((c) => <div key={c.id} className="border-t border-border pt-3"><div className="eyebrow">Partner joined</div><p className="mt-1 text-[13px] font-medium text-ink">{c.partnerName}</p><p className="text-[12px] text-muted-foreground">{c.contributionTypes.join(", ")} · {c.estimatedSupport}</p></div>)}
          </div>
        </Panel>
      </div>}

      {tab === "team" && <Panel><PanelHeader title="Create multidisciplinary team" subtitle="Choose a faculty mentor and students across relevant disciplines." />
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-2">
          <div><div className="eyebrow mb-2">Faculty mentor</div><div className="space-y-2">{uniFaculty.map((f) => <label key={f.id} className={`block cursor-pointer border p-3 ${mentor === f.id ? "border-primary bg-primary/[0.04]" : "border-border"}`}><input type="radio" name="mentor" className="mr-2" checked={mentor === f.id} onChange={() => setMentor(f.id)} /><span className="text-[13px] font-medium text-ink">{f.name}</span><span className="ml-2 text-[12px] text-muted-foreground">{f.department} · {f.expertise.join(", ")}</span></label>)}</div></div>
          <div><div className="eyebrow mb-2">Students</div><div className="grid gap-2 sm:grid-cols-2">{uniStudents.map((s) => <label key={s.id} className={`cursor-pointer border p-3 ${members.includes(s.id) ? "border-primary bg-primary/[0.04]" : "border-border"}`}><input type="checkbox" className="mr-2" checked={members.includes(s.id)} onChange={() => setMembers((x) => x.includes(s.id) ? x.filter((i) => i !== s.id) : [...x, s.id])} /><span className="text-[13px] font-medium text-ink">{s.name}</span><p className="ml-5 text-[11.5px] text-muted-foreground">{s.department} · {s.year}</p></label>)}</div></div>
          <div className="lg:col-span-2"><Field label="Required skills" hint="Comma-separated"><input className="field" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="IoT, water chemistry, community research" /></Field></div>
          <div><button className="btn btn-primary" onClick={saveTeam}>Save team</button></div>
        </div>
      </Panel>}

      {tab === "proposal" && (existingProposal ? <Panel><PanelHeader title="Submitted solution proposal" subtitle={`Submitted ${fmtDate(existingProposal.submittedAt)} · ${existingProposal.status}`} />
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">{[["Problem understanding", existingProposal.problemUnderstanding], ["Proposed solution", existingProposal.proposedSolution], ["Technology", existingProposal.technology], ["Innovation", existingProposal.innovation], ["Expected impact", existingProposal.expectedImpact], ["Implementation plan", existingProposal.implementationPlan]].map(([l,v]) => <div key={l}><div className="eyebrow">{l}</div><p className="mt-1 text-[13px] leading-relaxed text-ink">{v}</p></div>)}</div>
      </Panel> : <Panel><PanelHeader title="Solution proposal" subtitle="A structured proposal makes government review and industry matching faster." />
        <form onSubmit={submit} className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          {([['problemUnderstanding','Problem understanding'],['proposedSolution','Proposed solution'],['technology','Technology'],['innovation','Innovation'],['expectedImpact','Expected impact'],['implementationPlan','Implementation plan']] as const).map(([k,l]) => <Field key={k} label={l} required><textarea className="field min-h-24" required value={proposal[k]} onChange={(e) => setProposal((p) => ({...p,[k]:e.target.value}))} /></Field>)}
          <Field label="Estimated budget" required><input className="field" required value={proposal.estimatedBudget} onChange={(e) => setProposal((p) => ({...p,estimatedBudget:e.target.value}))} placeholder="₹4.5 Lakh" /></Field>
          <Field label="Timeline" required><input className="field" required value={proposal.timeline} onChange={(e) => setProposal((p) => ({...p,timeline:e.target.value}))} placeholder="9 months" /></Field>
          <Field label="Expected community beneficiaries" required><input type="number" className="field" required value={proposal.expectedBeneficiaries} onChange={(e) => setProposal((p) => ({...p,expectedBeneficiaries:e.target.value}))} /></Field>
          <Field label="Supporting document"><button type="button" className="btn btn-outline w-full" onClick={() => setProposal((p) => ({...p,documents:[...p.documents,"solution-proposal.pdf"]}))}>Upload document {proposal.documents.length ? <Check className="size-4" /> : null}</button></Field>
          <div className="sm:col-span-2"><div className="eyebrow mb-2">Required industry support</div><div className="flex flex-wrap gap-2">{SUPPORT.map((s) => <label key={s} className={`cursor-pointer border px-3 py-2 text-[12.5px] ${proposal.requiredIndustrySupport.includes(s) ? "border-primary bg-primary/[0.04] text-primary" : "border-border text-ink"}`}><input type="checkbox" className="mr-2" checked={proposal.requiredIndustrySupport.includes(s)} onChange={() => setProposal((p) => ({...p,requiredIndustrySupport:p.requiredIndustrySupport.includes(s)?p.requiredIndustrySupport.filter((x)=>x!==s):[...p.requiredIndustrySupport,s]}))} />{s}</label>)}</div></div>
          <div className="sm:col-span-2"><button className="btn btn-primary btn-lg">Submit proposal</button></div>
        </form>
      </Panel>)}

      {tab === "milestones" && <div className="space-y-4">{project.milestones.map((m) => <Panel key={m.id}><div className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_180px_190px] lg:items-start"><div><div className="flex items-center gap-2"><h3 className="font-serif text-[17px] font-semibold text-ink">{m.name}</h3><MilestoneBadge status={m.status} /></div><p className="mt-1 text-[12px] text-muted-foreground">Owner: {m.owner} · due {fmtDate(m.deadline)} · {m.documents.length} document(s)</p>{m.comments.map((c,i) => <p key={i} className="mt-2 border-l-2 border-primary/40 pl-3 text-[12.5px] text-ink"><span className="font-medium">{c.author}:</span> {c.text}</p>)}</div><Field label="Status"><select className="field" value={m.status} onChange={(e) => updateMilestone(project.id,m.id,{status:e.target.value as MilestoneStatus})}>{["Pending","In Progress","Completed","Delayed"].map((s)=><option key={s}>{s}</option>)}</select></Field><div><Field label="Comment"><input className="field" value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Add update" /></Field><button type="button" className="btn btn-outline btn-sm mt-2" onClick={()=>{if(comment.trim()){addMilestoneComment(project.id,m.id,user?.name??"Team",comment);setComment("");toast.success("Comment added.")}}}><MessageSquare className="size-4" /> Add</button></div></div></Panel>)}</div>}
    </div>
  </PortalLayout>;
}
