import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeta } from "@/contexts/PageMetaContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { createClient } from "@/lib/supabase/client";
import {
  Check, Copy, Link2, Mail, Plus, Trash2, UserCircle2, Users, X,
} from "lucide-react";
import { cn, avatarGradient, avatarInitials } from "@/lib/utils";
import { FormSelect } from "@/components/ui/form-select";
import {
  StatBar, StatItem, FilterBar, SearchInput, FilterSelect,
} from "@/components/ui/page-components";
import type { Database } from "@/lib/supabase/types";

export const Route = createFileRoute("/settings/team-members")({
  component: TeamMembersPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Role    = Database["public"]["Tables"]["roles"]["Row"];
type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type Member  = Database["public"]["Tables"]["user_profiles"]["Row"] & {
  roles:    Pick<Role, "id" | "name" | "color"> | null;
  vehicles: Pick<Vehicle, "id" | "name"> | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const inputCls  = "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50";
const labelCls  = "block text-2xs uppercase tracking-wider text-muted-foreground font-medium mb-1";

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function fetchMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*, roles(id, name, color), vehicles(id, name)")
    .order("created_at");
  if (error) throw error;
  return data as Member[];
}

async function fetchRoles() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, color")
    .order("created_at");
  if (error) throw error;
  return data as Pick<Role, "id" | "name" | "color">[];
}

async function fetchVehicles() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data as Pick<Vehicle, "id" | "name">[];
}

async function updateMember(id: string, patch: { role_id?: string | null; vehicle_id?: string | null }) {
  const supabase = createClient();
  const { error } = await supabase.from("user_profiles").update(patch).eq("id", id);
  if (error) throw error;
}

async function removeMember(id: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("deactivate_member", { p_id: id });
  if (error) throw error;
}

type InactiveMember = {
  id: string;
  tenant_id: string;
  full_name: string | null;
  email: string | null;
  role_id: string | null;
  is_active: boolean;
  created_at: string;
};

async function fetchInactiveMembers(): Promise<InactiveMember[]> {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_inactive_members");
  if (error) throw error;
  return ((data ?? []) as unknown as InactiveMember[]);
}

async function reactivateMember(id: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("reactivate_member", { p_id: id });
  if (error) throw error;
}

// ─── Initials avatar ──────────────────────────────────────────────────────────


function Avatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ background: avatarGradient(name) }}
    >
      {avatarInitials(name)}
    </div>
  );
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Pick<Role, "name" | "color"> | null }) {
  if (!role) return <span className="text-xs text-muted-foreground/50 italic">No role</span>;
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-2xs font-medium text-white"
      style={{ backgroundColor: role.color + "cc" }}
    >
      {role.name}
    </span>
  );
}

// ─── EditPanel ────────────────────────────────────────────────────────────────

