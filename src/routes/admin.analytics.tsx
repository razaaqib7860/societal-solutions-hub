import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortalLayout } from "@/components/PortalLayout";
import { useData } from "@/context/DataContext";
import { IMPACT_SNAPSHOT } from "@/lib/seed";
import { Metric, Panel, PanelHeader, STATUS_LABEL } from "@/components/kit";
import type { ChallengeStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "State analytics — Government portal" },
      { name: "description", content: "Challenges by district and domain, severity spread, status pipeline, institutional participation and measured social impact." },
      { property: "og:title", content: "State analytics — Government portal" },
      { property: "og:description", content: "Data view of the Jharkhand societal innovation pipeline." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Analytics;
});

const GREEN = "var(--color-primary)";
const TERRA = "var(--color-accent)";
const SLATE = "var(--color-muted-foreground)";
const TOOLTIP = { fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" };

function Analytics() {
  const { challenges, projects, universities, industry } = useData();
  const open = challenges.filter((c) => c.status !== "MERGED");

  const count = <T extends string>(keys: T[], pick: (c: (typeof open)[number]) => T) =>
    keys.map((k) => ({ name: k, value: open.filter((c) => pick(c) === k).length }));

  const byDistrict = Object.entries(open.reduce<Record<string, number>>((a, c) => ({ ...a, [c.location.district]: (a[c.location.district] ?? 0) + 1 }), {}))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const byDomain = Object.entries(open.reduce<Record<string, number>>((a, c) => ({ ...a, [c.category]: (a[c.category] ?? 0) + 1 }), {}))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const bySeverity = count(["Critical", "High", "Medium", "Low"], (c) => c.severity);

  const statuses: ChallengeStatus[] = ["SUBMITTED", "UNDER_REVIEW", "VALIDATED", "MATCHED", "PROJECT_CREATED", "IN_PROGRESS", "RESOLVED"];
  const byStatus = statuses.map((s) => ({ name: STATUS_LABEL[s], value: open.filter((c) => c.status === s).length }));

  const uniParticipation = universities
    .map((u) => ({
      name: u.shortName,
      value: projects.filter((p) => p.universityId === u.id).length,
    }))
    .sort((a, b) => b.value - a.value);

  const industryParticipation = industry
    .map((i) => ({ name: i.name.split(" ").slice(0, 2).join(" "), value: projects.filter((p) => p.industryPartnerIds.includes(i.id)).length }))
    .sort((a, b) => b.value - a.value);

  const trend = (() => {
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    return months.map((m, i) => ({ name: m, reported: 6 + i * 4 + (i % 2 ? 3 : 0), validated: 3 + i * 3 }));
  })();

  const impact = projects.flatMap((p) => p.impactMetrics);
  const citizensImpacted = impact.filter((m) => m.unit.toLowerCase().includes("people") || m.label.toLowerCase().includes("resident")).reduce((s, m) => s + m.value, 0);

  return (
    <PortalLayout role="ADMIN" title="State Analytics" subtitle="One consolidated view of the challenge register, institutional participation and measured impact.">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Challenges on register" value={open.length} />
          <Metric label="Districts reporting" value={byDistrict.length} />
          <Metric label="Active projects" value={projects.length} tone="primary" />
          <Metric label="Citizens impacted" value={(citizensImpacted || IMPACT_SNAPSHOT.citizensImpacted).toLocaleString("en-IN")} tone="accent" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Challenges by district" />
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byDistrict}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={SLATE} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} stroke={SLATE} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="value" fill={GREEN} radius={[2, 2, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Challenges by domain" />
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byDomain} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke={SLATE} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={128} tick={{ fontSize: 11 }} stroke={SLATE} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="value" fill={GREEN} radius={[0, 2, 2, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Severity distribution" />
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={bySeverity} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} strokeWidth={1} stroke="var(--color-card)">
                    {bySeverity.map((s, i) => (
                      <Cell key={s.name} fill={i === 0 ? TERRA : i === 1 ? "color-mix(in oklab, var(--color-accent) 65%, white)" : i === 2 ? GREEN : "color-mix(in oklab, var(--color-primary) 45%, white)"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 pb-2 text-[12px] text-muted-foreground">
                {bySeverity.map((s) => (
                  <li key={s.name}>
                    {s.name} — <span className="font-mono font-semibold text-ink">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Challenge status pipeline" />
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byStatus}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10.5 }} stroke={SLATE} interval={0} angle={-20} textAnchor="end" height={62} />
                  <YAxis tick={{ fontSize: 11 }} stroke={SLATE} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="value" fill={GREEN} radius={[2, 2, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Reported vs validated" subtitle="Last six months" />
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={SLATE} />
                  <YAxis tick={{ fontSize: 11 }} stroke={SLATE} />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Line type="monotone" dataKey="reported" stroke={GREEN} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="validated" stroke={TERRA} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className="pb-2 text-center text-[12px] text-muted-foreground">
                <span className="text-primary">—</span> Reported &nbsp; <span className="text-accent">—</span> Validated
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Participation" subtitle="Projects per institution and industry partner" />
            <div className="grid gap-6 px-5 py-5 sm:grid-cols-2">
              <div>
                <div className="eyebrow mb-2">Universities</div>
                <ul className="space-y-2">
                  {uniParticipation.map((u) => (
                    <li key={u.name} className="flex items-center gap-3 text-[13px]">
                      <span className="w-24 shrink-0 truncate text-ink">{u.name}</span>
                      <span className="h-2 flex-1 bg-muted">
                        <span className="block h-full bg-primary" style={{ width: `${Math.min(100, u.value * 40 + 6)}%` }} />
                      </span>
                      <span className="w-5 shrink-0 text-right font-mono tabular-nums">{u.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="eyebrow mb-2">Industry partners</div>
                <ul className="space-y-2">
                  {industryParticipation.map((u) => (
                    <li key={u.name} className="flex items-center gap-3 text-[13px]">
                      <span className="w-24 shrink-0 truncate text-ink">{u.name}</span>
                      <span className="h-2 flex-1 bg-muted">
                        <span className="block h-full bg-accent" style={{ width: `${Math.min(100, u.value * 40 + 6)}%` }} />
                      </span>
                      <span className="w-5 shrink-0 text-right font-mono tabular-nums">{u.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        </div>

        <Panel>
          <PanelHeader title="Recorded impact" subtitle="Verified figures reported by project teams and confirmed by officers" />
          {impact.length === 0 ? (
            <p className="px-5 py-6 text-[13px] text-muted-foreground">No impact recorded yet.</p>
          ) : (
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {impact.map((m) => (
                <div key={m.id} className="bg-card px-5 py-4">
                  <div className="eyebrow">{m.label}</div>
                  <div className="mt-1 font-mono text-[22px] font-semibold text-ink tabular-nums">{m.value.toLocaleString("en-IN")}</div>
                  <div className="text-[12px] text-muted-foreground">{m.unit}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </PortalLayout>
  );
}
