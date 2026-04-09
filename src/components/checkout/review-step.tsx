"use client";

import type { CartLine, FulfillmentMode, UserAddress } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { SERVICE_FEE } from "@/lib/constants";
import { ChevronRight, HelpCircle } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { PAYMENT_OPTIONS } from "./payment-step";
import {
  CashIcon,
  VisaIcon,
  MastercardIcon,
  EloIcon,
  HipercardIcon,
} from "./card-brand-icons";

const BRAND_ICONS: Record<string, React.FC<{ size?: number }>> = {
  cash: CashIcon,
  credit_visa: VisaIcon,
  credit_mastercard: MastercardIcon,
  credit_elo: EloIcon,
  credit_hipercard: HipercardIcon,
};

interface ReviewStepProps {
  lines: CartLine[];
  fulfillmentMode: FulfillmentMode;
  selectedAddress: UserAddress | undefined;
  paymentMethod: string;
  cashChangeAmount: number | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  error: string | null;
}

export function ReviewStep({
  lines,
  fulfillmentMode,
  selectedAddress,
  paymentMethod,
  cashChangeAmount,
  subtotal,
  deliveryFee,
  total,
  error,
}: ReviewStepProps) {
  const paymentLabel =
    PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label || paymentMethod;

  const PaymentIcon = BRAND_ICONS[paymentMethod] || CashIcon;

  const changeLabel =
    paymentMethod === "cash" && cashChangeAmount
      ? `Troco para ${formatCurrency(cashChangeAmount)}`
      : paymentMethod === "cash"
        ? "Sem troco"
        : null;

  return (
    <div className="px-4 py-6 space-y-5">
      {/* ── Payment method card (like mobile) ── */}
      <div>
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
          Pagamento ao receber
        </p>
        <div className="rounded-[14px] bg-[#F9FAFB] p-3">
          <div className="flex items-center gap-3 rounded-[12px] bg-white p-3">
            <PaymentIcon size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">
                {paymentLabel}
              </p>
              {changeLabel && (
                <p className="text-[12px] text-[#6B7280]">{changeLabel}</p>
              )}
            </div>
            <ChevronRight size={16} className="text-[#D1D5DB] shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Summary (like mobile) ── */}
      <div>
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
          Resumo de valores
        </p>

        <div className="space-y-2.5">
          <div className="flex justify-between text-[14px]">
            <span className="text-[#6B7280]">Subtotal</span>
            <span className="text-[#6B7280] tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-[14px]">
            <span className="text-[#6B7280]">
              {fulfillmentMode === "pickup" ? "Retirada na loja" : "Entrega"}
            </span>
            <span className="text-[#6B7280] tabular-nums">
              {fulfillmentMode === "pickup"
                ? "Grátis"
                : formatCurrency(deliveryFee)}
            </span>
          </div>

          <div className="flex justify-between text-[14px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280]">Taxa de serviço</span>
              <HelpCircle size={14} className="text-[#D1D5DB]" />
            </div>
            <span className="text-[#6B7280] tabular-nums">
              {formatCurrency(SERVICE_FEE)}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between pt-2 mt-1 border-t border-[#E5E7EB]">
            <span className="text-[16px] font-bold text-[#111827]">Total</span>
            <span className="text-[16px] font-bold text-[#111827] tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
    </div>
  );
}
