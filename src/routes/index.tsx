import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart, Bar,
  AreaChart, Area,
  XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Briefcase, FileText, Target, Receipt } from "lucide-react";
import { PageHeader, StatCard, StageChip } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

type Stage = "lead" | "qualified" | "proposal" | "won" | "lost";
type ActivityIcon = typeof Briefcase;

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard · Port City Sound & Security" }] }),
  component: Dashboard,
});

const revenueData = [
  { month: "Jan", revenue: 98000 },
  { month: "Feb", revenue: 112000 },
  { month: "Mar", revenue: 124000 },
  { month: "Apr", revenue: 108000 },
  { month: "May", revenue: 131000 },
  { month: "Jun", revenue: 142800 },
];

const jobStatusData: { name: string; value: number; color: string }[] = [
  { name: "Active",    value: 24, color: "var(--color-status-won)" },
  { name: "Scheduled", value: 8,  color: "var(--color-status-qualified)" },
  { name: "On Hold",   value: 3,  color: "var(--color-status-proposal)" },
  { name: "Completed", value: 47, color: "var(--color-muted-foreground)" },
];

const activityItems: { icon: ActivityIcon; action: string; customer: string; time: string; color: string }[] = [
  { icon: Briefcase, action: "Job completed",   customer: "Port City Medical",    time: "2h ago",     color: "text-status-won" },
  { icon: Receipt,   action: "Invoice sent",     customer: "Harbor View Marina",   time: "3h ago",     color: "text-primary" },
  { icon: Target,    action: "New opportunity",  customer: "Coastal Law Group",    time: "5h ago",     color: "text-status-qualified" },
  { icon: FileText,  action: "Quote approved",   customer: "Riverside Estates",    time: "Yesterday",  color: "text-status-proposal" },
  { icon: Briefcase, action: "Job started",      customer: "Downtown Hotel Group", time: "Yesterday",  color: "text-status-qualified" },
  { icon: Receipt,   action: "Payment received", customer: "Port City Medical",    time: "2 days ago", color: "text-status-won" },
];

const opportunityItems: { title: string; customer: string; value: string; stage: Stage }[] = [
  { title: "Enterprise Security Overhaul", customer: "Port City Medical",    value: "$84,000", stage: "proposal" },
  { title: "Multi-Site AV Rollout",        customer: "Downtown Hotel Group", value: "$62,500", stage: "qualified" },
  { title: "Smart Home Package",           customer: "Riverside Estates",    value: "$28,000", stage: "proposal" },
  { title: "Office AV System",             customer: "Coastal Law Group",    value: "$18,200", stage: "lead" },
];

const CARD = "rounded-lg border border-border bg-card p-5";
const SECTION_TITLE = "text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground";

function RevenueTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-[12px] shadow-sm">
      <span className="font-medium">${payload[0].value.toLocaleString()}</span>
    </div>
  );
}

function Dashboard() {
  const [chartStyle, setChartStyle] = useState<"bar" | "area">("bar");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={today} />
      <div className="p-6 space-y-5">

        {/* Row 1 — KPI stat cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Revenue MTD"         value="$142,800" delta="+8.2%"  accent="up" />
          <StatCard label="Active Jobs"          value="24"       delta="+3"     accent="up" />
          <StatCard label="Open Pipeline"        value="$380,500" delta="+12.4%" accent="up" />
          <StatCard label="Outstanding Invoices" value="$47,200"  delta="-2"     accent="down" />
        </div>

        {/* Row 2 — Revenue trend + Job status */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Revenue trend */}
          <div className={cn(CARD, "lg:col-span-2")}>
            <div className="mb-4 flex items-center justify-between">
              <span className={SECTION_TITLE}>Revenue Trend</span>
              <div className="flex h-6 items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
                <button
                  onClick={() => setChartStyle("bar")}
                  className={cn(
                    "h-5 rounded px-2.5 text-[11px] transition-colors",
                    chartStyle === "bar"
                      ? "bg-elevated text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartStyle("area")}
                  className={cn(
                    "h-5 rounded px-2.5 text-[11px] transition-colors",
                    chartStyle === "area"
                      ? "bg-elevated text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Area
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              {chartStyle === "bar" ? (
                <BarChart data={revenueData} barCategoryGap="32%">
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: "var(--color-muted-foreground)", opacity: 0.08 }} />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="var(--color-primary)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#revGradient)"
                    dot={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Job status donut */}
          <div className={CARD}>
            <div className="mb-4">
              <span className={SECTION_TITLE}>Job Status</span>
            </div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={78}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {jobStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-bold leading-none tracking-tight">82</span>
                <span className="mt-1 text-[11px] text-muted-foreground">Total Jobs</span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {jobStatusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-[12px]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1 text-muted-foreground">{s.name}</span>
                  <span className="font-medium tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3 — Activity feed + Top opportunities */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Recent activity */}
          <div className={cn(CARD, "lg:col-span-2")}>
            <div className="mb-4">
              <span className={SECTION_TITLE}>Recent Activity</span>
            </div>
            <ul>
              {activityItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex items-start gap-3 py-2.5",
                      i < activityItems.length - 1 && "border-b border-border",
                    )}
                  >
                    <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted", item.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium">{item.action}</div>
                      <div className="text-[11px] text-muted-foreground">{item.customer} · {item.time}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Top opportunities */}
          <div className={CARD}>
            <div className="mb-4">
              <span className={SECTION_TITLE}>Top Opportunities</span>
            </div>
            <ul>
              {opportunityItems.map((opp, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start justify-between gap-3 py-2.5",
                    i < opportunityItems.length - 1 && "border-b border-border",
                  )}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium">{opp.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{opp.customer}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-[13px] font-semibold tabular-nums">{opp.value}</span>
                    <StageChip stage={opp.stage} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
