import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, GraduationCap, Landmark, Users } from "lucide-react";
import { EcosystemFlow } from "@/components/EcosystemFlow";
import { Badge, SectionHeading } from "@/components/kit";
import { IMPACT_SNAPSHOT } from "@/lib/seed";
import { useData } from "@/context/DataContext";
import { useAuth, ROLE_HOME } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jharkhand Societal Innovation Collaboration Platform" },
      {
        name: "description",
        content:
          "Report community problems and watch them become validated challenges, university research projects and deployed solutions with measured social impact across Jharkhand.",
      },
      { property: "og:title", content: "From Community Problems to Real-World Solutions" },
      {
        property: "og:description",
        content:
          "An intelligent collaboration platform connecting citizens, universities, industry and government to solve Jharkhand's most pressing societal challenges.",
      },
    ],
  }),
  component: Landing,
});

const STAKEHOLDERS = [
  {
    icon: Users,
    title: "Citizens & Community Organisations",
    body: "Report a problem in minutes with photos, location and community impact. Follow it through every stage.",
  },
  {
    icon: Landmark,
    title: "Government & Nodal Officers",
    body: "Validate reports, merge duplicates into master challenges, prioritise by evidence and route to the right institution.",
  },
  {
    icon: GraduationCap,
    title: "Higher Education Institutions",
    body: "Receive challenges matched to your departments, labs and faculty. Form multidisciplinary teams and submit solutions.",
  },
  {
    icon: Building2,
    title: "Industry, Startups, MSMEs & CSR",
    body: "Back the projects that fit your capability — funding, hardware, mentorship, pilot sites, deployment.",
  },
];

function Landing() {
  const { challenges } = useData();
  const { user } = useAuth();
  const featured = challenges.filter((c) => c.status !== "MERGED").slice(0, 4);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-sm bg-primary font-serif text-[15px] font-bold text-primary-foreground">
              JH
            </span>
            <span>
              <span className="block font-serif text-[15px] leading-tight font-semibold text-ink">
                Societal Innovation Platform
              </span>
              <span className="block text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Government of Jharkhand
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/challenges" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              Explore Challenges
            </Link>
            {user ? (
              <Link to={ROLE_HOME[user.role]} className="btn btn-primary btn-sm">
                My dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
          <div>
            <Badge tone="forest">Jharkhand · Public innovation infrastructure</Badge>
            <h1 className="mt-5 font-serif text-[34px] leading-[1.12] font-semibold text-ink sm:text-[44px]">
              From Community Problems to Real-World Solutions.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-slate">
              An intelligent collaboration platform connecting citizens, universities, industry and government to solve
              Jharkhand's most pressing societal challenges.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user?.role === "CITIZEN" ? "/citizen/report" : "/login"} className="btn btn-primary btn-lg">
                Report a Challenge
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link to="/challenges" className="btn btn-outline btn-lg">
                Explore Challenges
              </Link>
            </div>
            <p className="mt-5 text-[12.5px] text-muted-foreground">
              Four connected portals · AI-assisted triage reviewed by government officers · Impact tracked to deployment
            </p>
          </div>
          <EcosystemFlow />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeading eyebrow="Impact snapshot" title="What the state has achieved so far" />
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
            {IMPACT_SNAPSHOT.map((stat) => (
              <div key={stat.label} className="bg-card px-4 py-5">
                <dd className="font-serif text-[27px] leading-none font-semibold text-primary tabular-nums">
                  {stat.value.toLocaleString("en-IN")}
                </dd>
                <dt className="mt-2 text-[12.5px] leading-snug text-muted-foreground">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            eyebrow="Four stakeholders, one workflow"
            title="Every participant has a defined role"
            description="Each portal shows only what that stakeholder needs to act on, with role-based access control enforced end to end."
          />
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {STAKEHOLDERS.map((s) => (
              <div key={s.title} className="bg-card px-5 py-6">
                <s.icon className="size-5 text-accent" aria-hidden />
                <h3 className="mt-3 text-[15px] font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            eyebrow="Live challenge register"
            title="Recently reported across the state"
            action={
              <Link to="/challenges" className="btn btn-outline btn-sm">
                View all challenges
              </Link>
            }
          />
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Challenge</th>
                    <th>District</th>
                    <th>Domain</th>
                    <th className="text-right">Reports</th>
                    <th className="text-right">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {featured.map((c) => (
                    <tr key={c.id}>
                      <td className="max-w-[380px]">
                        <Link to="/challenges/$id" params={{ id: c.id }} className="font-medium text-ink hover:text-primary">
                          {c.title}
                        </Link>
                      </td>
                      <td className="text-muted-foreground">{c.location.district}</td>
                      <td className="text-muted-foreground">{c.category}</td>
                      <td className="text-right font-mono tabular-nums">{c.reportCount}</td>
                      <td className="text-right font-mono font-semibold tabular-nums">{c.priorityScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-sidebar px-4 py-10 text-sidebar-foreground sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-serif text-[15px] font-semibold text-white">Societal Innovation Collaboration Platform</p>
            <p className="mt-1 text-[12.5px] text-sidebar-foreground/60">
              Department of Higher & Technical Education, Government of Jharkhand
            </p>
          </div>
          <div className="text-[12.5px] text-sidebar-foreground/60">
            <p>Prototype built for Smart India Hackathon. All data shown is demonstration data.</p>
            <Link to="/login" className="mt-2 inline-block text-white underline underline-offset-4">
              Sign in to a portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
