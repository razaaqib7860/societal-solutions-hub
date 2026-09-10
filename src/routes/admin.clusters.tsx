import { createFileRoute, Link } from "@tanstack/react-router";
import { GitMerge } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { AIBadge, EmptyState, Panel, PanelHeader, SeverityBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/admin/clusters")({
  head: () => ({
    meta: [
      { title: "Duplicate clusters — Government portal" },
      { name: "description", content: "Group repeat reports of the same problem into a single master challenge before routing it to an institution." },
      { property: "og:title", content: "Duplicate clusters — Government portal" },
      { property: "og:description", content: "Deduplication workspace for the state challenge register." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Clusters,
});

function Clusters() {
  const { challenges, clusterOf, mergeCluster } = useData();
  const { user } = useAuth();
  const officer = user?.name ?? "Officer";

  const groups = challenges.filter((c) => c.status !== "MERGED" && (c.similarChallenges.length > 0 || (c.isMaster && c.reportCount > 1)));

  return (
    <PortalLayout
      role="ADMIN"
      title="Duplicate Clusters"
      subtitle="One problem reported many times is still one problem. Merge to keep the register clean and the priority accurate."
    >
      {groups.length === 0 ? (
        <EmptyState title="No clusters right now" body="When several citizens report the same issue nearby, the group will appear here for your review." />
      ) : (
        <div className="space-y-5">
          {groups.map((master) => {
            const members = clusterOf(master);
            return (
              <Panel key={master.id}>
                <PanelHeader
                  eyebrow={`${master.reportCount} reports`}
                  title={master.title}
                  subtitle={`${master.location.block}, ${master.location.district} · ${master.category} · within 5 km`}
                  action={
                    <div className="flex items-center gap-2">
                      <AIBadge />
                      {master.similarChallenges.length > 0 ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            mergeCluster(master.id, officer);
                            toast.success("Reports merged into one master challenge.");
                          }}
                        >
                          <GitMerge className="size-4" aria-hidden /> Merge {master.similarChallenges.length}
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">Merged</span>
                      )}
                      <Link to="/admin/challenges/$id" params={{ id: master.id }} className="btn btn-outline btn-sm">
                        Review
                      </Link>
                    </div>
                  }
                />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-muted/50 px-5 py-3 text-[12.5px] text-muted-foreground">
                  <span>
                    Severity <SeverityBadge severity={master.severity} />
                  </span>
                  <span>
                    Priority <span className="font-mono font-semibold text-ink">{master.priorityScore}</span>
                  </span>
                  <span>
                    People affected <span className="font-mono font-semibold text-ink">{master.affectedPopulation.toLocaleString("en-IN")}</span>
                  </span>
                </div>
                <ul className="max-h-[280px] overflow-y-auto">
                  {members.map((m) => (
                    <li key={m.id} className="flex items-start justify-between gap-4 border-b border-border px-5 py-3 last:border-b-0">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-ink">{m.title}</p>
                        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {m.submitterName} · {m.location.village}, {m.location.block} · {fmtDate(m.createdAt)}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground">{m.code}</span>
                    </li>
                  ))}
                  {members.length === 0 && <li className="px-5 py-5 text-[13px] text-muted-foreground">Individual reports are archived under this master challenge.</li>}
                </ul>
              </Panel>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
