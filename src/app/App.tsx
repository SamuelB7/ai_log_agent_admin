import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth";
import { Chat } from "@/routes/Chat";
import { ConversationDetail } from "@/routes/ConversationDetail";
import { History } from "@/routes/History";
import { IncidentDetail } from "@/routes/IncidentDetail";
import { Incidents } from "@/routes/Incidents";
import { Login } from "@/routes/Login";
import { Logs } from "@/routes/Logs";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/history" element={<History />} />
                <Route path="/conversations/:id" element={<ConversationDetail />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/incidents/:id" element={<IncidentDetail />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
