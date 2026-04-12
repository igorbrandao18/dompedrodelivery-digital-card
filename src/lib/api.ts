import { API_URL } from "@/lib/constants";

const KNOWN_ERRORS: Record<string, string> = {
  "Invalid credentials": "Credenciais inválidas.",
  "Unauthorized": "Sessão expirada. Faça login novamente.",
  "Not found": "Recurso não encontrado.",
  "Forbidden": "Você não tem permissão para esta ação.",
  "Too many requests": "Muitas tentativas. Aguarde um momento.",
  "Validation error": "Dados inválidos. Verifique e tente novamente.",
};

function sanitizeError(status: number, message?: string): string {
  if (message) {
    const known = KNOWN_ERRORS[message];
    if (known) return known;
  }

  switch (status) {
    case 400: return "Dados inválidos. Verifique e tente novamente.";
    case 401: return "Sessão expirada. Faça login novamente.";
    case 403: return "Você não tem permissão para esta ação.";
    case 404: return "Recurso não encontrado.";
    case 409: return "Conflito com dados existentes.";
    case 422: return "Dados inválidos. Verifique e tente novamente.";
    case 429: return "Muitas tentativas. Aguarde um momento.";
    default:
      if (status >= 500) return "Erro no servidor. Tente novamente mais tarde.";
      return "Ocorreu um erro. Tente novamente.";
  }
}

// ── Main fetch function ──
// Digital card uses httpOnly cookies (customerAccessToken) via credentials:include.
// X-Client-Type: customer tells the backend to use customer-prefixed cookies,
// isolating the session from the admin panel (which uses accessToken).
const DEFAULT_TIMEOUT_MS = 15_000;

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Client-Type": "customer",
    ...(options?.headers as Record<string, string> || {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("A conexão demorou demais. Verifique sua internet.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401) {
    throw new Error(sanitizeError(401));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(sanitizeError(res.status, body.message || body.detail));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
