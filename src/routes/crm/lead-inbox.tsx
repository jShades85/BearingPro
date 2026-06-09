import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui-bits";
import { PageTabs, PageTab, FilterBar, FilterSelect } from "@/components/ui/page-components";
import { useMeta } from "@/contexts/PageMetaContext";
import { ownerNames } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/crm/lead-inbox")({
  head: () => ({ meta: [{ title: "Lead Inbox · BearingPro" }] }),
  component: LeadInbox,
});

// ─── Types ───────────────────────────────────────────────────────────────────

type LeadStatus = "new" | "contacted" | "qualified" | "dismissed";
type LeadSource = "Phone" | "Web Form" | "Referral" | "Email" | "Walk-in";

interface Lead {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: LeadSource;
  service: string;
  location: string;
  dateReceived: string;
  assignedTo: string;
  status: LeadStatus;
  notes: string;
  activity: { time: string; text: string }[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const statusMeta: Record<LeadStatus, { label: string; cls: string }> = {
  new:       { label: "New",       cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  contacted: { label: "Contacted", cls: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
  qualified: { label: "Qualified", cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
  dismissed: { label: "Dismissed", cls: "bg-slate-500/15 text-slate-500 dark:text-slate-400" },
};

const sourceCls: Record<LeadSource, string> = {
  "Phone":    "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "Web Form": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "Referral": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "Email":    "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  "Walk-in":  "bg-teal-500/15 text-teal-600 dark:text-teal-400",
};

const statusOrder: LeadStatus[] = ["new", "contacted", "qualified", "dismissed"];
const sourceOptions: LeadSource[] = ["Phone", "Web Form", "Referral", "Email", "Walk-in"];

// ─── Demo data ────────────────────────────────────────────────────────────────

const INITIAL_LEADS: Lead[] = [
  {
    id: 1, name: "John Hartwell", company: "Hartwell Properties",
    phone: "(312) 555-0142", email: "j.hartwell@hartwellprop.com",
    source: "Phone", service: "Security system install", location: "Chicago, IL",
    dateReceived: "2026-05-28", assignedTo: "JK", status: "new", notes: "",
    activity: [{ time: "May 28, 9:14 AM", text: "Lead received via phone call" }],
  },
  {
    id: 2, name: "Sarah Okonkwo", company: "Okonkwo Restaurant Group",
    phone: "(305) 555-8821", email: "sokonkwo@okonkwo-rg.com",
    source: "Referral", service: "AV system + background audio", location: "Miami, FL",
    dateReceived: "2026-05-30", assignedTo: "EM", status: "contacted",
    notes: "Referred by Quay Residential. Looking to outfit 3 locations.",
    activity: [
      { time: "May 30, 10:00 AM", text: "Lead received via referral" },
      { time: "Jun 01, 2:30 PM",  text: "Called — left voicemail" },
      { time: "Jun 02, 9:15 AM",  text: "Send intro email with portfolio" },
    ],
  },
  {
    id: 3, name: "Mike Delaney", company: "Delaney Construction",
    phone: "(303) 555-4410", email: "mike@delaneyconst.com",
    source: "Web Form", service: "Access control system", location: "Denver, CO",
    dateReceived: "2026-06-01", assignedTo: "RT", status: "qualified",
    notes: "Has a $40k budget. Timeline is Q3 for new office buildout.",
    activity: [
      { time: "Jun 01, 8:00 AM",  text: "Lead received via web form" },
      { time: "Jun 02, 11:00 AM", text: "Called — spoke with Mike, confirmed interest" },
      { time: "Jun 03, 3:00 PM",  text: "Site visit scheduled for Jun 10" },
    ],
  },
  {
    id: 4, name: "Rachel Kim", company: "Kim Medical Partners",
    phone: "(718) 555-0299", email: "rkim@kimmedical.org",
    source: "Email", service: "Conference room AV", location: "Brooklyn, NY",
    dateReceived: "2026-06-02", assignedTo: "SN", status: "new", notes: "",
    activity: [{ time: "Jun 02, 4:45 PM", text: "Lead received via email inquiry" }],
  },
  {
    id: 5, name: "Tom Garza", company: "Garza Family Estates",
    phone: "(512) 555-7733", email: "tgarza@garzaestates.com",
    source: "Walk-in", service: "Home theater + smart automation", location: "Austin, TX",
    dateReceived: "2026-06-03", assignedTo: "AV", status: "contacted",
    notes: "Came in person. Very interested in full smart home with Lutron lighting.",
    activity: [
      { time: "Jun 03, 1:15 PM",  text: "Walk-in visit at showroom" },
      { time: "Jun 04, 10:00 AM", text: "Sent intro email with smart home brochure" },
    ],
  },
  {
    id: 6, name: "Lisa Nguyen", company: "Pacific Realty Group",
    phone: "(615) 555-1908", email: "lnguyen@pacificrealty.com",
    source: "Referral", service: "Surveillance / IP camera system", location: "Nashville, TN",
    dateReceived: "2026-06-04", assignedTo: "MO", status: "dismissed",
    notes: "Timeline too far out — revisit Q1 2027.",
    activity: [
      { time: "Jun 04, 9:30 AM", text: "Lead received via referral" },
      { time: "Jun 04, 2:00 PM", text: "Called — timeline 12+ months out, dismissed" },
    ],
  },
  {
    id: 7, name: "Carlos Rivera", company: "Rivera Hotel Group",
    phone: "(323) 555-6641", email: "crivera@riverahotels.com",
    source: "Web Form", service: "IP cameras + access control", location: "Los Angeles, CA",
    dateReceived: "2026-06-05", assignedTo: "JK", status: "new", notes: "",
    activity: [{ time: "Jun 05, 7:55 AM", text: "Lead received via web form" }],
  },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, cls } = statusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium", sourceCls[source])}>
      {source}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function LeadInbox() {
  const { setMeta } = useMeta();
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all");

  const unreviewedCount = useMemo(
    () => leads.filter((l) => l.status === "new" || l.status === "contacted").length,
    [leads],
  );

  useEffect(() => {
    setMeta({
      title: "Lead Inbox",
      subtitle: `${unreviewedCount} unreviewed lead${unreviewedCount !== 1 ? "s" : ""}`,
      onNew: () => setNewLeadOpen(true),
      newLabel: "New Lead",
    });
  }, [setMeta, unreviewedCount]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length, new: 0, contacted: 0, qualified: 0, dismissed: 0 };
    leads.forEach((l) => { c[l.status]++; });
    return c;
  }, [leads]);

  const filteredLeads = useMemo(() => leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
    if (assignedFilter !== "all" && l.assignedTo !== assignedFilter) return false;
    return true;
  }), [leads, statusFilter, sourceFilter, assignedFilter]);

  const updateLead = useCallback((id: number, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSelectedLead((prev) => (prev !== null && prev.id === id ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Status tabs */}
      <PageTabs>
        {(["all", ...statusOrder] as (LeadStatus | "all")[]).map((s) => (
          <PageTab key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} count={statusCounts[s]}>
            {s === "all" ? "All" : statusMeta[s].label}
          </PageTab>
        ))}
      </PageTabs>
      {/* Filter bar */}
      <FilterBar>
        <FilterSelect value={sourceFilter} onChange={(v) => setSourceFilter(v as LeadSource | "all")}>
          <option value="all">All Sources</option>
          {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </FilterSelect>
        <FilterSelect value={assignedFilter} onChange={(v) => setAssignedFilter(v)}>
          <option value="all">All Assigned</option>
          {Object.entries(ownerNames).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {/* Lead list */}
      <div className="p-4">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface/50">
              <tr className="border-b border-border text-[10.5px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 px-3 text-left font-medium">Name / Company</th>
                <th className="py-2 px-3 text-left font-medium">Source</th>
                <th className="py-2 px-3 text-left font-medium">Service</th>
                <th className="py-2 px-3 text-left font-medium">Location</th>
                <th className="py-2 px-3 text-left font-medium">Received</th>
                <th className="py-2 px-3 text-left font-medium">Assigned</th>
                <th className="py-2 px-3 text-left font-medium">Status</th>
                <th className="py-2 px-3 pr-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="row-hover border-b border-border/60 cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold leading-snug">{lead.name}</div>
                    <div className="text-[11px] text-muted-foreground">{lead.company}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <SourceBadge source={lead.source} />
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground max-w-[180px]">
                    <span className="truncate block">{lead.service}</span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{lead.location}</td>
                  <td className="py-2.5 px-3 font-mono text-[11.5px] text-muted-foreground whitespace-nowrap">
                    {lead.dateReceived}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <Avatar initials={lead.assignedTo} />
                      <span className="text-[11.5px]">{ownerNames[lead.assignedTo]?.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-2.5 px-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateLead(lead.id, { status: "qualified" }); }}
                        disabled={lead.status === "qualified" || lead.status === "dismissed"}
                        className="h-6 rounded px-2 text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-35 disabled:cursor-default transition-opacity"
                      >
                        Convert
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateLead(lead.id, { status: "dismissed" }); }}
                        disabled={lead.status === "dismissed"}
                        className="h-6 rounded px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-35 disabled:cursor-default transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[12.5px] text-muted-foreground">
                    No leads match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={selectedLead !== null} onOpenChange={(open) => { if (!open) setSelectedLead(null); }}>
        {selectedLead !== null && (
          <LeadDrawer key={selectedLead.id} lead={selectedLead} onUpdate={updateLead} />
        )}
      </Sheet>

      {/* New lead modal */}
      <Dialog open={newLeadOpen} onOpenChange={setNewLeadOpen}>
        <NewLeadModal onClose={() => setNewLeadOpen(false)} />
      </Dialog>
    </div>
  );
}

// ─── Lead detail drawer ───────────────────────────────────────────────────────

function LeadDrawer({
  lead,
  onUpdate,
}: {
  lead: Lead;
  onUpdate: (id: number, patch: Partial<Lead>) => void;
}) {
  const [notes, setNotes] = useState(lead.notes);

  return (
    <SheetContent className="sm:max-w-[440px] flex flex-col p-0 gap-0">
      <SheetHeader className="border-b border-border px-5 py-4">
        <SheetTitle className="text-[15px] font-semibold">{lead.name}</SheetTitle>
        <p className="text-[12.5px] text-muted-foreground -mt-1">{lead.company}</p>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Status / Source / Date / Assigned grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-[12.5px]">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Source</p>
            <SourceBadge source={lead.source} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
            <StatusBadge status={lead.status} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Date Received</p>
            <span className="font-mono text-[12px]">{lead.dateReceived}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Assigned To</p>
            <div className="flex items-center gap-1.5">
              <Avatar initials={lead.assignedTo} />
              <span>{ownerNames[lead.assignedTo]}</span>
            </div>
          </div>
        </div>

        {/* Service / Location / Contact */}
        <div className="space-y-3 text-[12.5px]">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Service Interested In</p>
            <span>{lead.service}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Location</p>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {lead.location}
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Contact</p>
            <div className="flex flex-col gap-1 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {lead.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {lead.email}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate(lead.id, { notes })}
            placeholder="Add notes…"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Activity log */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Activity</p>
          <ul className="space-y-3">
            {lead.activity.map((a, i) => (
              <li key={i} className="flex gap-2.5 text-[12px]">
                <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/50" />
                <div>
                  <div>{a.text}</div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-border px-5 py-4 flex flex-col gap-2">
        <button
          onClick={() => onUpdate(lead.id, { status: "qualified" })}
          disabled={lead.status === "qualified"}
          className="w-full h-8 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-default transition-opacity"
        >
          Convert to Contact
        </button>
        <button
          onClick={() => onUpdate(lead.id, { status: "dismissed" })}
          disabled={lead.status === "dismissed"}
          className="w-full h-8 rounded-md border border-destructive text-destructive text-[12.5px] font-medium hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-default transition-colors"
        >
          Dismiss Lead
        </button>
      </div>
    </SheetContent>
  );
}

// ─── New lead modal ───────────────────────────────────────────────────────────

function NewLeadModal({ onClose }: { onClose: () => void }) {
  const inputCls  = "w-full h-8 rounded-md border border-border bg-surface px-2.5 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50";
  const selectCls = "w-full h-8 rounded-md border border-border bg-surface px-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary";
  const labelCls  = "block text-[10px] uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>New Lead</DialogTitle>
      </DialogHeader>
      <div className="mt-1 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Contact Name</label>
          <input className={inputCls} placeholder="Full name" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Company</label>
          <input className={inputCls} placeholder="Company name" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input className={inputCls} placeholder="(555) 000-0000" type="tel" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input className={inputCls} placeholder="email@example.com" type="email" />
        </div>
        <div>
          <label className={labelCls}>Source</label>
          <select className={selectCls}>
            {sourceOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Assign To</label>
          <select className={selectCls}>
            {Object.entries(ownerNames).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Service Interested In</label>
          <input className={inputCls} placeholder="e.g. Security system install" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Location</label>
          <input className={inputCls} placeholder="City, State" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Notes</label>
          <textarea
            rows={3}
            placeholder="Add any notes…"
            className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-8 rounded-md border border-border px-3 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="h-8 rounded-md bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Add Lead
        </button>
      </div>
    </DialogContent>
  );
}
