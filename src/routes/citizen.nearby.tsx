import { createFileRoute } from "@tanstack/react-router";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { JharkhandMap } from "@/components/JharkhandMap";
import { Panel, PanelHeader, SeverityBadge, StatusBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/citizen/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby challenges — Citizen portal" },
      { name: "description", content: "Challenges reported by others in your district and neighbouring blocks." },
      { property: "og:title", content: "Nearby challenges — Citizen portal" },
      { property: "og:description", content: "See what your neighbours have reported before adding a duplicate." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Nearby,
});

function Nearby() {
  const { user } = useAuth();
  const { challenges } = useData();
  const list = challenges.filter((c) => c.status !== "MERGED").sort((a, b) => (a.location.district === user?.district ? -1 : 1));

  return (
    <PortalLayout
      role="CITIZEN"
      title="Nearby Challenges"
      subtitle="Check whether your problem is already reported — adding your voice to an existing report carries more weight than a duplicate."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Location</th>
                  <th>Reports</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-[320px]">
                      <span className="font-medium text-ink">{c.title}</span>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                        {c.category} · {fmtDate(c.createdAt)}
                      </div>
                    </td>
                    <td className="text-muted-foreground">
                      {c.location.village}, {c.location.district}
                    </td>
                    <td className="font-mono tabular-nums">{c.reportCount}</td>
                    <td>
                      <SeverityBadge severity={c.severity} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel className="h-fit">
          <PanelHeader title="Challenge map" subtitle="All open reports" />
          <div className="px-4 py-4">
            <JharkhandMap challenges={list} className="aspect-square" />
          </div>
        </Panel>
      </div>
    </PortalLayout>
  );
}
