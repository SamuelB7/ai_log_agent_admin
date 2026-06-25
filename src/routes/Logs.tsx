import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/State";
import { LogTable } from "@/components/LogTable";
import { ApiError, LogRecord, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface LogFilters {
  service: string;
  environment: string;
  level: string;
  from: string;
  to: string;
  message: string;
  requestId: string;
  traceId: string;
}

const initialFilters: LogFilters = {
  service: "",
  environment: "",
  level: "",
  from: "",
  to: "",
  message: "",
  requestId: "",
  traceId: ""
};

export function Logs() {
  const auth = useAuth();
  const [draft, setDraft] = useState<LogFilters>(initialFilters);
  const [filters, setFilters] = useState<LogFilters>({ ...initialFilters, level: "error" });

  const logs = useQuery({
    queryKey: ["logs", filters],
    queryFn: () =>
      apiRequest<LogRecord[]>("/logs", {
        token: auth.token,
        query: {
          ...filters,
          page: 1,
          pageSize: 50
        }
      })
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters(draft);
  }

  return (
    <>
      <PageHeader title="Logs" description="Busque logs salvos por filtros estruturados e texto." />
      <section className="space-y-4 p-4 md:p-6">
        <form className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit}>
          <Field label="Servico" value={draft.service} onChange={(value) => setDraft({ ...draft, service: value })} />
          <Field label="Ambiente" value={draft.environment} onChange={(value) => setDraft({ ...draft, environment: value })} />
          <label className="text-sm font-medium">
            Nivel
            <select
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={draft.level}
              onChange={(event) => setDraft({ ...draft, level: event.target.value })}
            >
              <option value="">Todos</option>
              <option value="trace">trace</option>
              <option value="debug">debug</option>
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="error">error</option>
              <option value="fatal">fatal</option>
            </select>
          </label>
          <Field label="Mensagem" value={draft.message} onChange={(value) => setDraft({ ...draft, message: value })} />
          <Field label="Request ID" value={draft.requestId} onChange={(value) => setDraft({ ...draft, requestId: value })} />
          <Field label="Trace ID" value={draft.traceId} onChange={(value) => setDraft({ ...draft, traceId: value })} />
          <Field label="De" type="datetime-local" value={draft.from} onChange={(value) => setDraft({ ...draft, from: toIsoDate(value) })} />
          <Field label="Ate" type="datetime-local" value={draft.to} onChange={(value) => setDraft({ ...draft, to: toIsoDate(value) })} />
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              Buscar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDraft(initialFilters)}>
              Limpar
            </Button>
          </div>
        </form>

        {logs.isLoading ? <LoadingState label="Buscando logs" /> : null}
        {logs.error ? <ErrorState message={readError(logs.error)} onRetry={() => void logs.refetch()} /> : null}
        {logs.data?.length === 0 ? <EmptyState title="Nenhum log encontrado" description="Ajuste filtros ou amplie o periodo da busca." /> : null}
        {logs.data?.length ? <LogTable logs={logs.data} /> : null}
      </section>
    </>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        type={type}
        value={type === "datetime-local" ? toLocalDate(value) : value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function toIsoDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function toLocalDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function readError(error: unknown) {
  return error instanceof ApiError || error instanceof Error ? error.message : "Erro inesperado.";
}
