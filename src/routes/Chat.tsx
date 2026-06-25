import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/State";
import { ApiError, Conversation, Message, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Chat() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const token = auth.token;

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiRequest<Conversation[]>("/conversations", { token })
  });

  const selectedConversationId = activeConversationId ?? conversations.data?.[0]?.id ?? null;

  const messages = useQuery({
    queryKey: ["conversation-messages", selectedConversationId],
    enabled: Boolean(selectedConversationId),
    queryFn: () => apiRequest<Message[]>(`/conversations/${selectedConversationId}/messages`, { token })
  });

  const createConversation = useMutation({
    mutationFn: (title: string) =>
      apiRequest<Conversation>("/conversations", {
        token,
        method: "POST",
        body: JSON.stringify({ title })
      }),
    onSuccess: async (conversation) => {
      setActiveConversationId(conversation.id);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      let conversationId = selectedConversationId;

      if (!conversationId) {
        const conversation = await createConversation.mutateAsync(content.slice(0, 80));
        conversationId = conversation.id;
      }

      return apiRequest<Message>(`/conversations/${conversationId}/messages`, {
        token,
        method: "POST",
        body: JSON.stringify({ content })
      });
    },
    onSuccess: async () => {
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      await queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;
    await sendMessage.mutateAsync(content);
  }

  const latestAssistant = useMemo(() => {
    return [...(messages.data ?? [])].reverse().find((item) => item.role === "assistant");
  }, [messages.data]);

  return (
    <>
      <PageHeader title="Chat com agente" description="Investigue logs, traces, documentacao e incidentes usando linguagem natural." />
      <div className="grid min-h-[calc(100vh-73px)] gap-0 lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-border bg-card lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold">Conversas</h2>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => void createConversation.mutateAsync("Nova investigacao")}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto p-2 lg:max-h-[calc(100vh-145px)]">
            {conversations.isLoading ? <LoadingState label="Carregando conversas" /> : null}
            {conversations.error ? <ErrorState message={readError(conversations.error)} onRetry={() => void conversations.refetch()} /> : null}
            {conversations.data?.length === 0 ? (
              <EmptyState title="Sem conversas" description="Envie uma pergunta para iniciar uma investigacao." />
            ) : null}
            <div className="space-y-1">
              {conversations.data?.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    selectedConversationId === conversation.id && "bg-muted"
                  )}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <span className="block truncate font-medium">{conversation.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(conversation.updatedAt)}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-73px)] flex-col bg-background">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
            {messages.isLoading ? <LoadingState label="Carregando mensagens" /> : null}
            {messages.error ? <ErrorState message={readError(messages.error)} onRetry={() => void messages.refetch()} /> : null}
            {!selectedConversationId ? (
              <EmptyState title="Pergunte ao agente" description="Comece uma conversa para buscar logs, gerar hipoteses e criar proximos passos." />
            ) : null}
            {messages.data?.map((item) => (
              <article
                key={item.id}
                className={cn(
                  "max-w-4xl rounded-lg border border-border p-4",
                  item.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-card"
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase">{item.role === "user" ? "Usuario" : "Agente"}</span>
                  <span className="text-xs opacity-75">{formatDate(item.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.content}</p>
              </article>
            ))}
          </div>

          <div className="border-t border-border bg-card p-4">
            {sendMessage.error ? <ErrorState message={readError(sendMessage.error)} /> : null}
            {latestAssistant ? (
              <div className="mb-3 rounded-md border border-border bg-background p-3 text-sm">
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Ultima resposta
                </div>
                <p className="line-clamp-2 text-muted-foreground">{latestAssistant.content}</p>
                <Link className="mt-2 inline-block text-sm text-primary hover:underline" to={`/conversations/${latestAssistant.conversationId}`}>
                  Ver detalhe da investigacao
                </Link>
              </div>
            ) : null}
            <form className="flex gap-2" onSubmit={(event) => void handleSubmit(event)}>
              <textarea
                className="min-h-12 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ex.: Busque erros do servico payments na ultima hora e gere um relatorio"
              />
              <Button type="submit" className="h-auto gap-2" disabled={sendMessage.isPending || !message.trim()}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Enviar
              </Button>
            </form>
          </div>
        </section>
      </div>
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
