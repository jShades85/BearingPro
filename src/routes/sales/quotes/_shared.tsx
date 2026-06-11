// Shared types, components, and data functions for the quote builder pages.
// Not a route file — imported by new.tsx and $quoteId.tsx.

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { currency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { Plus, Search, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const supabase = createClient();
const DEFAULT_LABOR_RATE = 85;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BuilderSection {
  id: string;
  name: string;
  order: number;
}

export interface BuilderLineItem {
  id: string;
  sectionId: string;
  type: "product" | "labor" | "custom";
  catalogItemId: string | null;
  description: string;
  qty: number;
  unitCost: number;
  unitPrice: number;
  unit: string;
}

export interface BuilderCatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  unitPrice: number;
  unit: string;
  hasLabor: boolean;
  laborHours: number;
  laborRate: number;
}

export type EditingCell = {
  id: string;
  field: "qty" | "unitCost" | "unitPrice";
  draft: string;
} | null;

export interface CompanyOption { id: string; name: string }
export interface ContactOption { id: string; full_name: string; company_id: string | null }
export interface TeamMember    { id: string; full_name: string | null }
export interface OppOption     { id: string; title: string; company: { id: string; name: string } | null; contact: { id: string; full_name: string } | null }

export interface DbQuoteRow {
  id: string;
  number: string;
  status: string;
  value: number;
  notes: string | null;
  expiry_date: string | null;
  revision: number;
  opportunity_id: string;
  created_at: string;
  opportunity: {
    id: string;
    title: string;
    company: { id: string; name: string } | null;
    contact: { id: string; full_name: string } | null;
  } | null;
}

export interface DbQuoteLineItemRow {
  id: string;
  catalog_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  unit: string;
  item_type: string;
  section_name: string | null;
  sort_order: number;
}

// ─── Static builder templates ─────────────────────────────────────────────────

export const BUILDER_TEMPLATES = [
  {
    id: "qt-001", name: "Commercial Install",
    sections: [
      { id: "s-001-1", name: "Equipment",             order: 1 },
      { id: "s-001-2", name: "Labor",                 order: 2 },
      { id: "s-001-3", name: "Low-Voltage Materials", order: 3 },
      { id: "s-001-4", name: "Subcontractor",         order: 4 },
      { id: "s-001-5", name: "Misc",                  order: 5 },
    ],
  },
  {
    id: "qt-002", name: "Residential Install",
    sections: [
      { id: "s-002-1", name: "Equipment",          order: 1 },
      { id: "s-002-2", name: "Installation Labor", order: 2 },
      { id: "s-002-3", name: "Materials",          order: 3 },
    ],
  },
  {
    id: "qt-003", name: "Service Call",
    sections: [
      { id: "s-003-1", name: "Labor",             order: 1 },
      { id: "s-003-2", name: "Parts & Materials", order: 2 },
    ],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function marginColor(m: number): string {
  if (m >= 30) return "text-green-600 dark:text-green-400";
  if (m >= 15) return "text-amber-500";
  return "text-red-500";
}

export function freshId(prefix = "li"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Data functions ───────────────────────────────────────────────────────────

export async function fetchBuilderCatalog(): Promise<BuilderCatalogItem[]> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select("id, name, sku, cost, msrp, unit_of_measure, has_labor, labor_hours, labor_rate_override, categories(name)")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id:         r.id,
    sku:        r.sku ?? "",
    name:       r.name,
    category:   (r.categories as { name: string } | null)?.name ?? "",
    unitCost:   r.cost,
    unitPrice:  r.msrp,
    unit:       r.unit_of_measure,
    hasLabor:   r.has_labor,
    laborHours: r.labor_hours ?? 0,
    laborRate:  r.labor_rate_override ?? DEFAULT_LABOR_RATE,
  }));
}

