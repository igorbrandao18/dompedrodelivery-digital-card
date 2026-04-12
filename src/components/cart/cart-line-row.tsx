"use client";

import type { CartLine } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Minus, Plus, Trash2, MessageSquare, UtensilsCrossed } from "lucide-react";

interface CartLineRowProps {
  line: CartLine;
  onSetQty: (lineId: string, qty: number) => void;
}

export function CartLineRow({ line, onSetQty }: CartLineRowProps) {
  return (
    <div className="flex gap-3 px-4 py-3">
      {/* Thumbnail */}
      {line.imageUrl ? (
        <div className="h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-[8px]">
          <img
            src={line.imageUrl}
            alt={line.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
          <UtensilsCrossed className="h-5 w-5 text-[#6B7280]" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[#111827]">
          {line.name}
        </p>
        {line.optionsSummary && (
          <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
            {line.optionsSummary}
          </p>
        )}
        {line.customerNote && (
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-[#6B7280]">
            <MessageSquare className="h-3 w-3" />
            <span className="truncate">{line.customerNote}</span>
          </div>
        )}
        <p className="mt-1 text-[14px] font-bold text-[#111827]">
          {formatCurrency(
            (line.unitPrice +
              line.selectedOptions.reduce((s, o) => s + o.priceModifier, 0)) *
              line.quantity
          )}
        </p>

        {/* Qty controls */}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSetQty(line.lineId, line.quantity - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
          >
            {line.quantity === 1 ? (
              <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
          </button>
          <span className="w-5 text-center text-[14px] font-bold text-[#111827]">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => onSetQty(line.lineId, line.quantity + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
