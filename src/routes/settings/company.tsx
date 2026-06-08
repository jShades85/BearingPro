import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { Building2, Clock, Globe, Mail, MapPin, Phone, Percent, FileText } from "lucide-react";

export const Route = createFileRoute("/settings/company")({
  component: CompanyProfilePage,
});

// ─── Demo state ───────────────────────────────────────────────────────────────

const TRADE_TYPES = [
  "AV / Security Systems",
  "Electrical",
  "HVAC",
  "Plumbing",
  "General Contracting",
  "Fire Protection",
  "IT / Low Voltage",
  "Solar",
  "Other",
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

const PAYMENT_TERMS = ["Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60"];

// ─── Page ─────────────────────────────────────────────────────────────────────

function CompanyProfilePage() {
  const { setMeta } = useMeta();
  useEffect(() => { setMeta({ title: "Company Profile", subtitle: "Settings" }); }, [setMeta]);

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "Port City Sound & Security",
    tagline: "AV & Security Systems",
    phone: "(910) 555-0182",
    email: "info@portcitysoundsecurity.com",
    website: "www.portcitysoundsecurity.com",
    address: "1204 Dock Street",
    city: "Wilmington",
    state: "NC",
    zip: "28401",
    tradeType: "AV / Security Systems",
    timezone: "America/New_York",
    taxRate: "7.00",
    paymentTerms: "Net 30",
  });

  const update = (k: keyof typeof form, v: string) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[15px] font-semibold">Company Profile</h1>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          Basic information about your business — shown on invoices, quotes, and client-facing documents.
        </p>
      </div>

      <div className="space-y-8">

        {/* Logo */}
        <Section title="Logo" icon={Building2}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted text-[10px] font-bold text-muted-foreground">
              PCSS
            </div>
            <div>
              <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                Upload logo
              </button>
              <p className="mt-1 text-[11px] text-muted-foreground">PNG or SVG, max 2 MB. Shown on invoices and quotes.</p>
            </div>
          </div>
        </Section>

        {/* Business info */}
        <Section title="Business Information" icon={Building2}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" className="col-span-2">
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tagline / Descriptor" className="col-span-2">
              <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputCls} placeholder="e.g. AV & Security Systems" />
            </Field>
            <Field label="Trade Type">
              <select value={form.tradeType} onChange={(e) => update("tradeType", e.target.value)} className={inputCls}>
                {TRADE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Timezone">
              <select value={form.timezone} onChange={(e) => update("timezone", e.target.value)} className={inputCls}>
                {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact" icon={Phone}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={`${inputCls} pl-8`} />
              </div>
            </Field>
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input value={form.email} onChange={(e) => update("email", e.target.value)} className={`${inputCls} pl-8`} type="email" />
              </div>
            </Field>
            <Field label="Website" className="col-span-2">
              <div className="relative">
                <Globe className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input value={form.website} onChange={(e) => update("website", e.target.value)} className={`${inputCls} pl-8`} />
              </div>
            </Field>
          </div>
        </Section>

        {/* Address */}
        <Section title="Address" icon={MapPin}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Street Address" className="col-span-2">
              <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="State">
                <input value={form.state} onChange={(e) => update("state", e.target.value)} className={inputCls} maxLength={2} />
              </Field>
              <Field label="ZIP">
                <input value={form.zip} onChange={(e) => update("zip", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Invoice defaults */}
        <Section title="Invoice Defaults" icon={FileText}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Default Payment Terms">
              <select value={form.paymentTerms} onChange={(e) => update("paymentTerms", e.target.value)} className={inputCls}>
                {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Default Tax Rate (%)">
              <div className="relative">
                <Percent className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input
                  value={form.taxRate}
                  onChange={(e) => update("taxRate", e.target.value)}
                  className={`${inputCls} pr-8`}
                  type="number"
                  step="0.25"
                  min="0"
                  max="20"
                />
              </div>
            </Field>
          </div>
        </Section>

      </div>

      {/* Save bar */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
        {saved && <span className="text-[12px] text-green-600 dark:text-green-400">Changes saved</span>}
        <button
          onClick={handleSave}
          className="h-8 rounded-md bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = "h-8 w-full rounded-md border border-border bg-surface px-2.5 text-[12.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Building2; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-[13px] font-semibold">{title}</h2>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[10.5px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
