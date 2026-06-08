import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMeta } from "@/contexts/PageMetaContext";
import { currency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Briefcase, Check, CheckCircle2, ChevronsUpDown, Circle, Clock,
  DollarSign, ExternalLink, FileText, Package, PackageCheck, Pencil, Plus, Truck, X,
} from "lucide-react";
import {
  StatBar, StatItem, FilterBar, SearchInput, FilterSelect,
  PageTabs, PageTab,
} from "@/components/ui/page-components";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DEMO_PURCHASE_ORDERS,
  VENDORS,
  type PurchaseOrder,
  type POLineItem,
  type POStatus,
} from "@/data/purchase-orders";
import { PROJECTS } from "@/data/projects";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/inventory/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders · Crosscurrent" }] }),
  component: PurchaseOrdersPage,
});

// ─── Catalog lookup (shared with Stock/Catalog pages) ─────────────────────────

interface CatalogEntry {
  id: string;
  name: string;
  sku: string;
  unitCost: number;
}

const CATALOG: CatalogEntry[] = [
  { id: "ci-101", name: "Axis P3245-V Fixed Dome Camera",       sku: "AX-P3245-V",    unitCost: 420  },
  { id: "ci-102", name: "Axis A1001 Network Door Controller",   sku: "AX-A1001",       unitCost: 680  },
  { id: "ci-103", name: "Axis M3106-L MkII Mini Dome",          sku: "AX-M3106L",      unitCost: 180  },
  { id: "ci-201", name: "Verkada CD52 Indoor Dome Camera",      sku: "VK-CD52",        unitCost: 590  },
  { id: "ci-202", name: "Verkada AD31 Access Controller",       sku: "VK-AD31",        unitCost: 890  },
  { id: "ci-301", name: "Leviton GigaMax Cat5e QuickPort Jack", sku: "LV-5G108-RW5",   unitCost: 28   },
  { id: "ci-302", name: 'Leviton 42" 2-Post Open Frame Rack',  sku: "LV-47612-FR",    unitCost: 285  },
  { id: "ci-401", name: "Biamp Tesira Forte AVB VT4",           sku: "BA-TESIRA-VT4",  unitCost: 2240 },
  { id: "ci-402", name: "Biamp Parlé TCM-1 Ceiling Mic",        sku: "BA-PARLE-TCM1",  unitCost: 890  },
  { id: "ci-501", name: "Camera Install — per drop",            sku: "INT-CAM-DROP",   unitCost: 55   },
  { id: "ci-502", name: "Low-Voltage Cable Run",                sku: "INT-LV-RUN",     unitCost: 40   },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<POStatus, {
  label: string;
  badgeCls: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  draft:     { label: "Draft",     badgeCls: "bg-muted text-muted-foreground",                                         Icon: FileText     },
  sent:      { label: "Sent",      badgeCls: "bg-blue-500/15 text-blue-600 dark:text-blue-400",                        Icon: Truck        },
  partial:   { label: "Partial",   badgeCls: "bg-amber-500/15 text-amber-600 dark:text-amber-400",                     Icon: Package      },
  received:  { label: "Received",  badgeCls: "bg-green-500/15 text-green-600 dark:text-green-400",                     Icon: PackageCheck },
  cancelled: { label: "Cancelled", badgeCls: "bg-red-500/15 text-red-600 dark:text-red-400",                           Icon: X            },
};

const TODAY = new Date("2026-06-07");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findJob(id: string | null) {
  if (!id) return null;
  return PROJECTS.find((p) => p.id === id) ?? null;
}

const JOB_PROJECTS   = PROJECTS.filter((p) => p.type === "project"    && p.status !== "cancelled");
const JOB_WORKORDERS = PROJECTS.filter((p) => p.type === "work-order" && p.status !== "cancelled");

function trackingUrl(n: string): string {
  if (/^1Z/i.test(n)) return `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`;
  if (/^\d{12,22}$/.test(n)) return `https://www.fedex.com/fedextrack/?tracknumbers=${encodeURIComponent(n)}`;
  return `https://www.google.com/search?q=track+${encodeURIComponent(n)}`;
}

function poTotal(po: PurchaseOrder): number {
  return po.lineItems.reduce((s, li) => s + li.qtyOrdered * li.unitCost, 0);
}

function poReceivedValue(po: PurchaseOrder): number {
  return po.lineItems.reduce((s, li) => s + li.qtyReceived * li.unitCost, 0);
}

function poRemainingValue(po: PurchaseOrder): number {
  return po.lineItems.reduce((s, li) => s + (li.qtyOrdered - li.qtyReceived) * li.unitCost, 0);
}

function isOverdue(po: PurchaseOrder): boolean {
  if (!po.expectedDate || po.status === "received" || po.status === "cancelled") return false;
  const exp = new Date(po.expectedDate);
  return exp < TODAY;
}

function receivedPct(po: PurchaseOrder): number {
  const total = po.lineItems.reduce((s, li) => s + li.qtyOrdered, 0);
  if (total === 0) return 0;
  const recv = po.lineItems.reduce((s, li) => s + li.qtyReceived, 0);
  return Math.round((recv / total) * 100);
}

function nextPONumber(pos: PurchaseOrder[]): string {
  const nums = pos
    .map((p) => parseInt(p.poNumber.replace("PO-", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1184;
  return `PO-${max + 1}`;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, overdue }: { status: POStatus; overdue?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap",
      overdue && status !== "received" && status !== "cancelled"
        ? "bg-red-500/15 text-red-600 dark:text-red-400"
        : m.badgeCls,
    )}>
      <m.Icon className="h-3 w-3" />
      {overdue && status !== "received" && status !== "cancelled" ? "Overdue" : m.label}
    </span>
  );
}

// ─── StatusTimeline ───────────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: POStatus }) {
  const steps: Array<{ key: POStatus; label: string }> = [
    { key: "draft",    label: "Draft"    },
    { key: "sent",     label: "Sent"     },
    { key: "partial",  label: "Partial"  },
    { key: "received", label: "Received" },
  ];
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-[11.5px] font-medium text-red-600 dark:text-red-400">
          <X className="h-3.5 w-3.5" /> Cancelled
        </span>
      </div>
    );
  }

  const order: Record<string, number> = { draft: 0, sent: 1, partial: 2, received: 3 };
  const currentIdx = order[status] ?? 0;

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const stepIdx = order[step.key];
        const done    = stepIdx < currentIdx;
        const active  = stepIdx === currentIdx;
        const future  = stepIdx > currentIdx;
        const skip    = step.key === "partial" && status === "received" && currentIdx === 3;
        return (
          <div key={step.key} className="flex items-center">
            {i > 0 && (
              <div className={cn(
                "h-px w-8",
                done || (skip) ? "bg-green-500" : "bg-border",
              )} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                done  ? "border-green-500 bg-green-500"
                : active ? "border-primary bg-primary/15"
                : "border-border bg-background",
              )}>
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : active ? (
                  <Circle className="h-2 w-2 fill-primary text-primary" />
                ) : (
                  <Circle className="h-2 w-2 text-muted-foreground/30" />
                )}
              </div>
              <span className={cn(
                "text-[10px] whitespace-nowrap",
                active ? "text-foreground font-medium" : future ? "text-muted-foreground/50" : "text-muted-foreground",
              )}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── LineItemProgressBar ──────────────────────────────────────────────────────

