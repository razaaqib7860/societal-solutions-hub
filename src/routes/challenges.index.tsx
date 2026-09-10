import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useData } from "@/context/DataContext";
import { DOMAINS } from "@/lib/aiService";
import { DISTRICTS } from "@/lib/seed";
import { JharkhandMap } from "@/components/JharkhandMap";
import { Panel, PanelHeader, SectionHeading, SeverityBadge, StatusBadge, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/challenges/")({
  head: () => ({
    meta: [
      { title: "Explore societal challenges — Jharkhand Innovation Platform" },
      {
        name: "description",
        content:
          "Browse validated societal challenges reported across Jharkhand districts, with severity, priority and current stage of resolution.",
      },
      { property: "og:title", content: "Explore societal challenges across Jharkhand" },
      { property: "og:description", content: "Open register of community-reported challenges, their priority and progress." },
    ],
  }),
  component: PublicChallenges,
});

function PublicChallenges() {
  const { challenges } = useData();
  const [district, setDistrict] = useState("");
  const [domain, setDomain] = useState("");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      challenges
        .filter((c) => c.status !== "MERGED")
        .filter((c) => (district ? c.location.district === district : true))
        .filter((c) => (domain ? c.category === domain : true))
        .filter((c) => (q ? c.title.toLowerCase().includes(q.toLowerCase()) : true))
        .sort((a, b) => b.priorityScore - a.priorityScore),
    [challenges, district, domain, q],
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-sm bg-primary font-serif text-[15px] font-bold text-primary-foreground">
              JH
            </span>
            <span className="font-serif text-[15px] font-semibold text-ink">Societal Innovation Platform</span>
          </Link>
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <SectionHeading
          eyebrow="Public register"
          title="Societal challenges across Jharkhand"
          description="Every entry originates from a citizen or community report and has been triaged with AI-assisted analysis reviewed by state officers."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="field" placeholder="Search challenges" value={q} onChange={(e) => setQ(e.target.value)} />
              <select className="field" value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="District">
                <option value="">All districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <select className="field" value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Domain">
                <option value="">All domains</option>
                {Object.keys(DOMAINS).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <Panel className="overflow-hidden">
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
                    {list.map((c) => (
                      <tr key={c.id}>
                        <td className="max-w-[300px]">
                          <Link to="/challenges/$id" params={{ id: c.id }} className="font-medium text-ink hover:text-primary">
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
            </Panel>
          </div>

          <Panel className="h-fit">
            <PanelHeader title="District distribution" subtitle="Reported challenge locations" />
            <div className="px-4 py-4">
              <JharkhandMap challenges={list} className="aspect-square" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
