import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Menu,
  PlusCircle,
  Search,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { Role } from "@/lib/types";
import { fmtDateTime } from "./kit";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean | undefined;
}

const NAV: Record<Role, NavItem[]> = {
  CITIZEN: [
    { to: "/citizen", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/citizen/report", label: "Report a Problem", icon: PlusCircle },
    { to: "/citizen/challenges", label: "My Challenges", icon: FileText },
    { to: "/citizen/nearby", label: "Nearby Challenges", icon: MapIcon },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/challenges", label: "Challenge Review", icon: ShieldCheck },
    { to: "/admin/clusters", label: "Duplicate Clusters", icon: Workflow },
    { to: "/admin/projects", label: "Projects & Impact", icon: FileText },
    { to: "/admin/analytics", label: "Analytics", icon: Landmark },
  ],
  UNIVERSITY: [
    { to: "/university", label: "Innovation Workspace", icon: LayoutDashboard, exact: true },
    { to: "/university/challenges", label: "Recommended Challenges", icon: ShieldCheck },
    { to: "/university/projects", label: "Projects", icon: FileText },
    { to: "/university/teams", label: "Teams & Mentors", icon: Users },
  ],
  INDUSTRY: [
    { to: "/industry", label: "Collaboration Hub", icon: LayoutDashboard, exact: true },
    { to: "/industry/projects", label: "Projects Seeking Support", icon: Building2 },
    { to: "/industry/partnerships", label: "My Partnerships", icon: FileText },
  ],
};

const ORG_LINE: Record<Role, string> = {
  CITIZEN: "Citizen Services",
  ADMIN: "Dept. of Higher & Technical Education",
  UNIVERSITY: "Higher Education Institution",
  INDUSTRY: "Industry & CSR Partner",
};

export function PortalLayout({
  role,
  title,
  subtitle,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const { notifications, markAllRead } = useData();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login", replace: true });
    else if (ready && user && user.role !== role) navigate({ to: "/unauthorized", replace: true });
  }, [ready, user, role, navigate]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Verifying your session…</p>
      </div>
    );
  }

  const items = NAV[role];
  const mine = notifications.filter((n) => n.role === role);
  const unread = mine.filter((n) => !n.read).length;

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link to="/" className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent font-serif text-[15px] font-bold text-accent-foreground">
          JH
        </span>
        <span className="min-w-0">
          <span className="block truncate font-serif text-[15px] font-semibold text-white">Societal Innovation</span>
          <span className="block text-[10.5px] tracking-[0.14em] text-sidebar-foreground/60 uppercase">
            Government of Jharkhand
          </span>
        </span>
      </Link>

      <div className="border-b border-sidebar-border px-5 py-3">
        <div className="text-[10px] tracking-[0.14em] text-sidebar-foreground/50 uppercase">Portal</div>
        <div className="mt-0.5 text-[13.5px] font-semibold text-white">{ROLE_LABEL[role]}</div>
        <div className="text-[11.5px] text-sidebar-foreground/60">{ORG_LINE[role]}</div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white data-[status=active]:bg-sidebar-accent data-[status=active]:font-medium data-[status=active]:text-white"
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="text-[12.5px] font-medium text-white">{user.name}</div>
        <div className="text-[11.5px] text-sidebar-foreground/60">{user.title ?? user.email}</div>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/", replace: true });
          }}
          className="mt-3 inline-flex items-center gap-2 text-[12.5px] text-sidebar-foreground/70 transition-colors hover:text-white"
        >
          <LogOut className="size-3.5" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-[248px] shrink-0 lg:block">
        <div className="fixed h-screen w-[248px]">{sidebar}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink/40" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-[264px] shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-paper/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="size-5" />
            </button>
            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input className="field pl-9" placeholder="Search challenges, projects, districts…" aria-label="Search" />
            </div>
            <div className="flex-1 md:hidden" />
            <div className="relative">
              <button
                className="btn btn-ghost btn-sm relative"
                onClick={() => {
                  setBellOpen((v) => !v);
                  if (!bellOpen) markAllRead(role);
                }}
                aria-label={`Notifications (${unread} unread)`}
              >
                <Bell className="size-[18px]" />
                {unread > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 z-40 mt-2 w-[340px] rounded-lg border border-border bg-card shadow-lg">
                  <div className="border-b border-border px-4 py-2.5 text-[12px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                    Notifications
                  </div>
                  <ul className="max-h-[320px] overflow-y-auto">
                    {mine.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-muted-foreground">Nothing yet.</li>}
                    {mine.slice(0, 8).map((n) => (
                      <li key={n.id} className="border-b border-border px-4 py-3 last:border-b-0">
                        <p className="text-[13px] font-medium text-ink">{n.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{fmtDateTime(n.at)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5 border-l border-border pl-3">
              <span className="hidden text-right sm:block">
                <span className="block text-[12.5px] font-medium text-ink">{user.name}</span>
                <span className="block text-[11px] text-muted-foreground">{ROLE_LABEL[role]}</span>
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
                {user.name
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </span>
            </div>
          </div>
        </header>

        <div className="border-b border-border bg-card px-4 py-5 sm:px-6">
          <h1 className="font-serif text-[22px] font-semibold text-ink sm:text-[26px]">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl text-[13.5px] text-muted-foreground">{subtitle}</p>}
        </div>

        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>

      {bellOpen && <button className="fixed inset-0 z-20" aria-hidden onClick={() => setBellOpen(false)} tabIndex={-1} />}
    </div>
  );
}

export function CloseIcon() {
  return <X className="size-4" />;
}

export function statusPathClass(active: boolean) {
  return cn(active && "font-medium");
}
