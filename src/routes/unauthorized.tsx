import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { ROLE_HOME, useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Access restricted — Jharkhand Societal Innovation Platform" },
      { name: "description", content: "This portal is restricted to a different stakeholder role." },
      { property: "og:title", content: "Access restricted" },
      { property: "og:description", content: "This portal is restricted to a different stakeholder role." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Unauthorized,
});

function Unauthorized() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-md px-7 py-8 text-center">
        <ShieldAlert className="mx-auto size-8 text-accent" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold">Access restricted</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          This area belongs to a different stakeholder role. Role-based access control keeps citizen, government,
          university and industry workspaces separate.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {user ? (
            <Link to={ROLE_HOME[user.role]} className="btn btn-primary">
              Go to my dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign in
            </Link>
          )}
          <Link to="/" className="btn btn-outline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
