import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { LifecycleBar } from "@/components/LifecycleBar";
import { AIBadge, EmptyState, Metric, Panel, PanelHeader, ScoreBar, SeverityBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/university/")({
  head: () => ({
    meta: [
      { title: "Innovation Workspace — University portal" },
      { name: "description", content: "Matched societal challenges, faculty mentors, student teams and live projects for your institution." },
      { property: "og:title", content: "Innovation Workspace — University portal" },
      { property: "og:description", content: "Turn validated community challenges into student research projects." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UniversityHome,
});

function UniversityHome() {
  const { user } = useAuth();
  const { challenges, projects, faculty, students, universities, notifications } = useData();
  const uniId = user?.organizationId ?? universities[0]!.id;
  const uni = universities.find((u) => u.id === uniId);

  const recommended = challenges
    .filter((c) => c.status !== "MERGED" && c.recommendedUniversities.some((m) => m.universityId === uniId))
    .filter((c) => !c.assignedUniversity || c.assignedUniversity === uniId)
    .sort((a, b) => {
      const sa = a.recommendedUniversities.find((m) => m.universityId === uniId)?.score ?? 0;
      const sb = b.recommendedUniversities.find((m) => m.universityId === uniId)?.score ?? 0;
      return sb - sa;
    });

  const myProjects = projects.filter((p) => p.universityId === uniId);
  const myFaculty = faculty.filter((f) => f.universityId === uniId);
  const myStudents = students.filter((s) => s.universityId === uniId);
  const news = notifications.filter((n) => n.role === "UNIVERSITY").slice(0, 4);

  return (
    <PortalLayout role="UNIVERSITY" title="Innovation Workspace" subtitle={uni ? `${uni.name} · ${uni.district}` : undefined}>
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Recommended challenges" value={recommended.length} tone="accent" />
          <Metric label="Active projects" value={myProjects.filter((p) => p.status !== "IMPACT_MEASUREMENT").length} tone="primary" />
          <Metric label="Faculty mentors" value={myFaculty.length} />
          <Metric label="Student team members" value={myStudents.length} />
          <Metric label="Completed projects" value={myProjects.filter((p) => p.status === "IMPACT_MEASUREMENT").length} />
        </div>

        <Panel>
          <PanelHeader
            title="Recommended challenges"
            subtitle="Matched to your departments, research areas, faculty and laboratories."
            action={
              <div className="flex items-center gap-2">
                <AIBadge />
                <Link to="/university/challenges" className="btn btn-outline btn-sm">
                  See all
                </Link>
              </div>
            }
          />
          {recommended.length === 0 ? (
            <EmptyState title="No matches yet" body="As officers validate new challenges, the ones fitting your institution will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {recommended.slice(0, 3).map((c) => {
                const match = c.recommendedUniversities.find((m) => m.universityId === uniId)!;
                return (
                  <div key={c.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11.5px] text-muted-foreground">{c.code}</span>
                        <SeverityBadge severity={c.severity} />
                      </div>
                      <p className="mt-1.5 font-serif text-[17px] font-semibold text-ink">{c.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                        {c.category} · {c.location.block}, {c.location.district} · priority {c.priorityScore} · reported {fmtDate(c.createdAt)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <ScoreBar label="Institution match" value={match.score} />
                      <ul className="space-y-0.5">
                        {match.reasons.slice(0, 4).map((r) => (
                          <li key={r} className="flex items-start gap-1.5 text-[12px] text-ink">
                            <Check className="mt-0.5 size-3 shrink-0 text-primary" aria-hidden /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="lg:text-right">
                      <Link to="/university/challenges/$id" params={{ id: c.id }} className="btn btn-primary btn-sm">
                        View challenge
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel>
            <PanelHeader title="Your projects" subtitle="Live lifecycle status" action={<Link to="/university/projects" className="btn btn-outline btn-sm">Open workspace</Link>} />
            {myProjects.length === 0 ? (
              <EmptyState title="No projects yet" body="Accept a recommended challenge to open your first project workspace." />
            ) : (
              <div className="divide-y divide-border">
                {myProjects.map((p) => (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link to="/university/projects/$id" params={{ id: p.id }} className="text-[14px] font-semibold text-ink hover:text-primary">
                          {p.title}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {p.code} · {p.studentIds.length} students · {p.milestones.filter((m) => m.status === "Completed").length}/{p.milestones.length} milestones
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <LifecycleBar status={p.status} compact />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Notifications" subtitle="Matches, approvals and partner interest" />
            <ul>
              {news.map((n) => (
                <li key={n.id} className="border-b border-border px-5 py-3.5 last:border-b-0">
                  <p className="text-[13px] font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">{n.body}</p>
                </li>
              ))}
              {news.length === 0 && <li className="px-5 py-6 text-[13px] text-muted-foreground">Nothing new.</li>}
            </ul>
          </Panel>
        </div>
      </div>
    </PortalLayout>
  );
}
