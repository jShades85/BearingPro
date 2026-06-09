import { useNavigate } from "@tanstack/react-router";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Inbox, Target, FileText, Users, Building2, Briefcase,
  CalendarDays, Package, Receipt, HardHat, Boxes, Truck, CreditCard,
  BarChart2, Plus, ClipboardList, Headphones, ShieldCheck, ShoppingCart,
  GanttChart, Layers, Puzzle, Settings,
} from "lucide-react";
import { COMPANIES } from "@/data/companies";
import { PROJECTS } from "@/data/projects";
import { contacts } from "@/lib/demo-data";

// ─── Nav entries ──────────────────────────────────────────────────────────────

const NAV = [
  { to: "/",                            label: "Dashboard",        icon: LayoutDashboard, group: "General"    },
  { to: "/inbox",                       label: "Inbox",            icon: Inbox,           group: "General"    },
  { to: "/crm/contacts",               label: "Contacts",         icon: Users,           group: "CRM"        },
  { to: "/crm/companies",              label: "Companies",        icon: Building2,        group: "CRM"        },
  { to: "/crm/lead-inbox",             label: "Lead Inbox",       icon: Inbox,           group: "CRM"        },
  { to: "/sales/opportunities",        label: "Opportunities",    icon: Target,           group: "Sales"      },
  { to: "/sales/quotes",               label: "Quotes & Estimates", icon: FileText,       group: "Sales"      },
  { to: "/operations/projects",        label: "Projects",         icon: Briefcase,        group: "Operations" },
  { to: "/operations/work-orders",     label: "Work Orders",      icon: ClipboardList,    group: "Operations" },
  { to: "/operations/planner",         label: "Planner",          icon: GanttChart,       group: "Operations" },
  { to: "/operations/scheduling",      label: "Scheduling",       icon: CalendarDays,     group: "Operations" },
  { to: "/operations/team",            label: "Team",             icon: HardHat,          group: "Operations" },
  { to: "/service/service-tickets",    label: "Service Tickets",  icon: Headphones,       group: "Service"    },
  { to: "/service/service-plans",      label: "Service Plans",    icon: ShieldCheck,      group: "Service"    },
  { to: "/inventory/catalog",          label: "Catalog",          icon: Package,          group: "Inventory"  },
  { to: "/inventory/stock",            label: "Stock",            icon: Boxes,            group: "Inventory"  },
  { to: "/inventory/purchase-orders",  label: "Purchase Orders",  icon: ShoppingCart,     group: "Inventory"  },
  { to: "/inventory/vendors",          label: "Vendors",          icon: Truck,            group: "Inventory"  },
  { to: "/finance/invoices",           label: "Invoices",         icon: Receipt,          group: "Finance"    },
  { to: "/finance/payments",           label: "Payments",         icon: CreditCard,       group: "Finance"    },
  { to: "/reports",                    label: "Reports",          icon: BarChart2,        group: "Reports"    },
  { to: "/settings/company",           label: "Company Profile",  icon: Settings,         group: "Settings"   },
  { to: "/settings/service-plan-tiers", label: "Service Plan Tiers", icon: Layers,        group: "Settings"   },
  { to: "/settings/quote-templates",   label: "Quote Templates",  icon: FileText,         group: "Settings"   },
  { to: "/settings/integrations",      label: "Integrations",     icon: Puzzle,           group: "Settings"   },
];

// ─── Quick actions ────────────────────────────────────────────────────────────

const ACTIONS: { label: string; to: string; icon: typeof Plus }[] = [
  { label: "New Lead",           to: "/crm/lead-inbox",          icon: Plus },
  { label: "New Opportunity",    to: "/sales/opportunities",     icon: Plus },
  { label: "New Quote",          to: "/sales/quotes",            icon: Plus },
  { label: "New Project",        to: "/operations/projects",     icon: Plus },
  { label: "New Work Order",     to: "/operations/work-orders",  icon: Plus },
  { label: "New Service Ticket", to: "/service/service-tickets", icon: Plus },
  { label: "New Invoice",        to: "/finance/invoices",        icon: Plus },
  { label: "New Purchase Order", to: "/inventory/purchase-orders", icon: Plus },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Search pages, companies, projects, contacts…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="Navigate">
            {NAV.map((n) => (
              <CommandItem key={n.to} value={`${n.label} ${n.group}`} onSelect={() => go(n.to)}>
                <n.icon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>{n.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{n.group}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Quick actions */}
          <CommandGroup heading="Quick actions">
            {ACTIONS.map((a) => (
              <CommandItem key={a.label} value={a.label} onSelect={() => go(a.to)}>
                <a.icon className="mr-2 h-3.5 w-3.5 text-primary" />
                {a.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Companies */}
          <CommandGroup heading="Companies">
            {COMPANIES.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.name} ${c.industry}`}
                onSelect={() => go(`/crm/companies/${c.id}`)}
              >
                <Building2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>{c.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{c.industry}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Projects */}
          <CommandGroup heading="Projects">
            {PROJECTS.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.code} ${p.customer}`}
                onSelect={() => go(`/operations/projects/${p.id}`)}
              >
                <Briefcase className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>{p.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{p.code}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Contacts */}
          <CommandGroup heading="Contacts">
            {contacts.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.name} ${c.company ?? ""} ${c.title ?? ""}`}
                onSelect={() => go("/crm/contacts")}
              >
                <Users className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>{c.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{c.company}</span>
              </CommandItem>
            ))}
          </CommandGroup>

        </CommandList>
      </Command>
    </CommandDialog>
  );
}
