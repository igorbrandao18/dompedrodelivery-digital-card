import { Clock, Package } from "lucide-react";

export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof Clock }
> = {
  PENDING: { label: "Pendente", bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock },
  CONFIRMED: { label: "Confirmado", bg: "bg-blue-50", text: "text-blue-700", icon: Package },
  PREPARING: { label: "Preparando", bg: "bg-indigo-50", text: "text-indigo-700", icon: Package },
  READY: { label: "Pronto", bg: "bg-purple-50", text: "text-purple-700", icon: Package },
  OUT_FOR_DELIVERY: { label: "Saiu p/ entrega", bg: "bg-cyan-50", text: "text-cyan-700", icon: Package },
  DELIVERED: { label: "Entregue", bg: "bg-green-50", text: "text-green-700", icon: Package },
  CANCELLED: { label: "Cancelado", bg: "bg-red-50", text: "text-red-700", icon: Package },
};

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  credit_visa: "Visa (Crédito)",
  credit_mastercard: "Mastercard (Crédito)",
  credit_elo: "Elo (Crédito)",
  credit_hipercard: "Hipercard (Crédito)",
};

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
