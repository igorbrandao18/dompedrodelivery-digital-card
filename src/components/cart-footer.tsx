"use client";

import { formatCurrency } from "@/lib/format";
import { ShoppingBag } from "lucide-react";

interface CartFooterProps {
  itemCount: number;
  subtotal: number;
  onPress: () => void;
}

export function CartFooter({ itemCount, subtotal, onPress }: CartFooterProps) {
  if (itemCount <= 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <button
          type="button"
          onClick={onPress}
          className="flex w-full items-center justify-between rounded-[12px] bg-[#DC2626] px-4 py-3 text-white transition-colors hover:bg-[#B91C1C]"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[13px] font-bold">
              {itemCount}
            </span>
            <span className="text-[16px] font-bold">Ver sacola</span>
          </div>
          <span className="text-[16px] font-bold">
            {formatCurrency(subtotal)}
          </span>
        </button>
      </div>
    </div>
  );
}
