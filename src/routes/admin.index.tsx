import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PortalLayout } from "@/components/PortalLayout";
import { useData } from "@/context/DataContext";
import { JharkhandMap } from "@/components/JharkhandMap";
import { AIBadge, Metric, Panel, PanelHeader, SeverityBadge, StatusBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Jharkhand Societal Innovation Dashboard — Government portal" },
      { name: "description", content: "State-level view of reported challenges, validations, university participation, active projects and measured impact." },
      { property: "og:title", content: "Jharkhand Societal Innovation Dashboard" },
      { property: "og:description", content: "Challenge intelligence, validation queue and impact tracking for state officers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { challenges, projects, universities, industry } = useData();
  const open = challenges.filter((c) => c.status !== "MERGED");
  const pending = open.filter((c) => ["SUBMITTED", "UNDER_REVIEW"].includes(c.status));
  const validated = open.filter((c) => ["VALIDATED", "MATCHED", "PROJECT_CREATED", "IN_PROGRESS", "RESOLVED"].includes(c.status));
  const deployed = projects.filter((p) => ["DEPLOYMENT", "IMPACT_MEASUREMENT"].includes(p.status));
  const clusters = open.filter((c) => c.reportCount > 3);

  const byDomain = Object.entries(
    open.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.category]: (acc[c.category] ?? 0) + 1 }), {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const bySeverity = (["Critical", "High", "Medium", "Low"] as const).map((s) => ({
    name: s,
    value: open.filter((c) => c.severity === s).length,
  }));

  const byDistrict = Object.entries(
    open.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.location.district]: (acc[c.location.district] ?? 0) + 1 }), {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <PortalLayout
      role="ADMIN"
      title="Jharkhand Societal Innovation Dashboard"
      subtitle="Department of Higher & Technical Education — challenge intelligence, validation and impact oversight."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Metric label="Total challenges" value={open.length} />
          <Metric label="Pending validation" value={pending.length} tone="accent" />
          <Metric label="Validated" value={validated.length} tone="primary" />
          <Metric label="Active projects" value={projects.filter((p) => p.status !== "IMPACT_MEASUREMENT").length} />
          <Metric label="Solutions deployed" value={deployed.length} tone="primary" />
          <Metric label="Universities" value={universities.length} />
          <Metric label="Industry partners" value={industry.length} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Panel>
            <PanelHeader title="District-wise challenge map" subtitle="Live reports plotted across the state" />
            <div className="px-5 py-5">
              <JharkhandMap challenges={open} className="aspect-[16/10]" />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Pending validations" subtitle="Oldest first — act on these" action={<Link to="/admin/challenges" className="btn btn-outline btn-sm">Open queue</Link>} />
            <ul>
              {pending.slice(0, 6).map((c) => (
                <li key={c.id} className="border-b border-border px-5 py-3.5 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to="/admin/challenges/$id" params={{ id: c.id }} className="text-[13.5px] font-medium text-ink hover:text-primary">
                        {c.title}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {c.location.district} · {c.reportCount} report(s) · {fmtDate(c.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[13px] font-semibold text-ink tabular-nums">{c.priorityScore}</span>
                  </div>
                </li>
              ))}
              {pending.length === 0 && <li className="px-5 py-6 text-[13px] text-muted-foreground">Queue is clear.</li>}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel>
            <PanelHeader title="Domain distribution" subtitle="Open challenges by domain" />
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={byDomain} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <YAxis type="category" dataKey="name" width={116} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 2, 2, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Severity distribution" subtitle="Officer-confirmed severity" />
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={bySeverity} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={34}>
                    {bySeverity.map((s) => (
                      <Cell key={s.name} fill={s.name === "Critical" || s.name === "High" ? "var(--color-accent)" : "var(--color-primary)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Duplicate clusters" subtitle="Repeat reports of the same issue" action={<AIBadge />} />
            <ul>
              {clusters.slice(0, 5).map((c) => (
                <li key={c.id} className="border-b border-border px-5 py-3.5 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to="/admin/challenges/$id" params={{ id: c.id }} className="text-[13.5px] font-medium text-ink hover:text-primary">
                        {c.title}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {c.reportCount} reports · {c.location.block}, {c.location.district}
                      </p>
                    </div>
                    <SeverityBadge severity={c.severity} />
                  </div>
                </li>
              ))}
              {clusters.length === 0 && <li className="px-5 py-6 text-[13px] text-muted-foreground">No clusters detected.</li>}
            </ul>
          </Panel>
        </div>

        <Panel>
          <PanelHeader title="Challenge trends by district" subtitle="Top reporting districts" action={<Link to="/admin/analytics" className="btn btn-outline btn-sm">Full analytics</Link>} />
          <div className="px-3 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDistrict}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[2, 2, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Latest submissions" subtitle="Newest citizen reports" />
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
                {open.slice(0, 6).map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-[300px]">
                      <Link to="/admin/challenges/$id" params={{ id: c.id }} className="font-medium text-ink hover:text-primary">
                        {c.title}
                      </Link>
                    </td>
                    <td className="text-muted-foreground">{c.location.district}</td>
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
        </Panel>
      </div>
    </PortalLayout>
  );
}
