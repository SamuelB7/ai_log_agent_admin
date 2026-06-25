import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/State";
import { ApiError, Conversation, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function History() {
  const auth = useAuth();
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiRequest<Conversation[]>("/conversations", { token: auth.token })
  });

  return (
    <>
      <PageHeader title="Historico de conversas" description="Retome investigacoes salvas e revise mensagens anteriores." />
      <section className="p-4 md:p-6">
        {conversations.isLoading ? <LoadingState label="Carregando historico" /> : null}
        {conversations.error ? <ErrorState message={readError(conversations.error)} onRetry={() => void conversations.refetch()} /> : null}
        {conversations.data?.length === 0 ? <EmptyState title="Nenhuma conversa" description="As investigacoes iniciadas no chat aparecerao aqui." /> : null}
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {conversations.data?.map((conversation) => (
            <Link key={conversation.id} className="flex items-center justify-between gap-4 p-4 hover:bg-muted/60" to={`/conversations/${conversation.id}`}>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium">{conversation.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Atualizada em {formatDate(conversation.updatedAt)}</p>
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
