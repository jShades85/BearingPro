import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMeta } from "@/contexts/PageMetaContext";
import { currency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  Camera, ImagePlus, KeyRound, LayoutGrid, List, Monitor,
  Network, Package2, Pencil, Plug, Wrench,
} from "lucide-react";
import { FilterBar, SearchInput, FilterSelect } from "@/components/ui/page-components";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/inventory/catalog")({
  head: () => ({ meta: [{ title: "Catalog · BearingPro" }] }),
  component: CatalogPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "camera"
  | "access_control"
  | "networking"
  | "cable_hardware"
  | "audio_video"
  | "labor"
  | "misc";

interface Manufacturer {
  id: string;
  name: string;
  logoInitials: string;
  categories: string[];
}

interface CatalogItem {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  name: string;
  sku: string;
  category: Category;
  description: string;
  cost: number;
  msrp: number;
  unitOfMeasure: string;
  hasLabor: boolean;
  laborHours: number | null;
  laborRateOverride: number | null;
  imageUrl: string | null;
  isActive: boolean;
}

// ─── Zod schema ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "camera", "access_control", "networking",
  "cable_hardware", "audio_video", "labor", "misc",
] as const;

const ItemFormSchema = z
  .object({
    name:                z.string().min(1, "Required"),
    manufacturerId:      z.string().min(1, "Required"),
    newManufacturerName: z.string(),
    sku:                 z.string(),
    category:            z.enum(CATEGORIES),
    description:         z.string(),
    cost:                z.coerce.number({ invalid_type_error: "Required" }).min(0, "Must be ≥ 0"),
    msrp:                z.coerce.number({ invalid_type_error: "Required" }).min(0, "Must be ≥ 0"),
    unitOfMeasure:       z.string().min(1, "Required"),
    isActive:            z.boolean(),
    hasLabor:            z.boolean(),
    laborHours:          z.string(),
    laborRateOverride:   z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.manufacturerId === "__new__" && !data.newManufacturerName.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Manufacturer name required", path: ["newManufacturerName"] });
    }
    if (data.hasLabor) {
      const h = parseFloat(data.laborHours);
      if (!data.laborHours || isNaN(h) || h <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Labor hours required", path: ["laborHours"] });
      }
    }
    if (data.laborRateOverride) {
      const r = parseFloat(data.laborRateOverride);
      if (isNaN(r) || r <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be > 0", path: ["laborRateOverride"] });
      }
    }
  });

type ItemFormValues = z.infer<typeof ItemFormSchema>;

const DEFAULT_FORM: ItemFormValues = {
  name: "", manufacturerId: "", newManufacturerName: "",
  sku: "", category: "camera", description: "",
  cost: 0, msrp: 0, unitOfMeasure: "ea",
  isActive: true, hasLabor: false, laborHours: "", laborRateOverride: "",
};

// ─── Config ───────────────────────────────────────────────────────────────────

