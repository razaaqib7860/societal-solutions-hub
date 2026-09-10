import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { Challenge, ChallengeStatus } from "@/lib/types";
import { STATUS_LABEL, fmtDate } from "./kit";

const JOURNEY: ChallengeStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VALIDATED",
  "MATCHED",
  "PROJECT_CREATED",
  "IN_PROGRESS",
  "RESOLVED",
];

export function ChallengeTimeline({ challenge }: { challenge: Challenge }) {
  const reached = new Map(challenge.timeline.map((t) => [t.status, t]));
  const currentIndex = Math.max(...JOURNEY.map((s, i) => (reached.has(s) ? i : -1)));

  return (
    <ol className="relative">
      {JOURNEY.map((status, i) => {
        const entry = reached.get(status);
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
            {i < JOURNEY.length - 1 && (
              <span
                className={cn("absolute top-6 left-[11px] h-full w-px", done ? "bg-primary/40" : "bg-border")}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-accent bg-accent text-accent-foreground",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className={cn("text-[14px] font-medium", done || active ? "text-ink" : "text-muted-foreground")}>
                {STATUS_LABEL[status]}
              </div>
              {entry ? (
                <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {fmtDate(entry.at)} · {entry.by}
                  {entry.note && <span className="block text-slate italic">{entry.note}</span>}
                </div>
              ) : (
                <div className="mt-0.5 text-[12.5px] text-muted-foreground">Pending</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