function EditPanel({
  member,
  roles,
  vehicles,
  onSave,
  onClose,
}: {
  member: Member;
  roles: Pick<Role, "id" | "name" | "color">[];
  vehicles: Pick<Vehicle, "id" | "name">[];
  onSave: (id: string, patch: { role_id: string | null; vehicle_id: string | null }) => void;
  onClose: () => void;
}) {
  const [roleId,    setRoleId]    = useState(member.role_id    ?? "");
  const [vehicleId, setVehicleId] = useState(member.vehicle_id ?? "");

  function handleSave() {
    onSave(member.id, {
      role_id:    roleId    || null,
      vehicle_id: vehicleId || null,
    });
    onClose();
  }

  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-80 flex-col border-l border-border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={member.full_name ?? "?"} />
          <div>
            <p className="text-base font-medium">{member.full_name ?? "Unknown"}</p>
            <p className="text-xs text-muted-foreground">{member.email ?? ""}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div>
          <label className={labelCls}>Role</label>
          <FormSelect value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">No role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </FormSelect>
        </div>

        <div>
          <label className={labelCls}>Assigned Vehicle</label>
          <FormSelect value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">None</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </FormSelect>
          {vehicles.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              No vehicles set up yet. Add them in Inventory → Locations.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-8 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-8 rounded-md border border-border px-4 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── InvitePanel ──────────────────────────────────────────────────────────────

function InvitePanel({
  tenantId,
  tenantSlug,
  roles,
  onClose,
}: {
  tenantId: string;
  tenantSlug: string;
  roles: Pick<Role, "id" | "name" | "color">[];
  onClose: () => void;
}) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [roleId,   setRoleId]   = useState(roles[0]?.id ?? "");
  const [copied,   setCopied]   = useState(false);
  const [link,     setLink]     = useState("");

  const selectedRole = roles.find((r) => r.id === roleId);

  function generateLink() {
    if (tenantSlug) {
      const params = new URLSearchParams();
      if (selectedRole) params.set("role", selectedRole.name);
      if (name.trim())  params.set("n",    name.trim());
      if (email.trim()) params.set("e",    email.trim());
      setLink(`${window.location.origin}/join/${tenantSlug}?${params.toString()}`);
    } else {
      // Fallback for tenants without a slug yet (pre-migration)
      const payload: Record<string, string> = { tenant_id: tenantId };
      if (selectedRole)  payload.role_name = selectedRole.name;
      if (name.trim())   payload.full_name = name.trim();
      if (email.trim())  payload.email     = email.trim();
      const token = btoa(JSON.stringify(payload));
      setLink(`${window.location.origin}/auth/signup?t=${token}`);
    }
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-80 flex-col border-l border-border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="text-base font-semibold">Invite Team Member</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          <label className={labelCls}>Name (optional)</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setLink(""); }}
            placeholder="Jane Smith"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setLink(""); }}
            placeholder="jane@company.com"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Pre-fills their signup form.
          </p>
        </div>

        <div>
          <label className={labelCls}>Role</label>
          <FormSelect
            value={roleId}
            onChange={(e) => { setRoleId(e.target.value); setLink(""); }}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </FormSelect>
        </div>

        {/* Generated link */}
        {link && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">Invite Link</p>
            <p className="font-mono text-2xs text-muted-foreground break-all leading-relaxed">{link}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Send this link to your team member. They'll create their own password and join your account.
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4 space-y-2">
        {!link ? (
          <button
            type="button"
            onClick={generateLink}
            className="w-full h-8 flex items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Link2 className="h-3.5 w-3.5" /> Generate Invite Link
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCopy}
            className="w-full h-8 flex items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {copied
              ? <><Check className="h-3.5 w-3.5" /> Copied!</>
              : <><Copy className="h-3.5 w-3.5" /> Copy Link</>
            }
          </button>
        )}
        <button
          type="button"
          disabled
          className="w-full h-8 flex items-center justify-center gap-2 rounded-md border border-border text-sm text-muted-foreground opacity-50 cursor-not-allowed"
        >
          <Mail className="h-3.5 w-3.5" /> Send via Email (coming soon)
        </button>
      </div>
    </div>
  );
}

// ─── TeamMembersPage ──────────────────────────────────────────────────────────

