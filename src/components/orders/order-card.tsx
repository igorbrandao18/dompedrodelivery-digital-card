"use client";

import { Store } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { STATUS_CONFIG, formatDate } from "./order-constants";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}

interface OrderCardProps {
  id: string;
  shortId?: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  restaurantName?: string;
  restaurantLogo?: string;
  onPress: () => void;
}

export function OrderCard({
  status,
  total,
  createdAt,
  items,
  restaurantName,
  restaurantLogo,
  onPress,
}: OrderCardProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const preview = items
    .slice(0, 3)
    .map((i) => `${i.quantity}x ${i.productName}`)
    .join(", ");

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4">
      {/* Top row: logo + name + status */}
      <div className="flex items-start gap-3 mb-3">
        {restaurantLogo ? (
          <img
            src={restaurantLogo}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover border border-[#E5E7EB]"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
            <Store size={20} className="text-[#9CA3AF]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-[#111827] truncate">
            {restaurantName || "Restaurante"}
          </p>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            {formatDate(createdAt)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.pill} ${cfg.pillText}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Items preview */}
      {preview && (
        <p className="text-[13px] text-[#6B7280] mb-3 line-clamp-1">
          {preview}
        </p>
      )}

      {/* Bottom row: price + actions */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-3">
        <span className="text-[16px] font-bold text-[#111827] tabular-nums">
          {formatCurrency(total)}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPress}
            className="text-[13px] font-semibold text-[#DC2626] hover:underline"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
