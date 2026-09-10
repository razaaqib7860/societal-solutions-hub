import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { JharkhandMap } from "@/components/JharkhandMap";
import { EmptyState, Metric, Panel, PanelHeader, SeverityBadge, StatusBadge, fmtDate, fmtDateTime } from "@/components/kit";

export const Route = createFileRoute("/citizen/")({
  head: () => ({
    meta: [
      { title: "Citizen dashboard — Jharkhand Innovation Platform" },
      { name: "description", content: "Report community problems and follow each challenge from submission to deployed solution." },
      { property: "og:title", content: "Citizen dashboard — Jharkhand Innovation Platform" },
      { property: "og:description", content: "Your reported challenges, their status and challenges near you." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const { user } = useAuth();
  const { challenges, notifications } = useData();
  const mine = challenges.filter((c) => c.submittedBy === user?.id);
  const nearby = challenges.filter((c) => c.location.district === user?.district && c.submittedBy !== user?.id && c.status !== "MERGED");
  const recent = challenges.filter((c) => c.status !== "MERGED").slice(0, 6);
  const mineNotifications = notifications.filter((n) => n.role === "CITIZEN").slice(0, 4);

  return (
    <PortalLayout
      role="CITIZEN"
      title={`Namaste, ${user?.name.split(" ")[0]}`}
      subtitle="Report a problem in your area and follow what happens to it — validation, university research, industry support and final impact."
    >
      <div className="space-y-6">
        <div className="panel flex flex-wrap items-center justify-between gap-4 bg-primary px-5 py-5 text-primary-foreground">
          <div>
            <h2 className="font-serif text-[19px] font-semibold text-white">Seen a problem in your village or ward?</h2>
            <p className="mt-1 text-[13.5px] text-primary-foreground/80">
              It takes about three minutes. Photos and location help officers act faster.
            </p>
          </div>
          <Link to="/citizen/report" className="btn bg-accent text-accent-foreground hover:brightness-95">
            <PlusCircle className="size-4" aria-hidden /> Report a Problem
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="My challenges" value={mine.length} />
          <Metric label="Validated" value={mine.filter((c) => ["VALIDATED", "MATCHED", "PROJECT_CREATED", "IN_PROGRESS", "RESOLVED"].includes(c.status)).length} tone="primary" />
          <Metric label="In progress" value={mine.filter((c) => c.status === "IN_PROGRESS").length} tone="accent" />
          <Metric label="Near me" value={nearby.length} hint={user?.district} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Panel>
            <PanelHeader
              title="My challenges"
              subtitle="Reports you have submitted"
              action={
                <Link to="/citizen/challenges" className="btn btn-outline btn-sm">
                  View all
                </Link>
              }
            />
            {mine.length === 0 ? (
              <EmptyState
                title="You haven't reported anything yet"
                body="Your first report starts the whole chain: validation, university matching and a real solution."
                action={
                  <Link to="/citizen/report" className="btn btn-primary btn-sm">
                    Report a Problem
                  </Link>
                }
              />
            ) : (
              <ul>
                {mine.map((c) => (
                  <li key={c.id} className="border-b border-border px-5 py-4 last:border-b-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to="/citizen/challenges/$id" params={{ id: c.id }} className="text-[14.5px] font-medium text-ink hover:text-primary">
                          {c.title}
                        </Link>
                        <p className="mt-1 text-[12.5px] text-muted-foreground">
                          {c.code} · {c.location.village}, {c.location.district} · {fmtDate(c.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <SeverityBadge severity={c.severity} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="space-y-6">
            <Panel>
              <PanelHeader title="Notifications" subtitle="Updates on your reports" />
              <ul>
                {mineNotifications.length === 0 && <li className="px-5 py-6 text-[13px] text-muted-foreground">No updates yet.</li>}
                {mineNotifications.map((n) => (
                  <li key={n.id} className="border-b border-border px-5 py-3.5 last:border-b-0">
                    <p className="text-[13.5px] font-medium text-ink">{n.title}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{fmtDateTime(n.at)}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <PanelHeader title="Nearby challenges" subtitle={`Reported around ${user?.district ?? "your district"}`} />
              <div className="px-4 py-4">
                <JharkhandMap challenges={nearby.length ? nearby : recent} className="aspect-[4/3]" />
              </div>
            </Panel>
          </div>
        </div>

        <Panel>
          <PanelHeader title="Recently reported across Jharkhand" subtitle="Public register" />
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>District</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th className="text-right">Priority</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-[340px] font-medium text-ink">{c.title}</td>
                    <td className="text-muted-foreground">{c.location.district}</td>
                    <td className="text-muted-foreground">{c.category}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-right font-mono font-semibold tabular-nums">{c.priorityScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </PortalLayout>
  );
}
