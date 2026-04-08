"use client";

import { ChevronRight, Package } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { STATUS_CONFIG, formatDate } from "./order-constants";

interface OrderItem {
  id: string;
  quantity: number;
}

interface OrderCardProps {
  id: string;
  shortId?: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  onPress: () => void;
}

export function OrderCard({
  id,
  shortId,
  status,
  total,
  createdAt,
  items,
  onPress,
}: OrderCardProps) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    bg: "bg-gray-50",
    text: "text-gray-700",
    icon: Package,
  };

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const itemLabel = totalQty === 1 ? "1 item" : `${totalQty} itens`;

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full items-center gap-3 rounded-[16px] border border-[#E5E7EB] bg-white p-4 text-left transition-colors hover:bg-[#F9FAFB]"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
      >
        <cfg.icon size={20} className={cfg.text} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-[#111827]">
            #{shortId || id.slice(0, 6)}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
          >
            {cfg.label}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-[#6B7280]">
          {formatDate(createdAt)} · {itemLabel}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[15px] font-bold text-[#111827] tabular-nums">
          {formatCurrency(total)}
        </span>
        <ChevronRight size={16} className="text-[#D1D5DB]" />
      </div>
    </button>
  );
}
