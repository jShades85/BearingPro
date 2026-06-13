import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { Kanban } from "lucide-react";

export const Route = createFileRoute("/settings/pipeline-stages")({
  component: PipelineStagesPage,
});

function PipelineStagesPage() {
  const { setMeta } = useMeta();
  useEffect(() => { setMeta({ title: "Pipeline Stages", subtitle: "Settings" }); }, [setMeta]);
  return <SettingsStub icon={Kanban} title="Pipeline Stages" description="Define the stages leads move through from first contact to closed deal." />;
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
