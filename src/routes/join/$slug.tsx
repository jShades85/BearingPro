import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const Route = createFileRoute("/join/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: typeof search.role === "string" ? search.role : "",
    n:    typeof search.n    === "string" ? search.n    : "",
    e:    typeof search.e    === "string" ? search.e    : "",
  }),
  component: JoinPage,
});

type TenantInfo = { id: string; name: string; slug: string };

function JoinPage() {
  const { slug } = Route.useParams();
  const search   = Route.useSearch();

  const [tenant,   setTenant]   = useState<TenantInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .rpc("get_tenant_by_slug", { p_slug: slug })
      .then(({ data }: { data: TenantInfo[] | null }) => {
        const row = data?.[0] ?? null;
        if (row) setTenant(row);
        else     setNotFound(true);
      });
  }, [slug]);

  function handleAccept() {
    const payload: Record<string, string> = { tenant_id: tenant!.id };
    if (search.role) payload.role_name  = search.role;
    if (search.n)    payload.full_name  = search.n;
    if (search.e)    payload.email      = search.e;
    const token = btoa(JSON.stringify(payload));
    window.location.href = `/auth/signup?t=${token}`;
  }

  if (!tenant && !notFound) {
    return (
      <JoinShell>
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </JoinShell>
    );
  }

  if (notFound) {
    return (
      <JoinShell>
        <div className="text-center">
          <p className="text-[15px] font-semibold text-foreground">Invalid invite link</p>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            This invite link is no longer valid or the company doesn't exist.
          </p>
          <Link to="/auth/login" className="mt-5 inline-block text-[12px] text-primary hover:underline">
            Sign in instead
          </Link>
        </div>
      </JoinShell>
    );
  }

  const initials = tenant!.name
    .replace(/&/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <JoinShell>
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary to-chart-2 text-[18px] font-bold text-primary-foreground shadow-glow">
          {initials}
        </div>
        <h1 className="text-[17px] font-semibold text-foreground">
          You're invited to join
        </h1>
        <p className="mt-1 text-[15px] font-medium text-primary">{tenant!.name}</p>
        {search.role && (
          <p className="mt-1 text-[13px] text-muted-foreground">
            Role: <span className="font-medium text-foreground">{search.role}</span>
          </p>
        )}
        {search.n && (
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Invited as <span className="font-medium text-foreground">{search.n}</span>
          </p>
        )}
      </div>

      <button
        onClick={handleAccept}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Accept Invitation
      </button>

      <p className="mt-4 text-center text-[12px] text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </JoinShell>
  );
}

function JoinShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-2 text-[11px] font-bold text-primary-foreground shadow-glow">
            BP
          </div>
          <span className="text-[14px] font-semibold tracking-tight">BearingPro</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
