import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Mic, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { DOMAINS } from "@/lib/aiService";
import { DISTRICTS } from "@/lib/seed";
import { AIBadge, DataRow, Field, Panel, PanelHeader, ScoreBar } from "@/components/kit";
import type { AIAnalysis } from "@/lib/types";

export const Route = createFileRoute("/citizen/report")({
  head: () => ({
    meta: [
      { title: "Report a problem — Citizen portal" },
      { name: "description", content: "Describe a community problem with evidence, location and community impact so it can be validated and solved." },
      { property: "og:title", content: "Report a problem — Citizen portal" },
      { property: "og:description", content: "A short guided form: basic information, evidence, location and community impact." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportProblem,
});

const DURATIONS = ["Less than 6 months", "6-12 months", "1-5 years", "More than 5 years"];
const FREQUENCIES = ["Daily", "Weekly", "Seasonal", "Occasional"];
const URGENCIES = ["Low", "Medium", "High", "Critical"];

const DISTRICT_COORDS: Record<string, [number, number]> = {
  Ranchi: [23.36, 85.33],
  Gumla: [23.04, 84.54],
  Dhanbad: [23.8, 86.44],
  "East Singhbhum": [22.8, 86.2],
  Hazaribagh: [23.99, 85.36],
  Palamu: [24.05, 84.07],
  Dumka: [24.27, 87.25],
  Simdega: [22.61, 84.5],
  Bokaro: [23.65, 85.98],
  Giridih: [24.19, 86.3],
};

function ReportProblem() {
  const { user } = useAuth();
  const { submitChallenge } = useData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    district: user?.district ?? "Gumla",
    block: "",
    village: "",
    affectedPopulation: "",
    issueDuration: DURATIONS[2]!,
    frequency: FREQUENCIES[0]!,
    urgency: URGENCIES[2]!,
  });
  const [files, setFiles] = useState<{ type: "photo" | "video" | "document"; name: string }[]>([]);
  const [phase, setPhase] = useState<"form" | "analysing" | "done">("form");
  const [result, setResult] = useState<{ id: string; analysis: AIAnalysis } | null>(null);

  const coords = DISTRICT_COORDS[form.district] ?? [23.36, 85.33];
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function addFile(type: "photo" | "video" | "document") {
    const names = {
      photo: ["field-photo.jpg", "site-photo-2.jpg", "closeup.jpg"],
      video: ["site-walkthrough.mp4"],
      document: ["panchayat-letter.pdf", "measurement-note.pdf"],
    }[type];
    setFiles((prev) => [...prev, { type, name: names[prev.filter((f) => f.type === type).length % names.length]! }]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPhase("analysing");
    const payload = {
      ...form,
      subcategory: form.subcategory,
      lat: coords[0] + (Math.random() - 0.5) * 0.05,
      lng: coords[1] + (Math.random() - 0.5) * 0.05,
      affectedPopulation: Number(form.affectedPopulation) || 100,
      evidenceNames: files,
      submittedBy: user.id,
      submitterName: user.name,
    };
    window.setTimeout(() => {
      const { challenge, analysis } = submitChallenge(payload);
      setResult({ id: challenge.id, analysis });
      setPhase("done");
      toast.success("Challenge submitted successfully.");
    }, 1600);
  }

  if (phase !== "form") {
    return (
      <PortalLayout role="CITIZEN" title="Challenge submitted" subtitle="Your report has been logged and sent for officer validation.">
        <div className="mx-auto max-w-2xl space-y-6">
          <Panel className="px-6 py-7 text-center">
            <CheckCircle2 className="mx-auto size-9 text-primary" aria-hidden />
            <h2 className="mt-4 font-serif text-[21px] font-semibold text-ink">Challenge submitted successfully.</h2>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              A state nodal officer will review it. You will be notified at every stage.
            </p>
          </Panel>

          <Panel>
            <PanelHeader
              title={phase === "analysing" ? "AI analysis in progress…" : "Preliminary analysis"}
              subtitle="Suggestions for officer review. The officer can override any of these."
              action={<AIBadge />}
            />
            {phase === "analysing" ? (
              <div className="space-y-4 px-5 py-8">
                {["Classifying the problem domain", "Scoring priority and innovation potential", "Searching for similar reports nearby"].map((step) => (
                  <div key={step} className="flex items-center gap-3 text-[13.5px] text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                    {step}
                  </div>
                ))}
              </div>
            ) : (
              result && (
                <div className="animate-rise grid gap-5 px-5 py-5 sm:grid-cols-2">
                  <dl>
                    <DataRow label="Category" value={result.analysis.category} />
                    <DataRow label="Subcategory" value={result.analysis.subcategory} />
                    <DataRow label="Severity" value={result.analysis.severity} />
                    <DataRow label="Similar challenges" value={result.analysis.similarCount} />
                    <DataRow label="Model confidence" value={`${Math.round(result.analysis.confidence * 100)}%`} />
                  </dl>
                  <div className="space-y-4">
                    <ScoreBar label="Priority" value={result.analysis.priorityScore} />
                    <ScoreBar label="Innovation potential" value={result.analysis.innovationScore} tone="accent" />
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground">{result.analysis.summary}</p>
                  </div>
                </div>
              )
            )}
          </Panel>

          {result && (
            <div className="flex flex-wrap gap-2">
              <Link to="/citizen/challenges/$id" params={{ id: result.id }} className="btn btn-primary">
                View my challenge
              </Link>
              <button className="btn btn-outline" onClick={() => navigate({ to: "/citizen" })}>
                Back to dashboard
              </button>
            </div>
          )}
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      role="CITIZEN"
      title="Report a Problem"
      subtitle="Four short sections. The more specific you are, the faster officers and universities can act."
    >
      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
        <Panel>
          <PanelHeader eyebrow="Section 1" title="Basic information" />
          <div className="grid gap-4 px-5 py-5">
            <Field label="Title" required hint="One line, as you would describe it to a neighbour.">
              <input
                className="field"
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Drinking water from our handpump has turned yellow"
              />
            </Field>
            <Field label="Description" required hint="What happens, since when, and who it affects.">
              <textarea
                className="field min-h-[130px]"
                required
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the problem, when it started and how it affects daily life…"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" hint="Leave blank to let the system suggest one.">
                <select className="field" value={form.category} onChange={(e) => { set("category", e.target.value); set("subcategory", ""); }}>
                  <option value="">Suggest for me</option>
                  {Object.keys(DOMAINS).map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subcategory">
                <select className="field" value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} disabled={!form.category}>
                  <option value="">Suggest for me</option>
                  {(DOMAINS[form.category]?.subcategories ?? []).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="rounded-md border border-border bg-muted/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-ink">Prefer to speak instead of type?</p>
                  <p className="text-[12px] text-muted-foreground">Voice description in your language — coming soon.</p>
                </div>
                <button type="button" className="btn btn-outline btn-sm" disabled>
                  <Mic className="size-4" aria-hidden /> Record
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Section 2" title="Evidence" subtitle="Photos help officers validate faster." />
          <div className="px-5 py-5">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => addFile("photo")}>
                <Upload className="size-4" aria-hidden /> Add photo
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => addFile("video")}>
                <Upload className="size-4" aria-hidden /> Add video
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => addFile("document")}>
                <Upload className="size-4" aria-hidden /> Add document
              </button>
            </div>
            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <span className="text-[13px] text-ink">
                      {f.name} <span className="text-muted-foreground">· {f.type}</span>
                    </span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                      <X className="size-4 text-muted-foreground hover:text-danger" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Section 3" title="Location" subtitle="Pick your district — the block and village make routing accurate." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-3">
            <Field label="District" required>
              <select className="field" value={form.district} onChange={(e) => set("district", e.target.value)}>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Block" required>
              <input className="field" required value={form.block} onChange={(e) => set("block", e.target.value)} placeholder="Raidih" />
            </Field>
            <Field label="Village / Area" required>
              <input className="field" required value={form.village} onChange={(e) => set("village", e.target.value)} placeholder="Kondra" />
            </Field>
            <div className="sm:col-span-3">
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/60 px-4 py-3">
                <div>
                  <div className="eyebrow">Map selector</div>
                  <p className="mt-0.5 text-[13px] text-ink">
                    Approximate coordinates: <span className="font-mono">{coords[0].toFixed(3)}, {coords[1].toFixed(3)}</span>
                  </p>
                  <p className="text-[12px] text-muted-foreground">Derived from your district; drop a precise pin from the mobile app.</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Section 4" title="Community impact" subtitle="This drives prioritisation." />
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <Field label="Approximate people affected" required>
              <input
                className="field"
                type="number"
                min={1}
                required
                value={form.affectedPopulation}
                onChange={(e) => set("affectedPopulation", e.target.value)}
                placeholder="850"
              />
            </Field>
            <Field label="How long has the issue existed?">
              <select className="field" value={form.issueDuration} onChange={(e) => set("issueDuration", e.target.value)}>
                {DURATIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="How frequently does it occur?">
              <select className="field" value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                {FREQUENCIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Urgency">
              <select className="field" value={form.urgency} onChange={(e) => set("urgency", e.target.value)}>
                {URGENCIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary btn-lg">Submit challenge</button>
          <Link to="/citizen" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </PortalLayout>
  );
}
