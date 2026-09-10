import type { ReactNode } from "react";
import { FileText, Image as ImageIcon, MapPin, Video } from "lucide-react";
import type { Challenge } from "@/lib/types";
import { useData } from "@/context/DataContext";
import { JharkhandMap } from "./JharkhandMap";
import { ChallengeTimeline } from "./ChallengeTimeline";
import { AIBadge, DataRow, Panel, PanelHeader, ScoreBar, SeverityBadge, StatusBadge, fmtDate } from "./kit";

const EV_ICON = { photo: ImageIcon, video: Video, document: FileText };

/**
 * Shared challenge detail body used by the citizen, admin and university views.
 * Portal-specific actions are passed in through `actions` / `extra`.
 */
export function ChallengeDetail({
  challenge,
  actions,
  extra,
}: {
  challenge: Challenge;
  actions?: ReactNode;
  extra?: ReactNode;
}) {
  const { getUniversity } = useData();
  const uni = getUniversity(challenge.assignedUniversity);

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11.5px] text-muted-foreground">{challenge.code}</span>
              <StatusBadge status={challenge.status} />
              <SeverityBadge severity={challenge.severity} />
              {challenge.isMaster && <span className="text-[11px] font-semibold tracking-wide text-accent uppercase">Master challenge</span>}
            </div>
            <h2 className="mt-2 font-serif text-[22px] leading-snug font-semibold text-ink">{challenge.title}</h2>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden /> {challenge.location.village}, {challenge.location.block},{" "}
                {challenge.location.district}
              </span>
              <span>Submitted {fmtDate(challenge.createdAt)}</span>
              <span>by {challenge.submitterName}</span>
            </p>
          </div>
          {actions}
        </div>

        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="eyebrow mb-2">Problem description</div>
            <p className="text-[14.5px] leading-relaxed text-slate">{challenge.description}</p>

            <div className="eyebrow mt-6 mb-2">Evidence submitted</div>
            {challenge.evidence.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No evidence files attached to this report.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {challenge.evidence.map((ev) => {
                  const Icon = EV_ICON[ev.type];
                  return (
                    <li key={ev.id} className="flex items-start gap-3 rounded-md border border-border bg-muted/50 px-3 py-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-card text-primary">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">{ev.name}</span>
                        <span className="block text-[11.5px] text-muted-foreground">{ev.caption ?? ev.type}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <div className="eyebrow mb-1">Community impact</div>
            <dl>
              <DataRow label="People affected" value={challenge.affectedPopulation.toLocaleString("en-IN")} />
              <DataRow label="Issue duration" value={challenge.issueDuration} />
              <DataRow label="Frequency" value={challenge.frequency} />
              <DataRow label="Urgency" value={challenge.urgency} />
              <DataRow label="Domain" value={`${challenge.category} › ${challenge.subcategory}`} />
              <DataRow label="Linked reports" value={challenge.reportCount} />
              {uni && <DataRow label="Assigned institution" value={uni.shortName} />}
            </dl>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {challenge.ai && (
            <Panel>
              <PanelHeader title="Analysis" subtitle="Suggestions for officer review — not a final decision" action={<AIBadge />} />
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                <dl>
                  <DataRow label="Suggested category" value={challenge.ai.category} />
                  <DataRow label="Suggested subcategory" value={challenge.ai.subcategory} />
                  <DataRow label="Suggested severity" value={challenge.ai.severity} />
                  <DataRow label="Model confidence" value={`${Math.round(challenge.ai.confidence * 100)}%`} />
                  <DataRow label="Similar reports within 5 km" value={challenge.ai.similarCount} />
                  {challenge.ai.overridden && <DataRow label="Officer override" value="Applied" />}
                </dl>
                <div className="space-y-4">
                  <ScoreBar label="Priority score" value={challenge.ai.priorityScore} />
                  <ScoreBar label="Innovation potential" value={challenge.ai.innovationScore} tone="accent" />
                  <p className="text-[12.5px] leading-relaxed text-muted-foreground">{challenge.ai.summary}</p>
                </div>
              </div>
            </Panel>
          )}
          {extra}
        </div>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Challenge journey" subtitle="Every stage is recorded for public accountability" />
            <div className="px-5 py-5">
              <ChallengeTimeline challenge={challenge} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Location" subtitle={`${challenge.location.lat.toFixed(3)}, ${challenge.location.lng.toFixed(3)}`} />
            <div className="px-4 py-4">
              <JharkhandMap challenges={[challenge]} className="aspect-[4/3]" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
