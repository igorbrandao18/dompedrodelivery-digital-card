"use client";

import { formatCurrency } from "@/lib/format";
import { SERVICE_FEE } from "@/lib/constants";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <div className="mt-6 px-4 pb-4">
      <p className="text-[14px] font-bold text-[#111827] mb-4">
        Resumo de valores
      </p>
      <div className="flex justify-between text-[14px] text-[#6B7280] mb-2">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-[14px] text-[#6B7280] mb-2">
        <span>Entrega</span>
        <span className="tabular-nums">A calcular</span>
      </div>
      <div className="flex justify-between text-[14px] text-[#6B7280] mb-2">
        <span>Taxa de serviço</span>
        <span className="tabular-nums">{formatCurrency(SERVICE_FEE)}</span>
      </div>
      <div className="mt-2 flex justify-between text-[14px] font-bold text-[#111827]">
        <span>Total</span>
        <span className="tabular-nums">
          {formatCurrency(subtotal + SERVICE_FEE)}
        </span>
      </div>
    </div>
  );
}
