import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeta } from "@/contexts/PageMetaContext";
import { currency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, CheckCircle2, Clock, Download, Eye, FileText,
  FolderKanban, Loader2, Send,
} from "lucide-react";
import {
  type BuilderSection, type BuilderLineItem, type EditingCell,
  BUILDER_TEMPLATES, CatalogSearchModal, SectionBlock,
  marginColor, freshId, errMsg, saveQuoteToDb,
  fetchBuilderCatalog, fetchQuoteForEdit,
} from "./_shared";

export const Route = createFileRoute("/sales/quotes/$quoteId")({
  component: QuoteDetailPage,
});

const supabase = createClient();

const STATUS_STYLE = {
  draft:    { icon: FileText,     cls: "bg-slate-500/15 text-slate-500",      label: "Draft" },
  sent:     { icon: Clock,        cls: "bg-blue-500/15 text-blue-500",         label: "Sent" },
  viewed:   { icon: Eye,          cls: "bg-violet-500/15 text-violet-500",     label: "Viewed" },
  accepted: { icon: CheckCircle2, cls: "bg-green-500/15 text-green-600",       label: "Accepted" },
  expired:  { icon: FileText,     cls: "bg-red-500/15 text-red-500",           label: "Expired" },
} as const;

function QuoteDetailPage() {
  const { quoteId } = Route.useParams();
  const { setMeta } = useMeta();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // ── Load quote ────────────────────────────────────────────────────────────
  const { data: loaded, isLoading, error } = useQuery({
    queryKey: ["quote-detail", quoteId],
    queryFn: () => fetchQuoteForEdit(quoteId),
  });
  const { data: catalog = [] } = useQuery({
    queryKey: ["catalog-items-builder"],
    queryFn: fetchBuilderCatalog,
  });

  // ── Builder state ─────────────────────────────────────────────────────────
  const [sections, setSections]   = useState<BuilderSection[]>([]);
  const [lineItems, setLineItems] = useState<BuilderLineItem[]>([]);
  const [editingCell, setEditingCell]     = useState<EditingCell>(null);
  const [modalSectionId, setModalSectionId] = useState<string | null>(null);
  const [laborModalOpen, setLaborModalOpen] = useState(false);
  const [notes, setNotes]         = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [inited, setInited]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(BUILDER_TEMPLATES[0].id);

  // Populate state once on load
  useEffect(() => {
    if (loaded && !inited) {
      setSections(loaded.sections);
      setLineItems(loaded.lineItems);
      setNotes(loaded.quote.notes ?? "");
      setExpiryDate(loaded.quote.expiry_date ?? "");
      setInited(true);
    }
  }, [loaded, inited]);

  useEffect(() => {
    if (loaded) {
      setMeta({
        title: loaded.quote.number,
        subtitle: loaded.quote.opportunity?.title ?? "Quote",
      });
    }
  }, [setMeta, loaded]);

  // ── Status mutations ──────────────────────────────────────────────────────
  const markSentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("quotes").update({ status: "sent" }).eq("id", quoteId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quote-detail", quoteId] });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const oppId = loaded?.quote.opportunity_id;
      if (!oppId) throw new Error("No opportunity linked");
      const { error: qe } = await supabase
        .from("quotes").update({ status: "accepted" }).eq("id", quoteId);
      if (qe) throw qe;
      const { error: oe } = await supabase
        .from("opportunities").update({ stage: "closed-won" }).eq("id", oppId);
      if (oe) throw oe;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quote-detail", quoteId] });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });

  // ── Builder logic ─────────────────────────────────────────────────────────
  function applyTemplate(id: string) {
    const tpl = BUILDER_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setSections(tpl.sections.map((s) => ({ ...s })));
    setLineItems([]);
  }

  function startBlank() {
    setSections([{ id: freshId("sec"), name: "Items", order: 1 }]);
    setLineItems([]);
  }

  function handleAddItem(sectionId: string, catalogItem: typeof catalog[0] | null) {
    if (!catalogItem) {
      setLineItems((prev) => [
        ...prev,
        { id: freshId("li"), sectionId, type: "custom", catalogItemId: null,
          description: "Custom Item", qty: 1, unitCost: 0, unitPrice: 0, unit: "ea" },
      ]);
      return;
    }
    const productId = freshId("li");
    const newItems: BuilderLineItem[] = [
      { id: productId, sectionId, type: "product", catalogItemId: catalogItem.id,
        description: catalogItem.name, qty: 1, unitCost: catalogItem.unitCost,
        unitPrice: catalogItem.unitPrice, unit: catalogItem.unit },
    ];
    if (catalogItem.hasLabor && catalogItem.laborHours > 0) {
      const rate = catalogItem.laborRate > 0 ? catalogItem.laborRate : 85;
      newItems.push({
        id: freshId("li"), sectionId, type: "labor", catalogItemId: null,
        description: `Installation — ${catalogItem.name}`,
        qty: catalogItem.laborHours, unitCost: Math.round(rate * 0.65),
        unitPrice: rate, unit: "hr",
      });
    }
    setLineItems((prev) => [...prev, ...newItems]);
  }

  const laborItems = useMemo(
    () => catalog.filter((i) => i.category.toLowerCase().includes("labor")),
    [catalog],
  );

  function handleAddLaborItem(catalogItem: typeof catalog[0] | null) {
    const existing = sections.find((s) => s.name.toLowerCase().includes("labor"));
    const sectionId = existing?.id ?? freshId("sec");
    if (!existing) {
      setSections((prev) => [...prev, { id: sectionId, name: "Labor", order: prev.length + 1 }]);
    }
    const newItem: BuilderLineItem = catalogItem
      ? { id: freshId("li"), sectionId, type: "labor", catalogItemId: catalogItem.id,
          description: catalogItem.name, qty: 1, unitCost: catalogItem.unitCost,
          unitPrice: catalogItem.unitPrice, unit: catalogItem.unit }
      : { id: freshId("li"), sectionId, type: "labor", catalogItemId: null,
          description: "Labor", qty: 1, unitCost: 0, unitPrice: 0, unit: "hr" };
    setLineItems((prev) => [...prev, newItem]);
  }

  function handleCellClick(id: string, field: "qty" | "unitCost" | "unitPrice", current: number) {
    setEditingCell({ id, field, draft: String(current) });
  }
  function handleCellChange(draft: string) {
    setEditingCell((prev) => prev ? { ...prev, draft } : null);
  }
  function handleCellCommit() {
    if (!editingCell) return;
    const { id, field, draft } = editingCell;
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0) {
      setLineItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, [field]: field === "qty" ? Math.max(0.01, parsed) : parsed }
            : item,
        ),
      );
    }
    setEditingCell(null);
  }
  function handleDeleteItem(id: string) {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  }

  const subtotal  = lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const costTotal = lineItems.reduce((s, i) => s + i.qty * i.unitCost,  0);
  const margin    = subtotal > 0 ? ((subtotal - costTotal) / subtotal) * 100 : 0;

  const statusConfig = useMemo(() => {
    const s = (loaded?.quote.status ?? "draft") as keyof typeof STATUS_STYLE;
    return STATUS_STYLE[s] ?? STATUS_STYLE.draft;
  }, [loaded]);

  async function handleSave() {
    if (!loaded) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveQuoteToDb({
        opportunityId: loaded.quote.opportunity_id,
        quoteId,
        currentRevision: loaded.quote.revision ?? 1,
        sections,
        lineItems,
        notes,
        expiryDate,
        issueDate: "",
      });
      qc.invalidateQueries({ queryKey: ["quote-detail", quoteId] });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    } catch (e) {
      setSaveError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !loaded) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-[14px] font-medium">Quote not found</p>
        <p className="text-[12.5px] text-muted-foreground mt-1">The quote ID "{quoteId}" doesn't exist.</p>
      </div>
    );
  }

  const q = loaded.quote;
  const { icon: StatusIcon, cls: statusCls, label: statusLabel } = statusConfig;

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* ── Main column ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <Link to="/sales/quotes"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Quotes & Estimates
          </Link>

          {/* Header */}
          <section>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-[11px] text-muted-foreground">{q.number}</span>
              <span className={cn("inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10.5px] font-medium", statusCls)}>
                <StatusIcon className="h-3 w-3" />
                {statusLabel}
              </span>
              {q.revision > 1 && (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  v{q.revision}
                </span>
              )}
            </div>
            <h1 className="text-[18px] font-semibold tracking-tight leading-snug">
              {q.opportunity?.title ?? "Quote"}
            </h1>
            {q.opportunity?.company && (
              <p className="mt-1 text-[13px] text-muted-foreground">
                {q.opportunity.company.name}
                {q.opportunity.contact && (
                  <> · <span className="text-foreground">{q.opportunity.contact.full_name}</span></>
                )}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-[11.5px] text-muted-foreground">
              {q.expiry_date && (
                <span>Expires: <span className="text-foreground">{q.expiry_date}</span></span>
              )}
              <span>Created: <span className="text-foreground">{new Date(q.created_at).toLocaleDateString()}</span></span>
            </div>
          </section>

          {/* Notes + expiry */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 rounded-lg border border-border bg-card p-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Valid Until</p>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-8 rounded-md border border-border bg-surface px-2.5 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Add notes…"
              />
            </div>
          </div>

          {/* Builder */}
          <section>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Line Items</p>

            {sections.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-5 space-y-4">
                <p className="text-[12.5px] text-muted-foreground">Apply a template or start blank to build this quote.</p>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="h-8 rounded-md border border-border bg-surface pl-3 pr-8 text-[12.5px] appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {BUILDER_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyTemplate(selectedTemplateId)}
                    className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Apply Template
                  </button>
                  <button
                    type="button"
                    onClick={startBlank}
                    className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    Start blank
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[...sections].sort((a, b) => a.order - b.order).map((section) => (
                  <SectionBlock
                    key={section.id}
                    section={section}
                    allItems={lineItems}
                    editingCell={editingCell}
                    onCellClick={handleCellClick}
                    onCellChange={handleCellChange}
                    onCellCommit={handleCellCommit}
                    onDeleteItem={handleDeleteItem}
                    onAddItem={(sid) => setModalSectionId(sid)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setLaborModalOpen(true)}
                  className="flex items-center gap-2 w-full rounded-lg border border-dashed border-border px-4 py-2.5 text-[12px] text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-surface/40 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Add Additional Labor
                </button>
                {/* Totals */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    <div className="flex justify-between px-4 py-2.5 text-[12.5px] text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono tabular-nums">{currency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 text-[15px] font-semibold">
                      <span>Total</span>
                      <span className="font-mono tabular-nums">{currency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 bg-surface/30">
                      <span className="text-[11.5px] text-muted-foreground">Cost</span>
                      <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums">{currency(costTotal)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 bg-surface/30">
                      <span className="text-[11.5px] text-muted-foreground">Gross Margin</span>
                      <span className={cn("font-mono text-[11.5px] font-medium tabular-nums", marginColor(margin))}>
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
          <div className="h-2" />
        </div>

        {/* Sticky save bar */}
        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-5 py-3 flex items-center justify-between">
          {saveError ? (
            <span className="text-[11.5px] text-destructive">{saveError}</span>
          ) : (
            <span className="text-[11.5px] text-muted-foreground">
              Unsaved changes will be lost if you navigate away.
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-8 rounded-md bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Right sidebar ────────────────────────────────────────── */}
      <aside className="w-[240px] shrink-0 border-l border-border overflow-y-auto px-4 py-5 space-y-4">

        {/* Actions */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Actions</p>

          {q.status === "draft" && (
            <button
              type="button"
              onClick={() => markSentMutation.mutate()}
              disabled={markSentMutation.isPending}
              className="flex w-full items-center justify-center gap-2 h-8 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {markSentMutation.isPending
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Send className="h-3.5 w-3.5" />
              }
              Mark as Sent
            </button>
          )}

          {(q.status === "sent" || q.status === "viewed") && (
            <button
              type="button"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="flex w-full items-center justify-center gap-2 h-8 rounded-md bg-green-600 text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {acceptMutation.isPending
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CheckCircle2 className="h-3.5 w-3.5" />
              }
              Accept Quote
            </button>
          )}

          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 h-8 rounded-md border border-border bg-surface text-[12.5px] text-muted-foreground cursor-not-allowed opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>

          {q.status === "accepted" && q.opportunity?.id && (
            <button
              type="button"
              onClick={() => navigate({ to: "/sales/opportunities" })}
              className="flex w-full items-center justify-center gap-2 h-8 rounded-md border border-border bg-surface text-[12.5px] text-foreground hover:bg-accent transition-colors"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              Convert to Project
            </button>
          )}
        </div>

        {/* Details */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2.5 text-[12px]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Details</p>
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Status</p>
            <span className={cn("inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10.5px] font-medium", statusCls)}>
              <StatusIcon className="h-3 w-3" />
              {statusLabel}
            </span>
          </div>
          {q.revision > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Revision</p>
              <p>v{q.revision}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Created</p>
            <p>{new Date(q.created_at).toLocaleDateString()}</p>
          </div>
          {q.expiry_date && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Expiry Date</p>
              <p>{q.expiry_date}</p>
            </div>
          )}
          {q.opportunity && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Linked Opportunity</p>
              <button
                type="button"
                onClick={() => navigate({ to: "/sales/opportunities" })}
                className="text-left text-primary hover:underline leading-snug"
              >
                {q.opportunity.title}
              </button>
            </div>
          )}
        </div>

        {/* Value summary */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Value</p>
          <p className="text-[20px] font-semibold tabular-nums font-mono">{currency(subtotal)}</p>
          {costTotal > 0 && (
            <p className={cn("text-[11.5px] mt-0.5 font-medium", marginColor(margin))}>
              {margin.toFixed(1)}% margin
            </p>
          )}
        </div>
      </aside>

      <CatalogSearchModal
        open={modalSectionId !== null}
        onClose={() => setModalSectionId(null)}
        items={catalog}
        onAddItem={(item) => {
          if (modalSectionId) handleAddItem(modalSectionId, item);
        }}
      />
      <CatalogSearchModal
        open={laborModalOpen}
        onClose={() => setLaborModalOpen(false)}
        items={laborItems}
        onAddItem={(item) => handleAddLaborItem(item)}
      />
    </div>
  );
}
