import * as React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Standard header for every drawer (Sheet). Keeps padding, title size, and —
// critically — the action cluster aligned with the absolutely-positioned close
// (X) button in the top-right corner. The header reserves the X's corner with
// pr-12 and top-aligns its actions (items-start) so Edit + X read as one row
// instead of sitting at different heights.

interface DrawerHeaderProps {
  /** Optional leading visual — an avatar or icon node. */
  leading?: React.ReactNode;
  /** Main title — rendered as the accessible SheetTitle. */
  title: React.ReactNode;
  /** Optional subtitle line under the title. */
  subtitle?: React.ReactNode;
  /** When provided, renders the canonical Edit button in the action cluster. */
  onEdit?: () => void;
  /** Label for the built-in Edit button (default "Edit"). */
  editLabel?: string;
  /** Extra action nodes (status dropdowns, secondary buttons) — placed left of Edit. */
  actions?: React.ReactNode;
  /** Content rendered below the title row (badges, tags, status chips). */
  children?: React.ReactNode;
  className?: string;
}

export function DrawerHeader({
  leading,
  title,
  subtitle,
  onEdit,
  editLabel = "Edit",
  actions,
  children,
  className,
}: DrawerHeaderProps) {
  const hasActions = actions || onEdit;
  return (
    <SheetHeader className={cn("shrink-0 space-y-2 border-b border-border px-5 py-4 pr-12", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {leading}
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-md font-semibold leading-tight truncate">{title}</SheetTitle>
            {subtitle ? <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {hasActions ? (
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Pencil className="h-3 w-3" /> {editLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {children}
    </SheetHeader>
  );
}
