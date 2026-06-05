import { createFileRoute } from "@tanstack/react-router";
import { catalog, currency } from "@/lib/demo-data";
import { PageHeader, Tab } from "@/components/ui-bits";
import { Filter, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/catalog")({
  head: () => ({ meta: [{ title: "Catalog · Crosscurrent" }] }),
  component: CatalogPage,
});

function CatalogPage() {
  const categories = Array.from(new Set(catalog.map((c) => c.category)));

  return (
    <div>
      <PageHeader
        title="Product catalog"
        subtitle={`${catalog.length} items across ${categories.length} categories`}
        actions={
          <>
            <div className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface px-2 text-[11.5px] text-muted-foreground">
              <Search className="h-3 w-3" />
              <input placeholder="Search SKU or name…" className="bg-transparent outline-none w-48 text-foreground placeholder:text-muted-foreground" />
            </div>
            <button className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface px-2 text-[11.5px] text-muted-foreground"><Filter className="h-3 w-3" /> Filter</button>
            <button className="flex h-7 items-center gap-1 rounded-md bg-primary px-2.5 text-[12px] font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Add SKU</button>
          </>
        }
        tabs={
          <>
            <Tab active>All</Tab>
            {categories.slice(0, 6).map((c) => <Tab key={c}>{c}</Tab>)}
          </>
        }
      />
      <div className="px-4 py-3">
        <table className="w-full text-[12.5px]">
          <thead className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left font-medium py-2 w-32">SKU</th>
              <th className="text-left font-medium py-2">Product</th>
              <th className="text-left font-medium py-2">Category</th>
              <th className="text-left font-medium py-2">Vendor</th>
              <th className="text-right font-medium py-2">Cost</th>
              <th className="text-right font-medium py-2">Price</th>
              <th className="text-right font-medium py-2">Margin</th>
              <th className="text-right font-medium py-2 pr-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((k) => {
              const m = ((k.price - k.cost) / k.price) * 100;
              const lowStock = k.stock <= 4 && k.category !== "Labor";
              return (
                <tr key={k.id} className="row-hover border-b border-border/60">
                  <td className="py-2.5 font-mono text-[11px] text-muted-foreground">{k.sku}</td>
                  <td className="py-2.5 font-medium">{k.name}</td>
                  <td className="py-2.5"><span className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground">{k.category}</span></td>
                  <td className="py-2.5 text-muted-foreground">{k.vendor}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-muted-foreground">{currency(k.cost)}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums font-medium">{currency(k.price)}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-status-won">{m.toFixed(0)}%</td>
                  <td className={`py-2.5 pr-2 text-right font-mono tabular-nums ${lowStock ? "text-priority-urgent" : ""}`}>
                    {k.category === "Labor" ? "—" : k.stock}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
