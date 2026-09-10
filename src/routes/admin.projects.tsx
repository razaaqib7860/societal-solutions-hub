import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalLayout } from "@/components/PortalLayout";
import { useData } from "@/context/DataContext";
import { LifecycleBar, PROJECT_STAGES } from "@/components/LifecycleBar";
import { EmptyState, Metric, Panel, PanelHeader, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({
    meta: [
      { title: "Innovation projects — Government portal" },
      { name: "description", content: "Track every validated challenge that became a university project, from proposal through pilot, deployment and measured impact." },
      { property: "og:title", content: "Innovation projects — Government portal" },
      { property: "og:description", content: "Project pipeline oversight for state officers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProjects,
});

function AdminProjects() {
  const { projects, getChallenge, getUniversity, industry } = useData();

  return (
    <PortalLayout role="ADMIN" title="Innovation Projects" subtitle="Validated challenges that are now live research and deployment projects.">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total projects" value={projects.length} />
          <Metric label="In prototype or testing" value={projects.filter((p) => ["PROTOTYPE", "TESTING"].includes(p.status)).length} />
          <Metric label="In pilot" value={projects.filter((p) => p.status === "PILOT").length} tone="accent" />
          <Metric label="Deployed" value={projects.filter((p) => ["DEPLOYMENT", "IMPACT_MEASUREMENT"].includes(p.status)).length} tone="primary" />
        </div>

        <Panel>
          <PanelHeader title="Pipeline by stage" subtitle="Where the portfolio stands today" />
          <div className="grid gap-px bg-border sm:grid-cols-4 lg:grid-cols-7">
            {PROJECT_STAGES.map((s) => (
              <div key={s.key} className="bg-card px-4 py-4">
                <div className="eyebrow">{s.label}</div>
                <div className="mt-1 font-mono text-[22px] font-semibold text-ink tabular-nums">
                  {projects.filter((p) => p.status === s.key).length}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {projects.length === 0 ? (
          <EmptyState title="No projects yet" body="Validate a challenge and assign it to an institution to start the first project." />
        ) : (
          <div className="space-y-5">
            {projects.map((p) => {
              const challenge = getChallenge(p.challengeId);
              const uni = getUniversity(p.universityId);
              const partners = industry.filter((i) => p.industryPartnerIds.includes(i.id));
              const impact = p.impactMetrics;
              return (
                <Panel key={p.id}>
                  <PanelHeader
                    eyebrow={`${p.code} · started ${fmtDate(p.createdAt)}`}
                    title={p.title}
                    subtitle={`${uni?.shortName ?? "Unassigned"}${challenge ? ` · ${challenge.location.district} · ${challenge.category}` : ""}`}
                    action={
                      challenge && (
                        <Link to="/admin/challenges/$id" params={{ id: challenge.id }} className="btn btn-outline btn-sm">
                          Source challenge
                        </Link>
                      )
                    }
                  />
                  <div className="px-5 py-5">
                    <LifecycleBar status={p.status} />
                  </div>
                  <div className="grid gap-5 border-t border-border px-5 py-5 sm:grid-cols-3">
                    <div>
                      <div className="eyebrow">Industry partners</div>
                      <p className="mt-1 text-[13px] text-ink">{partners.length > 0 ? partners.map((x) => x.name).join(", ") : "Seeking support"}</p>
                    </div>
                    <div>
                      <div className="eyebrow">Estimated budget</div>
                      <p className="mt-1 text-[13px] text-ink">{p.estimatedBudget || "To be proposed"}</p>
                    </div>
                    <div>
                      <div className="eyebrow">Milestones completed</div>
                      <p className="mt-1 text-[13px] text-ink">
                        {p.milestones.filter((m) => m.status === "Completed").length} of {p.milestones.length}
                      </p>
                    </div>
                  </div>
                  {impact.length > 0 && (
                    <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
                      {impact.map((m) => (
                        <div key={m.id} className="bg-primary/[0.04] px-5 py-4">
                          <div className="eyebrow">{m.label}</div>
                          <div className="mt-1 font-mono text-[20px] font-semibold text-primary tabular-nums">
                            {m.value.toLocaleString("en-IN")} <span className="text-[12px] font-normal text-muted-foreground">{m.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
