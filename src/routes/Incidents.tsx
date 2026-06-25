import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/State";
import { ApiError, Incident, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function Incidents() {
  const auth = useAuth();
  const incidents = useQuery({
    queryKey: ["incidents"],
    queryFn: () => apiRequest<Incident[]>("/incidents", { token: auth.token })
  });

  return (
    <>
      <PageHeader title="Incidentes" description="Acompanhe incidentes e relatorios gerados durante investigacoes." />
      <section className="p-4 md:p-6">
        {incidents.isLoading ? <LoadingState label="Carregando incidentes" /> : null}
        {incidents.error ? <ErrorState message={readError(incidents.error)} onRetry={() => void incidents.refetch()} /> : null}
        {incidents.data?.length === 0 ? <EmptyState title="Nenhum incidente" description="Incidentes criados pelo agente aparecerao nesta lista." /> : null}
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {incidents.data?.map((incident) => (
            <Link key={incident.id} className="flex items-center justify-between gap-4 p-4 hover:bg-muted/60" to={`/incidents/${incident.id}`}>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium">{incident.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {incident.severity} · {incident.status} · {formatDate(incident.createdAt)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function readError(error: unknown) {
  return error instanceof ApiError || error instanceof Error ? error.message : "Erro inesperado.";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
