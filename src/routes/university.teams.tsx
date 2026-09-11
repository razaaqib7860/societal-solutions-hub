import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalLayout } from "@/components/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Metric, Panel, PanelHeader } from "@/components/kit";

export const Route = createFileRoute("/university/teams")({
  head: () => ({
    meta: [
      { title: "Teams & mentors — University portal" },
      { name: "description", content: "Faculty mentors and multidisciplinary student teams available for societal innovation projects." },
      { property: "og:title", content: "Teams & mentors — University portal" },
      { property: "og:description", content: "Faculty expertise and student bench strength across departments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Teams,
});

function Teams() {
  const { user } = useAuth();
  const { faculty, students, projects, universities } = useData();
  const uniId = user?.organizationId ?? universities[0]!.id;
  const myFaculty = faculty.filter((f) => f.universityId === uniId);
  const myStudents = students.filter((s) => s.universityId === uniId);
  const mine = projects.filter((p) => p.universityId === uniId);

  const byDept = myStudents.reduce<Record<string, typeof myStudents>>((acc, s) => {
    acc[s.department] = [...(acc[s.department] ?? []), s];
    return acc;
  }, {});

  return (
    <PortalLayout role="UNIVERSITY" title="Teams & Mentors" subtitle="Multidisciplinary teams solve societal problems better than single-department teams.">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Faculty mentors" value={myFaculty.length} />
          <Metric label="Students on bench" value={myStudents.length} />
          <Metric label="Departments represented" value={Object.keys(byDept).length} />
          <Metric label="Teams deployed" value={mine.filter((p) => p.studentIds.length > 0).length} tone="primary" />
        </div>

        <Panel>
          <PanelHeader title="Faculty mentors" subtitle="Available to mentor student project teams" />
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Expertise</th>
                  <th className="text-right">Mentoring</th>
                </tr>
              </thead>
              <tbody>
                {myFaculty.map((f) => (
                  <tr key={f.id}>
                    <td className="font-medium text-ink">{f.name}</td>
                    <td className="text-muted-foreground">{f.department}</td>
                    <td className="text-muted-foreground">{f.expertise.join(", ")}</td>
                    <td className="text-right font-mono tabular-nums">{mine.filter((p) => p.facultyMentorId === f.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(byDept).map(([dept, list]) => (
            <Panel key={dept}>
              <PanelHeader eyebrow={`${list.length} students`} title={dept} />
              <ul>
                {list.map((s) => (
                  <li key={s.id} className="flex items-center justify-between border-b border-border px-5 py-3 last:border-b-0">
                    <span className="text-[13px] text-ink">{s.name}</span>
                    <span className="text-[12px] text-muted-foreground">{s.year}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>

        <Panel>
          <PanelHeader title="Team composition per project" subtitle="Assembled in the project workspace" />
          <ul>
            {mine.map((p) => {
              const mentor = myFaculty.find((f) => f.id === p.facultyMentorId);
              const team = myStudents.filter((s) => p.studentIds.includes(s.id));
              return (
                <li key={p.id} className="border-b border-border px-5 py-4 last:border-b-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link to="/university/projects/$id" params={{ id: p.id }} className="text-[13.5px] font-semibold text-ink hover:text-primary">
                        {p.title}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{mentor ? `Mentor: ${mentor.name}` : "Mentor not assigned"}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {team.map((s) => (
                        <span key={s.id} className="badge badge-neutral">
                          {s.name.split(" ")[0]} · {s.department}
                        </span>
                      ))}
                      {team.length === 0 && <span className="text-[12px] text-muted-foreground">No students added yet</span>}
                    </div>
                  </div>
                </li>
              );
            })}
            {mine.length === 0 && <li className="px-5 py-6 text-[13px] text-muted-foreground">No projects yet.</li>}
          </ul>
        </Panel>
      </div>
    </PortalLayout>
  );
}
