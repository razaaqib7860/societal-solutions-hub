import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Challenge } from "@/lib/types";

/**
 * Lightweight schematic map of Jharkhand. Deliberately restrained: it plots
 * challenge locations by lat/lng on a simplified state outline rather than
 * dominating the page with a full tile map.
 */
const BOUNDS = { minLat: 21.9, maxLat: 25.4, minLng: 83.3, maxLng: 87.9 };

const OUTLINE =
  "M 22 46 L 30 30 L 46 18 L 62 12 L 80 16 L 92 26 L 96 44 L 92 62 L 80 74 L 84 88 L 66 92 L 46 86 L 30 74 L 20 62 Z";

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)) };
}

export function JharkhandMap({
  challenges,
  className,
  onSelect,
}: {
  challenges: Challenge[];
  className?: string | undefined;
  onSelect?: (c: Challenge) => void;
}) {
  const [hover, setHover] = useState<Challenge | null>(null);
  const points = useMemo(
    () => challenges.filter((c) => c.status !== "MERGED").map((c) => ({ c, ...project(c.location.lat, c.location.lng) })),
    [challenges],
  );

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Challenge locations across Jharkhand">
        <path d={OUTLINE} fill="var(--color-muted)" stroke="var(--color-border)" strokeWidth="0.6" />
        {points.map(({ c, x, y }) => {
          const r = c.severity === "Critical" ? 2.6 : c.severity === "High" ? 2.1 : 1.6;
          const fill = c.severity === "Critical" || c.severity === "High" ? "var(--color-accent)" : "var(--color-primary)";
          return (
            <g key={c.id}>
              {(c.severity === "Critical" || c.reportCount > 10) && (
                <circle cx={x} cy={y} r={r * 2.2} fill={fill} opacity="0.12" />
              )}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                opacity={0.9}
                className="cursor-pointer"
                onMouseEnter={() => setHover(c)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect?.(c)}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" /> High / critical severity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" /> Low / medium severity
        </span>
        <span>Marker size reflects report volume</span>
      </div>
      {hover && (
        <div className="pointer-events-none absolute top-2 left-2 max-w-[240px] rounded-md border border-border bg-card px-3 py-2 shadow-sm">
          <p className="text-[12.5px] font-medium text-ink">{hover.title}</p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {hover.location.village}, {hover.location.district} · {hover.reportCount} report(s)
          </p>
        </div>
      )}
    </div>
  );
}
