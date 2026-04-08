"use client";

import { formatCurrency } from "@/lib/format";
import { SERVICE_FEE } from "@/lib/constants";

interface CartFooterProps {
  subtotal: number;
  lineCount: number;
  isClosed: boolean;
  belowMin: boolean;
  minOrderValue?: number | null;
  onCheckout: () => void;
}

export function CartFooter({
  subtotal,
  lineCount,
  isClosed,
  belowMin,
  minOrderValue,
  onCheckout,
}: CartFooterProps) {
  return (
    <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[11px] text-[#6B7280]">Total sem a entrega</p>
          <p className="mt-0.5 text-[14px] font-bold text-[#111827] tabular-nums">
            {formatCurrency(subtotal + SERVICE_FEE)} / {lineCount}{" "}
            {lineCount === 1 ? "item" : "itens"}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {isClosed && (
            <p className="text-[12px] text-[#DC2626] font-medium">
              Restaurante fechado no momento
            </p>
          )}
          {!isClosed && belowMin && (
            <p className="text-[12px] text-[#DC2626] font-medium">
              Pedido minimo: {formatCurrency(minOrderValue!)}
            </p>
          )}
          <button
            type="button"
            onClick={onCheckout}
            disabled={isClosed || belowMin}
            className="rounded-[12px] bg-[#DC2626] px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
