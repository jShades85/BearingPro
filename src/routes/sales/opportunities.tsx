import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Avatar, PriorityDot } from "@/components/ui-bits";
import { useMeta } from "@/contexts/PageMetaContext";
import { currency } from "@/lib/demo-data";
import type { Priority } from "@/lib/demo-data";
import {
  ChevronDown, ChevronUp, ChevronsUpDown, FileText,
  KanbanSquare, List, MapPin, MessageSquare, Phone, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/sales/opportunities")({
  head: () => ({ meta: [{ title: "Opportunities · Port City Sound & Security" }] }),
  component: Opportunities,
});

// ─── Types ───────────────────────────────────────────────────────────────────

type OpportunityStage =
  | "site-visit" | "estimating" | "proposal-sent"
  | "negotiation" | "closed-won" | "closed-lost";

type Source = "Referral" | "Repeat Client" | "Cold Outreach" | "Bid/RFP";
type ActivityKind = "call" | "quote" | "site-visit" | "proposal" | "note";
type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "expired";

interface LinkedQuote {
  number: string;
  value: number;
  status: QuoteStatus;
}

interface ActivityEntry {
  kind: ActivityKind;
  text: string;
  date: string;
}

interface Opportunity {
  id: number;
  title: string;
  company: string;
  contact: string;
  value: number;
  stage: OpportunityStage;
  closeDate: string;
  rep: string;
  repInitials: string;
  source: Source;
  priority: Priority;
  notes: string;
  linkedQuote?: LinkedQuote;
  activityFeed: ActivityEntry[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const stageOrder: OpportunityStage[] = [
  "site-visit", "estimating", "proposal-sent",
  "negotiation", "closed-won", "closed-lost",
];

const stageMeta: Record<OpportunityStage, { label: string; badge: string; dim?: true }> = {
  "site-visit":    { label: "Site Visit",    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  "estimating":    { label: "Estimating",    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  "proposal-sent": { label: "Proposal Sent", badge: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
  "negotiation":   { label: "Negotiation",   badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  "closed-won":    { label: "Closed Won",    badge: "bg-green-500/15 text-green-600 dark:text-green-400",  dim: true },
  "closed-lost":   { label: "Closed Lost",   badge: "bg-red-500/15 text-red-500 dark:text-red-400",        dim: true },
};

const priorityOrder: Record<Priority, number> = { urgent: 0, high: 1, med: 2, low: 3 };

const priorityBadgeCls: Record<Priority, string> = {
  urgent: "bg-red-500/15 text-red-600 dark:text-red-400",
  high:   "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  med:    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  low:    "bg-slate-500/15 text-slate-500 dark:text-slate-400",
};

const priorityLabel: Record<Priority, string> = {
  urgent: "Urgent", high: "High", med: "Medium", low: "Low",
};

const quoteStatusMeta: Record<QuoteStatus, { label: string; cls: string }> = {
  draft:    { label: "Draft",    cls: "bg-slate-500/15 text-slate-500" },
  sent:     { label: "Sent",     cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  viewed:   { label: "Viewed",   cls: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
  accepted: { label: "Accepted", cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
  expired:  { label: "Expired",  cls: "bg-red-500/15 text-red-500 dark:text-red-400" },
};

const activityIcon: Record<ActivityKind, React.ComponentType<{ className?: string }>> = {
  call:       Phone,
  quote:      FileText,
  "site-visit": MapPin,
  proposal:   Send,
  note:       MessageSquare,
};

const activityColor: Record<ActivityKind, string> = {
  call:       "text-green-500",
  quote:      "text-blue-500",
  "site-visit": "text-teal-500",
  proposal:   "text-amber-500",
  note:       "text-violet-500",
};

// ─── Demo data ────────────────────────────────────────────────────────────────

const INITIAL: Opportunity[] = [
  {
    id: 1,
    title: "Ballroom A/V + control room",
    company: "Harborview Hotel",
    contact: "Marcus Bell",
    value: 76400,
    stage: "site-visit",
    closeDate: "2026-07-15",
    rep: "Damon Reyes",
    repInitials: "DR",
    source: "Repeat Client",
    priority: "high",
    notes: "Large ballroom with tricky acoustics. Need to see the space before finalizing scope.",
    activityFeed: [
      { kind: "call",       text: "Call — confirmed site visit for Jun 18",        date: "Jun 05" },
      { kind: "call",       text: "Call — intro, discussed ballroom AV needs",     date: "Jun 03" },
      { kind: "note",       text: "Opportunity created from repeat client request", date: "Jun 01" },
    ],
  },
  {
    id: 2,
    title: "Exam room A/V systems",
    company: "Riverside Medical Center",
    contact: "Dr. Lena Park",
    value: 84200,
    stage: "proposal-sent",
    closeDate: "2026-06-28",
    rep: "Audrey Chen",
    repInitials: "AC",
    source: "Bid/RFP",
    priority: "high",
    linkedQuote: { number: "Q-2026-0392", value: 84200, status: "sent" },
    notes: "RFP response submitted. Waiting for procurement committee review. Decision expected June 25.",
    activityFeed: [
      { kind: "quote",      text: "Quote Q-2026-0392 sent — $84,200",              date: "Jun 01" },
      { kind: "proposal",   text: "Proposal delivered to procurement committee",    date: "May 29" },
      { kind: "site-visit", text: "Site visit — 12 exam rooms measured",           date: "May 20" },
      { kind: "call",       text: "Call — reviewed RFP requirements with Dr. Park", date: "May 15" },
    ],
  },
  {
    id: 3,
    title: "Conference room refresh — 3 floors",
    company: "Downtown Office Retrofit",
    contact: "Eli Voss",
    value: 52000,
    stage: "negotiation",
    closeDate: "2026-06-20",
    rep: "Damon Reyes",
    repInitials: "DR",
    source: "Repeat Client",
    priority: "med",
    notes: "Client requesting 15% discount. We can offer 8% if they sign by month end.",
    activityFeed: [
      { kind: "call",       text: "Call — negotiating final scope and pricing",    date: "Jun 05" },
      { kind: "proposal",   text: "Proposal sent — $52,000",                       date: "May 25" },
      { kind: "site-visit", text: "Site walkthrough — floors 3, 7, 12",           date: "May 10" },
      { kind: "call",       text: "Call — confirmed conference room count",         date: "May 02" },
    ],
  },
  {
    id: 4,
    title: "Multi-room audio system",
    company: "Northbeam Architects",
    contact: "Iris Wang",
    value: 38500,
    stage: "estimating",
    closeDate: "2026-07-30",
    rep: "Marcus Bell",
    repInitials: "MB",
    source: "Referral",
    priority: "med",
    notes: "Referred by Caleb Ortiz. New office build-out — AV being spec'd into design drawings.",
    activityFeed: [
      { kind: "site-visit", text: "Site visit — reviewed design drawings",         date: "Jun 02" },
      { kind: "call",       text: "Call — intro meeting, collected requirements",  date: "May 28" },
    ],
  },
  {
    id: 7,
    title: "Office PA and paging system",
    company: "Lakeside Comfort Systems",
    contact: "Carla Ruiz",
    value: 18500,
    stage: "site-visit",
    closeDate: "2026-07-18",
    rep: "Audrey Chen",
    repInitials: "AC",
    source: "Referral",
    priority: "med",
    notes: "Small warehouse office. PA system + 4-zone paging. Should be a straightforward install.",
    activityFeed: [
      { kind: "call", text: "Call — confirmed site visit for Jun 12", date: "Jun 04" },
      { kind: "call", text: "Call — intro, discussed paging needs",   date: "May 30" },
    ],
  },
  {
    id: 8,
    title: "2-room conference AV",
    company: "River North Plumbing",
    contact: "James Pruitt",
    value: 9800,
    stage: "estimating",
    closeDate: "2026-07-05",
    rep: "Iris Wang",
    repInitials: "IW",
    source: "Bid/RFP",
    priority: "low",
    notes: "Two conference rooms, basic AV. Labor-heavy given tight ceiling clearance.",
    activityFeed: [
      { kind: "site-visit", text: "Site visit — rooms measured, ceiling noted",   date: "Jun 01" },
      { kind: "call",       text: "Call — initial scope discussion",               date: "May 26" },
    ],
  },
  {
    id: 9,
    title: "Tenant showroom display wall",
    company: "Coastal Electric Co",
    contact: "Nina Torres",
    value: 34000,
    stage: "proposal-sent",
    closeDate: "2026-07-01",
    rep: "Marcus Bell",
    repInitials: "MB",
    source: "Cold Outreach",
    priority: "med",
    linkedQuote: { number: "Q-2026-0388", value: 34000, status: "viewed" },
    notes: "Showroom LED wall + ambient audio. Quote was viewed 3× — strong signal.",
    activityFeed: [
      { kind: "quote",      text: "Quote Q-2026-0388 sent — $34,000",             date: "May 31" },
      { kind: "site-visit", text: "Site visit — showroom floor measured",          date: "May 22" },
      { kind: "call",       text: "Call — intro, discussed display concept",       date: "May 14" },
    ],
  },
  {
    id: 10,
    title: "Common area A/V + access control",
    company: "Harbor View Apartments",
    contact: "Greg Moss",
    value: 67500,
    stage: "closed-won",
    closeDate: "2026-06-05",
    rep: "Audrey Chen",
    repInitials: "AC",
    source: "Repeat Client",
    priority: "med",
    linkedQuote: { number: "Q-2026-0381", value: 67500, status: "accepted" },
    notes: "Contract signed. Project kick-off scheduled for June 23.",
    activityFeed: [
      { kind: "note",     text: "Contract signed — kick-off scheduled Jun 23",   date: "Jun 05" },
      { kind: "quote",    text: "Quote Q-2026-0381 accepted — $67,500",          date: "Jun 02" },
      { kind: "proposal", text: "Final proposal delivered",                        date: "May 28" },
      { kind: "call",     text: "Call — scope finalized with Greg Moss",          date: "May 20" },
    ],
  },
  {
    id: 11,
    title: "District-wide classroom AV",
    company: "Tri-County School Dist.",
    contact: "Supt. D. Hale",
    value: 180000,
    stage: "closed-lost",
    closeDate: "2026-05-30",
    rep: "Damon Reyes",
    repInitials: "DR",
    source: "Bid/RFP",
    priority: "high",
    notes: "Lost to lower bid. Follow up when contract is up for renewal (2028).",
    activityFeed: [
      { kind: "call",     text: "Call — notified of award to competitor",         date: "May 30" },
      { kind: "proposal", text: "Final proposal submitted — $180,000",            date: "May 01" },
      { kind: "site-visit", text: "Site visits — 14 schools surveyed",           date: "Apr 15" },
      { kind: "call",     text: "Call — pre-bid conference with district",         date: "Mar 28" },
    ],
  },
  {
    id: 12,
    title: "Training room AV install",
    company: "Midwest Plumbing Supply",
    contact: "Phil Garza",
    value: 4200,
    stage: "negotiation",
    closeDate: "2026-06-18",
    rep: "Iris Wang",
    repInitials: "IW",
    source: "Referral",
    priority: "low",
    notes: "Small job but great relationship. Phil referred two clients last year.",
    activityFeed: [
      { kind: "call",     text: "Call — negotiating display mount pricing",       date: "Jun 04" },
      { kind: "proposal", text: "Proposal sent — $4,200",                         date: "May 28" },
      { kind: "call",     text: "Call — single training room, scope confirmed",   date: "May 20" },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: OpportunityStage }) {
  const { label, badge } = stageMeta[stage];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium", badge)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function Opportunities() {
  const { setMeta } = useMeta();
  const [opps, setOpps] = useState<Opportunity[]>(INITIAL);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const reps = useMemo(() => Array.from(new Set(opps.map((o) => o.rep))).sort(), [opps]);

  useEffect(() => {
    const pipeline = opps
      .filter((o) => o.stage !== "closed-lost")
      .reduce((s, o) => s + o.value, 0);
    setMeta({
      title: "Opportunities",
      subtitle: `${opps.length} opportunities · ${currency(pipeline)} pipeline`,
      onNew: () => console.log("New opportunity"),
      newLabel: "New Opportunity",
    });
  }, [setMeta, opps]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return opps.filter((o) => {
      if (q && !o.title.toLowerCase().includes(q) && !o.company.toLowerCase().includes(q) && !o.contact.toLowerCase().includes(q)) return false;
      if (priorityFilter !== "all" && o.priority !== priorityFilter) return false;
      if (assignedFilter !== "all" && o.rep !== assignedFilter) return false;
      return true;
    });
  }, [opps, search, priorityFilter, assignedFilter]);

  const moveStage = (id: number, stage: OpportunityStage) =>
    setOpps((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));

  const selectCls = "h-7 rounded-md border border-border bg-surface px-2 text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex h-full flex-col">
      {/* Filter + view toggle bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search opportunities…"
          className="h-7 min-w-[180px] flex-1 rounded-md border border-border bg-surface px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")} className={selectCls}>
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="med">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} className={selectCls}>
          <option value="all">All Assigned</option>
          {reps.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="text-[11px] text-muted-foreground font-mono">
          {filtered.length} of {opps.length}
        </span>
        {/* View toggle */}
        <div className="ml-auto flex items-center rounded-md border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={cn(
              "flex h-7 w-7 items-center justify-center transition-colors",
              view === "kanban" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground",
            )}
            aria-label="Kanban view"
          >
            <KanbanSquare className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex h-7 w-7 items-center justify-center border-l border-border transition-colors",
              view === "list" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground",
            )}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {view === "kanban"
        ? <KanbanView opps={filtered} onMove={moveStage} onSelect={setSelected} />
        : <ListView opps={filtered} onSelect={setSelected} />}

      {/* Detail drawer */}
      <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected !== null && <OpportunityDrawer key={selected.id} opp={selected} />}
      </Sheet>
    </div>
  );
}

// ─── Kanban view ──────────────────────────────────────────────────────────────

function KanbanView({
  opps,
  onMove,
  onSelect,
}: {
  opps: Opportunity[];
  onMove: (id: number, stage: OpportunityStage) => void;
  onSelect: (opp: Opportunity) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", paddingRight: "24px" }}>
      <div className="relative flex h-full flex-row gap-3 p-4" style={{ minWidth: "max-content" }}>
        {openId !== null && (
          <div className="fixed inset-0 z-10" onClick={() => setOpenId(null)} />
        )}
        {stageOrder.map((stage) => {
          const items = opps.filter((o) => o.stage === stage);
          const total = items.reduce((s, o) => s + o.value, 0);
          const { dim } = stageMeta[stage];
          return (
            <div
              key={stage}
              className={cn(
                "flex h-full w-[272px] min-w-[260px] shrink-0 flex-col rounded-lg border border-border",
                dim ? "bg-muted/30 opacity-80" : "bg-surface/40",
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <StageBadge stage={stage} />
                  <span className="font-mono text-[10.5px] text-muted-foreground">{items.length}</span>
                </div>
                <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">{currency(total)}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 p-2">
                {items.map((opp) => (
                  <KanbanCard
                    key={opp.id}
                    opp={opp}
                    selectorOpen={openId === opp.id}
                    onOpenSelector={(e) => { e.stopPropagation(); setOpenId(opp.id); }}
                    onMove={(s) => { onMove(opp.id, s); setOpenId(null); }}
                    onSelect={() => onSelect(opp)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="py-5 text-center text-[11px] text-muted-foreground">Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  opp,
  selectorOpen,
  onOpenSelector,
  onMove,
  onSelect,
}: {
  opp: Opportunity;
  selectorOpen: boolean;
  onOpenSelector: (e: React.MouseEvent) => void;
  onMove: (stage: OpportunityStage) => void;
  onSelect: () => void;
}) {
  return (
    <div
      className="rounded-md border border-border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="relative inline-block">
        <button
          onClick={onOpenSelector}
          className={cn("rounded px-1.5 py-0.5 text-[10.5px] font-medium flex items-center gap-1", stageMeta[opp.stage].badge)}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {stageMeta[opp.stage].label}
        </button>
        {selectorOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-popover py-1 shadow-lg">
            {stageOrder.map((s) => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); onMove(s); }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] hover:bg-accent",
                  s === opp.stage && "bg-accent/60",
                )}
              >
                <StageBadge stage={s} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-1.5 text-[12.5px] font-semibold leading-snug truncate">{opp.title}</div>
      <div className="text-[11px] text-muted-foreground truncate">{opp.company} · {opp.contact}</div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-mono tabular-nums text-[12.5px] font-semibold">{currency(opp.value)}</span>
        <PriorityDot p={opp.priority} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted-foreground">
        <span>{opp.closeDate}</span>
        <div className="flex items-center gap-1.5">
          <Avatar initials={opp.repInitials} />
          <span>{opp.rep.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────

type SortCol = "title" | "company" | "contact" | "value" | "stage" | "closeDate" | "rep" | "source" | "priority";
type SortDir = "asc" | "desc";

function ListView({ opps, onSelect }: { opps: Opportunity[]; onSelect: (opp: Opportunity) => void }) {
  const [sortCol, setSortCol] = useState<SortCol>("closeDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    return [...opps].sort((a, b) => {
      let av: number, bv: number;
      if (sortCol === "value") {
        av = a.value; bv = b.value;
      } else if (sortCol === "stage") {
        av = stageOrder.indexOf(a.stage); bv = stageOrder.indexOf(b.stage);
      } else if (sortCol === "priority") {
        av = priorityOrder[a.priority]; bv = priorityOrder[b.priority];
      } else {
        const as = String(a[sortCol]).toLowerCase();
        const bs = String(b[sortCol]).toLowerCase();
        return (as < bs ? -1 : as > bs ? 1 : 0) * (sortDir === "asc" ? 1 : -1);
      }
      return (av - bv) * (sortDir === "asc" ? 1 : -1);
    });
  }, [opps, sortCol, sortDir]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortCol }) =>
    sortCol !== col ? (
      <ChevronsUpDown className="inline h-3 w-3 ml-0.5 text-muted-foreground/40" />
    ) : sortDir === "asc" ? (
      <ChevronUp className="inline h-3 w-3 ml-0.5" />
    ) : (
      <ChevronDown className="inline h-3 w-3 ml-0.5" />
    );

  return (
    <div className="p-4">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-surface/50">
            <tr className="border-b border-border text-[10.5px] uppercase tracking-wide text-muted-foreground">
              {(
                [
                  ["title",     "Opportunity",  "text-left"],
                  ["company",   "Company",      "text-left"],
                  ["value",     "Value",        "text-right"],
                  ["stage",     "Stage",        "text-left"],
                  ["closeDate", "Close Date",   "text-left"],
                  ["rep",       "Assigned",     "text-left"],
                  ["priority",  "Priority",     "text-left pr-3"],
                ] as [SortCol, string, string][]
              ).map(([col, label, align]) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className={cn("py-2 px-2 font-medium cursor-pointer select-none hover:text-foreground whitespace-nowrap", align)}
                >
                  {label}<SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr
                key={o.id}
                onClick={() => onSelect(o)}
                className="row-hover border-b border-border/60 cursor-pointer"
              >
                <td className="py-2.5 px-2">
                  <div className="font-medium leading-snug">{o.title}</div>
                  <div className="text-[11px] text-muted-foreground">{o.contact}</div>
                </td>
                <td className="py-2.5 px-2 text-muted-foreground text-[12px]">{o.company}</td>
                <td className="py-2.5 px-2 text-right font-mono tabular-nums font-semibold">{currency(o.value)}</td>
                <td className="py-2.5 px-2"><StageBadge stage={o.stage} /></td>
                <td className="py-2.5 px-2 text-muted-foreground font-mono text-[11.5px]">{o.closeDate}</td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <Avatar initials={o.repInitials} />
                    <span className="text-[11.5px]">{o.rep}</span>
                  </div>
                </td>
                <td className="py-2.5 px-2 pr-3"><PriorityDot p={o.priority} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[12.5px] text-muted-foreground">
                  No opportunities match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Opportunity detail drawer ────────────────────────────────────────────────

function OpportunityDrawer({ opp }: { opp: Opportunity }) {
  return (
    <SheetContent className="sm:max-w-[460px] flex flex-col p-0 gap-0">
      {/* Header */}
      <SheetHeader className="border-b border-border px-5 py-4">
        <SheetTitle className="text-[15px] font-semibold leading-tight">{opp.title}</SheetTitle>
        <p className="text-[12px] text-muted-foreground">{opp.company} · {opp.contact}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <StageBadge stage={opp.stage} />
          <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium", priorityBadgeCls[opp.priority])}>
            {priorityLabel[opp.priority]}
          </span>
        </div>
      </SheetHeader>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Details */}
        <section>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Details</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Value</p>
              <p className="font-semibold font-mono tabular-nums">{currency(opp.value)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Close Date</p>
              <p className="font-mono">{opp.closeDate}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Assigned To</p>
              <div className="flex items-center gap-1.5">
                <Avatar initials={opp.repInitials} />
                <span>{opp.rep}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Lead Source</p>
              <p>{opp.source}</p>
            </div>
          </div>
        </section>

        {/* Linked quote */}
        <section>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Linked Quote</p>
          {opp.linkedQuote ? (
            <div className="flex items-center justify-between rounded-md border border-border bg-surface/50 px-3 py-2.5 text-[12px]">
              <span className="font-mono text-foreground">{opp.linkedQuote.number}</span>
              <div className="flex items-center gap-2.5 shrink-0 ml-2">
                <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium", quoteStatusMeta[opp.linkedQuote.status].cls)}>
                  {quoteStatusMeta[opp.linkedQuote.status].label}
                </span>
                <span className="font-mono text-muted-foreground">{currency(opp.linkedQuote.value)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-md border border-dashed border-border px-3 py-2.5 text-[12px]">
              <span className="text-muted-foreground">No quote linked yet</span>
              <button className="text-primary text-[11.5px] font-medium hover:underline">
                Create Quote
              </button>
            </div>
          )}
        </section>

        {/* Notes */}
        <section>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Notes</p>
          <textarea
            rows={3}
            defaultValue={opp.notes}
            className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-muted-foreground leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Add notes…"
          />
        </section>

        {/* Activity */}
        <section>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Activity</p>
          <ul className="space-y-3">
            {opp.activityFeed.map((a, i) => {
              const Icon = activityIcon[a.kind];
              return (
                <li key={i} className="flex gap-3 text-[12px]">
                  <div className={cn("mt-0.5 shrink-0", activityColor[a.kind])}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div>{a.text}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{a.date}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Footer actions */}
      <div className="border-t border-border px-5 py-4 space-y-2">
        {opp.stage === "closed-won" && (
          <button className="w-full h-8 rounded-md bg-primary text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Convert to Project
          </button>
        )}
        <button className="w-full h-8 rounded-md border border-border text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          Edit Opportunity
        </button>
      </div>
    </SheetContent>
  );
}
