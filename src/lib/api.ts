const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(sanitizeError(res.status, body.message || body.detail));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
