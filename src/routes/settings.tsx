import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle, Boxes, Building2, CalendarClock, ClipboardList,
  Clock, FileText, Kanban, Lock, MapPin, Megaphone, Palette,
  Percent, Puzzle, Ruler, ShieldCheck, SlidersHorizontal, Tag, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · BearingPro" }] }),
  component: SettingsShell,
});

// ─── Sub-nav ──────────────────────────────────────────────────────────────────

const sections = [
  {
    title: "Company",
    items: [
      { to: "/settings/company",        label: "Company Profile", icon: Building2 },
      { to: "/settings/business-hours", label: "Business Hours",  icon: Clock     },
    ],
  },
  {
    title: "Team",
    items: [
      { to: "/settings/team-members", label: "Team Members", icon: Users       },
      { to: "/settings/roles",        label: "Roles",        icon: ShieldCheck },
    ],
  },
  {
    title: "Sales",
    items: [
      { to: "/settings/pipeline-stages", label: "Pipeline Stages", icon: Kanban           },
      { to: "/settings/lead-sources",    label: "Lead Sources",    icon: Megaphone        },
      { to: "/settings/quote-defaults",  label: "Quote Defaults",  icon: SlidersHorizontal },
      { to: "/settings/quote-templates", label: "Quote Templates", icon: FileText         },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/settings/work-order-types", label: "Work Order Types", icon: ClipboardList },
      { to: "/settings/job-priorities",   label: "Job Priorities",   icon: AlertTriangle },
      { to: "/settings/custom-statuses",  label: "Custom Statuses",  icon: Tag           },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/settings/tax-rates",        label: "Tax Rates",        icon: Percent      },
      { to: "/settings/payment-terms",    label: "Payment Terms",    icon: CalendarClock },
      { to: "/settings/invoice-branding", label: "Invoice Branding", icon: Palette      },
    ],
  },
  {
    title: "Inventory",
    items: [
      { to: "/settings/units-of-measure", label: "Units of Measure", icon: Ruler  },
      { to: "/settings/item-categories",  label: "Item Categories",  icon: Boxes  },
      { to: "/settings/location-types",   label: "Location Types",   icon: MapPin },
    ],
  },
  {
    title: "Integrations",
    items: [
      { to: "/settings/integrations", label: "Integrations", icon: Puzzle },
    ],
  },
  {
    title: "Security",
    items: [
      { to: "/settings/security", label: "Security", icon: Lock },
    ],
  },
];

// ─── Shell ────────────────────────────────────────────────────────────────────

function SettingsShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full">
      {/* Sub-nav */}
      <aside className="w-[200px] shrink-0 border-r border-border bg-surface/40 px-3 py-5">
        <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Settings
        </p>
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-1 px-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground/50">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex h-7 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
