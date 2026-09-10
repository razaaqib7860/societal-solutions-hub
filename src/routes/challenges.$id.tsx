import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/context/DataContext";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import { EmptyState } from "@/components/kit";

export const Route = createFileRoute("/challenges/$id")({
  head: () => ({
    meta: [
      { title: "Challenge detail — Jharkhand Innovation Platform" },
      { name: "description", content: "Full record of a community-reported societal challenge, its analysis and its journey to a solution." },
      { property: "og:title", content: "Challenge detail — Jharkhand Innovation Platform" },
      { property: "og:description", content: "Evidence, analysis, matched institution and progress timeline for a reported challenge." },
    ],
  }),
  component: PublicChallengeDetail,
});

function PublicChallengeDetail() {
  const { id } = useParams({ from: "/challenges/$id" });
  const { getChallenge } = useData();
  const challenge = getChallenge(id);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/challenges" className="btn btn-ghost btn-sm">
            <ArrowLeft className="size-4" aria-hidden /> All challenges
          </Link>
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {challenge ? (
          <ChallengeDetail challenge={challenge} />
        ) : (
          <EmptyState title="Challenge not found" body="This challenge may have been merged into a master challenge." />
        )}
      </div>
    </div>
  );
}
