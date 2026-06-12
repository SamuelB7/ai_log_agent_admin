import { Activity, Bot, Database, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiBaseUrl } from "@/lib/api";

const panels = [
  { title: "Backend API", value: apiBaseUrl, icon: Server },
  { title: "Agent", value: "http://localhost:8000", icon: Bot },
  { title: "Logs", value: "OpenSearch + Redis", icon: Activity },
  { title: "RAG", value: "Qdrant", icon: Database }
];

export function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Admin Web Panel</p>
            <h1 className="text-xl font-semibold tracking-normal">DebugOps Agent</h1>
          </div>
          <Button type="button">New investigation</Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4">
        {panels.map((panel) => {
          const Icon = panel.icon;
          return (
            <article key={panel.title} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-medium">{panel.title}</h2>
              <p className="mt-1 break-words text-sm text-muted-foreground">{panel.value}</p>
            </article>
          );
        })}
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Investigation workspace</h2>
          <div className="min-h-72 rounded-md border border-dashed border-border bg-muted/40" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Related logs</h2>
          <div className="min-h-72 rounded-md border border-dashed border-border bg-muted/40" />
        </div>
      </section>
    </main>
  );
}

