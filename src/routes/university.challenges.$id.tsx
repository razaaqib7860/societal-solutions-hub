import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/PortalLayout";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { AIBadge, EmptyState, Panel, PanelHeader, ScoreBar } from "@/components/kit";

export const Route = createFileRoute("/university/challenges/$id")({
  head: () => ({
    meta: [
      { title: "Challenge brief — University portal" },
      { name: "description", content: "Full challenge brief with evidence, community impact and the reasons your institution was matched." },
      { property: "og:title", content: "Challenge brief — University portal" },
      { property: "og:description", content: "Accept the challenge to open a project workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UniversityChallenge,
});

function UniversityChallenge() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getChallenge, universities, acceptChallenge, notify } = useData();
  const challenge = getChallenge(id);
  const uniId = user?.organizationId ?? universities[0]!.id;

  if (!challenge) {
    return (
      <PortalLayout role="UNIVERSITY" title="Challenge not found">
        <EmptyState title="Challenge not found" action={<Link to="/university/challenges" className="btn btn-outline btn-sm">Back to recommendations</Link>} />
      </PortalLayout>
    );
  }

  const match = challenge.recommendedUniversities.find((m) => m.universityId === uniId);
  const canAccept = challenge.assignedUniversity === uniId && !challenge.projectId;
  const uni = universities.find((u) => u.id === uniId);

  return (
    <PortalLayout role="UNIVERSITY" title="Challenge Brief" subtitle={`${challenge.code} · ${challenge.category}`}>
      <ChallengeDetail
        challenge={challenge}
        actions={
          <div className="flex flex-wrap gap-2">
            {canAccept && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const project = acceptChallenge(challenge.id, uniId, uni?.shortName ?? "University");
                  notify({ role: "ADMIN", title: "Challenge accepted", body: `${uni?.shortName ?? "An institution"} accepted "${challenge.title}" and opened a project.` });
                  toast.success("Challenge accepted — project workspace created.");
                  navigate({ to: "/university/projects/$id", params: { id: project.id } });
                }}
              >
                Accept challenge
              </button>
            )}
            {challenge.projectId && (
              <Link to="/university/projects/$id" params={{ id: challenge.projectId }} className="btn btn-outline btn-sm">
                Open project workspace
              </Link>
            )}
            {!canAccept && !challenge.projectId && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  notify({ role: "ADMIN", title: "Institution expressed interest", body: `An institution has expressed interest in "${challenge.title}".` });
                  toast.success("Interest recorded.");
                }}
              >
                Express interest
              </button>
            )}
          </div>
        }
        extra={
          match && (
            <Panel>
              <PanelHeader title="Why your institution was matched" subtitle="Suggested by the matching service; the officer made the final assignment." action={<AIBadge />} />
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-[220px_1fr]">
                <ScoreBar label="Institution match" value={match.score} />
                <ul className="space-y-1">
                  {match.reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-[13px] text-ink">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden /> {r}
                    </li>
                  ))}
                </ul>
              </div>
              {uni && (
                <div className="grid gap-4 border-t border-border px-5 py-4 sm:grid-cols-3">
                  <div>
                    <div className="eyebrow">Departments</div>
                    <p className="mt-1 text-[12.5px] text-ink">{uni.departments.join(", ")}</p>
                  </div>
                  <div>
                    <div className="eyebrow">Research areas</div>
                    <p className="mt-1 text-[12.5px] text-ink">{uni.researchAreas.join(", ")}</p>
                  </div>
                  <div>
                    <div className="eyebrow">Laboratories</div>
                    <p className="mt-1 text-[12.5px] text-ink">{uni.laboratories.join(", ")}</p>
                  </div>
                </div>
              )}
            </Panel>
          )
        }
      />
    </PortalLayout>
  );
}