const categoryMeta: Record<Category, { label: string; cls: string }> = {
  camera:        { label: "Camera",         cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  access_control:{ label: "Access Control", cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
  networking:    { label: "Networking",     cls: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400" },
  cable_hardware:{ label: "Cable/HW",       cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  audio_video:   { label: "Audio/Video",    cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  labor:         { label: "Labor",          cls: "bg-slate-500/15 text-slate-500" },
  misc:          { label: "Misc",           cls: "bg-pink-500/15 text-pink-600 dark:text-pink-400" },
};

const categoryIcons: Record<Category, React.ComponentType<{ className?: string }>> = {
  camera:        Camera,
  access_control:KeyRound,
  networking:    Network,
  cable_hardware:Plug,
  audio_video:   Monitor,
  labor:         Wrench,
  misc:          Package2,
};

const categoryCardBg: Record<Category, string> = {
  camera:        "bg-blue-500/8 dark:bg-blue-500/10",
  access_control:"bg-green-500/8 dark:bg-green-500/10",
  networking:    "bg-cyan-500/8 dark:bg-cyan-500/10",
  cable_hardware:"bg-amber-500/8 dark:bg-amber-500/10",
  audio_video:   "bg-violet-500/8 dark:bg-violet-500/10",
  labor:         "bg-slate-500/8 dark:bg-slate-500/10",
  misc:          "bg-pink-500/8 dark:bg-pink-500/10",
};

const categoryIconCls: Record<Category, string> = {
  camera:        "text-blue-400/40",
  access_control:"text-green-400/40",
  networking:    "text-cyan-400/40",
  cable_hardware:"text-amber-400/40",
  audio_video:   "text-violet-400/40",
  labor:         "text-slate-400/40",
  misc:          "text-pink-400/40",
};

const MFR_PALETTE = [
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
];

function mfrColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return MFR_PALETTE[Math.abs(h) % MFR_PALETTE.length];
}

const UNIT_SUGGESTIONS = ["ea", "hr", "ft", "lot", "spl", "run", "box", "set"];

// ─── Demo data ────────────────────────────────────────────────────────────────

const INITIAL_MANUFACTURERS: Manufacturer[] = [
  { id: "m-1", name: "Axis Communications", logoInitials: "AX", categories: ["Cameras", "Access Control"] },
  { id: "m-2", name: "Verkada",             logoInitials: "VK", categories: ["Cameras", "Access Control"] },
  { id: "m-3", name: "Leviton",             logoInitials: "LV", categories: ["Networking", "Infrastructure"] },
  { id: "m-4", name: "Biamp",               logoInitials: "BA", categories: ["Audio/Video"] },
  { id: "m-5", name: "Internal / Custom",   logoInitials: "PC", categories: ["Labor", "Services", "Misc"] },
];

const INITIAL_ITEMS: CatalogItem[] = [
  {
    id: "ci-101", manufacturerId: "m-1", manufacturerName: "Axis Communications",
    name: "Axis P3245-V Fixed Dome Camera", sku: "AX-P3245-V", category: "camera",
    description: "Fixed dome 1080p camera with WDR, IR illumination to 10m. IP66/IK10 rated.",
    cost: 420, msrp: 549, unitOfMeasure: "ea",
    hasLabor: true, laborHours: 1.5, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-102", manufacturerId: "m-1", manufacturerName: "Axis Communications",
    name: "Axis A1001 Network Door Controller", sku: "AX-A1001", category: "access_control",
    description: "2-door network door controller, OSDP/Wiegand readers, PoE-powered.",
    cost: 680, msrp: 895, unitOfMeasure: "ea",
    hasLabor: true, laborHours: 2, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-103", manufacturerId: "m-1", manufacturerName: "Axis Communications",
    name: "Axis M3106-L MkII Mini Dome", sku: "AX-M3106L", category: "camera",
    description: "Compact 4MP fixed mini dome, indoor ceiling mount, 2.8mm lens.",
    cost: 180, msrp: 235, unitOfMeasure: "ea",
    hasLabor: false, laborHours: null, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-201", manufacturerId: "m-2", manufacturerName: "Verkada",
    name: "Verkada CD52 Indoor Dome Camera", sku: "VK-CD52", category: "camera",
    description: "5MP IR dome camera, cloud-managed, 30-day onboard storage, PoE.",
    cost: 590, msrp: 749, unitOfMeasure: "ea",
    hasLabor: true, laborHours: 1.5, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-202", manufacturerId: "m-2", manufacturerName: "Verkada",
    name: "Verkada AD31 Access Controller", sku: "VK-AD31", category: "access_control",
    description: "Cloud-based door access controller, supports up to 2 readers, built-in Bluetooth.",
    cost: 890, msrp: 1150, unitOfMeasure: "ea",
    hasLabor: true, laborHours: 2, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-301", manufacturerId: "m-3", manufacturerName: "Leviton",
    name: "Leviton GigaMax 5e QuickPort Jack", sku: "LV-5G108-RW5", category: "networking",
    description: "Cat 5e QuickPort jack, 110-style termination, white. Pack of 25.",
    cost: 28, msrp: 42, unitOfMeasure: "box",
    hasLabor: false, laborHours: null, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-302", manufacturerId: "m-3", manufacturerName: "Leviton",
    name: "Leviton 42\" 2-Post Open Frame Rack", sku: "LV-47612-FR", category: "cable_hardware",
    description: "42U two-post open frame rack, 19-inch, black powder coat, 400 lb capacity.",
    cost: 285, msrp: 415, unitOfMeasure: "ea",
    hasLabor: false, laborHours: null, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-401", manufacturerId: "m-4", manufacturerName: "Biamp",
    name: "Biamp Tesira Forte AVB VT4", sku: "BA-TESIRA-VT4", category: "audio_video",
    description: "Network-based fixed I/O DSP, 4-in/4-out, AVB/DANTE, AEC, rackmount.",
    cost: 2240, msrp: 3150, unitOfMeasure: "ea",
    hasLabor: true, laborHours: 3, laborRateOverride: 95,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-402", manufacturerId: "m-4", manufacturerName: "Biamp",
    name: "Biamp Parlé TCM-1 Ceiling Mic", sku: "BA-PARLE-TCM1", category: "audio_video",
    description: "Beamtracking ceiling microphone, 360° coverage, PoE, white or black.",
    cost: 890, msrp: 1280, unitOfMeasure: "ea",
    hasLabor: false, laborHours: null, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-501", manufacturerId: "m-5", manufacturerName: "Internal / Custom",
    name: "Camera Install — per drop", sku: "INT-CAM-DROP", category: "labor",
    description: "Per-drop labor rate for camera installation including mounting, cable termination, and basic commissioning.",
    cost: 55, msrp: 95, unitOfMeasure: "ea",
    hasLabor: false, laborHours: null, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-502", manufacturerId: "m-5", manufacturerName: "Internal / Custom",
    name: "Low-Voltage Cable Run", sku: "INT-LV-RUN", category: "cable_hardware",
    description: "Per-run pricing for pulling and terminating Cat6/coax from panel to device, up to 150ft.",
    cost: 40, msrp: 85, unitOfMeasure: "run",
    hasLabor: false, laborHours: null, laborRateOverride: null,
    imageUrl: null, isActive: true,
  },
  {
    id: "ci-503", manufacturerId: "m-5", manufacturerName: "Internal / Custom",
    name: "System Programming & Commissioning", sku: "INT-PROG-HR", category: "labor",
    description: "Hourly rate for system programming, configuration, and on-site commissioning.",
    cost: 75, msrp: 145, unitOfMeasure: "hr",
    hasLabor: false, laborHours: null, laborRateOverride: null,
    imageUrl: null, isActive: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryChip(cat: Category) {
  const m = categoryMeta[cat];
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium", m.cls)}>
      {m.label}
    </span>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
      <span className={cn("text-[12.5px] font-medium", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function PriceStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-surface/50 py-3 px-2 gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      <span className={cn("text-[15px] font-semibold tabular-nums", highlight && "text-status-won")}>{value}</span>
    </div>
  );
}

// ─── ItemDrawer ───────────────────────────────────────────────────────────────

interface ItemDrawerProps {
  open: boolean;
  item: CatalogItem | null;
  mode: "view" | "edit";
  manufacturers: Manufacturer[];
  onClose: () => void;
  onSwitchToEdit: () => void;
  onSave: (item: CatalogItem, newMfr: Manufacturer | null) => void;
}

function ItemDrawer({ open, item, mode, manufacturers, onClose, onSwitchToEdit, onSave }: ItemDrawerProps) {
  const idRef = useRef(0);

  const defaultValues: ItemFormValues = item
    ? {
        name:                item.name,
        manufacturerId:      item.manufacturerId,
        newManufacturerName: "",
        sku:                 item.sku,
        category:            item.category,
        description:         item.description,
        cost:                item.cost,
        msrp:                item.msrp,
        unitOfMeasure:       item.unitOfMeasure,
        isActive:            item.isActive,
        hasLabor:            item.hasLabor,
        laborHours:          item.laborHours?.toString() ?? "",
        laborRateOverride:   item.laborRateOverride?.toString() ?? "",
      }
    : DEFAULT_FORM;

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        item
          ? {
              name:                item.name,
              manufacturerId:      item.manufacturerId,
              newManufacturerName: "",
              sku:                 item.sku,
              category:            item.category,
              description:         item.description,
              cost:                item.cost,
              msrp:                item.msrp,
              unitOfMeasure:       item.unitOfMeasure,
              isActive:            item.isActive,
              hasLabor:            item.hasLabor,
              laborHours:          item.laborHours?.toString() ?? "",
              laborRateOverride:   item.laborRateOverride?.toString() ?? "",
            }
          : DEFAULT_FORM,
      );
    }
  }, [open, item, form]);

  const mfrId = form.watch("manufacturerId");
  const hasLabor = form.watch("hasLabor");

  function onSubmit(values: ItemFormValues) {
    let resolvedMfrId = values.manufacturerId;
    let mfrName = manufacturers.find((m) => m.id === resolvedMfrId)?.name ?? "";
    let newMfr: Manufacturer | null = null;

    if (values.manufacturerId === "__new__") {
      const trimmed = values.newManufacturerName.trim();
      const newId = `m-${Date.now()}`;
      newMfr = {
        id: newId,
        name: trimmed,
        logoInitials: trimmed.slice(0, 2).toUpperCase(),
        categories: [],
      };
      resolvedMfrId = newId;
      mfrName = trimmed;
    }

    idRef.current += 1;
    onSave(
      {
        id: item?.id ?? `ci-${Date.now()}-${idRef.current}`,
        manufacturerId:   resolvedMfrId,
        manufacturerName: mfrName,
        name:             values.name,
        sku:              values.sku,
        category:         values.category,
        description:      values.description,
        cost:             values.cost,
        msrp:             values.msrp,
        unitOfMeasure:    values.unitOfMeasure,
        isActive:         values.isActive,
        hasLabor:         values.hasLabor,
        laborHours:       values.laborHours       ? parseFloat(values.laborHours)       : null,
        laborRateOverride:values.laborRateOverride ? parseFloat(values.laborRateOverride) : null,
        imageUrl:         item?.imageUrl ?? null,
      },
      newMfr,
    );
  }

  // ── View mode ────────────────────────────────────────────────────────────────

  function renderViewContent() {
    if (!item) return null;
    const margin = item.msrp > 0 ? ((item.msrp - item.cost) / item.msrp * 100) : 0;
    const mfr = manufacturers.find((m) => m.id === item.manufacturerId);
    const colorCls = mfrColor(item.manufacturerId);

    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Manufacturer + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-bold", colorCls)}>
              {mfr?.logoInitials ?? item.manufacturerName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[12.5px] text-muted-foreground">{item.manufacturerName}</span>
            <span className="ml-auto">{categoryChip(item.category)}</span>
            <span className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
              item.isActive
                ? "bg-status-won/15 text-status-won"
                : "bg-muted text-muted-foreground",
            )}>
              {item.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">{item.description}</p>
          )}

          {/* Details */}
          <fieldset className="space-y-0">
            <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Details</legend>
            <div className="rounded-lg border border-border bg-surface/30 px-3 py-1">
              <DetailRow label="SKU" value={item.sku || "—"} mono />
              <DetailRow label="Unit of Measure" value={item.unitOfMeasure} />
            </div>
          </fieldset>

          {/* Pricing */}
          <fieldset className="space-y-2">
            <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Pricing</legend>
            <div className="grid grid-cols-3 gap-2">
              <PriceStat label="Your Cost" value={currency(item.cost)} />
              <PriceStat label="MSRP" value={currency(item.msrp)} />
              <PriceStat label="Margin" value={`${margin.toFixed(1)}%`} highlight={margin > 0} />
            </div>
          </fieldset>

          {/* Labor */}
          {item.hasLabor && (
            <fieldset className="space-y-2">
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Labor</legend>
              <div className="rounded-lg border border-border bg-surface/30 px-3 py-1">
                <DetailRow
                  label="Labor Hours"
                  value={item.laborHours != null ? `${item.laborHours} hr` : "—"}
                />
                <DetailRow
                  label="Rate Override"
                  value={item.laborRateOverride ? `${currency(item.laborRateOverride)}/hr` : "Default rate"}
                />
              </div>
            </fieldset>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button type="button" onClick={onClose}
            className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] hover:bg-accent transition-colors">
            Close
          </button>
          <button type="button" onClick={onSwitchToEdit}
            className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Pencil className="h-3 w-3" />
            Edit Item
          </button>
        </div>
      </div>
    );
  }

  // ── Edit mode ────────────────────────────────────────────────────────────────

  function renderEditContent() {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

            {/* ── Basic Info ─────────────────────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Basic Info</legend>

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11.5px]">Name *</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Axis P3245-V Fixed Dome" className="h-8 text-[13px]" /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />

              <FormField control={form.control} name="manufacturerId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11.5px]">Manufacturer *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-8 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Select manufacturer…</option>
                      {manufacturers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                      <option value="__new__">+ Add new manufacturer…</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />

              {mfrId === "__new__" && (
                <FormField control={form.control} name="newManufacturerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">New Manufacturer Name *</FormLabel>
                    <FormControl><Input {...field} autoFocus placeholder="e.g. Hanwha Vision" className="h-8 text-[13px]" /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">SKU</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. AX-P3245-V" className="h-8 text-[13px]" /></FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">Category *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-8 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{categoryMeta[c].label}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11.5px]">Description</FormLabel>
                  <FormControl><Textarea {...field} rows={3} placeholder="Brief product description…" className="text-[13px] resize-none" /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />

              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-[12.5px] font-normal cursor-pointer mt-0!">Active</FormLabel>
                </FormItem>
              )} />
            </fieldset>

            {/* ── Pricing ──────────────────────────────────────────── */}
            <fieldset className="space-y-4">
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pricing</legend>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="cost" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">Your Cost *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">$</span>
                        <Input {...field} type="number" min="0" step="0.01" className="h-8 pl-5 text-[13px]" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="msrp" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11.5px]">MSRP / List Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">$</span>
                        <Input {...field} type="number" min="0" step="0.01" className="h-8 pl-5 text-[13px]" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="unitOfMeasure" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11.5px]">Unit of Measure *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ea" list="uom-suggestions" className="h-8 text-[13px] w-36" />
                  </FormControl>
                  <datalist id="uom-suggestions">
                    {UNIT_SUGGESTIONS.map((u) => <option key={u} value={u} />)}
                  </datalist>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </fieldset>

            {/* ── Product Image ─────────────────────────────────────── */}
            <fieldset className="space-y-3">
              <legend className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Product Image</legend>
              <div className="flex cursor-default items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface/50 px-6 py-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-foreground">Click to upload or drag & drop</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG up to 5MB</p>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground/60 italic">
                    Image storage will be enabled when Supabase is connected
                  </p>
                </div>
              </div>
            </fieldset>

            {/* ── Labor ──────────────────────────────────────────────── */}
            <fieldset className="space-y-3">
              <div className="flex items-center gap-2">
                <FormField control={form.control} name="hasLabor" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="hasLabor"
                      />
                    </FormControl>
                    <FormLabel htmlFor="hasLabor" className="text-[11.5px] font-medium cursor-pointer mt-0!">
                      Attach Labor
                    </FormLabel>
                  </FormItem>
                )} />
              </div>

              {hasLabor && (
                <div className="rounded-lg border border-border bg-surface/50 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="laborHours" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11.5px]">Labor Hours *</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" step="0.25" placeholder="e.g. 1.5" className="h-8 text-[13px]" />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="laborRateOverride" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11.5px]">Rate Override</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">$</span>
                            <Input {...field} type="number" min="0" step="1" placeholder="85" className="h-8 pl-5 text-[13px]" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )} />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Leave Rate Override blank to use the tenant default ($85/hr). When added to a quote, this item will generate a separate labor line below it.
                  </p>
                </div>
              )}
            </fieldset>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            <button type="button" onClick={onClose}
              className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="h-8 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              {item ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-120 flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-[15px] pr-8">
            {mode === "view" && item ? item.name : item ? "Edit Item" : "New Catalog Item"}
          </SheetTitle>
        </SheetHeader>

        {mode === "view" && item ? renderViewContent() : renderEditContent()}
      </SheetContent>
    </Sheet>
  );
}

