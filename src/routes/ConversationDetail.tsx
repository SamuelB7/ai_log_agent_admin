import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/State";
import { LogTable } from "@/components/LogTable";
import { ApiError, Conversation, Message, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function ConversationDetail() {
  const { id } = useParams();
  const auth = useAuth();

  const conversation = useQuery({
    queryKey: ["conversation", id],
    enabled: Boolean(id),
    queryFn: () => apiRequest<Conversation>(`/conversations/${id}`, { token: auth.token })
  });

  const messages = useQuery({
    queryKey: ["conversation-messages", id],
    enabled: Boolean(id),
    queryFn: () => apiRequest<Message[]>(`/conversations/${id}/messages`, { token: auth.token })
  });

  const relatedLogs = messages.data?.flatMap((message) => message.metadata?.logs ?? []) ?? [];

  return (
    <>
      <PageHeader title={conversation.data?.title ?? "Detalhe da investigacao"} description="Mensagens, resposta do agente, contexto tecnico e logs relacionados." />
      <section className="space-y-4 p-4 md:p-6">
        {conversation.isLoading || messages.isLoading ? <LoadingState /> : null}
        {conversation.error ? <ErrorState message={readError(conversation.error)} onRetry={() => void conversation.refetch()} /> : null}
        {messages.error ? <ErrorState message={readError(messages.error)} onRetry={() => void messages.refetch()} /> : null}

        <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <div className="space-y-3">
            {messages.data?.length === 0 ? <EmptyState title="Sem mensagens" description="Esta conversa ainda nao tem mensagens registradas." /> : null}
            {messages.data?.map((message) => (
              <article key={message.id} className={cn("rounded-lg border border-border p-4", message.role === "user" ? "bg-muted" : "bg-card")}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">{message.role}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Contexto retornado</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Quando o BFF retornar metadados do agente, evidencias e tools usadas aparecem nesta area.
              </p>
              <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(messages.data?.map((message) => message.metadata).filter(Boolean), null, 2) || "[]"}
              </pre>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Logs relacionados</h2>
              {relatedLogs.length ? (
                <LogTable logs={relatedLogs} />
              ) : (
                <EmptyState title="Sem logs vinculados" description="Use a busca de logs para investigar request IDs e trace IDs citados na conversa." />
              )}
            </section>
          </aside>
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
