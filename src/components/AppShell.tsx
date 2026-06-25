import { NavLink, Outlet } from "react-router-dom";
import { Bot, History, LogOut, MessageSquare, ScrollText, Search, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/history", label: "Historico", icon: History },
  { to: "/logs", label: "Logs", icon: Search },
  { to: "/incidents", label: "Incidentes", icon: ShieldAlert }
];

export function AppShell() {
  const auth = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">DebugOps Agent</h1>
                <p className="text-xs text-muted-foreground">Admin Web</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <div className="mb-3 min-w-0 px-2">
              <p className="truncate text-sm font-medium">{auth.user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{auth.user?.email}</p>
            </div>
            <Button type="button" variant="secondary" className="w-full justify-start gap-2" onClick={() => void auth.logout()}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-semibold">DebugOps Agent</span>
            </div>
            <Button type="button" variant="secondary" onClick={() => void auth.logout()}>
              Sair
            </Button>
          </div>
          <nav className="mt-3 grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground"
                    )
                  }
                  title={item.label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              );
            })}
          </nav>
        </header>

        <Outlet />
      </div>
    </main>
  );
}
