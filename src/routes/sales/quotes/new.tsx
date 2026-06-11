import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMeta } from "@/contexts/PageMetaContext";
import { currency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown, Clock, FileText, Loader2 } from "lucide-react";
import {
  type BuilderSection, type BuilderLineItem, type EditingCell,
  BUILDER_TEMPLATES, CatalogSearchModal, SectionBlock,
  marginColor, freshId, saveQuoteToDb,
  fetchBuilderCatalog, fetchCompanyOptions, fetchAllContacts,
  fetchTeamMembers, fetchOpportunityById,
} from "./_shared";

export const Route = createFileRoute("/sales/quotes/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    opportunityId: (search.opportunityId as string | undefined),
  }),
  head: () => ({ meta: [{ title: "New Quote · BearingPro" }] }),
  component: NewQuotePage,
});

function NewQuotePage() {
  const { setMeta } = useMeta();
  const navigate = useNavigate();
  const { opportunityId } = Route.useSearch();

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysOut = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  // ── Form state ────────────────────────────────────────────────────────────
  const [companyId, setCompanyId]       = useState("");
  const [contactId, setContactId]       = useState("");
  const [linkedOppId, setLinkedOppId]   = useState<string>(opportunityId ?? "");
  const [issueDate, setIssueDate]       = useState(today);
  const [validUntil, setValidUntil]     = useState(thirtyDaysOut);
  const [notes, setNotes]               = useState("");
  const [templateId, setTemplateId]     = useState("");
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState<string | null>(null);

  // ── Builder state ─────────────────────────────────────────────────────────
  const [sections, setSections]         = useState<BuilderSection[]>([]);
  const [lineItems, setLineItems]       = useState<BuilderLineItem[]>([]);
  const [editingCell, setEditingCell]   = useState<EditingCell>(null);
  const [modalSectionId, setModalSectionId] = useState<string | null>(null);
  const [laborModalOpen, setLaborModalOpen] = useState(false);

  useEffect(() => {
    setMeta({ title: "New Quote", subtitle: "Build & price a new quote" });
  }, [setMeta]);

  // ── Live data ─────────────────────────────────────────────────────────────
  const { data: catalog = [] } = useQuery({
    queryKey: ["catalog-items-builder"],
    queryFn: fetchBuilderCatalog,
  });
  const { data: companies = [] } = useQuery({
    queryKey: ["companies-quote"],
    queryFn: fetchCompanyOptions,
  });
  const { data: allContacts = [] } = useQuery({
    queryKey: ["contacts-quote"],
    queryFn: fetchAllContacts,
  });
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members-quote"],
    queryFn: fetchTeamMembers,
  });
  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities-quote"],
    queryFn: async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { data } = await sb
        .from("opportunities")
        .select("id, title, company:companies(id,name), contact:contacts(id,full_name)")
        .order("created_at", { ascending: false });
      return (data ?? []) as Array<{
        id: string; title: string;
        company: { id: string; name: string } | null;
        contact: { id: string; full_name: string } | null;
      }>;
    },
  });
  // Pre-fill from opportunity if provided
  const { data: prefilledOpp } = useQuery({
    queryKey: ["opp-for-quote", opportunityId],
    queryFn: () => fetchOpportunityById(opportunityId!),
    enabled: !!opportunityId,
  });
  useEffect(() => {
    if (prefilledOpp) {
      if (prefilledOpp.company) setCompanyId(prefilledOpp.company.id);
      if (prefilledOpp.contact) setContactId(prefilledOpp.contact.id);
      setLinkedOppId(prefilledOpp.id);
    }
  }, [prefilledOpp]);

  const contacts = useMemo(
    () => allContacts.filter((c) => !companyId || c.company_id === companyId),
    [allContacts, companyId],
  );
  const laborItems = useMemo(
    () => catalog.filter((i) => i.category.toLowerCase().includes("labor")),
    [catalog],
  );
  void teamMembers;

  // ── Builder helpers ───────────────────────────────────────────────────────
  function handleTemplateChange(id: string) {
    setTemplateId(id);
    const tpl = BUILDER_TEMPLATES.find((t) => t.id === id);
    if (tpl) {
      setSections(tpl.sections.map((s) => ({ ...s })));
      setLineItems([]);
    }
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

  async function handleSaveDraft() {
    if (!linkedOppId) { setSaveError("Select a linked opportunity before saving."); return; }
    setSaving(true);
    setSaveError(null);
    try {
      await saveQuoteToDb({
        opportunityId: linkedOppId,
        quoteId: null,
        currentRevision: 0,
        sections,
        lineItems,
        notes,
        expiryDate: validUntil,
        issueDate,
      });
      navigate({ to: "/sales/quotes" });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls  = "w-full h-8 rounded-md border border-border bg-surface px-2.5 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50";
  const selectCls = "w-full h-8 rounded-md border border-border bg-surface px-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary";
  const labelCls  = "block text-[10px] uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        <div>
          <Link to="/sales/quotes"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Quotes & Estimates
          </Link>
        </div>

        {/* Header form */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Quote Details</p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* Linked Opportunity — full width */}
            <div className="col-span-2">
              <label className={labelCls}>Linked Opportunity *</label>
              <select
                className={selectCls}
                value={linkedOppId}
                onChange={(e) => {
                  setLinkedOppId(e.target.value);
                  const opp = opportunities.find((o) => o.id === e.target.value);
                  if (opp) {
                    if (opp.company) setCompanyId(opp.company.id);
                    if (opp.contact) setContactId(opp.contact.id);
                  }
                }}
              >
                <option value="">Select opportunity…</option>
                {opportunities.map((o) => (
                  <option key={o.id} value={o.id}>{o.title}</option>
                ))}
              </select>
            </div>

            {/* Company */}
            <div>
              <label className={labelCls}>Customer</label>
              <select
                className={selectCls}
                value={companyId}
                onChange={(e) => { setCompanyId(e.target.value); setContactId(""); }}
              >
                <option value="">Select company…</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Contact */}
            <div>
              <label className={labelCls}>Contact</label>
              <select
                className={selectCls}
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                disabled={!companyId}
              >
                <option value="">{companyId ? "Select contact…" : "Select a company first"}</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label className={labelCls}>Issue Date</label>
              <input type="date" className={inputCls} value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)} />
            </div>

            {/* Valid Until */}
            <div>
              <label className={labelCls}>Valid Until</label>
              <input type="date" className={inputCls} value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)} />
            </div>

            {/* Template */}
            <div className="col-span-2">
              <label className={labelCls}>Template</label>
              <div className="relative">
                <select
                  className={cn(selectCls, "pr-8 appearance-none")}
                  value={templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Select a template…</option>
                  {BUILDER_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Add notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Builder section */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Line Items</p>
          {sections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 px-5 py-8 flex flex-col items-center gap-2 text-center">
              <FileText className="h-6 w-6 text-muted-foreground/25" />
              <p className="text-[12.5px] text-muted-foreground">
                Select a template above to begin adding line items
              </p>
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
            </div>
          )}
        </div>
        <div className="h-2" />
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-5 py-3 flex items-center gap-5">
        <div className="flex items-center gap-5 text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono font-semibold tabular-nums">{currency(subtotal)}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Margin</span>
            <span className={cn("font-mono font-semibold tabular-nums", marginColor(margin))}>
              {margin.toFixed(1)}%
            </span>
          </div>
        </div>
        {saveError && (
          <span className="text-[11.5px] text-destructive">{saveError}</span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => navigate({ to: "/sales/quotes" })}
          disabled={saving}
          className="h-8 rounded-md border border-border px-3 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saving || !linkedOppId}
          className="flex items-center gap-2 h-8 rounded-md bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save as Draft
        </button>
      </div>

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