export async function fetchCompanyOptions(): Promise<CompanyOption[]> {
  const { data, error } = await supabase.from("companies").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllContacts(): Promise<ContactOption[]> {
  const { data, error } = await supabase
    .from("contacts").select("id, full_name, company_id").order("full_name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("user_profiles").select("id, full_name").eq("is_active", true).order("full_name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchOpportunityOptions(): Promise<OppOption[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("id, title, company:companies(id,name), contact:contacts(id,full_name)")
    .not("stage", "in", '("closed-lost")')
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OppOption[];
}

export async function fetchOpportunityById(id: string): Promise<OppOption | null> {
  const { data } = await supabase
    .from("opportunities")
    .select("id, title, company:companies(id,name), contact:contacts(id,full_name)")
    .eq("id", id)
    .single();
  return data as unknown as OppOption | null;
}

export async function fetchQuoteForEdit(quoteId: string): Promise<{
  quote: DbQuoteRow;
  sections: BuilderSection[];
  lineItems: BuilderLineItem[];
} | null> {
  const { data: quote } = await supabase
    .from("quotes")
    .select("*, opportunity:opportunities(id,title,company:companies(id,name),contact:contacts(id,full_name))")
    .eq("id", quoteId)
    .single();
  if (!quote) return null;

  const { data: items } = await supabase
    .from("quote_line_items")
    .select("id, catalog_item_id, description, quantity, unit_price, unit_cost, unit, item_type, section_name, sort_order")
    .eq("quote_id", quoteId)
    .order("sort_order");

  // Reconstruct sections from section_name order of appearance
  const sectionOrder: string[] = [];
  for (const item of items ?? []) {
    const name = item.section_name ?? "Items";
    if (!sectionOrder.includes(name)) sectionOrder.push(name);
  }
  const sections: BuilderSection[] = sectionOrder.map((name, i) => ({
    id: freshId("sec"), name, order: i + 1,
  }));
  const sectionByName = new Map(sections.map((s) => [s.name, s.id]));

  const lineItems: BuilderLineItem[] = (items ?? []).map((li) => ({
    id:            freshId("li"),
    sectionId:     sectionByName.get(li.section_name ?? "Items") ?? sections[0]?.id ?? freshId("sec"),
    type:          (li.item_type ?? "product") as BuilderLineItem["type"],
    catalogItemId: li.catalog_item_id,
    description:   li.description,
    qty:           li.quantity,
    unitCost:      li.unit_cost ?? 0,
    unitPrice:     li.unit_price,
    unit:          li.unit ?? "ea",
  }));

  return { quote: quote as unknown as DbQuoteRow, sections, lineItems };
}

export async function saveQuoteToDb(params: {
  opportunityId: string;
  quoteId: string | null;
  currentRevision: number;
  sections: BuilderSection[];
  lineItems: BuilderLineItem[];
  notes: string;
  expiryDate: string;
  issueDate: string;
}): Promise<string> {
  const { opportunityId, quoteId, currentRevision, sections, lineItems, notes, expiryDate, issueDate } = params;
  const { data: tenantRow } = await supabase.from("tenants").select("id").single();
  if (!tenantRow) throw new Error("No tenant");
  const tid = tenantRow.id;

  const value = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const expiry = expiryDate || null;

  let resolvedQuoteId = quoteId;

  if (quoteId) {
    const { error } = await supabase.from("quotes").update({
      value, notes: notes || null, expiry_date: expiry, revision: currentRevision + 1,
    }).eq("id", quoteId);
    if (error) throw error;
  } else {
    const { count } = await supabase.from("quotes").select("*", { count: "exact", head: true });
    const year = new Date().getFullYear();
    const number = `Q-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`;
    const { data: created, error } = await supabase
      .from("quotes")
      .insert({ tenant_id: tid, opportunity_id: opportunityId, number, value, notes: notes || null, status: "draft", expiry_date: expiry, revision: 1 })
      .select("id").single();
    if (error || !created) throw error ?? new Error("Quote insert failed");
    resolvedQuoteId = created.id;
  }

  // Delete existing line items and re-insert
  await supabase.from("quote_line_items").delete().eq("quote_id", resolvedQuoteId!);

  let sortOrder = 0;
  const rows = sections.flatMap((section) =>
    lineItems
      .filter((li) => li.sectionId === section.id)
      .map((li) => ({
        tenant_id:       tid,
        quote_id:        resolvedQuoteId!,
        catalog_item_id: li.catalogItemId,
        description:     li.description,
        quantity:        li.qty,
        unit_price:      li.unitPrice,
        unit_cost:       li.unitCost,
        total:           li.qty * li.unitPrice,
        unit:            li.unit,
        item_type:       li.type,
        section_name:    section.name,
        sort_order:      sortOrder++,
      }))
  );

  if (rows.length > 0) {
    const { error } = await supabase.from("quote_line_items").insert(rows);
    if (error) throw error;
  }

  // Sync opportunity value
  await supabase.from("opportunities").update({ value }).eq("id", opportunityId);

  void issueDate; // stored on the quote when PDF/send is implemented
  return resolvedQuoteId!;
}

// ─── CatalogSearchModal ───────────────────────────────────────────────────────

export function CatalogSearchModal({
  open, onClose, onAddItem, items,
}: {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: BuilderCatalogItem | null) => void;
  items: BuilderCatalogItem[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? items.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.sku.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setQuery(""); } }}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-[14px] font-semibold">Add Item from Catalog</DialogTitle>
        </DialogHeader>
        <div className="px-4 pt-3 pb-2 border-b border-border">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 h-8">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, SKU, or category…"
              className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <div className="overflow-y-auto max-h-72">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">
              No items match "{query}"
            </div>
          ) : filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { onAddItem(item); onClose(); setQuery(""); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left border-b border-border/40 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium truncate">{item.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{item.sku}</div>
              </div>
              {item.category && (
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary">
                  {item.category}
                </span>
              )}
              <span className="shrink-0 font-mono text-[12px] text-muted-foreground tabular-nums w-20 text-right">
                {currency(item.unitPrice)}
              </span>
              {item.hasLabor && item.laborHours > 0 && (
                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  +{item.laborHours}hr
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="border-t border-border px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => { onAddItem(null); onClose(); setQuery(""); }}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add custom item
          </button>
          <button type="button" onClick={onClose}
            className="h-7 rounded-md border border-border bg-surface px-3 text-[12px] hover:bg-accent transition-colors">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── LineItemRow ──────────────────────────────────────────────────────────────

export function LineItemRow({
  item, editingCell, onCellClick, onCellChange, onCellCommit, onDelete,
}: {
  item: BuilderLineItem;
  editingCell: EditingCell;
  onCellClick: (id: string, field: "qty" | "unitCost" | "unitPrice", current: number) => void;
  onCellChange: (draft: string) => void;
  onCellCommit: () => void;
  onDelete: (id: string) => void;
}) {
  const isEditing = (field: "qty" | "unitCost" | "unitPrice") =>
    editingCell?.id === item.id && editingCell.field === field;

  function cellValue(field: "qty" | "unitCost" | "unitPrice"): string {
    if (isEditing(field)) return editingCell!.draft;
    const v = item[field];
    return field === "qty" ? String(v) : currency(v);
  }

  function EditableCell({ field }: { field: "qty" | "unitCost" | "unitPrice" }) {
    if (isEditing(field)) {
      return (
        <input
          autoFocus
          value={editingCell!.draft}
          onChange={(e) => onCellChange(e.target.value)}
          onBlur={onCellCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); onCellCommit(); }
            if (e.key === "Escape") onCellCommit();
          }}
          className="w-full rounded border border-primary/40 bg-primary/5 px-1.5 py-0.5 text-right text-[12px] outline-none tabular-nums"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => onCellClick(item.id, field, item[field])}
        className="w-full rounded px-1.5 py-0.5 text-right text-[12px] tabular-nums hover:bg-accent transition-colors cursor-text"
      >
        {cellValue(field)}
      </button>
    );
  }

  const isLabor = item.type === "labor";
  const ext = item.qty * item.unitPrice;

  return (
    <div className={cn(
      "group grid items-center border-b border-border/50 last:border-0 px-3 py-1.5",
      "grid-cols-[1fr_64px_44px_88px_88px_88px_28px]",
      isLabor ? "bg-surface/30 pl-8" : "hover:bg-surface/40 transition-colors",
    )}>
      <div className={cn("min-w-0 pr-2", isLabor && "flex items-center gap-1.5")}>
        {isLabor && <span className="h-px w-3 shrink-0 bg-muted-foreground/30" />}
        <span className={cn("text-[12px] truncate", isLabor ? "text-muted-foreground" : "font-medium")}>
          {item.description}
        </span>
        {item.type === "custom" && (
          <span className="ml-1.5 inline-flex shrink-0 items-center rounded px-1 py-0.5 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
            custom
          </span>
        )}
      </div>
      <EditableCell field="qty" />
      <span className={cn("text-center text-[11px]", isLabor ? "text-muted-foreground/60" : "text-muted-foreground")}>
        {item.unit}
      </span>
      <EditableCell field="unitCost" />
      <EditableCell field="unitPrice" />
      <span className={cn(
        "text-right font-mono text-[12px] tabular-nums font-medium px-1.5",
        isLabor ? "text-muted-foreground/70" : "text-foreground",
      )}>
        {currency(ext)}
      </span>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────

export function SectionBlock({
  section, allItems, editingCell,
  onCellClick, onCellChange, onCellCommit, onDeleteItem, onAddItem,
}: {
  section: BuilderSection;
  allItems: BuilderLineItem[];
  editingCell: EditingCell;
  onCellClick: (id: string, field: "qty" | "unitCost" | "unitPrice", current: number) => void;
  onCellChange: (draft: string) => void;
  onCellCommit: () => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (sectionId: string) => void;
}) {
  const sectionItems = allItems.filter((i) => i.sectionId === section.id);
  const subtotal = sectionItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-surface/60 px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold">{section.name}</span>
          <span className="text-[10.5px] text-muted-foreground">
            {sectionItems.length} {sectionItems.length === 1 ? "item" : "items"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
            {subtotal > 0 ? currency(subtotal) : "—"}
          </span>
          <button
            type="button"
            onClick={() => onAddItem(section.id)}
            className="flex items-center gap-1 rounded-md border border-border bg-background px-2 h-6 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Item
          </button>
        </div>
      </div>
      {sectionItems.length > 0 && (
        <div className="grid grid-cols-[1fr_64px_44px_88px_88px_88px_28px] gap-0 border-b border-border/40 bg-surface/20 px-3 py-1">
          <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground/60">Description</span>
          <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground/60 text-right">Qty</span>
          <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground/60 text-center">Unit</span>
          <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground/60 text-right">Cost</span>
          <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground/60 text-right">Price</span>
          <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground/60 text-right px-1.5">Ext.</span>
          <span />
        </div>
      )}
      {sectionItems.map((item) => (
        <LineItemRow
          key={item.id}
          item={item}
          editingCell={editingCell}
          onCellClick={onCellClick}
          onCellChange={onCellChange}
          onCellCommit={onCellCommit}
          onDelete={onDeleteItem}
        />
      ))}
      {sectionItems.length === 0 && (
        <div className="px-4 py-3 text-[11.5px] text-muted-foreground/50 italic">
          No items — click "Add Item" to populate this section
        </div>
      )}
    </div>
  );
}
