import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { quotes, currency } from "@/lib/demo-data";
import type { QuoteLineItem, QuoteActivity } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, ChevronDown, ChevronRight, Clock, Download, Eye,
  FileText, FolderKanban, MessageSquare, Send, XCircle,
} from "lucide-react";

export const Route = createFileRoute("/quotes/$quoteId")({
  component: QuoteDetailPage,
});

// ─── Config ──────────────────────────────────────────────────────────────────

const statusStyle = {
  draft:    { icon: FileText,     cls: "bg-slate-500/15 text-slate-500",               label: "Draft" },
  sent:     { icon: Clock,        cls: "bg-status-qualified/15 text-status-qualified", label: "Sent" },
  viewed:   { icon: Eye,          cls: "bg-status-proposal/15 text-status-proposal",   label: "Viewed" },
  accepted: { icon: CheckCircle2, cls: "bg-status-won/15 text-status-won",             label: "Accepted" },
  expired:  { icon: XCircle,      cls: "bg-status-lost/15 text-status-lost",           label: "Expired" },
} as const;

const activityIcon: Record<QuoteActivity["type"], React.ComponentType<{ className?: string }>> = {
  created:  FileText,
  sent:     Send,
  viewed:   Eye,
  accepted: CheckCircle2,
  note:     MessageSquare,
};

const activityColor: Record<QuoteActivity["type"], string> = {
  created:  "text-muted-foreground",
  sent:     "text-status-qualified",
  viewed:   "text-status-proposal",
  accepted: "text-status-won",
  note:     "text-blue-500",
};