function LineItemProgressBar({ received, ordered }: { received: number; ordered: number }) {
  if (ordered === 0) return null;
  const pct = Math.min(100, Math.round((received / ordered) * 100));
  const done = received >= ordered;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", done ? "bg-green-500" : "bg-amber-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        "text-[10.5px] font-mono tabular-nums whitespace-nowrap",
        done ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
      )}>
        {received}/{ordered}
      </span>
    </div>
  );
}

// ─── JobCombobox ─────────────────────────────────────────────────────────────

interface JobComboboxProps {
  value: string;
  onChange: (id: string) => void;
}

function JobCombobox({ value, onChange }: JobComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = findJob(value || null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-[12.5px] hover:bg-accent/30 transition-colors"
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <span className={cn(
                "shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                selected.type === "work-order"
                  ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
              )}>
                {selected.type === "work-order" ? "WO" : "Proj"}
              </span>
              <span className="font-mono text-[11.5px] shrink-0">{selected.code}</span>
              <span className="text-muted-foreground truncate">{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">No linked job (general stock)</span>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 ml-auto" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-110 p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            if (itemValue === "__clear__") return 1;
            const job = PROJECTS.find((p) => p.id === itemValue);
            if (!job) return 0;
            const haystack = `${job.code} ${job.name} ${job.customer}`.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search by code, name, or customer…" />
          <CommandList>
            <CommandEmpty>No jobs found.</CommandEmpty>
            {value && (
              <>
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={() => { onChange(""); setOpen(false); }}
                    className="text-[12.5px] text-muted-foreground gap-2"
                  >
                    <X className="h-3.5 w-3.5 shrink-0" />
                    Clear — general stock
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup heading="Projects">
              {JOB_PROJECTS.map((job) => (
                <CommandItem
                  key={job.id}
                  value={job.id}
                  onSelect={(v) => { onChange(v); setOpen(false); }}
                  className="text-[12.5px] gap-2"
                >
                  <Check className={cn("h-3.5 w-3.5 shrink-0", value === job.id ? "opacity-100" : "opacity-0")} />
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0">{job.code}</span>
                  <span className="flex-1 truncate">{job.name}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0 truncate max-w-28">{job.customer}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Work Orders">
              {JOB_WORKORDERS.map((job) => (
                <CommandItem
                  key={job.id}
                  value={job.id}
                  onSelect={(v) => { onChange(v); setOpen(false); }}
                  className="text-[12.5px] gap-2"
                >
                  <Check className={cn("h-3.5 w-3.5 shrink-0", value === job.id ? "opacity-100" : "opacity-0")} />
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0">{job.code}</span>
                  <span className="flex-1 truncate">{job.name}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0 truncate max-w-28">{job.customer}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── CatalogCombobox ─────────────────────────────────────────────────────────

interface CatalogComboboxProps {
  onSelect: (id: string) => void;
  onCustom: () => void;
}

function CatalogCombobox({ onSelect, onCustom }: CatalogComboboxProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(id: string) {
    if (id === "__custom__") { onCustom(); }
    else { onSelect(id); }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-8 w-full flex items-center gap-2 rounded-md border border-border bg-background px-3 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          Add from catalog…
          <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-110 p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            if (itemValue === "__custom__") return 1;
            const item = CATALOG.find((c) => c.id === itemValue);
            if (!item) return 0;
            const haystack = `${item.name} ${item.sku}`.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search by name or SKU…" />
          <CommandList>
            <CommandEmpty>No catalog items found.</CommandEmpty>
            <CommandGroup heading="Catalog">
              {CATALOG.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  className="text-[12.5px] gap-3"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{item.name}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{item.sku}</span>
                  </span>
                  <span className="font-mono text-[12px] text-muted-foreground shrink-0">{currency(item.unitCost)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="__custom__" onSelect={handleSelect} className="text-[12.5px] text-muted-foreground gap-2">
                <Plus className="h-3.5 w-3.5 shrink-0" />
                Add custom item…
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── PODrawer ─────────────────────────────────────────────────────────────────

type DrawerMode = "view" | "edit" | "new";

interface PODrawerProps {
  open: boolean;
  po: PurchaseOrder | null;
  mode: DrawerMode;
  suggestedPONumber?: string;
  onClose: () => void;
  onSwitchToEdit: () => void;
  onSave: (po: PurchaseOrder) => void;
}

const POFormSchema = z.object({
  poNumber:          z.string().min(1, "Required"),
  vendorId:          z.string().min(1, "Select a vendor"),
  status:            z.enum(["draft", "sent", "partial", "received", "cancelled"]),
  orderDate:         z.string().min(1, "Required"),
  expectedDate:      z.string(),
  vendorOrderNumber: z.string(),
  trackingNumber:    z.string(),
  linkedJobId:       z.string(),
  notes:             z.string(),
});

type POFormValues = z.infer<typeof POFormSchema>;

function PODrawer({ open, po, mode, suggestedPONumber, onClose, onSwitchToEdit, onSave }: PODrawerProps) {
  const idCounter = useRef(0);

  const defaultForm: POFormValues = {
    poNumber:          "",
    vendorId:          "",
    status:            "draft",
    orderDate:         "",
    expectedDate:      "",
    vendorOrderNumber: "",
    trackingNumber:    "",
    linkedJobId:       "",
    notes:             "",
  };

  const form = useForm<POFormValues>({
    resolver: zodResolver(POFormSchema),
    defaultValues: defaultForm,
  });

  const [lineItems, setLineItems] = useState<POLineItem[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customItem, setCustomItem] = useState({ description: "", sku: "", qtyOrdered: 1, unitCost: 0 });

  useEffect(() => {
    if (!open) return;
    if (po && (mode === "edit" || mode === "view")) {
      form.reset({
        poNumber:          po.poNumber,
        vendorId:          po.vendorId,
        status:            po.status,
        orderDate:         po.orderDate,
        expectedDate:      po.expectedDate ?? "",
        vendorOrderNumber: po.vendorOrderNumber ?? "",
        trackingNumber:    po.trackingNumber ?? "",
        linkedJobId:       po.linkedJobId ?? "",
        notes:             po.notes,
      });
      setLineItems([...po.lineItems]);
    } else {
      form.reset({ ...defaultForm, poNumber: suggestedPONumber ?? "" });
      setLineItems([]);
    }
    setAddingCustom(false);
    setCustomItem({ description: "", sku: "", qtyOrdered: 1, unitCost: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, po, mode]);

  function addFromCatalog(catalogId: string) {
    if (!catalogId) return;
    const entry = CATALOG.find((c) => c.id === catalogId);
    if (!entry) return;
    idCounter.current += 1;
    setLineItems((prev) => [
      ...prev,
      {
        id:            `new-li-${idCounter.current}`,
        catalogItemId: entry.id,
        description:   entry.name,
        sku:           entry.sku,
        qtyOrdered:    1,
        qtyReceived:   0,
        unitCost:      entry.unitCost,
      },
    ]);
  }

  function addCustom() {
    if (!customItem.description.trim()) return;
    idCounter.current += 1;
    setLineItems((prev) => [
      ...prev,
      {
        id:            `new-li-${idCounter.current}`,
        catalogItemId: null,
        description:   customItem.description,
        sku:           customItem.sku,
        qtyOrdered:    customItem.qtyOrdered,
        qtyReceived:   0,
        unitCost:      customItem.unitCost,
      },
    ]);
    setCustomItem({ description: "", sku: "", qtyOrdered: 1, unitCost: 0 });
    setAddingCustom(false);
  }

  function updateLineItem(id: string, field: keyof POLineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((li) => li.id === id ? { ...li, [field]: value } : li),
    );
  }

  function removeLineItem(id: string) {
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  }

  function markAllReceived() {
    if (!po) return;
    onSave({
      ...po,
      status: "received",
      receivedDate: "Jun 7, 2026",
      lineItems: po.lineItems.map((li) => ({ ...li, qtyReceived: li.qtyOrdered })),
    });
  }

  function sendPO() {
    if (!po) return;
    onSave({ ...po, status: "sent" });
  }

  function onSubmit(values: POFormValues) {
    idCounter.current += 1;
    const vendor = VENDORS.find((v) => v.id === values.vendorId);
    onSave({
      id:           po?.id ?? `po-${Date.now()}-${idCounter.current}`,
      poNumber:     values.poNumber,
      vendorId:     values.vendorId,
      vendorName:   vendor?.name ?? values.vendorId,
      status:            values.status,
      orderDate:         values.orderDate,
      expectedDate:      values.expectedDate || null,
      receivedDate:      values.status === "received" ? (po?.receivedDate ?? "Jun 7, 2026") : null,
      vendorOrderNumber: values.vendorOrderNumber || null,
      trackingNumber:    values.trackingNumber || null,
      linkedJobId:       values.linkedJobId || null,
      notes:             values.notes,
      lineItems,
    });
  }

  const overdue  = po ? isOverdue(po) : false;
  const viewJob  = findJob(po?.linkedJobId ?? null);
  const totalVal = lineItems.reduce((s, li) => s + li.qtyOrdered * li.unitCost, 0);

  // ── View mode ────────────────────────────────────────────────────────────────

  function renderView() {
    if (!po) return null;
    const pct = receivedPct(po);
    const remaining = poRemainingValue(po);

    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Vendor + meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-[13.5px] font-semibold">{po.vendorName}</span>
              <StatusBadge status={po.status} overdue={overdue} />
              {overdue && (
                <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-red-500/15 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" /> Overdue
                </span>
              )}
            </div>
            <div className="rounded-lg border border-border bg-surface/30 px-3 py-1 divide-y divide-border/50">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[11.5px] text-muted-foreground">Order Date</span>
                <span className="text-[12.5px] font-medium">{po.orderDate}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[11.5px] text-muted-foreground">Expected</span>
                <span className={cn("text-[12.5px] font-medium", overdue && "text-red-600 dark:text-red-400")}>
                  {po.expectedDate ?? "—"}
                  {overdue && " · Overdue"}
                </span>
              </div>
              {po.receivedDate && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[11.5px] text-muted-foreground">Received</span>
                  <span className="text-[12.5px] font-medium text-green-600 dark:text-green-400">{po.receivedDate}</span>
                </div>
              )}
              {viewJob && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[11.5px] text-muted-foreground">Job</span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                      viewJob.type === "work-order"
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                    )}>
                      {viewJob.type === "work-order" ? "WO" : "Project"}
                    </span>
                    <span className="text-[12px] font-mono font-medium">{viewJob.code}</span>
                    <span className="text-[12px] text-muted-foreground truncate max-w-32">{viewJob.name}</span>
                  </div>
                </div>
              )}
              {po.vendorOrderNumber && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[11.5px] text-muted-foreground">Vendor Order #</span>
                  <span className="text-[12.5px] font-medium font-mono">{po.vendorOrderNumber}</span>
                </div>
              )}
              {po.trackingNumber && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[11.5px] text-muted-foreground">Tracking #</span>
                  <a
                    href={trackingUrl(po.trackingNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[12.5px] font-medium font-mono text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {po.trackingNumber}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[11.5px] text-muted-foreground">PO Total</span>
                <span className="text-[12.5px] font-medium font-mono">{currency(poTotal(po))}</span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <fieldset>
            <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Status</legend>
            <StatusTimeline status={po.status} />
          </fieldset>

          {/* Receipt progress (only if open) */}
          {(po.status === "sent" || po.status === "partial") && (
            <div className="rounded-lg border border-border bg-surface/30 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Received</span>
                <span className="font-mono tabular-nums font-semibold">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-green-500" : "bg-amber-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{currency(poReceivedValue(po))} received</span>
                <span>{currency(remaining)} remaining</span>
              </div>
            </div>
          )}

          {/* Line items */}
          <fieldset>
            <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Line Items ({po.lineItems.length})
            </legend>
            <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/50">
              {po.lineItems.map((li) => {
                const lineDone = li.qtyReceived >= li.qtyOrdered;
                return (
                  <div key={li.id} className="px-3.5 py-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium leading-snug truncate">{li.description}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{li.sku || "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12.5px] font-mono tabular-nums">
                          {currency(li.qtyOrdered * li.unitCost)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {li.qtyOrdered} × {currency(li.unitCost)}
                        </p>
                      </div>
                    </div>
                    {(po.status === "sent" || po.status === "partial" || po.status === "received") && (
                      <LineItemProgressBar received={li.qtyReceived} ordered={li.qtyOrdered} />
                    )}
                    {po.status === "received" && lineDone && (
                      <p className="text-[10.5px] text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Fully received
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* Notes */}
          {po.notes && (
            <fieldset>
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Notes</legend>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed rounded-lg border border-border bg-surface/30 px-3.5 py-3">
                {po.notes}
              </p>
            </fieldset>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <div className="flex gap-2">
            {po.status === "draft" && (
              <button
                type="button"
                onClick={sendPO}
                className="h-8 rounded-md bg-blue-600 px-3 text-[12.5px] font-medium text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Truck className="h-3.5 w-3.5" />
                Send PO
              </button>
            )}
            {(po.status === "sent" || po.status === "partial") && (
              <button
                type="button"
                onClick={markAllReceived}
                className="h-8 rounded-md bg-green-600 px-3 text-[12.5px] font-medium text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <PackageCheck className="h-3.5 w-3.5" />
                Mark All Received
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] hover:bg-accent transition-colors">
              Close
            </button>
            {po.status !== "received" && po.status !== "cancelled" && (
              <button type="button" onClick={onSwitchToEdit}
                className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Edit / New mode ──────────────────────────────────────────────────────────

  const inputCls = "h-8 w-full rounded-md border border-border bg-background px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50";

  function renderEdit() {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

            {/* PO Header */}
            <fieldset className="space-y-4">
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">PO Details</legend>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="poNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">PO Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PO-1185" className="h-8 text-[13px]" />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">Status *</FormLabel>
                    <FormControl>
                      <select {...field} className={inputCls}>
                        {(Object.keys(STATUS_META) as POStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="vendorId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11.5px]">Vendor *</FormLabel>
                  <FormControl>
                    <select {...field} className={inputCls}>
                      <option value="">Select vendor…</option>
                      {VENDORS.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="orderDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">Order Date *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Jun 7, 2026" className="h-8 text-[13px]" />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="expectedDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">Expected Date</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Jun 14, 2026" className="h-8 text-[13px]" />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="vendorOrderNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">Vendor Order #</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. ADI-SO-254001" className="h-8 text-[13px]" />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">Tracking #</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 1Z999AA1…" className="h-8 text-[13px]" />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11.5px]">Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Optional notes…" className="text-[13px] resize-none" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </fieldset>

            {/* Linked Job */}
            <fieldset className="space-y-3">
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Linked Job</legend>

              <FormField control={form.control} name="linkedJobId" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <JobCombobox value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </fieldset>

            {/* Line items */}
            <fieldset className="space-y-3">
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Line Items {lineItems.length > 0 && <span className="ml-1 normal-case font-normal text-muted-foreground">· {currency(totalVal)} total</span>}
              </legend>

              {lineItems.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/50">
                  {lineItems.map((li) => (
                    <div key={li.id} className="px-3 py-2.5 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <input
                            value={li.description}
                            onChange={(e) => updateLineItem(li.id, "description", e.target.value)}
                            placeholder="Description"
                            className="h-7 w-full rounded border border-border bg-background px-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <div className="grid grid-cols-3 gap-1.5">
                            <input
                              value={li.sku}
                              onChange={(e) => updateLineItem(li.id, "sku", e.target.value)}
                              placeholder="SKU"
                              className="h-7 rounded border border-border bg-background px-2 text-[12px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">Qty</span>
                              <input
                                type="number"
                                min="0"
                                value={li.qtyOrdered}
                                onChange={(e) => updateLineItem(li.id, "qtyOrdered", parseInt(e.target.value, 10) || 0)}
                                className="h-7 w-full rounded border border-border bg-background pl-7 pr-2 text-[12.5px] tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={li.unitCost}
                                onChange={(e) => updateLineItem(li.id, "unitCost", parseFloat(e.target.value) || 0)}
                                className="h-7 w-full rounded border border-border bg-background pl-5 pr-2 text-[12.5px] tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
                          <p className="text-[12px] font-mono tabular-nums text-muted-foreground">
                            {currency(li.qtyOrdered * li.unitCost)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeLineItem(li.id)}
                            className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add from catalog */}
              {!addingCustom && (
                <CatalogCombobox
                  onSelect={addFromCatalog}
                  onCustom={() => setAddingCustom(true)}
                />
              )}

              {/* Add custom item */}
              {addingCustom && (
                <div className="rounded-lg border border-border bg-surface/30 p-3 space-y-2">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Custom Item</p>
                  <input
                    value={customItem.description}
                    onChange={(e) => setCustomItem((v) => ({ ...v, description: e.target.value }))}
                    placeholder="Description *"
                    className="h-7 w-full rounded border border-border bg-background px-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <input
                      value={customItem.sku}
                      onChange={(e) => setCustomItem((v) => ({ ...v, sku: e.target.value }))}
                      placeholder="SKU"
                      className="h-7 rounded border border-border bg-background px-2 text-[12px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={customItem.qtyOrdered}
                        onChange={(e) => setCustomItem((v) => ({ ...v, qtyOrdered: parseInt(e.target.value, 10) || 1 }))}
                        className="h-7 w-full rounded border border-border bg-background pl-7 pr-2 text-[12.5px] tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={customItem.unitCost}
                        onChange={(e) => setCustomItem((v) => ({ ...v, unitCost: parseFloat(e.target.value) || 0 }))}
                        className="h-7 w-full rounded border border-border bg-background pl-5 pr-2 text-[12.5px] tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setAddingCustom(false)}
                      className="h-7 rounded border border-border bg-surface px-3 text-[11.5px] hover:bg-accent transition-colors">
                      Cancel
                    </button>
                    <button type="button" onClick={addCustom}
                      className="h-7 rounded bg-primary px-3 text-[11.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                      Add Item
                    </button>
                  </div>
                </div>
              )}
            </fieldset>
          </div>

          <div className="shrink-0 flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            <button type="button" onClick={onClose}
              className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              {mode === "new" ? "Create PO" : "Save Changes"}
            </button>
          </div>
        </form>
      </Form>
    );
  }

  const title =
    mode === "new"  ? "New Purchase Order"
    : mode === "edit" ? `Edit ${po?.poNumber ?? "PO"}`
    : po?.poNumber ?? "Purchase Order";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-130 flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-[15px] pr-8">{title}</SheetTitle>
        </SheetHeader>
        {mode === "view" ? renderView() : renderEdit()}
      </SheetContent>
    </Sheet>
  );
}

// ─── POTable ──────────────────────────────────────────────────────────────────

interface POTableProps {
  pos: PurchaseOrder[];
  onView: (po: PurchaseOrder) => void;
  onEdit: (po: PurchaseOrder) => void;
}

function POTable({ pos, onView, onEdit }: POTableProps) {
  if (pos.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/25 mb-3" />
        <p className="text-[13px] font-medium">No purchase orders</p>
        <p className="mt-1 text-[12px] text-muted-foreground">No POs match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2 px-4">PO # / Vendor</th>
              <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Status</th>
              <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Job</th>
              <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Order Date</th>
              <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Expected</th>
              <th className="text-right text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Items</th>
              <th className="text-right text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2 pr-4">Total</th>
              <th className="py-2 pr-4 w-24" />
            </tr>
          </thead>
          <tbody>
            {pos.map((po) => {
              const overdue  = isOverdue(po);
              const total    = poTotal(po);
              const pct      = receivedPct(po);
              const isOpen   = po.status === "sent" || po.status === "partial";
              const tableJob = findJob(po.linkedJobId);
              return (
                <tr
                  key={po.id}
                  onClick={() => onView(po)}
                  className="group border-b border-border/60 last:border-0 hover:bg-surface/40 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4">
                    <p className="font-medium">{po.poNumber}</p>
                    <p className="text-[11.5px] text-muted-foreground">{po.vendorName}</p>
                    {po.trackingNumber && (
                      <a
                        href={trackingUrl(po.trackingNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Truck className="h-2.5 w-2.5" />
                        {po.trackingNumber}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge status={po.status} overdue={overdue} />
                  </td>
                  <td className="py-2.5 pr-4 max-w-44">
                    {tableJob ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                          <span className="text-[11px] font-mono text-muted-foreground">{tableJob.code}</span>
                        </div>
                        <p className="text-[12px] leading-snug truncate">{tableJob.name}</p>
                      </div>
                    ) : (
                      <span className="text-[11.5px] text-muted-foreground/40 italic">General stock</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{po.orderDate}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {po.expectedDate ? (
                      <span className={cn(overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                        {overdue && <AlertTriangle className="inline h-3 w-3 mr-1 mb-0.5" />}
                        {po.expectedDate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-muted-foreground">
                    {po.lineItems.length}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <p className="font-mono tabular-nums font-medium">{currency(total)}</p>
                    {isOpen && pct > 0 && pct < 100 && (
                      <p className="text-[10.5px] text-muted-foreground">{pct}% received</p>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1 justify-end">
                      {po.status !== "received" && po.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEdit(po); }}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded border border-border bg-surface px-2 h-6 text-[11px] text-muted-foreground hover:text-foreground transition-all"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PurchaseOrdersPage ───────────────────────────────────────────────────────

type TabValue = "all" | POStatus;

function PurchaseOrdersPage() {
  const { setMeta } = useMeta();

  const [pos, setPos] = useState<PurchaseOrder[]>(DEMO_PURCHASE_ORDERS);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPO, setDrawerPO] = useState<PurchaseOrder | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");

  const openNew = useCallback(() => {
    setDrawerPO(null);
    setDrawerMode("new");
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    setMeta({
      title: "Purchase Orders",
      subtitle: "Inventory",
      newLabel: "New PO",
      onNew: openNew,
    });
  }, [setMeta, openNew]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const open       = pos.filter((p) => p.status === "draft" || p.status === "sent" || p.status === "partial");
    const openVal    = open.reduce((s, p) => s + poRemainingValue(p), 0);
    const awaiting   = pos.filter((p) => p.status === "sent" || p.status === "partial").length;
    const overdueCount = pos.filter(isOverdue).length;
    return { openCount: open.length, openVal, awaiting, overdueCount };
  }, [pos]);

  // ── Tab counts ────────────────────────────────────────────────────────────

  const tabCounts = useMemo(() => {
    const counts: Record<TabValue, number> = { all: pos.length, draft: 0, sent: 0, partial: 0, received: 0, cancelled: 0 };
    pos.forEach((p) => { counts[p.status] += 1; });
    return counts;
  }, [pos]);

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pos.filter((p) => {
      if (activeTab !== "all" && p.status !== activeTab) return false;
      if (vendorFilter !== "all" && p.vendorId !== vendorFilter) return false;
      if (jobFilter === "none" && p.linkedJobId !== null) return false;
      if (jobFilter !== "all" && jobFilter !== "none" && p.linkedJobId !== jobFilter) return false;
      if (q && !p.poNumber.toLowerCase().includes(q) && !p.vendorName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pos, activeTab, search, vendorFilter, jobFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleView(po: PurchaseOrder) {
    setDrawerPO(po);
    setDrawerMode("view");
    setDrawerOpen(true);
  }

  function handleEdit(po: PurchaseOrder) {
    setDrawerPO(po);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }

  function handleSave(saved: PurchaseOrder) {
    setPos((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx === -1) return [saved, ...prev];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
    setDrawerOpen(false);
  }

  // ── New PO — auto-generate PO number ─────────────────────────────────────

  const newPONumber = useMemo(() => nextPONumber(pos), [pos]);

  const TABS: Array<{ value: TabValue; label: string }> = [
    { value: "all",       label: "All"       },
    { value: "draft",     label: "Draft"     },
    { value: "sent",      label: "Sent"      },
    { value: "partial",   label: "Partial"   },
    { value: "received",  label: "Received"  },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Stats bar */}
      {/* Stat bar */}
      <StatBar>
        <StatItem icon={Package}     label="Open POs"        value={String(stats.openCount)} />
        <StatItem icon={DollarSign}  label="Open Value"      value={currency(stats.openVal)} />
        <StatItem icon={Truck}       label="Awaiting Receipt" value={String(stats.awaiting)} />
        <StatItem icon={AlertTriangle} label="Overdue"       value={String(stats.overdueCount)} accent={stats.overdueCount > 0} />
      </StatBar>

      {/* Tabs */}
      <PageTabs>
        {TABS.map((tab) => (
          <PageTab key={tab.value} active={activeTab === tab.value} onClick={() => setActiveTab(tab.value)} count={tabCounts[tab.value]}>
            {tab.label}
          </PageTab>
        ))}
      </PageTabs>

      {/* Filter bar */}
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search PO # or vendor…" />
        <FilterSelect value={vendorFilter} onChange={setVendorFilter}>
          <option value="all">All Vendors</option>
          {VENDORS.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={jobFilter} onChange={setJobFilter}>
          <option value="all">All Jobs</option>
          <option value="none">General Stock</option>
          <optgroup label="── Projects ──">
            {JOB_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </optgroup>
          <optgroup label="── Work Orders ──">
            {JOB_WORKORDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </optgroup>
        </FilterSelect>
        {(search || vendorFilter !== "all" || jobFilter !== "all") && (
          <button
            type="button"
            onClick={() => { setSearch(""); setVendorFilter("all"); setJobFilter("all"); }}
            className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-border text-[11.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </FilterBar>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <POTable
          pos={filtered}
          onView={handleView}
          onEdit={handleEdit}
        />
      </div>

      {/* Drawer */}
      <PODrawer
        open={drawerOpen}
        po={drawerPO}
        mode={drawerMode}
        suggestedPONumber={newPONumber}
        onClose={() => setDrawerOpen(false)}
        onSwitchToEdit={() => setDrawerMode("edit")}
        onSave={handleSave}
      />
    </div>
  );
}
