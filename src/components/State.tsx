import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="border-b border-border bg-card px-4 py-4 md:px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </header>
  );
}

export function LoadingState({ label = "Carregando" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-destructive">Falha na operacao</p>
          <p className="mt-1 break-words text-muted-foreground">{message}</p>
          {onRetry ? (
            <Button type="button" variant="secondary" className="mt-3" onClick={onRetry}>
              Tentar novamente
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
