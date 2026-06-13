import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/settings/work-order-types")({
  component: WorkOrderTypesPage,
});

function WorkOrderTypesPage() {
  const { setMeta } = useMeta();
  useEffect(() => { setMeta({ title: "Work Order Types", subtitle: "Settings" }); }, [setMeta]);
  return <SettingsStub icon={ClipboardList} title="Work Order Types" description="Define job types — install, service call, maintenance, warranty — used across all work orders." />;
}

function SettingsStub({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-medium">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Coming soon</span>
    </div>
  );
}
