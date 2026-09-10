import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { EmptyState, Panel, SeverityBadge, StatusBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/citizen/challenges/")({
  head: () => ({
    meta: [
      { title: "My challenges — Citizen portal" },
      { name: "description", content: "All problems you have reported and their current stage." },
      { property: "og:title", content: "My challenges — Citizen portal" },
      { property: "og:description", content: "Track every report you have submitted." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyChallenges,
});

function MyChallenges() {
  const { user } = useAuth();
  const { challenges } = useData();
  const mine = challenges.filter((c) => c.submittedBy === user?.id);

  return (
    <PortalLayout role="CITIZEN" title="My Challenges" subtitle="Every report you have submitted, with its current stage.">
      <Panel className="overflow-hidden">
        {mine.length === 0 ? (
          <EmptyState
            title="Nothing reported yet"
            action={
              <Link to="/citizen/report" className="btn btn-primary btn-sm">
                Report a Problem
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Location</th>
                  <th>Domain</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th className="text-right">Priority</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-[320px]">
                      <Link to="/citizen/challenges/$id" params={{ id: c.id }} className="font-medium text-ink hover:text-primary">
                        {c.title}
                      </Link>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                        {c.code} · {fmtDate(c.createdAt)}
                      </div>
                    </td>
                    <td className="text-muted-foreground">
                      {c.location.village}, {c.location.district}
                    </td>
                    <td className="text-muted-foreground">{c.category}</td>
                    <td>
                      <SeverityBadge severity={c.severity} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-right font-mono font-semibold tabular-nums">{c.priorityScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PortalLayout>
  );
}
