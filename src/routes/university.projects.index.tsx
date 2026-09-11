import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { LifecycleBar } from "@/components/LifecycleBar";
import { EmptyState, Panel, PanelHeader, fmtDate } from "@/components/kit";

export const Route = createFileRoute("/university/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — University portal" },
      { name: "description", content: "Your institution's live societal innovation projects, from proposal through pilot and deployment." },
      { property: "og:title", content: "Projects — University portal" },
      { property: "og:description", content: "Manage teams, proposals, milestones and industry support." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UniversityProjects,
});

function UniversityProjects() {
  const { user } = useAuth();
  const { projects, universities, faculty, industry } = useData();
  const uniId = user?.organizationId ?? universities[0]!.id;
  const mine = projects.filter((p) => p.universityId === uniId);

  return (
    <PortalLayout role="UNIVERSITY" title="Projects" subtitle="Each accepted challenge becomes a project workspace with a team, a proposal and milestones.">
      {mine.length === 0 ? (
        <EmptyState
          title="No projects yet"
          body="Accept a recommended challenge to open your first project workspace."
          action={
            <Link to="/university/challenges" className="btn btn-primary btn-sm">
              See recommended challenges
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {mine.map((p) => {
            const mentor = faculty.find((f) => f.id === p.facultyMentorId);
            const partners = industry.filter((i) => p.industryPartnerIds.includes(i.id));
            return (
              <Panel key={p.id}>
                <PanelHeader
                  eyebrow={`${p.code} · opened ${fmtDate(p.createdAt)}`}
                  title={p.title}
                  subtitle={`${mentor ? `Mentor: ${mentor.name}, ${mentor.department}` : "No faculty mentor assigned yet"} · ${p.studentIds.length} students`}
                  action={
                    <Link to="/university/projects/$id" params={{ id: p.id }} className="btn btn-primary btn-sm">
                      Open workspace
                    </Link>
                  }
                />
                <div className="px-5 py-5">
                  <LifecycleBar status={p.status} />
                </div>
                <div className="grid gap-4 border-t border-border px-5 py-4 sm:grid-cols-3">
                  <div>
                    <div className="eyebrow">Milestones</div>
                    <p className="mt-1 text-[13px] text-ink">
                      {p.milestones.filter((m) => m.status === "Completed").length} of {p.milestones.length} completed
                    </p>
                  </div>
                  <div>
                    <div className="eyebrow">Industry support</div>
                    <p className="mt-1 text-[13px] text-ink">{partners.length > 0 ? partners.map((x) => x.name).join(", ") : "Seeking partners"}</p>
                  </div>
                  <div>
                    <div className="eyebrow">Proposal</div>
                    <p className="mt-1 text-[13px] text-ink">{p.proposalId ? "Submitted" : "Pending"}</p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
