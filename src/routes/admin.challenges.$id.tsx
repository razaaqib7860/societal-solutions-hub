import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, GitMerge, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/PortalLayout";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { DOMAINS } from "@/lib/aiService";
import { AIBadge, EmptyState, Field, Panel, PanelHeader, ScoreBar, SeverityBadge, fmtDate } from "@/components/kit";
import type { Severity } from "@/lib/types";

export const Route = createFileRoute("/admin/challenges/$id")({
  head: () => ({
    meta: [
      { title: "Challenge review — Government portal" },
      { name: "description", content: "Review evidence, AI-assisted analysis, duplicate reports and recommended institutions before validating and routing a challenge." },
      { property: "og:title", content: "Challenge review — Government portal" },
      { property: "og:description", content: "Officer review with override, merge and assignment controls." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminChallengeReview,
});

function AdminChallengeReview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getChallenge, clusterOf, universities, setStatus, mergeCluster, overrideClassification, assignUniversity } = useData();
  const challenge = getChallenge(id);
  const officer = user?.name ?? "Officer";

  const [cat, setCat] = useState(challenge?.category ?? "");
  const [sub, setSub] = useState(challenge?.subcategory ?? "");
  const [sev, setSev] = useState<Severity>(challenge?.severity ?? "Medium");

  if (!challenge) {
    return (
      <PortalLayout role="ADMIN" title="Challenge not found">
        <EmptyState title="Challenge not found" body="It may have been merged into a master challenge." action={<Link to="/admin/challenges" className="btn btn-outline btn-sm">Back to queue</Link>} />
      </PortalLayout>
    );
  }

  const cluster = clusterOf(challenge);
  const canValidate = ["SUBMITTED", "UNDER_REVIEW"].includes(challenge.status);
  const canAssign = challenge.status === "VALIDATED";

  return (
    <PortalLayout role="ADMIN" title="Challenge Review" subtitle={`${challenge.code} · submitted by ${challenge.submitterName} on ${fmtDate(challenge.createdAt)}`}>
      <div className="space-y-6">
        <ChallengeDetail
          challenge={challenge}
          actions={
            <div className="flex flex-wrap gap-2">
              {canValidate && (
                <>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setStatus(challenge.id, "VALIDATED", officer, "Validated after officer review");
                      toast.success("Challenge validated.");
                    }}
                  >
                    <ShieldCheck className="size-4" aria-hidden /> Validate
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setStatus(challenge.id, "REJECTED", officer, "Rejected by officer");
                      toast("Challenge rejected.");
                      navigate({ to: "/admin/challenges" });
                    }}
                  >
                    <X className="size-4" aria-hidden /> Reject
                  </button>
                </>
              )}
              {challenge.similarChallenges.length > 0 && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    mergeCluster(challenge.id, officer);
                    toast.success(`${challenge.similarChallenges.length} reports merged into one master challenge.`);
                  }}
                >
                  <GitMerge className="size-4" aria-hidden /> Merge reports
                </button>
              )}
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              title="Similar challenges"
              subtitle={
                challenge.similarChallenges.length > 0
                  ? `${challenge.similarChallenges.length} similar submissions detected within 5 km.`
                  : challenge.isMaster
                    ? `${challenge.reportCount} reports grouped into this master challenge.`
                    : "No similar submissions detected."
              }
              action={<AIBadge />}
            />
            {cluster.length > 0 ? (
              <ul className="max-h-[320px] overflow-y-auto">
                {cluster.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-3 border-b border-border px-5 py-3 last:border-b-0">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">{c.title}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                        {c.location.village}, {c.location.block} · {fmtDate(c.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {c.status === "MERGED" ? "Merged" : "Open"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-[13px] text-muted-foreground">Nothing to group. This is a single unique report.</p>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Classification" subtitle="You may override the AI-assisted classification at any time." />
            <div className="grid gap-4 px-5 py-5">
              <Field label="Category">
                <select
                  className="field"
                  value={cat}
                  onChange={(e) => {
                    setCat(e.target.value);
                    setSub(DOMAINS[e.target.value]?.subcategories[0] ?? "");
                  }}
                >
                  {Object.keys(DOMAINS).map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subcategory">
                <select className="field" value={sub} onChange={(e) => setSub(e.target.value)}>
                  {(DOMAINS[cat]?.subcategories ?? [sub]).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Severity">
                <select className="field" value={sev} onChange={(e) => setSev(e.target.value as Severity)}>
                  {(["Low", "Medium", "High", "Critical"] as Severity[]).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    overrideClassification(challenge.id, { category: cat, subcategory: sub, severity: sev }, officer);
                    toast.success("Classification updated — recorded as an officer override.");
                  }}
                >
                  <Check className="size-4" aria-hidden /> Save classification
                </button>
              </div>
            </div>
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            title="Routing — recommended institutions"
            subtitle="Match scores explain why each institution fits. The final assignment is yours."
            action={<AIBadge />}
          />
          <div className="divide-y divide-border">
            {challenge.recommendedUniversities.map((m) => {
              const uni = universities.find((u) => u.id === m.universityId);
              if (!uni) return null;
              return (
                <div key={m.universityId} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.1fr_1.4fr_auto] lg:items-center">
                  <div>
                    <p className="text-[14px] font-semibold text-ink">
                      {uni.shortName} <span className="font-normal text-muted-foreground">— {uni.district}</span>
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{uni.name}</p>
                    <div className="mt-2 max-w-[240px]">
                      <ScoreBar label="Match" value={m.score} />
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {m.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-[12.5px] text-ink">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="lg:text-right">
                    {challenge.assignedUniversity === uni.id ? (
                      <span className="text-[12px] font-semibold tracking-wide text-primary uppercase">Assigned</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={!canAssign}
                        onClick={() => {
                          assignUniversity(challenge.id, uni.id, officer);
                          toast.success(`Challenge assigned to ${uni.shortName}.`);
                        }}
                      >
                        Assign challenge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {challenge.recommendedUniversities.length === 0 && (
              <p className="px-5 py-6 text-[13px] text-muted-foreground">Validate the challenge to generate institution recommendations.</p>
            )}
          </div>
          {!canAssign && !challenge.assignedUniversity && (
            <p className="border-t border-border bg-muted/60 px-5 py-3 text-[12.5px] text-muted-foreground">
              Assignment unlocks once the challenge is validated.
            </p>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Officer summary" subtitle="What gets published to the state register" />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-3">
            <div>
              <div className="eyebrow">Severity</div>
              <div className="mt-1.5">
                <SeverityBadge severity={challenge.severity} />
              </div>
            </div>
            <ScoreBar label="Priority" value={challenge.priorityScore} />
            <ScoreBar label="Innovation potential" value={challenge.innovationScore} tone="accent" />
          </div>
        </Panel>
      </div>
    </PortalLayout>
  );
}
