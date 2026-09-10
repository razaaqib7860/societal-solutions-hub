import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Building2, GraduationCap, Landmark, Loader2, Users } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/lib/seed";
import { ROLE_HOME, ROLE_LABEL, useAuth } from "@/context/AuthContext";
import { Field } from "@/components/kit";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Jharkhand Societal Innovation Platform" },
      {
        name: "description",
        content: "Sign in to the citizen, government, university or industry portal of the Jharkhand innovation platform.",
      },
      { property: "og:title", content: "Sign in — Jharkhand Societal Innovation Platform" },
      { property: "og:description", content: "Role-based access for citizens, government, universities and industry partners." },
    ],
  }),
  component: LoginPage,
});

const ROLE_ICON: Record<Role, typeof Users> = {
  CITIZEN: Users,
  ADMIN: Landmark,
  UNIVERSITY: GraduationCap,
  INDUSTRY: Building2,
};

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: ROLE_HOME[user.role], replace: true });
  }, [ready, user, navigate]);

  async function submit(e: React.FormEvent, creds?: { email: string; password: string }) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const signed = await login(creds?.email ?? email, creds?.password ?? password);
      toast.success(`Signed in as ${ROLE_LABEL[signed.role]}`);
      navigate({ to: ROLE_HOME[signed.role], replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="hidden flex-col justify-between bg-sidebar px-12 py-12 text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-sm bg-accent font-serif font-bold text-accent-foreground">
            JH
          </span>
          <span>
            <span className="block font-serif text-[16px] font-semibold text-white">Societal Innovation Platform</span>
            <span className="block text-[10.5px] tracking-[0.14em] text-sidebar-foreground/60 uppercase">
              Government of Jharkhand
            </span>
          </span>
        </Link>

        <div className="max-w-md">
          <h2 className="font-serif text-3xl leading-snug font-semibold text-white">
            We don't just collect societal problems.
          </h2>
          <p className="mt-3 text-[15px] text-sidebar-foreground/75">
            We turn them into collaborative innovation projects and track them until measurable impact is created.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-sidebar-border pt-6">
            {[
              ["412", "Challenges validated"],
              ["18", "Universities connected"],
              ["37", "Industry partners"],
              ["48,200", "Citizens impacted"],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="font-serif text-2xl font-semibold text-white tabular-nums">{v}</dt>
                <dd className="text-[12.5px] text-sidebar-foreground/60">{k}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-[11.5px] text-sidebar-foreground/45">
          Prototype for Smart India Hackathon. Demo data only.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden">
            <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-sm bg-primary font-serif font-bold text-primary-foreground">
                JH
              </span>
              <span className="font-serif text-[15px] font-semibold">Societal Innovation Platform</span>
            </Link>
          </div>

          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Access is role-based. You'll be taken to your own workspace.
          </p>

          <form onSubmit={(e) => submit(e)} className="mt-7 space-y-4">
            <Field label="Email address" required>
              <input
                className="field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@department.gov.in"
                required
              />
            </Field>
            <Field label="Password" required>
              <input
                className="field"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>
            {error && (
              <p className="rounded-md border border-danger/25 bg-danger-soft px-3 py-2 text-[13px] text-danger">{error}</p>
            )}
            <button className="btn btn-primary w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Sign in
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <p className="eyebrow mb-3">Demo accounts — one click</p>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map(({ user: u, password: p }) => {
                const Icon = ROLE_ICON[u.role];
                return (
                  <button
                    key={u.email}
                    onClick={(e) => submit(e, { email: u.email, password: p })}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary-soft text-primary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-ink">
                        {ROLE_LABEL[u.role]} — {u.name}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">
                        {u.email} · {p}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
