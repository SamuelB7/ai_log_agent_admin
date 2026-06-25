import { LogRecord } from "@/lib/api";
import { cn } from "@/lib/utils";

export function LogTable({ logs }: { logs: LogRecord[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Timestamp</th>
              <th className="px-3 py-2 font-medium">Servico</th>
              <th className="px-3 py-2 font-medium">Nivel</th>
              <th className="px-3 py-2 font-medium">Mensagem</th>
              <th className="px-3 py-2 font-medium">Request</th>
              <th className="px-3 py-2 font-medium">Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(log.timestamp)}</td>
                <td className="whitespace-nowrap px-3 py-2">{log.service || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={cn("rounded px-2 py-1 text-xs font-medium", levelClass(log.level))}>
                    {log.level || "-"}
                  </span>
                </td>
                <td className="max-w-lg px-3 py-2">
                  <p className="line-clamp-2 break-words">{log.message || "-"}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{log.requestId || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{log.traceId || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function levelClass(level: string) {
  if (level === "fatal" || level === "error") return "bg-destructive/10 text-destructive";
  if (level === "warn") return "bg-warning/15 text-warning-foreground";
  return "bg-muted text-muted-foreground";
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
