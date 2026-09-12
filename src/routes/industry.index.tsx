import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { LifecycleBar } from "@/components/LifecycleBar";
import { EmptyState, Metric, Panel, PanelHeader } from "@/components/kit";

export const Route = createFileRoute("/industry/")({
  head: () => ({ meta: [
    { title: "Industry Collaboration Hub — Partner portal" },
    { name: "description", content: "Discover university projects seeking funding, technology, hardware, mentors, testing and deployment support." },
    { property: "og:title", content: "Industry Collaboration Hub — Partner portal" },
    { property: "og:description", content: "Back credible societal innovation projects across Jharkhand." },
    { name: "robots", content: "noindex" },
  ] }), component: IndustryHome,
});

function IndustryHome() {
  const { user } = useAuth();
  const { projects, getUniversity, industry, notifications } = useData();
  const partnerId = user?.organizationId ?? industry[0]!.id;
  const seeking = projects.filter((p) => p.requiredSupport.length > 0);
  const mine = projects.filter((p) => p.industryPartnerIds.includes(partnerId));
  const mentorship = seeking.filter((p) => p.requiredSupport.some((s) => s.toLowerCase().includes("mentor")));
  const funding = seeking.filter((p) => p.requiredSupport.some((s) => s.includes("₹") || s.toLowerCase().includes("fund")));
  return <PortalLayout role="INDUSTRY" title="Industry Collaboration Hub" subtitle={`${user?.organization ?? "Industry partner"} · discover where your resources can create measurable public value.`}>
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Projects seeking support" value={seeking.length} tone="accent" /><Metric label="Active partnerships" value={mine.length} tone="primary" /><Metric label="Mentorship requests" value={mentorship.length} /><Metric label="Funding opportunities" value={funding.length} /></div>
      <Panel><PanelHeader title="Projects seeking industry support" subtitle="Validated challenges with university teams and practical resource requirements." action={<Link to="/industry/projects" className="btn btn-outline btn-sm">See all</Link>} />
        {seeking.length===0?<EmptyState title="No open opportunities" body="New proposals will appear here when university teams request industry support."/>:<div className="divide-y divide-border">{seeking.slice(0,4).map((p)=>{const u=getUniversity(p.universityId);return <div key={p.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center"><div><p className="font-serif text-[17px] font-semibold text-ink">{p.title}</p><p className="mt-1 text-[12.5px] text-muted-foreground">{u?.shortName} · {p.code} · {p.estimatedBudget}</p></div><div><div className="eyebrow mb-1.5">Needs</div><div className="flex flex-wrap gap-1.5">{p.requiredSupport.map((s)=><span key={s} className="badge badge-neutral">{s}</span>)}</div></div><Link to="/industry/projects/$id" params={{id:p.id}} className="btn btn-primary btn-sm">View project</Link></div>})}</div>}
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><Panel><PanelHeader title="Your active partnerships" subtitle="Projects your organization is supporting" action={<Link to="/industry/partnerships" className="btn btn-outline btn-sm">Manage</Link>} />{mine.length===0?<EmptyState title="No partnerships yet" body="Choose an opportunity and offer funding, expertise, hardware or deployment support."/>:<div className="divide-y divide-border">{mine.map((p)=><div key={p.id} className="px-5 py-4"><Link to="/industry/projects/$id" params={{id:p.id}} className="text-[14px] font-semibold text-ink hover:text-primary">{p.title}</Link><div className="mt-3"><LifecycleBar status={p.status} compact /></div></div>)}</div>}</Panel>
      <Panel><PanelHeader title="Notifications" /> <ul>{notifications.filter(n=>n.role==="INDUSTRY").slice(0,5).map(n=><li key={n.id} className="border-b border-border px-5 py-3.5 last:border-0"><p className="text-[13px] font-medium text-ink">{n.title}</p><p className="mt-0.5 text-[12px] text-muted-foreground">{n.body}</p></li>)}</ul></Panel></div>
    </div>
  </PortalLayout>;
}
