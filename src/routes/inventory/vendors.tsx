import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { currency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  Building2, ExternalLink, LayoutGrid, List, Mail, MapPin,
  Pencil, Phone, ShoppingCart, Star, Truck, User, X,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { VENDORS, type VendorRecord, type VendorStatus, type VendorCategory } from "@/data/vendors";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/inventory/vendors")({
  head: () => ({ meta: [{ title: "Vendors · Port City Sound & Security" }] }),
  component: VendorsPage,
});

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<VendorStatus, { label: string; cls: string }> = {
  preferred: { label: "Preferred", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  active:    { label: "Active",    cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
  inactive:  { label: "Inactive",  cls: "bg-slate-500/15 text-slate-500 dark:text-slate-400" },
};

const CATEGORIES: VendorCategory[] = ["Security", "AV", "Networking", "Cabling", "Hardware", "Specialty"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const words = name.replace(/[/&]/g, " ").split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VendorStatus }) {
  const { label, cls } = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap", cls)}>
      {status === "preferred" ? <Star className="h-2.5 w-2.5 fill-current" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

function CategoryBadge({ category }: { category: VendorCategory }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium bg-muted text-muted-foreground">
      {category}
    </span>
  );
}

function VendorAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = getInitials(name);
  return (
    <div className={cn(
      "shrink-0 flex items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-chart-2/20 font-semibold text-primary",
      size === "sm" ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-[12px]",
    )}>
      {initials}
    </div>
  );
}

// ─── VendorDrawer ─────────────────────────────────────────────────────────────

type DrawerMode = "view" | "edit";

interface VendorDrawerProps {
  open: boolean;
  vendor: VendorRecord | null;
  mode: DrawerMode;
  onClose: () => void;
  onSwitchToEdit: () => void;
  onSave: (v: VendorRecord) => void;
}

function VendorDrawer({ open, vendor, mode, onClose, onSwitchToEdit, onSave }: VendorDrawerProps) {
  const [form, setForm] = useState<Partial<VendorRecord>>({});

  useEffect(() => {
    if (!open || !vendor) return;
    setForm({ ...vendor });
  }, [open, vendor]);

  function field<K extends keyof VendorRecord>(key: K) {
    return {
      value: (form[key] ?? "") as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  function handleSave() {
    if (!vendor) return;
    onSave({ ...vendor, ...form } as VendorRecord);
  }

  const inputCls = "h-8 w-full rounded-md border border-border bg-background px-3 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50";
  const labelCls = "block text-[10.5px] font-medium text-muted-foreground mb-1";

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-120 flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-start gap-3 pr-6">
            {vendor && <VendorAvatar name={vendor.name} />}
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-[14px] font-semibold leading-snug truncate">
                {vendor?.name ?? "Vendor"}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {vendor && <CategoryBadge category={vendor.category} />}
                {vendor && <StatusBadge status={vendor.status} />}
              </div>
            </div>
          </div>
        </SheetHeader>

        {vendor && mode === "view" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "YTD Spend",    value: currency(vendor.ytdSpend),    sub: `${vendor.totalPOs} total POs` },
                  { label: "Active POs",   value: String(vendor.activePOs),     sub: vendor.activePOs > 0 ? "In progress" : "None open" },
                  { label: "Last Order",   value: vendor.lastOrderDate ?? "—",  sub: "" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="rounded-lg border border-border bg-surface/30 px-3 py-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                    <p className="text-[13px] font-semibold tabular-nums">{value}</p>
                    {sub && <p className="text-[10.5px] text-muted-foreground mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>

              {/* Contact info */}
              <fieldset className="space-y-0 rounded-lg border border-border overflow-hidden divide-y divide-border/50">
                {vendor.accountNumber && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-[11.5px] text-muted-foreground">Account #</span>
                    <span className="text-[12.5px] font-mono font-medium">{vendor.accountNumber}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-[11.5px] text-muted-foreground">Payment Terms</span>
                  <span className="text-[12.5px] font-medium">{vendor.paymentTerms}</span>
                </div>
                {vendor.website && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-[11.5px] text-muted-foreground">Website</span>
                    <a
                      href={`https://${vendor.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[12.5px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {vendor.website}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-[11.5px] text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> Phone
                    </span>
                    <span className="text-[12.5px]">{vendor.phone}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-[11.5px] text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                    <a
                      href={`mailto:${vendor.email}`}
                      className="text-[12.5px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {vendor.email}
                    </a>
                  </div>
                )}
                {(vendor.city || vendor.state) && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-[11.5px] text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> Location
                    </span>
                    <span className="text-[12.5px]">{vendor.city}{vendor.state && `, ${vendor.state}`}</span>
                  </div>
                )}
              </fieldset>

              {/* Rep */}
              {vendor.repName && (
                <fieldset>
                  <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Account Rep</legend>
                  <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/50">
                    <div className="flex items-center justify-between px-3.5 py-2">
                      <span className="text-[11.5px] text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3 w-3" /> Name
                      </span>
                      <span className="text-[12.5px] font-medium">{vendor.repName}</span>
                    </div>
                    {vendor.repPhone && (
                      <div className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-[11.5px] text-muted-foreground flex items-center gap-1.5">
                          <Phone className="h-3 w-3" /> Phone
                        </span>
                        <span className="text-[12.5px]">{vendor.repPhone}</span>
                      </div>
                    )}
                    {vendor.repEmail && (
                      <div className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-[11.5px] text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3 w-3" /> Email
                        </span>
                        <a
                          href={`mailto:${vendor.repEmail}`}
                          className="text-[12.5px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {vendor.repEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </fieldset>
              )}

              {/* Notes */}
              {vendor.notes && (
                <fieldset>
                  <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Notes</legend>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed rounded-lg border border-border bg-surface/30 px-3.5 py-3">
                    {vendor.notes}
                  </p>
                </fieldset>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button type="button" onClick={onClose}
                className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] hover:bg-accent transition-colors">
                Close
              </button>
              <button type="button" onClick={onSwitchToEdit}
                className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
          </div>
        )}

        {vendor && mode === "edit" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Core details */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Vendor Details</legend>

                <div>
                  <label className={labelCls}>Vendor Name *</label>
                  <input {...field("name")} className={inputCls} placeholder="e.g. ADI Global Distribution" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select {...field("category")} className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select {...field("status")} className={inputCls}>
                      <option value="preferred">Preferred</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Account #</label>
                    <input {...field("accountNumber")} className={inputCls} placeholder="e.g. PCSS-ADI-4412" />
                  </div>
                  <div>
                    <label className={labelCls}>Payment Terms</label>
                    <select {...field("paymentTerms")} className={inputCls}>
                      {["Net 15", "Net 30", "Net 45", "Net 60", "COD", "Prepay"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Contact info */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Contact</legend>

                <div>
                  <label className={labelCls}>Website</label>
                  <input {...field("website")} className={inputCls} placeholder="e.g. adisecurity.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input {...field("phone")} className={inputCls} placeholder="(800) 000-0000" type="tel" />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input {...field("email")} className={inputCls} placeholder="orders@vendor.com" type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>City</label>
                    <input {...field("city")} className={inputCls} placeholder="City" />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input {...field("state")} className={inputCls} placeholder="ST" />
                  </div>
                </div>
              </fieldset>

              {/* Account rep */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Account Rep</legend>

                <div>
                  <label className={labelCls}>Rep Name</label>
                  <input {...field("repName")} className={inputCls} placeholder="Full name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Rep Phone</label>
                    <input {...field("repPhone")} className={inputCls} placeholder="(555) 000-0000" type="tel" />
                  </div>
                  <div>
                    <label className={labelCls}>Rep Email</label>
                    <input {...field("repEmail")} className={inputCls} placeholder="rep@vendor.com" type="email" />
                  </div>
                </div>
              </fieldset>

              {/* Notes */}
              <fieldset>
                <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Notes</legend>
                <textarea
                  {...field("notes")}
                  rows={3}
                  placeholder="Internal notes about this vendor…"
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                />
              </fieldset>
            </div>

            <div className="shrink-0 flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button type="button" onClick={onSwitchToEdit}
                className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] hover:bg-accent transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSave}
                className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── VendorsPage ──────────────────────────────────────────────────────────────

function VendorsPage() {
  const { setMeta } = useMeta();
  const [vendors, setVendors] = useState<VendorRecord[]>(VENDORS);
  const [newOpen, setNewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "all">("all");
  const [view, setView] = useState<"cards" | "list">("list");
  const [selected, setSelected] = useState<VendorRecord | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");

  useEffect(() => {
    setMeta({
      title: "Vendors",
      subtitle: `${vendors.length} vendors`,
      onNew: () => setNewOpen(true),
      newLabel: "+ New Vendor",
    });
  }, [setMeta, vendors.length]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return vendors.filter((v) => {
      if (q && !v.name.toLowerCase().includes(q) && !v.city.toLowerCase().includes(q)) return false;
      if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vendors, search, categoryFilter, statusFilter]);

  const totalYtdSpend = useMemo(() => vendors.reduce((s, v) => s + v.ytdSpend, 0), [vendors]);
  const activePOCount = useMemo(() => vendors.reduce((s, v) => s + v.activePOs, 0), [vendors]);
  const preferredCount = useMemo(() => vendors.filter((v) => v.status === "preferred").length, [vendors]);

  function openView(v: VendorRecord) {
    setSelected(v);
    setDrawerMode("view");
  }
  function openEdit(v: VendorRecord) {
    setSelected(v);
    setDrawerMode("edit");
  }
  function handleSave(updated: VendorRecord) {
    setVendors((prev) => prev.map((v) => v.id === updated.id ? updated : v));
    setSelected(updated);
    setDrawerMode("view");
  }

  const selectCls = "h-7 rounded-md border border-border bg-surface px-2 text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex flex-col">
      {/* Stat bar */}
      <div className="flex items-center gap-0 border-b border-border overflow-x-auto">
        {[
          { icon: Truck,         label: "Total Vendors",    value: String(vendors.length)       },
          { icon: Star,          label: "Preferred",        value: String(preferredCount)        },
          { icon: ShoppingCart,  label: "Active POs",       value: String(activePOCount)         },
          { icon: Building2,     label: "YTD Spend",        value: currency(totalYtdSpend)       },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-3 border-r border-border shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-[14px] font-semibold tabular-nums leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors…"
          className="h-7 min-w-40 flex-1 rounded-md border border-border bg-surface px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as VendorCategory | "all")} className={selectCls}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as VendorStatus | "all")} className={selectCls}>
          <option value="all">All Statuses</option>
          <option value="preferred">Preferred</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || categoryFilter !== "all" || statusFilter !== "all") && (
          <button
            type="button"
            onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); }}
            className="flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
        <span className="text-[11px] text-muted-foreground font-mono">
          {filtered.length} of {vendors.length}
        </span>
        <div className="ml-auto flex items-center rounded-md border border-border overflow-hidden">
          <button type="button" onClick={() => setView("cards")}
            className={cn("flex h-7 w-7 items-center justify-center transition-colors",
              view === "cards" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground")}
            aria-label="Card view">
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setView("list")}
            className={cn("flex h-7 w-7 items-center justify-center border-l border-border transition-colors",
              view === "list" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground")}
            aria-label="List view">
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Card view */}
      {view === "cards" && (
        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <div
              key={v.id}
              onClick={() => openView(v)}
              className="group rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <VendorAvatar name={v.name} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate leading-snug">{v.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CategoryBadge category={v.category} />
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{v.city}, {v.state}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">YTD Spend</div>
                  <div className="text-[12.5px] font-semibold tabular-nums">{currency(v.ytdSpend)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Total POs</div>
                  <div className="text-[12.5px] font-semibold">{v.totalPOs}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Active POs</div>
                  <div className={cn("text-[12.5px] font-semibold", v.activePOs > 0 && "text-amber-600 dark:text-amber-400")}>
                    {v.activePOs}
                  </div>
                </div>
              </div>

              {v.repName && (
                <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <User className="h-3 w-3 shrink-0" />
                  <span>{v.repName}</span>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-12 text-center text-[12.5px] text-muted-foreground">
              No vendors match the current filters.
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="p-4 overflow-x-auto">
          <div className="rounded-lg border border-border bg-card overflow-hidden min-w-215">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface/50">
                <tr className="border-b border-border text-[10.5px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 px-3 text-left font-medium">Vendor</th>
                  <th className="py-2 px-3 text-left font-medium">Status</th>
                  <th className="py-2 px-3 text-left font-medium">Account #</th>
                  <th className="py-2 px-3 text-left font-medium">Terms</th>
                  <th className="py-2 px-3 text-left font-medium">Rep</th>
                  <th className="py-2 px-3 text-right font-medium">YTD Spend</th>
                  <th className="py-2 px-3 text-right font-medium">Active POs</th>
                  <th className="py-2 px-3 text-right font-medium">Last Order</th>
                  <th className="py-2 px-3 pr-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => openView(v)}
                    className="group row-hover border-b border-border/60 cursor-pointer"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <VendorAvatar name={v.name} size="sm" />
                        <div>
                          <div className="font-semibold leading-snug">{v.name}</div>
                          <div className="text-[11px] text-muted-foreground">{v.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11.5px] text-muted-foreground">
                      {v.accountNumber ?? "—"}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{v.paymentTerms}</td>
                    <td className="py-2.5 px-3">
                      {v.repName ? (
                        <div>
                          <div className="leading-snug">{v.repName}</div>
                          {v.repEmail && (
                            <div className="text-[11px] text-muted-foreground truncate max-w-36">{v.repEmail}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11.5px]">{currency(v.ytdSpend)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={cn(
                        "font-semibold",
                        v.activePOs > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
                      )}>
                        {v.activePOs}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground text-[12px]">
                      {v.lastOrderDate ?? "—"}
                    </td>
                    <td className="py-2.5 px-3 pr-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(v); }}
                        className="invisible group-hover:visible flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ml-auto"
                        aria-label="Edit vendor"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[12.5px] text-muted-foreground">
                      No vendors match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer */}
      <VendorDrawer
        open={selected !== null}
        vendor={selected}
        mode={drawerMode}
        onClose={() => setSelected(null)}
        onSwitchToEdit={() => setDrawerMode(drawerMode === "edit" ? "view" : "edit")}
        onSave={handleSave}
      />

      {/* New vendor modal placeholder */}
      {newOpen && (
        <NewVendorModal onClose={() => setNewOpen(false)} onAdd={(v) => { setVendors((prev) => [...prev, v]); setNewOpen(false); }} />
      )}
    </div>
  );
}

// ─── NewVendorModal ───────────────────────────────────────────────────────────

interface NewVendorModalProps {
  onClose: () => void;
  onAdd: (v: VendorRecord) => void;
}

function NewVendorModal({ onClose, onAdd }: NewVendorModalProps) {
  const idRef = useRef(Date.now());
  const [form, setForm] = useState({
    name: "", category: "Hardware" as VendorCategory, status: "active" as VendorStatus,
    accountNumber: "", paymentTerms: "Net 30",
    website: "", phone: "", email: "", city: "", state: "",
    repName: "", repPhone: "", repEmail: "", notes: "",
  });

  function f(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((p) => ({ ...p, [key]: e.target.value })),
    };
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    onAdd({
      id: `v-new-${idRef.current}`,
      name: form.name,
      category: form.category,
      status: form.status,
      accountNumber: form.accountNumber || null,
      paymentTerms: form.paymentTerms,
      website: form.website,
      phone: form.phone,
      email: form.email,
      city: form.city,
      state: form.state,
      repName: form.repName || null,
      repPhone: form.repPhone || null,
      repEmail: form.repEmail || null,
      totalPOs: 0,
      ytdSpend: 0,
      activePOs: 0,
      lastOrderDate: null,
      notes: form.notes,
    });
  }

  const inputCls = "h-8 w-full rounded-md border border-border bg-surface px-2.5 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50";
  const labelCls = "block text-[10px] uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold">New Vendor</h2>
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Vendor Name *</label>
            <input {...f("name")} className={inputCls} placeholder="e.g. Axis Communications" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select {...f("category")} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select {...f("status")} className={inputCls}>
              <option value="preferred">Preferred</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Account #</label>
            <input {...f("accountNumber")} className={inputCls} placeholder="Your account number" />
          </div>
          <div>
            <label className={labelCls}>Payment Terms</label>
            <select {...f("paymentTerms")} className={inputCls}>
              {["Net 15", "Net 30", "Net 45", "Net 60", "COD", "Prepay"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Website</label>
            <input {...f("website")} className={inputCls} placeholder="e.g. vendor.com" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input {...f("phone")} className={inputCls} placeholder="(800) 000-0000" type="tel" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input {...f("email")} className={inputCls} placeholder="orders@vendor.com" type="email" />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input {...f("city")} className={inputCls} placeholder="City" />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input {...f("state")} className={inputCls} placeholder="ST" />
          </div>
          <div className="col-span-2 pt-1 border-t border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Account Rep (Optional)</p>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Rep Name</label>
            <input {...f("repName")} className={inputCls} placeholder="Full name" />
          </div>
          <div>
            <label className={labelCls}>Rep Phone</label>
            <input {...f("repPhone")} className={inputCls} placeholder="(555) 000-0000" type="tel" />
          </div>
          <div>
            <label className={labelCls}>Rep Email</label>
            <input {...f("repEmail")} className={inputCls} placeholder="rep@vendor.com" type="email" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Notes</label>
            <textarea {...f("notes")} rows={3} placeholder="Internal notes…"
              className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose}
            className="h-8 rounded-md border border-border px-3 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
          <button onClick={handleAdd}
            className="h-8 rounded-md bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Add Vendor
          </button>
        </div>
      </div>
    </div>
  );
}
