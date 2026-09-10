import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/types";

export const PROJECT_STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "PROPOSAL", label: "Proposal" },
  { key: "APPROVED", label: "Approved" },
  { key: "PROTOTYPE", label: "Prototype" },
  { key: "TESTING", label: "Testing" },
  { key: "PILOT", label: "Pilot" },
  { key: "DEPLOYMENT", label: "Deployment" },
  { key: "IMPACT_MEASUREMENT", label: "Impact" },
];

export function LifecycleBar({ status, compact }: { status: ProjectStatus; compact?: boolean }) {
  const idx = PROJECT_STAGES.findIndex((s) => s.key === status);
  return (
    <div className="flex w-full items-stretch gap-px overflow-hidden rounded-md border border-border">
      {PROJECT_STAGES.map((stage, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <div
            key={stage.key}
            className={cn(
              "flex-1 border-r border-border px-2 py-2 text-center last:border-r-0",
              compact ? "text-[10px]" : "text-[11px]",
              done && "bg-primary/10 text-primary",
              current && "bg-primary text-primary-foreground",
              !done && !current && "bg-card text-muted-foreground",
            )}
          >
            <div className="font-semibold tracking-wide uppercase">{stage.label}</div>
          </div>
        );
      })}
    </div>
  );
}
