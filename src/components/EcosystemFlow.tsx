import { Building2, GraduationCap, Landmark, ScrollText, Users } from "lucide-react";

const NODES = [
  { icon: Users, label: "Citizen", caption: "Reports a lived problem" },
  { icon: ScrollText, label: "Challenge", caption: "Validated & prioritised" },
  { icon: GraduationCap, label: "University", caption: "Research team & solution" },
  { icon: Building2, label: "Industry", caption: "Funding, hardware, mentors" },
  { icon: Landmark, label: "Impact", caption: "Deployed & measured" },
];

/**
 * Ecosystem flow visualisation for the landing hero — a schematic of how a
 * community problem becomes measured impact. Motion is limited to a slow
 * travelling dash along the connectors.
 */
export function EcosystemFlow() {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted px-5 py-3">
        <span className="eyebrow">The collaboration pipeline</span>
        <span className="font-mono text-[11px] text-muted-foreground">JH-CH-1001 · Gumla</span>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <ol className="grid gap-5 sm:grid-cols-5 sm:gap-2">
          {NODES.map((node, i) => (
            <li key={node.label} className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
              {i < NODES.length - 1 && (
                <>
                  <svg className="absolute top-11 left-[19px] h-[calc(100%-12px)] w-px sm:hidden" aria-hidden>
                    <line
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="100%"
                      stroke="var(--color-primary)"
                      strokeOpacity="0.45"
                      strokeWidth="1.5"
                      strokeDasharray="4 6"
                      className="animate-flow"
                    />
                  </svg>
                  <svg
                    className="absolute top-[19px] left-[calc(50%+26px)] hidden h-px w-[calc(100%-52px)] sm:block"
                    aria-hidden
                  >
                    <line
                      x1="0"
                      y1="0.5"
                      x2="100%"
                      y2="0.5"
                      stroke="var(--color-primary)"
                      strokeOpacity="0.45"
                      strokeWidth="1.5"
                      strokeDasharray="4 6"
                      className="animate-flow"
                    />
                  </svg>
                </>
              )}
              <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-sm border border-primary/25 bg-primary-soft text-primary">
                <node.icon className="size-[18px]" aria-hidden />
              </span>
              <span className="min-w-0 sm:mt-3">
                <span className="block text-[14px] font-semibold text-ink">{node.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{node.caption}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-7 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
          {[
            { k: "Reports merged", v: "23 → 1 master challenge" },
            { k: "Matched institution", v: "IIIT Ranchi · 94% fit" },
            { k: "Verified impact", v: "850 residents, Raidih block" },
          ].map((row) => (
            <div key={row.k}>
              <div className="eyebrow">{row.k}</div>
              <div className="mt-0.5 text-[13.5px] font-medium text-ink">{row.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
