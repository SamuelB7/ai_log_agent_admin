import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { FileText, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/State";
import { ApiError, GithubIssueResponse, Incident, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function IncidentDetail() {
  const { id } = useParams();
  const auth = useAuth();
  const [report, setReport] = useState("");

  const incident = useQuery({
    queryKey: ["incident", id],
    enabled: Boolean(id),
    queryFn: () => apiRequest<Incident>(`/incidents/${id}`, { token: auth.token })
  });

  const createReport = useMutation({
    mutationFn: () =>
      apiRequest(`/incidents/${id}/reports`, {
        token: auth.token,
        method: "POST",
        body: JSON.stringify({ content: report })
      })
  });

  const createIssue = useMutation({
    mutationFn: () =>
      apiRequest<GithubIssueResponse>("/github/issues", {
        token: auth.token,
        method: "POST",
        body: JSON.stringify({
          title: incident.data?.title ?? "Investigacao DebugOps",
          body: report || `Investigar incidente ${id}`,
          labels: ["incident", "debugops-agent"],
          incidentId: id
        })
      })
  });

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report.trim()) return;
    void createReport.mutateAsync();
  }

  return (
    <>
      <PageHeader title={incident.data?.title ?? "Detalhe do incidente"} description="Revise a investigacao e gere relatorio ou issue GitHub." />
      <section className="space-y-4 p-4 md:p-6">
        {incident.isLoading ? <LoadingState label="Carregando incidente" /> : null}
        {incident.error ? <ErrorState message={readError(incident.error)} onRetry={() => void incident.refetch()} /> : null}
        {incident.data ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
            <article className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Resumo</h2>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Severidade</dt>
                  <dd className="mt-1 font-medium">{incident.data.severity}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1 font-medium">{incident.data.status}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Criado em</dt>
                  <dd className="mt-1 font-medium">{formatDate(incident.data.createdAt)}</dd>
                </div>
              </dl>
            </article>

            <aside className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Acoes</h2>
              <form className="mt-4 space-y-3" onSubmit={handleReportSubmit}>
                <textarea
                  className="min-h-40 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  value={report}
                  onChange={(event) => setReport(event.target.value)}
                  placeholder="Resumo tecnico, impacto, evidencias e proximos passos"
                />
                {createReport.error ? <ErrorState message={readError(createReport.error)} /> : null}
                {createReport.isSuccess ? <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success-foreground">Relatorio registrado.</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" className="gap-2" disabled={!report.trim() || createReport.isPending}>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Salvar relatorio
                  </Button>
                  <Button type="button" variant="secondary" className="gap-2" onClick={() => void createIssue.mutateAsync()}>
                    <Github className="h-4 w-4" aria-hidden="true" />
                    Criar issue
                  </Button>
                </div>
              </form>
              {createIssue.error ? <ErrorState message={readError(createIssue.error)} /> : null}
              {createIssue.data ? (
                <p className="mt-3 rounded-md bg-success/10 px-3 py-2 text-sm text-success-foreground">
                  Issue #{createIssue.data.number} criada: {createIssue.data.url}
                </p>
              ) : null}
            </aside>
          </div>
        ) : !incident.isLoading ? (
          <EmptyState title="Incidente nao encontrado" description="Verifique se o incidente ainda existe." />
        ) : null}
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
