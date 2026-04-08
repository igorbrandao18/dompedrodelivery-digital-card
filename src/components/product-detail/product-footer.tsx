"use client";

import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ProductFooterProps {
  quantity: number;
  lineTotal: number;
  canAdd: boolean;
  isClosed: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onAdd: () => void;
}

export function ProductFooter({
  quantity,
  lineTotal,
  canAdd,
  isClosed,
  onIncrement,
  onDecrement,
  onAdd,
}: ProductFooterProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-4 border-t border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
    >
      {/* Quantity box */}
      <div className="flex h-12 items-center rounded-[8px] border border-[#E5E7EB]">
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-full w-10 items-center justify-center text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-[16px] font-bold text-[#111827]">
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-full w-10 items-center justify-center text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd || isClosed}
        className="flex flex-1 items-center justify-between rounded-[12px] bg-[#DC2626] px-5 py-3.5 text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="text-[14px] font-bold">
          {isClosed ? "Restaurante fechado" : "Adicionar"}
        </span>
        {!isClosed && (
          <span className="text-[14px] font-bold">
            {formatCurrency(lineTotal)}
          </span>
        )}
      </button>
    </div>
  );
}
