export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  permissions: string[];
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  order: number;
  createdAt: string;
  metadata?: {
    evidence?: unknown;
    logs?: LogRecord[];
    tools?: unknown;
    metadata?: unknown;
  };
}

export interface LogRecord {
  id: string;
  service: string;
  environment: string;
  level: string;
  message: string;
  requestId: string;
  traceId: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
}

export interface GithubIssueResponse {
  url: string;
  number: number;
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  query?: Record<string, string | number | undefined>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, query, headers, body, ...init } = options;
  const url = new URL(path, apiBaseUrl);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    ...init,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text ? safeJson(text) : undefined;

  if (!response.ok) {
    throw new ApiError(readErrorMessage(payload, response.status), response.status);
  }

  return payload as T;
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function logoutRequest(token: string) {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    token
  });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function readErrorMessage(payload: unknown, status: number) {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }

  if (typeof payload === "string" && payload.trim()) return payload;

  return `Request failed with status ${status}.`;
}
