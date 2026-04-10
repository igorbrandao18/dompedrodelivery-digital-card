import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  PackageCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export interface StatusCfg {
  label: string;
  bg: string;
  text: string;
  pill: string;
  pillText: string;
  icon: LucideIcon;
}

export const STATUS_CONFIG: Record<string, StatusCfg> = {
  PENDING: {
    label: "Pendente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    pill: "bg-amber-100",
    pillText: "text-amber-700",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmado",
    bg: "bg-blue-50",
    text: "text-blue-700",
    pill: "bg-blue-100",
    pillText: "text-blue-700",
    icon: CheckCircle2,
  },
  PREPARING: {
    label: "Preparando",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    pill: "bg-indigo-100",
    pillText: "text-indigo-700",
    icon: ChefHat,
  },
  READY: {
    label: "Pronto",
    bg: "bg-purple-50",
    text: "text-purple-700",
    pill: "bg-purple-100",
    pillText: "text-purple-700",
    icon: PackageCheck,
  },
  OUT_FOR_DELIVERY: {
    label: "Saiu p/ entrega",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    pill: "bg-cyan-100",
    pillText: "text-cyan-700",
    icon: Bike,
  },
  DELIVERED: {
    label: "Entregue",
    bg: "bg-green-50",
    text: "text-green-700",
    pill: "bg-green-100",
    pillText: "text-green-700",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Cancelado",
    bg: "bg-red-50",
    text: "text-red-700",
    pill: "bg-red-100",
    pillText: "text-red-700",
    icon: XCircle,
  },
};

export const PROGRESS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  credit_visa: "Visa (Credito)",
  credit_mastercard: "Mastercard (Credito)",
  credit_elo: "Elo (Credito)",
  credit_hipercard: "Hipercard (Credito)",
  pix: "Pix",
};

export function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month} as ${hours}:${mins}`;
}

export function getStepIndex(status: string): number {
  const idx = PROGRESS_STEPS.indexOf(status as (typeof PROGRESS_STEPS)[number]);
  return idx >= 0 ? idx : -1;
}
