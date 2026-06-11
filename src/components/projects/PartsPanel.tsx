import { useCallback, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TablesUpdate } from "@/lib/supabase/types";
import { currency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PartSource = "stock" | "special-order";
type PartStatus = "needed" | "ordered" | "received" | "installed";
type EditableCol = "name" | "phase" | "qty" | "unitCost" | "source" | "status" | "notes";

interface Part {
  id: string;
  catalogItemId: string | null;
  name: string;
  phase: string;
  qty: number;
  unitCost: number;
  laborHours: number | null;
  source: PartSource;
  status: PartStatus;
  notes: string;
}

interface EditingCell {
  rowId: string;
  col: EditableCol;
  value: string;
}

interface DraftPart {
  catalogItemId: string | null;
  name: string;
  phase: string;
  qty: string;
  unitCost: string;
  laborHours: string;
  source: PartSource;
  status: PartStatus;
  notes: string;
}

interface CatalogOption {
  id: string;
  name: string;
  cost: number | null;
  labor_hours: number | null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PartsPanelProps {
  projectId: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const sourceMeta: Record<PartSource, { label: string; cls: string }> = {
  "stock":         { label: "Stock",         cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  "special-order": { label: "Special Order", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
};

const statusMeta: Record<PartStatus, { label: string; cls: string }> = {
  "needed":    { label: "Needed",    cls: "bg-slate-500/15 text-slate-500 dark:text-slate-400" },
  "ordered":   { label: "Ordered",   cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  "received":  { label: "Received",  cls: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
  "installed": { label: "Installed", cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
};

const SOURCE_OPTIONS: PartSource[] = ["stock", "special-order"];
const STATUS_OPTIONS: PartStatus[] = ["needed", "ordered", "received", "installed"];
const PHASE_OPTIONS = ["Design", "Procurement", "Install", "Commission", "Closeout"];

const DEFAULT_DRAFT: DraftPart = {
  catalogItemId: null,
  name: "", phase: "Procurement", qty: "1", unitCost: "0", laborHours: "",
  source: "stock", status: "needed", notes: "",
};

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function fetchParts(projectId: string): Promise<Part[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_line_items")
    .select("id, catalog_item_id, name, phase, qty, unit_cost, labor_hours, source, status, notes")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id:           r.id,
    catalogItemId: r.catalog_item_id,
    name:         r.name,
    phase:        r.phase ?? "",
    qty:          Number(r.qty),
    unitCost:     Number(r.unit_cost),
    laborHours:   r.labor_hours != null ? Number(r.labor_hours) : null,
    source:       (r.source as PartSource) ?? "stock",
    status:       (r.status as PartStatus) ?? "needed",
    notes:        r.notes ?? "",
  }));
}

async function fetchCatalogOptions(): Promise<CatalogOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("catalog_items")
    .select("id, name, cost, labor_hours")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// ─── Small badge renders ──────────────────────────────────────────────────────

function SourceBadge({ source }: { source: PartSource }) {
  const { label, cls } = sourceMeta[source];
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap", cls)}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: PartStatus }) {
  const { label, cls } = statusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ─── Cell helpers ─────────────────────────────────────────────────────────────

const inputCls = "w-full bg-transparent text-[12px] outline-none border-b border-primary/60 focus:border-primary py-px";
const cellClickCls = "cursor-text select-none";

// ─── Main component ───────────────────────────────────────────────────────────

export function PartsPanel({ projectId }: PartsPanelProps) {
  const qc = useQueryClient();
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["project-line-items", projectId],
    queryFn: () => fetchParts(projectId),
  });
  const { data: catalogOptions = [] } = useQuery({
    queryKey: ["catalog-items-parts"],
    queryFn: fetchCatalogOptions,
  });

  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [addingPart, setAddingPart] = useState(false);
  const [draft, setDraft] = useState<DraftPart>({ ...DEFAULT_DRAFT });
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const insertMutation = useMutation({
    mutationFn: async (d: DraftPart) => {
      const supabase = createClient();
      const { data: tenantRow } = await supabase.from("tenants").select("id").single();
      if (!tenantRow) throw new Error("No tenant");
      const { error } = await supabase.from("project_line_items").insert({
        tenant_id:       tenantRow.id,
        project_id:      projectId,
        catalog_item_id: d.catalogItemId || null,
        name:            d.name.trim(),
        phase:           d.phase || null,
        qty:             Math.max(1, parseFloat(d.qty) || 1),
        unit_cost:       Math.max(0, parseFloat(d.unitCost) || 0),
        labor_hours:     d.laborHours ? parseFloat(d.laborHours) : null,
        source:          d.source,
        status:          d.status,
        notes:           d.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-line-items", projectId] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"project_line_items"> }) => {
      const supabase = createClient();
      const { error } = await supabase.from("project_line_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-line-items", projectId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("project_line_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-line-items", projectId] }),
  });

  // ── Editing helpers ────────────────────────────────────────────────────────

  const startEdit = useCallback((rowId: string, col: EditableCol, value: string) => {
    setEditingCell({ rowId, col, value });
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const { rowId, col, value } = editingCell;
    let patch: TablesUpdate<"project_line_items">;
    switch (col) {
      case "name":     patch = { name: value.trim() || undefined }; break;
      case "phase":    patch = { phase: value || null }; break;
      case "qty":      patch = { qty: Math.max(1, parseFloat(value) || 1) }; break;
      case "unitCost": patch = { unit_cost: Math.max(0, parseFloat(value) || 0) }; break;
      case "source":   patch = { source: value }; break;
      case "status":   patch = { status: value }; break;
      case "notes":    patch = { notes: value || null }; break;
      default: return;
    }
    updateMutation.mutate({ id: rowId, patch });
    setEditingCell(null);
  }, [editingCell, updateMutation]);

  const cancelEdit = useCallback(() => setEditingCell(null), []);

  const commitSelectEdit = useCallback(
    (rowId: string, col: EditableCol, value: string) => {
      let patch: TablesUpdate<"project_line_items">;
      switch (col) {
        case "phase":  patch = { phase: value || null }; break;
        case "source": patch = { source: value }; break;
        case "status": patch = { status: value }; break;
        default: return;
      }
      updateMutation.mutate({ id: rowId, patch });
      setEditingCell(null);
    },
    [updateMutation],
  );

  // ── Catalog combobox ───────────────────────────────────────────────────────

  const filteredCatalog = catalogSearch.trim()
    ? catalogOptions.filter((c) => c.name.toLowerCase().includes(catalogSearch.toLowerCase()))
    : catalogOptions.slice(0, 8);

  const selectCatalogItem = useCallback((item: CatalogOption) => {
    setDraft((d) => ({
      ...d,
      catalogItemId: item.id,
      name:          item.name,
      unitCost:      String(item.cost ?? 0),
      laborHours:    item.labor_hours != null ? String(item.labor_hours) : "",
    }));
    setCatalogSearch(item.name);
    setCatalogOpen(false);
  }, []);

  // ── Add part helpers ───────────────────────────────────────────────────────

  const openAddRow = useCallback(() => {
    setDraft({ ...DEFAULT_DRAFT });
    setCatalogSearch("");
    setAddingPart(true);
    setEditingCell(null);
  }, []);

  const commitAdd = useCallback(async () => {
    const name = draft.name.trim();
    if (!name) return;
    await insertMutation.mutateAsync(draft);
    setDraft({ ...DEFAULT_DRAFT });
    setCatalogSearch("");
    setAddingPart(false);
  }, [draft, insertMutation]);

  const cancelAdd = useCallback(() => {
    setAddingPart(false);
    setDraft({ ...DEFAULT_DRAFT });
    setCatalogSearch("");
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const totalCost = parts.reduce((s, p) => s + p.qty * p.unitCost, 0);
  const totalLaborHrs = parts.reduce((s, p) => s + p.qty * (p.laborHours ?? 0), 0);
  const statusCounts = STATUS_OPTIONS.map((s) => ({
    status: s,
    count: parts.filter((p) => p.status === s).length,
  })).filter((x) => x.count > 0);

  const selectCls = "bg-transparent text-[11.5px] outline-none cursor-pointer border border-border/60 rounded px-1.5 py-0.5 hover:border-primary/50 focus:border-primary transition-colors";
  const draftInputCls = "h-7 w-full rounded border border-border bg-surface px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40";

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-[12.5px] text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex flex-col">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-border px-5 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Parts Cost</span>
          <span className="text-[15px] font-semibold tabular-nums">{currency(totalCost)}</span>
        </div>
        {totalLaborHrs > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Budgeted Labor</span>
            <span className="text-[15px] font-semibold tabular-nums">{totalLaborHrs.toFixed(1)} hrs</span>
          </div>
        )}
        {statusCounts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {statusCounts.map(({ status, count }) => (
              <span key={status} className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium", statusMeta[status].cls)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {count} {statusMeta[status].label}
              </span>
            ))}
          </div>
        )}
        {parts.length === 0 && (
          <span className="text-[12px] text-muted-foreground">No parts yet.</span>
        )}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <div className="min-w-260">
          <table className="w-full text-[12px]">
            <thead className="bg-surface/50 border-b border-border">
              <tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 px-4 text-left font-medium w-55">Item Name</th>
                <th className="py-2 px-3 text-left font-medium w-30">Phase</th>
                <th className="py-2 px-3 text-right font-medium w-14.5">Qty</th>
                <th className="py-2 px-3 text-right font-medium w-22.5">Unit Cost</th>
                <th className="py-2 px-3 text-right font-medium w-22.5">Total</th>
                <th className="py-2 px-3 text-right font-medium w-18">Labor Hrs</th>
                <th className="py-2 px-3 text-left font-medium w-29">Source</th>
                <th className="py-2 px-3 text-left font-medium w-29">Status</th>
                <th className="py-2 px-3 text-left font-medium">Notes</th>
                <th className="py-2 px-3 w-8" />
              </tr>
            </thead>

            <tbody>
              {parts.map((part) => {
                const isEditingName     = editingCell?.rowId === part.id && editingCell.col === "name";
                const isEditingPhase    = editingCell?.rowId === part.id && editingCell.col === "phase";
                const isEditingQty      = editingCell?.rowId === part.id && editingCell.col === "qty";
                const isEditingUnitCost = editingCell?.rowId === part.id && editingCell.col === "unitCost";
                const isEditingSource   = editingCell?.rowId === part.id && editingCell.col === "source";
                const isEditingStatus   = editingCell?.rowId === part.id && editingCell.col === "status";
                const isEditingNotes    = editingCell?.rowId === part.id && editingCell.col === "notes";
                const lineTotal = part.qty * part.unitCost;

                return (
                  <tr key={part.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors group">
                    {/* Item Name */}
                    <td className="py-2 px-4">
                      {isEditingName ? (
                        <input autoFocus value={editingCell.value}
                          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                          onBlur={commitEdit}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                          className={cn(inputCls, "min-w-40")} />
                      ) : (
                        <span onClick={() => startEdit(part.id, "name", part.name)}
                          className={cn(cellClickCls, "block font-medium leading-snug")} title="Click to edit">
                          {part.name}
                        </span>
                      )}
                    </td>

                    {/* Phase */}
                    <td className="py-2 px-3">
                      {isEditingPhase ? (
                        <select autoFocus value={editingCell.value}
                          onChange={(e) => commitSelectEdit(part.id, "phase", e.target.value)}
                          onBlur={cancelEdit} className={selectCls}>
                          <option value="">— None —</option>
                          {PHASE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      ) : (
                        <span onClick={() => startEdit(part.id, "phase", part.phase)}
                          className={cn(cellClickCls, "text-muted-foreground")}>
                          {part.phase || <span className="opacity-40">—</span>}
                        </span>
                      )}
                    </td>

                    {/* Qty */}
                    <td className="py-2 px-3 text-right">
                      {isEditingQty ? (
                        <input autoFocus type="number" min={1} value={editingCell.value}
                          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                          onBlur={commitEdit}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                          className={cn(inputCls, "text-right [appearance:textfield] w-14")} />
                      ) : (
                        <span onClick={() => startEdit(part.id, "qty", String(part.qty))}
                          className={cn(cellClickCls, "tabular-nums")}>{part.qty}</span>
                      )}
                    </td>

                    {/* Unit Cost */}
                    <td className="py-2 px-3 text-right">
                      {isEditingUnitCost ? (
                        <input autoFocus type="number" min={0} step={0.01} value={editingCell.value}
                          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                          onBlur={commitEdit}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                          className={cn(inputCls, "text-right [appearance:textfield] w-20")} />
                      ) : (
                        <span onClick={() => startEdit(part.id, "unitCost", String(part.unitCost))}
                          className={cn(cellClickCls, "tabular-nums font-mono text-muted-foreground")}>
                          {currency(part.unitCost)}
                        </span>
                      )}
                    </td>

                    {/* Total Cost */}
                    <td className="py-2 px-3 text-right">
                      <span className="tabular-nums font-mono text-muted-foreground">{currency(lineTotal)}</span>
                    </td>

                    {/* Labor Hrs */}
                    <td className="py-2 px-3 text-right">
                      <span className="tabular-nums text-muted-foreground">
                        {part.laborHours != null
                          ? (part.qty * part.laborHours).toFixed(1)
                          : <span className="opacity-40">—</span>}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-2 px-3">
                      {isEditingSource ? (
                        <select autoFocus value={editingCell.value}
                          onChange={(e) => commitSelectEdit(part.id, "source", e.target.value)}
                          onBlur={cancelEdit} className={selectCls}>
                          {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{sourceMeta[s].label}</option>)}
                        </select>
                      ) : (
                        <span onClick={() => startEdit(part.id, "source", part.source)} className="cursor-pointer">
                          <SourceBadge source={part.source} />
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">
                      {isEditingStatus ? (
                        <select autoFocus value={editingCell.value}
                          onChange={(e) => commitSelectEdit(part.id, "status", e.target.value)}
                          onBlur={cancelEdit} className={selectCls}>
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusMeta[s].label}</option>)}
                        </select>
                      ) : (
                        <span onClick={() => startEdit(part.id, "status", part.status)} className="cursor-pointer">
                          <StatusBadge status={part.status} />
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-2 px-3">
                      {isEditingNotes ? (
                        <input autoFocus value={editingCell.value}
                          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                          onBlur={commitEdit}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                          className={cn(inputCls, "min-w-30")} />
                      ) : (
                        <span onClick={() => startEdit(part.id, "notes", part.notes)}
                          className={cn(cellClickCls, "text-muted-foreground")}>
                          {part.notes || <span className="opacity-0 group-hover:opacity-30 transition-opacity">Add note…</span>}
                        </span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="py-2 px-2">
                      <button
                        onClick={() => deleteMutation.mutate(part.id)}
                        className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                        aria-label="Remove part"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* ── Add Part inline row ──────────────────────────────────── */}
              {addingPart && (
                <tr className="border-b border-border/50 bg-surface/30">
                  {/* Catalog combobox / name */}
                  <td className="py-2 px-4" colSpan={1}>
                    <div className="relative" ref={catalogRef}>
                      <input
                        autoFocus
                        placeholder="Search catalog or type name…"
                        value={catalogSearch}
                        onChange={(e) => {
                          setCatalogSearch(e.target.value);
                          setDraft((d) => ({ ...d, name: e.target.value, catalogItemId: null }));
                          setCatalogOpen(true);
                        }}
                        onFocus={() => setCatalogOpen(true)}
                        onBlur={() => setTimeout(() => setCatalogOpen(false), 150)}
                        onKeyDown={(e) => { if (e.key === "Escape") cancelAdd(); }}
                        className={draftInputCls}
                      />
                      {catalogOpen && filteredCatalog.length > 0 && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border border-border bg-popover shadow-lg">
                          {filteredCatalog.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onMouseDown={() => selectCatalogItem(item)}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] hover:bg-accent transition-colors"
                            >
                              <span className="font-medium truncate">{item.name}</span>
                              <span className="ml-3 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                                {item.cost != null ? currency(item.cost) : ""}
                                {item.labor_hours != null ? ` · ${item.labor_hours}h` : ""}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Phase */}
                  <td className="py-2 px-3">
                    <select value={draft.phase}
                      onChange={(e) => setDraft((d) => ({ ...d, phase: e.target.value }))}
                      className="h-7 w-full rounded border border-border bg-surface px-1.5 text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">— None —</option>
                      {PHASE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </td>

                  {/* Qty */}
                  <td className="py-2 px-3">
                    <input type="number" min={1} value={draft.qty}
                      onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") cancelAdd(); }}
                      className={cn(draftInputCls, "text-right [appearance:textfield]")} />
                  </td>

                  {/* Unit Cost */}
                  <td className="py-2 px-3">
                    <input type="number" min={0} step={0.01} value={draft.unitCost}
                      onChange={(e) => setDraft((d) => ({ ...d, unitCost: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") cancelAdd(); }}
                      className={cn(draftInputCls, "text-right [appearance:textfield]")} />
                  </td>

                  {/* Total */}
                  <td className="py-2 px-3 text-right">
                    <span className="tabular-nums font-mono text-muted-foreground/60 text-[11.5px]">
                      {currency((parseFloat(draft.qty) || 1) * (parseFloat(draft.unitCost) || 0))}
                    </span>
                  </td>

                  {/* Labor Hrs */}
                  <td className="py-2 px-3">
                    <input type="number" min={0} step={0.25} placeholder="hrs"
                      value={draft.laborHours}
                      onChange={(e) => setDraft((d) => ({ ...d, laborHours: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") cancelAdd(); }}
                      className={cn(draftInputCls, "text-right [appearance:textfield]")} />
                  </td>

                  {/* Source */}
                  <td className="py-2 px-3">
                    <select value={draft.source}
                      onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value as PartSource }))}
                      className="h-7 w-full rounded border border-border bg-surface px-1.5 text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{sourceMeta[s].label}</option>)}
                    </select>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3">
                    <select value={draft.status}
                      onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as PartStatus }))}
                      className="h-7 w-full rounded border border-border bg-surface px-1.5 text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusMeta[s].label}</option>)}
                    </select>
                  </td>

                  {/* Notes + actions */}
                  <td className="py-2 px-3" colSpan={2}>
                    <div className="flex items-center gap-1.5">
                      <input placeholder="Notes…" value={draft.notes}
                        onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") cancelAdd(); }}
                        className={cn(draftInputCls, "min-w-20")} />
                      <button type="button" onClick={commitAdd}
                        disabled={!draft.name.trim() || insertMutation.isPending}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                        aria-label="Add part">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={cancelAdd}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        aria-label="Cancel">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {parts.length === 0 && !addingPart && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[12.5px] text-muted-foreground">
                    No parts added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part button */}
      {!addingPart && (
        <div className="border-t border-border/60 px-4 py-2">
          <button type="button" onClick={openAddRow}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Add Part
          </button>
        </div>
      )}
    </div>
  );
}
