import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/integrations")({
  component: IntegrationsPage,
});

// ─── Integration data ─────────────────────────────────────────────────────────

type IntegrationStatus = "connected" | "available" | "coming_soon";

type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  logo: string;
  docsUrl?: string;
};

type IntegrationGroup = {
  title: string;
  description: string;
  items: Integration[];
};

const GROUPS: IntegrationGroup[] = [
  {
    title: "Payment Processing",
    description: "Accept payments from clients and track collections.",
    items: [
      {
        id: "stripe",
        name: "Stripe",
        description: "Card payments, ACH transfers, and payment links for remote clients.",
        status: "available",
        logo: "S",
        docsUrl: "https://stripe.com",
      },
    ],
  },
  {
    title: "Accounting",
    description: "Sync invoices, payments, and expenses with your accounting software.",
    items: [
      {
        id: "quickbooks",
        name: "QuickBooks Online",
        description: "Two-way sync of invoices, payments, customers, and chart of accounts.",
        status: "coming_soon",
        logo: "QB",
      },
      {
        id: "xero",
        name: "Xero",
        description: "Sync invoices and contacts with Xero for automated bookkeeping.",
        status: "coming_soon",
        logo: "X",
      },
    ],
  },
  {
    title: "Communication",
    description: "Send automated emails and SMS to clients and your team.",
    items: [
      {
        id: "resend",
        name: "Resend",
        description: "Transactional email for invoices, quotes, appointment reminders, and more.",
        status: "available",
        logo: "R",
      },
      {
        id: "twilio",
        name: "Twilio SMS",
        description: "Text reminders for appointments, job updates, and payment follow-ups.",
        status: "coming_soon",
        logo: "T",
      },
    ],
  },
  {
    title: "Field Operations",
    description: "Tools for technicians and project managers in the field.",
    items: [
      {
        id: "google-maps",
        name: "Google Maps",
        description: "Address autocomplete, routing, and job site mapping.",
        status: "coming_soon",
        logo: "G",
      },
      {
        id: "waze",
        name: "Waze",
        description: "One-tap navigation from job details to any site address.",
        status: "coming_soon",
        logo: "W",
      },
    ],
  },
  {
    title: "Calendars & Scheduling",
    description: "Sync scheduled jobs with external calendars.",
    items: [
      {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Push scheduled jobs and appointments to team members' Google calendars.",
        status: "coming_soon",
        logo: "GC",
      },
      {
        id: "outlook",
        name: "Microsoft Outlook",
        description: "Sync jobs with Outlook / Microsoft 365 calendars.",
        status: "coming_soon",
        logo: "OL",
      },
    ],
  },
  {
    title: "File Storage",
    description: "Attach project documents, photos, and contracts from cloud storage.",
    items: [
      {
        id: "google-drive",
        name: "Google Drive",
        description: "Attach Drive files to projects, quotes, and service tickets.",
        status: "coming_soon",
        logo: "GD",
      },
      {
        id: "dropbox",
        name: "Dropbox",
        description: "Link Dropbox folders to jobs for shared document access.",
        status: "coming_soon",
        logo: "DB",
      },
    ],
  },
  {
    title: "Automation",
    description: "Connect BearingPro to thousands of other tools via automation platforms.",
    items: [
      {
        id: "zapier",
        name: "Zapier",
        description: "Trigger workflows in 6,000+ apps based on BearingPro events.",
        status: "coming_soon",
        logo: "Z",
      },
      {
        id: "webhooks",
        name: "Webhooks",
        description: "Push real-time event data to any custom endpoint or internal service.",
        status: "coming_soon",
        logo: "{}",
      },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function IntegrationsPage() {
  const { setMeta } = useMeta();
  useEffect(() => { setMeta({ title: "Integrations", subtitle: "Settings" }); }, [setMeta]);

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[15px] font-semibold">Integrations</h1>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          Connect BearingPro to the tools your business already uses.
        </p>
      </div>

      <div className="space-y-10">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-4">
              <h2 className="text-[13px] font-semibold">{group.title}</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => (
                <IntegrationCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function IntegrationCard({ item }: { item: Integration }) {
  const isConnected = item.status === "connected";
  const isComingSoon = item.status === "coming_soon";

  return (
    <div className={cn(
      "flex flex-col rounded-lg border border-border bg-card p-4 transition-colors",
      isComingSoon && "opacity-60",
    )}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-foreground shrink-0">
          {item.logo}
        </div>
        {isConnected && (
          <span className="flex items-center gap-1 rounded bg-green-500/15 px-2 py-0.5 text-[10.5px] font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        )}
        {isComingSoon && (
          <span className="rounded bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>

      <div className="flex-1">
        <p className="text-[13px] font-medium leading-snug">{item.name}</p>
        <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">{item.description}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isConnected ? (
          <button className="h-7 rounded-md border border-border px-3 text-[11.5px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            Configure
          </button>
        ) : isComingSoon ? null : (
          <button className="h-7 rounded-md bg-primary px-3 text-[11.5px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Connect
          </button>
        )}
        {item.docsUrl && (
          <a
            href={item.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
