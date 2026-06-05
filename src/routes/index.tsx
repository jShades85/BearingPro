import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { deals, currency, ownerNames, stages } from "@/lib/demo-data";
import { PageHeader, StatCard, Sparkline, StageChip, Avatar, PriorityDot } from "@/components/ui-bits";
import { ArrowUpRight, TrendingUp, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard · Crosscurrent" }] }),
  component: Dashboard,
});

function Dashboard() {
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipeline = open.reduce((s, d) => s + d.value, 0);
  const weighted = open.reduce((s, d) => s + (d.value * d.probability) / 100, 0);
  const won = deals.filter((d) => d.stage === "won").reduce((s, d) => s + d.value, 0);

  const byStage = stages.map((s) => ({
    ...s,
    count: deals.filter((d) => d.stage === s.id).length,
    value: deals.filter((d) => d.stage === s.id).reduce((sum, d) => sum + d.value, 0),
  }));

  return (
    <div>
      <PageHeader
        title="Workspace overview"
        subtitle="Q2 · Crosscurrent AV · Updated just now"
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Pipeline value" value={currency(pipeline)} delta="+12.4%" accent="up" />
          <StatCard label="Weighted forecast" value={currency(weighted)} delta="+5.1%" accent="up" />
          <StatCard label="Closed won (MTD)" value={currency(won)} delta="+18.7%" accent="up" />
          <StatCard label="Avg. days to close" value="34" delta="−4d" accent="up" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-[13px] font-medium">Pipeline by stage</div>
                <div className="text-[11.5px] text-muted-foreground">Open deals across the funnel</div>
              </div>
              <Link to="/deals" className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground">
                Open board <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4 space-y-2.5">
              {byStage.map((s) => {
                const max = Math.max(...byStage.map((x) => x.value));
                const w = max > 0 ? (s.value / max) * 100 : 0;
                return (
                  <div key={s.id} className="flex items-center gap-3 text-[12px]">
                    <div className="w-20 shrink-0 text-muted-foreground">{s.label}</div>
                    <div className="flex-1 h-6 rounded bg-muted overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-primary/70 to-chart-2/70"
                        style={{ width: `${w}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-2 justify-between">
                        <span className="font-mono text-[10.5px]">{s.count} deals</span>
                        <span className="font-mono text-[10.5px] tabular-nums">{currency(s.value)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <div className="text-[13px] font-medium">Bookings trend</div>
              <div className="text-[11.5px] text-muted-foreground">Last 12 weeks</div>
            </div>
            <div className="p-4">
              <div className="text-[26px] font-semibold tracking-tight">{currency(won + 142000)}</div>
              <div className="text-[11px] text-status-won flex items-center gap-1"><TrendingUp className="h-3 w-3" /> 22.4% vs prior</div>
              <div className="mt-4 text-primary">
                <Sparkline data={[8, 12, 9, 14, 11, 18, 16, 22, 19, 26, 28, 32]} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <div className="text-muted-foreground">Win rate</div>
                  <div className="text-foreground font-medium text-[14px]">38%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Avg deal size</div>
                  <div className="text-foreground font-medium text-[14px]">$94k</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-[13px] font-medium">Deals moving this week</div>
              <Link to="/deals" className="text-[11.5px] text-muted-foreground hover:text-foreground">View all</Link>
            </div>
            <ul className="divide-y divide-border">
              {open.slice(0, 6).map((d) => (
                <li key={d.id} className="row-hover flex items-center gap-3 px-4 py-2.5 text-[12.5px]">
                  <span className="font-mono text-[10.5px] text-muted-foreground w-14 shrink-0">{d.id}</span>
                  <PriorityDot p={d.priority} />
                  <span className="flex-1 truncate font-medium">{d.title}</span>
                  <span className="hidden md:inline text-muted-foreground truncate max-w-[180px]">{d.company}</span>
                  <StageChip stage={d.stage} />
                  <span className="font-mono tabular-nums text-[11.5px] w-20 text-right">{currency(d.value)}</span>
                  <Avatar initials={d.owner} />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="text-[13px] font-medium">Inbox & alerts</div>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">12 new</span>
            </div>
            <ul className="divide-y divide-border text-[12px]">
              {[
                { icon: AlertCircle, color: "text-priority-urgent", title: "Helio surgical quote expires in 3d", time: "5m" },
                { icon: Clock, color: "text-priority-high", title: "Vertex 14F awaiting client signature", time: "2h" },
                { icon: TrendingUp, color: "text-status-won", title: "Northbeam penthouse — viewed 4×", time: "3h" },
                { icon: AlertCircle, color: "text-priority-med", title: "Inventory low: Crestron MX-150 (8)", time: "1d" },
                { icon: Clock, color: "text-muted-foreground", title: "Halcyon district — RFP due Sep 30", time: "2d" },
              ].map((n, i) => (
                <li key={i} className="row-hover flex items-start gap-2.5 px-4 py-2.5">
                  <n.icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${n.color}`} />
                  <span className="flex-1">{n.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{n.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="text-[13px] font-medium">Team performance</div>
            <span className="text-[11px] text-muted-foreground">This quarter</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-border">
            {Object.entries(ownerNames).map(([id, name]) => {
              const owned = deals.filter((d) => d.owner === id);
              const value = owned.reduce((s, d) => s + d.value, 0);
              return (
                <div key={id} className="p-4">
                  <div className="flex items-center gap-2">
                    <Avatar initials={id} />
                    <div className="text-[12px] font-medium truncate">{name.split(" ")[0]}</div>
                  </div>
                  <div className="mt-2 text-[16px] font-semibold tabular-nums">{currency(value)}</div>
                  <div className="text-[10.5px] text-muted-foreground">{owned.length} deals</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
