import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { useData } from "@/context/DataContext";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import { LifecycleBar } from "@/components/LifecycleBar";
import { EmptyState, Panel, PanelHeader, DataRow, MilestoneBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/citizen/challenges/$id")({
  head: () => ({
    meta: [
      { title: "Challenge journey — Citizen portal" },
      { name: "description", content: "Follow your reported challenge from validation to deployed solution and measured impact." },
      { property: "og:title", content: "Challenge journey — Citizen portal" },
      { property: "og:description", content: "Status, analysis, evidence and project progress for your report." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CitizenChallengeDetail,
});

function CitizenChallengeDetail() {
  const { id } = useParams({ from: "/citizen/challenges/$id" });
  const { getChallenge, projects, getUniversity } = useData();
  const challenge = getChallenge(id);
  const project = projects.find((p) => p.challengeId === id);
  const uni = getUniversity(project?.universityId);

  return (
    <PortalLayout role="CITIZEN" title="Challenge detail" subtitle="What has happened to your report so far.">
      <Link to="/citizen/challenges" className="btn btn-ghost btn-sm mb-4">
        <ArrowLeft className="size-4" aria-hidden /> Back to my challenges
      </Link>
      {!challenge ? (
        <EmptyState title="Challenge not found" />
      ) : (
        <ChallengeDetail
          challenge={challenge}
          extra={
            project ? (
              <Panel>
                <PanelHeader
                  eyebrow="Solution in progress"
                  title={project.title}
                  subtitle={`${uni?.shortName ?? "University"} · project ${project.code}`}
                />
                <div className="space-y-5 px-5 py-5">
                  <LifecycleBar status={project.status} />
                  <dl>
                    <DataRow label="Institution" value={uni?.name ?? "—"} />
                    <DataRow label="Estimated budget" value={project.estimatedBudget} />
                    <DataRow label="Industry partners" value={project.collaborations.map((c) => c.partnerName).join(", ") || "Being sought"} />
                  </dl>
                  <div>
                    <div className="eyebrow mb-2">Milestones</div>
                    <ul className="space-y-2">
                      {project.milestones.map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                          <span className="text-[13.5px] text-ink">{m.name}</span>
                          <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            {fmtDate(m.deadline)}
                            <MilestoneBadge status={m.status} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {project.impactMetrics.length > 0 && (
                    <div className="rounded-md border border-primary/25 bg-primary-soft px-4 py-3">
                      <div className="eyebrow mb-1.5">Verified impact</div>
                      <ul className="space-y-1">
                        {project.impactMetrics.map((m) => (
                          <li key={m.id} className="text-[13.5px] text-ink">
                            <strong className="font-semibold">{m.value.toLocaleString("en-IN")}</strong> {m.unit} — {m.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Panel>
            ) : null
          }
        />
      )}
    </PortalLayout>
  );
}
