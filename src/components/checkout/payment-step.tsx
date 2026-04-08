"use client";

import type { PaymentMethod } from "@/lib/types";
import { Check, CreditCard, Banknote } from "lucide-react";

const PAYMENT_OPTIONS: { value: string; label: string; icon: typeof CreditCard }[] = [
  { value: "cash", label: "Dinheiro", icon: Banknote },
  { value: "credit_visa", label: "Visa (Credito)", icon: CreditCard },
  { value: "credit_mastercard", label: "Mastercard (Credito)", icon: CreditCard },
  { value: "credit_elo", label: "Elo (Credito)", icon: CreditCard },
  { value: "credit_hipercard", label: "Hipercard (Credito)", icon: CreditCard },
];

export { PAYMENT_OPTIONS };

const inputClass =
  "w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors";

interface PaymentStepProps {
  paymentMethod: PaymentMethod;
  cashChangeAmount: number | null;
  onSetPaymentMethod: (method: PaymentMethod) => void;
  onSetCashChangeAmount: (amount: number | null) => void;
}

export function PaymentStep({
  paymentMethod,
  cashChangeAmount,
  onSetPaymentMethod,
  onSetCashChangeAmount,
}: PaymentStepProps) {
  return (
    <div className="px-4 py-6 space-y-3">
      <p className="text-[14px] text-[#6B7280] mb-2">
        Escolha a forma de pagamento
      </p>

      {PAYMENT_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSetPaymentMethod(opt.value as PaymentMethod)}
            className={`flex w-full items-center gap-3 rounded-[12px] border-2 p-4 text-left transition-colors ${
              paymentMethod === opt.value
                ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <Icon
              size={20}
              className={
                paymentMethod === opt.value
                  ? "text-[#DC2626]"
                  : "text-[#6B7280]"
              }
            />
            <span className="flex-1 text-[14px] font-medium text-[#111827]">
              {opt.label}
            </span>
            {paymentMethod === opt.value && (
              <Check size={18} className="text-[#DC2626]" />
            )}
          </button>
        );
      })}

      {/* Cash change input */}
      {paymentMethod === "cash" && (
        <div className="pt-2">
          <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
            Troco para (opcional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF]">
              R$
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              value={cashChangeAmount ?? ""}
              onChange={(e) =>
                onSetCashChangeAmount(
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