function TeamMembersPage() {
  const { setMeta } = useMeta();
  const { can } = usePermissions();
  const canWrite = can("settings", "write");
  useEffect(() => {
    setMeta({ title: "Team Members", subtitle: "Settings" });
  }, [setMeta]);

  const qc = useQueryClient();
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("all");
  const [editId,      setEditId]      = useState<string | null>(null);
  const [inviteOpen,  setInviteOpen]  = useState(false);
  const [confirmId,   setConfirmId]   = useState<string | null>(null);

  const { data: members         = [], isLoading } = useQuery({ queryKey: ["members"],          queryFn: fetchMembers         });
  const { data: inactiveMembers = [] }            = useQuery({ queryKey: ["inactive-members"], queryFn: fetchInactiveMembers });
  const { data: roles           = [] }            = useQuery({ queryKey: ["roles-basic"],       queryFn: fetchRoles           });
  const { data: vehicles        = [] }            = useQuery({ queryKey: ["vehicles"],          queryFn: fetchVehicles        });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { role_id: string | null; vehicle_id: string | null } }) =>
      updateMember(id, patch),
    onSuccess: (_, { id, patch }) => {
      qc.setQueryData<Member[]>(["members"], (prev) =>
        prev?.map((m) => {
          if (m.id !== id) return m;
          const role    = roles.find((r) => r.id === patch.role_id)    ?? null;
          const vehicle = vehicles.find((v) => v.id === patch.vehicle_id) ?? null;
          return { ...m, ...patch, roles: role, vehicles: vehicle };
        }) ?? []
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeMember,
    onSuccess: (_, id) => {
      const removed = members.find((m) => m.id === id);
      qc.setQueryData<Member[]>(["members"], (prev) => prev?.filter((m) => m.id !== id) ?? []);
      if (removed) {
        qc.setQueryData<InactiveMember[]>(["inactive-members"], (prev) => [
          ...(prev ?? []),
          {
            id: removed.id,
            tenant_id: removed.tenant_id,
            full_name: removed.full_name,
            email: removed.email,
            role_id: removed.role_id,
            is_active: false,
            created_at: removed.created_at,
          },
        ]);
      }
      if (editId === id) setEditId(null);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateMember,
    onSuccess: (_, id) => {
      const reactivated = inactiveMembers.find((m) => m.id === id);
      qc.setQueryData<InactiveMember[]>(["inactive-members"], (prev) => prev?.filter((m) => m.id !== id) ?? []);
      if (reactivated) {
        qc.invalidateQueries({ queryKey: ["members"] });
      }
    },
  });

  const tenantId   = members[0]?.tenant_id ?? "";
  const tenantData = qc.getQueryData<{ slug?: string }>(["tenant"]);
  const tenantSlug = tenantData?.slug ?? "";

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role_id !== roleFilter) return false;
      if (q && !m.full_name?.toLowerCase().includes(q) && !m.email?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [members, search, roleFilter]);

  const editMember = editId ? members.find((m) => m.id === editId) ?? null : null;

  const rolesInUse = new Set(members.map((m) => m.role_id).filter(Boolean)).size;
  const vehiclesAssigned = members.filter((m) => m.vehicle_id).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading team…
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Stat bar */}
      <StatBar>
        <StatItem icon={Users}       label="Team Members"      value={String(members.length)} />
        <StatItem icon={UserCircle2} label="Roles in Use"      value={String(rolesInUse)} />
        <StatItem icon={UserCircle2} label="Vehicles Assigned" value={String(vehiclesAssigned)} />
      </StatBar>

      {/* Filter bar */}
      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
        />
        <FilterSelect value={roleFilter} onChange={setRoleFilter}>
          <option value="all">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </FilterSelect>
        {canWrite && (
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => { setInviteOpen(true); setEditId(null); }}
              className="h-8 flex items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> Invite Member
            </button>
          </div>
        )}
      </FilterBar>

      {/* Member table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-2xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Member</th>
              <th className="text-left px-4 py-2.5 font-medium">Email</th>
              <th className="text-left px-4 py-2.5 font-medium">Role</th>
              <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Vehicle</th>
              <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Joined</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr
                key={member.id}
                onClick={canWrite ? () => { setEditId(member.id); setInviteOpen(false); } : undefined}
                className={cn(
                  "group border-b border-border/60 transition-colors",
                  canWrite && "cursor-pointer",
                  editId === member.id ? "bg-accent/40" : canWrite ? "hover:bg-muted/30" : undefined,
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={member.full_name ?? "?"} />
                    <span className="font-medium">{member.full_name ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{member.email ?? "—"}</td>
                <td className="px-4 py-3"><RoleBadge role={member.roles} /></td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {member.vehicles?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {member.created_at
                    ? new Date(member.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  {canWrite && (confirmId === member.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground">Remove?</span>
                      <button
                        onClick={() => { removeMutation.mutate(member.id); setConfirmId(null); }}
                        className="rounded px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(member.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  {search || roleFilter !== "all" ? "No members match your filters" : "No team members yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deactivated members */}
      {inactiveMembers.length > 0 && (
        <div className="border-t border-border px-4 py-4">
          <p className="text-2xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
            Deactivated Members
            <span className="ml-1.5 text-foreground font-mono">{inactiveMembers.length}</span>
          </p>
          <div className="space-y-1">
            {inactiveMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white/70 bg-muted-foreground/30"
                >
                  {(m.full_name ?? "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-muted-foreground truncate">{m.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground/60">{m.email ?? ""}</p>
                </div>
                {canWrite && (
                  <button
                    onClick={() => reactivateMutation.mutate(m.id)}
                    disabled={reactivateMutation.isPending}
                    className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side panels */}
      {canWrite && editMember && (
        <>
          <div className="absolute inset-0 z-10" onClick={() => setEditId(null)} />
          <EditPanel
            member={editMember}
            roles={roles}
            vehicles={vehicles}
            onSave={(id, patch) => updateMutation.mutate({ id, patch })}
            onClose={() => setEditId(null)}
          />
        </>
      )}
      {canWrite && inviteOpen && (
        <>
          <div className="absolute inset-0 z-10" onClick={() => setInviteOpen(false)} />
          <InvitePanel
            tenantId={tenantId}
            tenantSlug={tenantSlug}
            roles={roles}
            onClose={() => setInviteOpen(false)}
          />
        </>
      )}
    </div>
  );
}
