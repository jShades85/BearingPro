import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMeta } from "@/contexts/PageMetaContext";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/settings/job-priorities")({
  component: JobPrioritiesPage,
});

function JobPrioritiesPage() {
  const { setMeta } = useMeta();
  useEffect(() => { setMeta({ title: "Job Priorities", subtitle: "Settings" }); }, [setMeta]);
  return <SettingsStub icon={AlertTriangle} title="Job Priorities" description="Configure priority levels and response time targets for jobs and service tickets." />;
}

function SettingsStub({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[13px] font-medium">{title}</p>
        <p className="mt-1 max-w-xs text-[12px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">Coming soon</span>
    </div>
  );
}
