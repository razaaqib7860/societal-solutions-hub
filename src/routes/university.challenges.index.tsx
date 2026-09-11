import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { AIBadge, EmptyState, Panel, PanelHeader, ScoreBar, SeverityBadge, StatusBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/university/challenges/")({
  head: () => ({
    meta: [
      { title: "Recommended challenges — University portal" },
      { name: "description", content: "Validated societal challenges matched to your departments, faculty expertise and laboratory facilities." },
      { property: "og:title", content: "Recommended challenges — University portal" },
      { property: "og:description", content: "Express interest and accept challenges that fit your institution." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecommendedChallenges,
});

function RecommendedChallenges() {
  const { user } = useAuth();
  const { challenges, universities, notify } = useData();
  const uniId = user?.organizationId ?? universities[0]!.id;

  const rows = challenges
    .filter((c) => c.status !== "MERGED" && c.recommendedUniversities.some((m) => m.universityId === uniId))
    .sort((a, b) => {
      const sa = a.recommendedUniversities.find((m) => m.universityId === uniId)?.score ?? 0;
      const sb = b.recommendedUniversities.find((m) => m.universityId === uniId)?.score ?? 0;
      return sb - sa;
    });

  return (
    <PortalLayout
      role="UNIVERSITY"
      title="Recommended Challenges"
      subtitle="Each match is explained. Review the evidence before expressing interest — you are committing faculty and student time."
    >
      {rows.length === 0 ? (
        <EmptyState title="No recommendations yet" body="Validated challenges matching your institution will appear here." />
      ) : (
        <div className="space-y-5">
          {rows.map((c) => {
            const match = c.recommendedUniversities.find((m) => m.universityId === uniId)!;
            const mine = c.assignedUniversity === uniId;
            const takenByOther = Boolean(c.assignedUniversity) && !mine;
            return (
              <Panel key={c.id}>
                <PanelHeader
                  eyebrow={`${c.code} · ${c.category} · ${c.location.block}, ${c.location.district}`}
                  title={c.title}
                  subtitle={`Reported ${fmtDate(c.createdAt)} · ${c.reportCount} report(s) · ${c.affectedPopulation.toLocaleString("en-IN")} people affected`}
                  action={
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={c.severity} />
                      <StatusBadge status={c.status} />
                    </div>
                  }
                />
                <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <p className="text-[13.5px] leading-relaxed text-ink">{c.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link to="/university/challenges/$id" params={{ id: c.id }} className="btn btn-outline btn-sm">
                        View challenge
                      </Link>
                      {!takenByOther && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            notify({
                              role: "ADMIN",
                              title: "Institution expressed interest",
                              body: `An institution has expressed interest in "${c.title}".`,
                            });
                            toast.success("Interest recorded. The nodal officer has been notified.");
                          }}
                        >
                          Express interest
                        </button>
                      )}
                      {mine && <span className="self-center text-[11.5px] font-semibold tracking-wide text-primary uppercase">Assigned to you</span>}
                      {takenByOther && <span className="self-center text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase">Assigned elsewhere</span>}
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="eyebrow">Why this matches you</div>
                      <AIBadge />
                    </div>
                    <div className="mt-3">
                      <ScoreBar label="Institution match" value={match.score} />
                    </div>
                    <ul className="mt-3 space-y-1">
                      {match.reasons.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-[12.5px] text-ink">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden /> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