const categoryLabel: Record<QuoteLineItem["category"], string> = {
  equipment:     "Equipment",
  labor:         "Labor",
  miscellaneous: "Miscellaneous",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function marginColor(m: number): string {
  if (m >= 30) return "text-status-won";
  if (m >= 20) return "text-amber-500";
  return "text-status-lost";
}

// ─── Detail page ─────────────────────────────────────────────────────────────

function QuoteDetailPage() {
  const { quoteId } = Route.useParams();
  const { setMeta } = useMeta();
  const [view, setView] = useState<"flat" | "grouped">("flat");

  const quote = quotes.find((q) => q.id === quoteId);

  useEffect(() => {
    if (quote) {
      setMeta({ title: quote.project, subtitle: quote.number });
    }
  }, [setMeta, quote]);

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-[14px] font-medium">Quote not found</p>
        <p className="text-[12.5px] text-muted-foreground mt-1">The quote ID "{quoteId}" doesn't exist.</p>
      </div>
    );
  }

  const subtotal = quote.lineItems.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const cost     = quote.lineItems.reduce((s, l) => s + l.qty * l.cost, 0);
  const margin   = subtotal > 0 ? ((subtotal - cost) / subtotal) * 100 : 0;

  const { icon: StatusIcon, cls: statusCls, label: statusLabel } = statusStyle[quote.status];

  const groupedItems = (["equipment", "labor", "miscellaneous"] as QuoteLineItem["category"][]).map((cat) => ({
    category: cat,
    items: quote.lineItems.filter((l) => l.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* ── Main column ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto px-5 py-5 space-y-5">

        {/* Header */}
        <section>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="font-mono text-[11px] text-muted-foreground">{quote.number}</span>
            <span className={cn("inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10.5px] font-medium", statusCls)}>
              <StatusIcon className="h-3 w-3" />
              {statusLabel}
            </span>
          </div>
          <h1 className="text-[18px] font-semibold tracking-tight leading-snug">{quote.project}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {quote.company}
            {quote.contactName && <> · <span className="text-foreground">{quote.contactName}</span></>}
          </p>
          {quote.linkedOpportunity && (
            <p className="mt-0.5 text-[12px] text-blue-500 hover:underline cursor-pointer">
              {quote.linkedOpportunity}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-[11.5px] text-muted-foreground">
            {quote.sent !== "—" && (
              <span>Sent: <span className="text-foreground">{quote.sent}</span></span>
            )}
            {quote.expiryDate !== "—" && (
              <span>Expires: <span className="text-foreground">{quote.expiryDate}</span></span>
            )}
            <span>Created: <span className="text-foreground">{quote.createdDate}</span></span>
          </div>
        </section>

        {/* Line items */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Line Items <span className="ml-1 text-foreground font-mono">{quote.lineItems.length}</span>
            </p>
            {/* Flat / Grouped toggle */}
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              {(["flat", "grouped"] as const).map((v, i) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "h-6 px-3 text-[11px] font-medium capitalize transition-colors",
                    i > 0 && "border-l border-border",
                    view === v ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border bg-surface/50 px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <span>Item</span>
              <span className="w-12 text-right">Qty</span>
              <span className="w-20 text-right">Unit Price</span>
              <span className="w-24 text-right">Total</span>
            </div>

            {view === "flat" && (
              <FlatLineItems items={quote.lineItems} />
            )}

            {view === "grouped" && groupedItems.map((g) => (
              <GroupSection key={g.category} category={g.category} items={g.items} />
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            <div className="flex justify-between px-4 py-2.5 text-[12.5px] text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{currency(subtotal)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 text-[12.5px] text-muted-foreground">
              <span>Cost</span>
              <span className="font-mono tabular-nums">{currency(cost)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 text-[12.5px]">
              <span>Gross Margin</span>
              <span className={cn("font-mono tabular-nums font-medium", marginColor(margin))}>
                {margin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between px-4 py-3 text-[15px] font-semibold">
              <span>Total</span>
              <span className="font-mono tabular-nums">{currency(subtotal)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Right sidebar ───────────────────────────────────────── */}
      <aside className="w-[268px] shrink-0 border-l border-border overflow-y-auto px-4 py-5 space-y-4">

        {/* Actions */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Actions</p>
          <button className="flex w-full items-center justify-center gap-2 h-8 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium hover:opacity-90 transition-opacity">
            <Send className="h-3.5 w-3.5" />
            Send to Client
          </button>
          <button className="flex w-full items-center justify-center gap-2 h-8 rounded-md border border-border bg-surface text-[12.5px] text-foreground hover:bg-accent transition-colors">
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          {quote.status === "accepted" && (
            <button className="flex w-full items-center justify-center gap-2 h-8 rounded-md border border-border bg-surface text-[12.5px] text-foreground hover:bg-accent transition-colors">
              <FolderKanban className="h-3.5 w-3.5" />
              Convert to Project
            </button>
          )}
        </div>

        {/* Details */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Details</p>
          <div className="space-y-2.5 text-[12px]">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Created</p>
              <p className="text-foreground">{quote.createdDate}</p>
            </div>
            {quote.sent !== "—" && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Sent</p>
                <p className="text-foreground">{quote.sent}</p>
              </div>
            )}
            {quote.expiryDate !== "—" && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Expiry Date</p>
                <p className="text-foreground">{quote.expiryDate}</p>
              </div>
            )}
            {quote.linkedOpportunity && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Linked Opportunity</p>
                <p className="text-blue-500 hover:underline cursor-pointer leading-snug">{quote.linkedOpportunity}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Notes</p>
          <textarea
            rows={5}
            placeholder="Add notes…"
            className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12px] text-muted-foreground leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Activity feed */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Activity</p>
          <ul className="space-y-3">
            {quote.activityFeed.map((a, i) => {
              const Icon = activityIcon[a.type];
              return (
                <li key={i} className="flex gap-2.5 text-[12px]">
                  <div className={cn("mt-0.5 shrink-0", activityColor[a.type])}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="leading-snug">{a.description}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{a.date}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LineItemRow({ item }: { item: QuoteLineItem }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border/60 px-3 py-2.5 text-[12px] hover:bg-surface/40 transition-colors">
      <div className="min-w-0">
        <div className="font-medium leading-snug truncate">{item.name}</div>
        <div className="mt-0.5 text-[10.5px] text-muted-foreground font-mono">
          {item.sku} · {item.brand}
        </div>
      </div>
      <div className="w-12 text-right text-muted-foreground tabular-nums self-center">×{item.qty}</div>
      <div className="w-20 text-right font-mono tabular-nums text-muted-foreground self-center">{currency(item.unitPrice)}</div>
      <div className="w-24 text-right font-mono tabular-nums font-medium self-center">{currency(item.qty * item.unitPrice)}</div>
    </div>
  );
}

function FlatLineItems({ items }: { items: QuoteLineItem[] }) {
  return (
    <>
      {items.map((item) => <LineItemRow key={item.id} item={item} />)}
    </>
  );
}

function GroupSection({ category, items }: { category: QuoteLineItem["category"]; items: QuoteLineItem[] }) {
  const [open, setOpen] = useState(false);
  const subtotal = items.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 border-b border-border bg-surface/30 px-3 py-1.5 hover:bg-surface/60 transition-colors"
      >
        <Chevron className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
          {categoryLabel[category]}
          <span className="ml-1.5 normal-case tracking-normal font-normal">({items.length})</span>
        </span>
        <span className="font-mono text-[10.5px] text-muted-foreground tabular-nums">{currency(subtotal)}</span>
      </button>
      {open && items.map((item) => <LineItemRow key={item.id} item={item} />)}
    </div>
  );
}
