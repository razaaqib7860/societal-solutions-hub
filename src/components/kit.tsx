import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ChallengeStatus, MilestoneStatus, ProjectStatus, Severity } from "@/lib/types";
import { Sparkles } from "lucide-react";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("panel", className)}>{children}</div>;
}

export function PanelHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1.5 text-[14px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "primary";
}) {
  return (
    <div className="panel-flat rounded-lg px-4 py-3.5">
      <div className="eyebrow">{label}</div>
      <div
        className={cn(
          "mt-1.5 font-serif text-[26px] leading-none font-semibold tabular-nums",
          tone === "accent" && "text-accent",
          tone === "primary" && "text-primary",
          tone === "default" && "text-ink",
        )}
      >
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </div>
      {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const badgeTone: Record<string, string> = {
  neutral: "bg-muted text-slate border-border",
  green: "bg-success-soft text-success border-success/25",
  amber: "bg-warning-soft text-[oklch(0.45_0.1_75)] border-warning/30",
  red: "bg-danger-soft text-danger border-danger/25",
  blue: "bg-info-soft text-info border-info/25",
  terra: "bg-accent-soft text-accent border-accent/25",
  forest: "bg-primary-soft text-primary border-primary/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const STATUS_LABEL: Record<ChallengeStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  VALIDATED: "Validated",
  MATCHED: "Matched",
  PROJECT_CREATED: "Project created",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
  MERGED: "Merged",
};

const statusTone: Record<ChallengeStatus, keyof typeof badgeTone> = {
  SUBMITTED: "neutral",
  UNDER_REVIEW: "amber",
  VALIDATED: "forest",
  MATCHED: "blue",
  PROJECT_CREATED: "blue",
  IN_PROGRESS: "terra",
  RESOLVED: "green",
  REJECTED: "red",
  MERGED: "neutral",
};

export function StatusBadge({ status }: { status: ChallengeStatus }) {
  return <Badge tone={statusTone[status]}>{STATUS_LABEL[status]}</Badge>;
}

const sevTone: Record<Severity, keyof typeof badgeTone> = { Low: "neutral", Medium: "blue", High: "amber", Critical: "red" };
export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={sevTone[severity]}>{severity}</Badge>;
}

const msTone: Record<MilestoneStatus, keyof typeof badgeTone> = {
  Pending: "neutral",
  "In Progress": "terra",
  Completed: "green",
  Delayed: "red",
};
export function MilestoneBadge({ status }: { status: MilestoneStatus }) {
  return <Badge tone={msTone[status]}>{status}</Badge>;
}

export function ScoreBar({ value, label, tone = "primary" }: { value: number; label?: string; tone?: "primary" | "accent" }) {
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[13px] text-slate">{label}</span>
          <span className="font-mono text-[13px] font-semibold text-ink tabular-nums">{value}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted">
        <div
          className={cn("h-full rounded-sm transition-all duration-500", tone === "primary" ? "bg-primary" : "bg-accent")}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function AIBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-accent/30 bg-accent-soft px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-accent uppercase",
        className,
      )}
    >
      <Sparkles className="size-3" aria-hidden />
      AI-assisted analysis
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 h-px w-10 bg-border" />
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-ink">{value}</dd>
    </div>
  );
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
