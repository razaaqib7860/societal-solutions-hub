import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { DOMAINS } from "@/lib/aiService";
import { DISTRICTS } from "@/lib/seed";
import { Panel, PriorityBadge, StatusBadge, fmtDate } from "@/components/kit";
import { STATUS_LABEL } from "@/components/kit";
import type { ChallengeStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/challenges/")({
  head: () => ({
    meta: [
      { title: "Challenge review queue — Government portal" },
      { name: "description", content: "Validate, reject, merge and assign citizen-reported challenges to institutions." },
      { property: "og:title", content: "Challenge review queue — Government portal" },
      { property: "og:description", content: "Officer workspace for triaging the state challenge register." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminChallenges,
});

const STATUSES: ChallengeStatus[] = ["SUBMITTED", "UNDER_REVIEW", "VALIDATED", "MATCHED", "PROJECT_CREATED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

function AdminChallenges() {
  const { challenges, setStatus, mergeCluster } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [district, setDistrict] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatusFilter] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState("");
  const [classification, setClassification] = useState("");
  const [date, setDate] = useState("");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      challenges
        .filter((c) => c.status !== "MERGED")
        .filter((c) => (district ? c.location.district === district : true))
        .filter((c) => (domain ? c.category === domain : true))
        .filter((c) => (status ? c.status === status : true))
        .filter((c) => (subcategory ? c.subcategory === subcategory : true))
        .filter((c) => (priority ? c.priority === priority : true))
        .filter((c) => (classification === "manual" ? c.ai?.requiresManualReview : classification === "classified" ? c.ai?.aiClassified && !c.ai.requiresManualReview : true))
        .filter((c) => (date ? c.createdAt.slice(0, 10) === date : true))
        .filter((c) => (q ? c.title.toLowerCase().includes(q.toLowerCase()) : true))
        .sort((a, b) => b.priorityScore - a.priorityScore),
    [challenges, district, domain, status, subcategory, priority, classification, date, q],
  );

  const officer = user?.name ?? "Officer";

  return (
    <PortalLayout
      role="ADMIN"
      title="Challenge Review"
      subtitle="Every challenge is triaged with AI-assisted analysis, but validation, merging and routing are officer decisions."
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <select className="field" value={status} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select className="field" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} aria-label="Subcategory">
            <option value="">All subcategories</option>
            {(domain ? DOMAINS[domain]?.subcategories ?? [] : [...new Set(Object.values(DOMAINS).flatMap((d) => d.subcategories))]).map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="field" value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
            <option value="">All priorities</option>
            {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((p) => <option key={p}>{p}</option>)}
          </select>
          <select className="field" value={classification} onChange={(e) => setClassification(e.target.value)} aria-label="Classification state">
            <option value="">All classification states</option>
            <option value="classified">AI classified</option>
            <option value="manual">Manual review required</option>
          </select>
          <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Created date" />
        </div>

        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Location</th>
                  <th>Classification</th>
                  <th>Priority</th>
                  <th className="text-right">Confidence</th>
                  <th className="text-right">Reports</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-[280px]">
                      <Link to="/admin/challenges/$id" params={{ id: c.id }} className="font-medium text-ink hover:text-primary">
                        {c.title}
                      </Link>
                      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                        {c.code} · {fmtDate(c.createdAt)}
                      </div>
                    </td>
                    <td className="text-muted-foreground">
                      {c.location.block}, {c.location.district}
                    </td>
                    <td>
                      <div className="text-ink">{c.category}</div>
                      <div className="text-[11.5px] text-muted-foreground">{c.subcategory}{c.ai?.requiresManualReview ? " · Manual review" : ""}</div>
                    </td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td className="text-right font-mono tabular-nums">{c.ai ? `${Math.round(c.ai.confidence * 100)}%` : "—"}</td>
                    <td className="text-right font-mono tabular-nums">{c.reportCount}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button className="btn btn-outline btn-sm" onClick={() => navigate({ to: "/admin/challenges/$id", params: { id: c.id } })}>
                          View
                        </button>
                        {["SUBMITTED", "UNDER_REVIEW"].includes(c.status) && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setStatus(c.id, "VALIDATED", officer, "Validated after officer review");
                                toast.success("Challenge validated.");
                              }}
                            >
                              Validate
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setStatus(c.id, "REJECTED", officer, "Rejected — insufficient evidence");
                                toast("Challenge rejected.");
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {c.similarChallenges.length > 0 && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              mergeCluster(c.id, officer);
                              toast.success(`Merged ${c.similarChallenges.length} reports.`);
                            }}
                          >
                            Merge
                          </button>
                        )}
                      </div>
                    </td>
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
