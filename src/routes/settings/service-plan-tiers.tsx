import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/service-plan-tiers")({
  component: ServicePlanTiersPage,
});

// ─── Types & demo state ───────────────────────────────────────────────────────

type Tier = {
  id: string;
  name: string;
  color: string;
  responseTime: string;
  visitsPerYear: string;
  coveredSystems: string[];
  extras: string[];
};

const SYSTEM_OPTIONS = [
  "Access Control", "Intrusion / Alarm", "CCTV / Cameras", "Video Surveillance",
  "Audio / Visual", "Network / IT", "Intercom", "Fire Alarm", "Lighting Control",
  "Gate / Entry", "Nurse Call", "PA System",
];

const INITIAL_TIERS: Tier[] = [
  {
    id: "essential",
    name: "Essential",
    color: "border-l-slate-400",
    responseTime: "72 hours",
    visitsPerYear: "1",
    coveredSystems: ["Intrusion / Alarm"],
    extras: [],
  },
  {
    id: "standard",
    name: "Standard",
    color: "border-l-blue-500",
    responseTime: "48 hours",
    visitsPerYear: "2",
    coveredSystems: ["Intrusion / Alarm", "Access Control"],
    extras: ["Priority scheduling"],
  },
  {
    id: "professional",
    name: "Professional",
    color: "border-l-purple-500",
    responseTime: "24 hours",
    visitsPerYear: "4",
    coveredSystems: ["Intrusion / Alarm", "Access Control", "CCTV / Cameras"],
    extras: ["Priority scheduling", "Remote monitoring", "Free parts on covered repairs"],
  },
  {
    id: "elite",
    name: "Elite",
    color: "border-l-amber-500",
    responseTime: "4 hours",
    visitsPerYear: "12",
    coveredSystems: ["Intrusion / Alarm", "Access Control", "CCTV / Cameras", "Audio / Visual", "Network / IT"],
    extras: ["Priority scheduling", "Remote monitoring", "Free parts on covered repairs", "Dedicated account manager", "After-hours emergency support"],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function ServicePlanTiersPage() {
  const { setMeta } = useMeta();
  useEffect(() => { setMeta({ title: "Service Plan Tiers", subtitle: "Settings" }); }, [setMeta]);

  const [tiers, setTiers] = useState<Tier[]>(INITIAL_TIERS);
  const [saved, setSaved] = useState(false);

  const updateTier = (id: string, patch: Partial<Tier>) => {
    setSaved(false);
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const toggleSystem = (tierId: string, system: string) => {
    const tier = tiers.find((t) => t.id === tierId)!;
    const next = tier.coveredSystems.includes(system)
      ? tier.coveredSystems.filter((s) => s !== system)
      : [...tier.coveredSystems, system];
    updateTier(tierId, { coveredSystems: next });
  };

  const addExtra = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId)!;
    updateTier(tierId, { extras: [...tier.extras, ""] });
  };

  const updateExtra = (tierId: string, idx: number, val: string) => {
    const tier = tiers.find((t) => t.id === tierId)!;
    const next = [...tier.extras];
    next[idx] = val;
    updateTier(tierId, { extras: next });
  };

  const removeExtra = (tierId: string, idx: number) => {
    const tier = tiers.find((t) => t.id === tierId)!;
    updateTier(tierId, { extras: tier.extras.filter((_, i) => i !== idx) });
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-2">
        <h1 className="text-[15px] font-semibold">Service Plan Tiers</h1>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          Define what's included at each tier. These definitions are used on Service Plans and client-facing proposals.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {tiers.map((tier) => (
          <div key={tier.id} className={cn("rounded-lg border border-border bg-card border-l-4 p-5", tier.color)}>

            {/* Tier name */}
            <input
              value={tier.name}
              onChange={(e) => updateTier(tier.id, { name: e.target.value })}
              className="mb-4 w-full bg-transparent text-[14px] font-semibold text-foreground focus:outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors pb-0.5"
            />

            {/* Response time + visits */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Response Time SLA</label>
                <input
                  value={tier.responseTime}
                  onChange={(e) => updateTier(tier.id, { responseTime: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. 24 hours"
                />
              </div>
              <div>
                <label className={labelCls}>Visits / Year</label>
                <input
                  value={tier.visitsPerYear}
                  onChange={(e) => updateTier(tier.id, { visitsPerYear: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. 4"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            {/* Covered systems */}
            <div className="mb-4">
              <label className={labelCls}>Covered Systems</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SYSTEM_OPTIONS.map((sys) => {
                  const active = tier.coveredSystems.includes(sys);
                  return (
                    <button
                      key={sys}
                      type="button"
                      onClick={() => toggleSystem(tier.id, sys)}
                      className={cn(
                        "rounded px-2 py-1 text-[11px] font-medium transition-colors",
                        active
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground border border-transparent hover:border-border hover:text-foreground",
                      )}
                    >
                      {sys}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extras */}
            <div>
              <label className={labelCls}>Extras & Perks</label>
              <div className="mt-1.5 space-y-1.5">
                {tier.extras.map((extra, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={extra}
                      onChange={(e) => updateExtra(tier.id, i, e.target.value)}
                      placeholder="e.g. Priority scheduling"
                      className={`${inputCls} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => removeExtra(tier.id, i)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addExtra(tier.id)}
                  className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add extra
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Save bar */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
        {saved && <span className="text-[12px] text-green-600 dark:text-green-400">Changes saved</span>}
        <button
          onClick={() => setSaved(true)}
          className="h-8 rounded-md bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

const inputCls = "h-8 w-full rounded-md border border-border bg-surface px-2.5 text-[12.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
const labelCls = "block text-[10.5px] uppercase tracking-wider text-muted-foreground font-medium mb-1";
