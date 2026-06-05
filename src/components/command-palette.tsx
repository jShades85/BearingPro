import { useNavigate } from "@tanstack/react-router";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Target, FileText, Users, Building2, Briefcase, CalendarDays, Package, Receipt, Plus,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/deals", label: "Deals pipeline", icon: Target },
  { to: "/quotes", label: "Quotes", icon: FileText },
  { to: "/catalog", label: "Product catalog", icon: Package },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/dispatch", label: "Dispatch", icon: CalendarDays },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/invoices", label: "Invoices", icon: Receipt },
];

const actions = [
  { label: "Create new deal", icon: Plus },
  { label: "New quote", icon: Plus },
  { label: "Create work order", icon: Plus },
  { label: "Add contact", icon: Plus },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Search deals, contacts, projects, SKUs…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {nav.map((n) => (
              <CommandItem
                key={n.to}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: n.to });
                }}
              >
                <n.icon className="mr-2 h-3.5 w-3.5" />
                {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick actions">
            {actions.map((a) => (
              <CommandItem key={a.label} onSelect={() => onOpenChange(false)}>
                <a.icon className="mr-2 h-3.5 w-3.5" />
                {a.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