// ─── ItemCard ─────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: CatalogItem;
  onView: () => void;
  onEdit: (e: React.MouseEvent) => void;
}

function ItemCard({ item, onView, onEdit }: ItemCardProps) {
  const CatIcon = categoryIcons[item.category];
  const colorCls = mfrColor(item.manufacturerId);

  return (
    <div
      onClick={onView}
      className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-150"
    >
      {/* Image area */}
      <div className={cn("relative flex items-center justify-center h-36 shrink-0", categoryCardBg[item.category])}>
        <CatIcon className={cn("h-14 w-14", categoryIconCls[item.category])} />

        {/* Manufacturer badge */}
        <div className={cn(
          "absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold tracking-tight",
          colorCls,
        )}>
          {item.manufacturerName.slice(0, 2).toUpperCase()}
        </div>

        {/* Inactive overlay */}
        {!item.isActive && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
              Inactive
            </span>
          </div>
        )}

        {/* Edit button — appears on hover */}
        <button
          type="button"
          onClick={onEdit}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 h-6 rounded-md bg-background/90 border border-border px-2 text-[11px] text-foreground shadow-sm transition-opacity"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-col p-3 gap-1.5 flex-1">
        <div className="flex items-center justify-between gap-1">
          {categoryChip(item.category)}
          {item.hasLabor && (
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-500/10 text-slate-500 dark:text-slate-400">
              + Labor
            </span>
          )}
        </div>

        <p className="text-[13px] font-semibold leading-snug line-clamp-2 mt-0.5">{item.name}</p>
        <p className="text-[11px] font-mono text-muted-foreground/70">{item.sku || "—"}</p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground truncate max-w-[55%]">{item.manufacturerName}</span>
          <span className="text-[13px] font-semibold tabular-nums">{currency(item.msrp)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ItemsTable (list view) ───────────────────────────────────────────────────

interface ItemsTableProps {
  items: CatalogItem[];
  onView: (item: CatalogItem) => void;
  onEdit: (item: CatalogItem) => void;
}

function ItemsTable({ items, onView, onEdit }: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <ImagePlus className="h-8 w-8 text-muted-foreground/25 mb-3" />
        <p className="text-[13px] font-medium">No items</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Add items to populate this view.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead className="border-b border-border bg-surface/50">
          <tr>
            <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2 px-3">Name</th>
            <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Manufacturer</th>
            <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">SKU</th>
            <th className="text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Category</th>
            <th className="text-right text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Cost</th>
            <th className="text-right text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">MSRP</th>
            <th className="text-right text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Labor hrs</th>
            <th className="text-center text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">UoM</th>
            <th className="text-center text-[10px] uppercase tracking-wide text-muted-foreground font-medium py-2">Status</th>
            <th className="py-2 pr-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onView(item)}
              className="group border-b border-border/60 last:border-0 hover:bg-surface/40 transition-colors cursor-pointer"
            >
              <td className="py-2.5 px-3">
                <p className="font-medium leading-snug">{item.name}</p>
                {item.description && (
                  <p className="text-[10.5px] text-muted-foreground truncate max-w-55">{item.description}</p>
                )}
              </td>
              <td className="py-2.5 text-muted-foreground whitespace-nowrap">{item.manufacturerName}</td>
              <td className="py-2.5 font-mono text-[11px] text-muted-foreground">{item.sku || "—"}</td>
              <td className="py-2.5">{categoryChip(item.category)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums text-muted-foreground">{currency(item.cost)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums">{currency(item.msrp)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                {item.hasLabor && item.laborHours != null ? item.laborHours : "—"}
              </td>
              <td className="py-2.5 text-center text-muted-foreground">{item.unitOfMeasure}</td>
              <td className="py-2.5 text-center">
                <span className={cn(
                  "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                  item.isActive
                    ? "bg-status-won/15 text-status-won"
                    : "bg-muted text-muted-foreground",
                )}>
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-2.5 pr-3 text-right">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded border border-border bg-surface px-2 h-6 text-[11px] text-muted-foreground hover:text-foreground transition-all"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CatalogPage ──────────────────────────────────────────────────────────────

function CatalogPage() {
  const { setMeta } = useMeta();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(INITIAL_MANUFACTURERS);
  const [items, setItems] = useState<CatalogItem[]>(INITIAL_ITEMS);

  const [view, setView]               = useState<"grid" | "list">("grid");
  const [search, setSearch]           = useState("");
  const [activeCat, setActiveCat]     = useState<Category | "all">("all");
  const [mfrFilter, setMfrFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<CatalogItem | null>(null);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");

  const openNew = useCallback(() => {
    setDrawerItem(null);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    setMeta({
      title: "Catalog",
      subtitle: "Products & Services",
      newLabel: "New Item",
      onNew: openNew,
    });
  }, [setMeta, openNew]);

  function handleSave(saved: CatalogItem, newMfr: Manufacturer | null) {
    if (newMfr) setManufacturers((prev) => [...prev, newMfr]);
    setItems((prev) =>
      prev.some((i) => i.id === saved.id)
        ? prev.map((i) => (i.id === saved.id ? saved : i))
        : [...prev, saved],
    );
    setDrawerOpen(false);
  }

  // Counts per category (for pills)
  const countByCat = useMemo(() => {
    const map: Record<string, number> = { all: 0 };
    for (const item of items) {
      if (item.isActive || statusFilter !== "active") {
        map[item.category] = (map[item.category] ?? 0) + 1;
        map.all = (map.all ?? 0) + 1;
      }
    }
    return map;
  }, [items, statusFilter]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeCat !== "all")           result = result.filter((i) => i.category === activeCat);
    if (mfrFilter !== "all")           result = result.filter((i) => i.manufacturerId === mfrFilter);
    if (statusFilter === "active")     result = result.filter((i) => i.isActive);
    if (statusFilter === "inactive")   result = result.filter((i) => !i.isActive);
    const q = search.toLowerCase().trim();
    if (q) result = result.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q),
    );
    return result;
  }, [items, activeCat, mfrFilter, statusFilter, search]);

  function openView(item: CatalogItem) {
    setDrawerItem(item);
    setDrawerMode("view");
    setDrawerOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setDrawerItem(item);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">

      {/* ── Filter bar ───────────────────────────────────────────── */}
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search items, SKUs…" />

        <FilterSelect value={mfrFilter} onChange={setMfrFilter}>
          <option value="all">All Manufacturers</option>
          {manufacturers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={statusFilter} onChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>

        <span className="ml-auto text-[11.5px] text-muted-foreground">
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
        </span>

        <div className="flex items-center rounded-md border border-border overflow-hidden">
          {(["grid", "list"] as const).map((v, i) => {
            const Icon = v === "grid" ? LayoutGrid : List;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "flex h-7 w-8 items-center justify-center transition-colors",
                  i > 0 && "border-l border-border",
                  view === v ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground",
                )}
                aria-label={v === "grid" ? "Grid view" : "List view"}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </FilterBar>

      {/* ── Category pills ───────────────────────────────────────── */}
      {view === "grid" && (
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveCat("all")}
            className={cn(
              "flex items-center gap-1.5 h-7 rounded-full px-3 text-[12px] font-medium whitespace-nowrap transition-colors",
              activeCat === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20",
            )}
          >
            All
            <span className={cn(
              "text-[10px] tabular-nums",
              activeCat === "all" ? "text-primary-foreground/70" : "text-muted-foreground/70",
            )}>
              {items.length}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat];
            const count = items.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "flex items-center gap-1.5 h-7 rounded-full px-3 text-[12px] font-medium whitespace-nowrap transition-colors",
                  activeCat === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20",
                )}
              >
                <Icon className="h-3 w-3" />
                {categoryMeta[cat].label}
                <span className={cn(
                  "text-[10px] tabular-nums",
                  activeCat === cat ? "text-primary-foreground/70" : "text-muted-foreground/70",
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Card grid */}
        {view === "grid" && (
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onView={() => openView(item)}
                  onEdit={(e) => { e.stopPropagation(); openEdit(item); }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <ImagePlus className="h-8 w-8 text-muted-foreground/25 mb-3" />
              <p className="text-[13px] font-medium">No items found</p>
              <p className="mt-1 text-[12px] text-muted-foreground">Try adjusting your filters or add a new item.</p>
            </div>
          )
        )}

        {/* List view */}
        {view === "list" && (
          <ItemsTable
            items={filteredItems}
            onView={openView}
            onEdit={openEdit}
          />
        )}
      </div>

      <ItemDrawer
        open={drawerOpen}
        item={drawerItem}
        mode={drawerMode}
        manufacturers={manufacturers}
        onClose={() => setDrawerOpen(false)}
        onSwitchToEdit={() => setDrawerMode("edit")}
        onSave={handleSave}
      />
    </div>
  );
}

export default CatalogPage;

/*
  SCHEMA NOTES — catalog_items table
  id, tenant_id, manufacturer_id, name, sku, category, description,
  cost, msrp, unit_of_measure, has_labor, labor_hours, labor_rate_override,
  image_url, is_active, created_at, updated_at

  manufacturers table
  id, tenant_id, name, logo_url, created_at
*/
