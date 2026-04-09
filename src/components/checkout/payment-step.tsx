"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/lib/types";
import { Banknote, X } from "lucide-react";

/* ── Brand colors for card icons ── */
const CARDS = [
  { value: "credit_visa", label: "Visa", color: "#1A1F71", letter: "V" },
  { value: "credit_mastercard", label: "Mastercard", color: "#EB001B", letter: "M" },
  { value: "credit_elo", label: "Elo", color: "#00A4E0", letter: "E" },
  { value: "credit_hipercard", label: "Hipercard", color: "#822124", letter: "H" },
];

export const PAYMENT_OPTIONS = [
  { value: "cash", label: "Dinheiro", icon: Banknote },
  ...CARDS.map((c) => ({ value: c.value, label: `${c.label} (Crédito)`, icon: Banknote })),
];

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
  const [showChangeSheet, setShowChangeSheet] = useState(false);
  const [changeInput, setChangeInput] = useState("");

  const confirmChange = () => {
    const val = parseFloat(changeInput.replace(",", "."));
    onSetCashChangeAmount(val > 0 ? val : null);
    setShowChangeSheet(false);
  };

  return (
    <div className="px-4 py-6 space-y-5">
      {/* ── Cash section ── */}
      <div>
        <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">
          Dinheiro
        </p>
        <button
          type="button"
          onClick={() => onSetPaymentMethod("cash")}
          className={`flex w-full items-center gap-4 rounded-[14px] p-4 transition-all ${
            paymentMethod === "cash"
              ? "bg-[#FEF2F2] ring-2 ring-[#DC2626]"
              : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
          }`}
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${
            paymentMethod === "cash" ? "bg-[#DC2626]" : "bg-[#D1FAE5]"
          }`}>
            <Banknote size={22} className={paymentMethod === "cash" ? "text-white" : "text-[#059669]"} />
          </div>
          <span className="flex-1 text-left text-[15px] font-semibold text-[#111827]">
            Dinheiro
          </span>
          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === "cash" ? "border-[#DC2626]" : "border-[#D1D5DB]"
          }`}>
            {paymentMethod === "cash" && (
              <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            )}
          </div>
        </button>

        {/* Cash change row */}
        {paymentMethod === "cash" && (
          <button
            type="button"
            onClick={() => {
              setChangeInput(cashChangeAmount ? String(cashChangeAmount) : "");
              setShowChangeSheet(true);
            }}
            className="flex w-full items-center gap-3 mt-2 rounded-[12px] bg-[#F9FAFB] px-4 py-3 text-left hover:bg-[#F3F4F6] transition-colors"
          >
            <span className="flex-1 text-[13px] text-[#DC2626] font-medium">
              {cashChangeAmount
                ? `Troco para R$ ${cashChangeAmount.toFixed(2).replace(".", ",")}`
                : "Precisa de troco? Toque aqui"}
            </span>
          </button>
        )}
      </div>

      {/* ── Credit cards section ── */}
      <div>
        <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">
          Crédito na entrega
        </p>
        <div className="space-y-2">
          {CARDS.map((card) => {
            const isSelected = paymentMethod === card.value;
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => onSetPaymentMethod(card.value as PaymentMethod)}
                className={`flex w-full items-center gap-4 rounded-[14px] p-4 transition-all ${
                  isSelected
                    ? "bg-[#FEF2F2] ring-2 ring-[#DC2626]"
                    : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                }`}
              >
                {/* Brand icon */}
                <div
                  className="flex h-11 w-[44px] items-center justify-center rounded-[8px]"
                  style={{ backgroundColor: isSelected ? card.color : `${card.color}15` }}
                >
                  <span
                    className="text-[16px] font-black"
                    style={{ color: isSelected ? "#fff" : card.color }}
                  >
                    {card.letter}
                  </span>
                </div>
                <span className="flex-1 text-left text-[15px] font-semibold text-[#111827]">
                  {card.label}
                </span>
                {/* Radio */}
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-[#DC2626]" : "border-[#D1D5DB]"
                }`}>
                  {isSelected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cash change bottom sheet ── */}
      {showChangeSheet && (
        <>
          <div
            className="fixed inset-0 z-[80] bg-black/40"
            onClick={() => setShowChangeSheet(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[81] rounded-t-[20px] bg-white p-6 shadow-xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#111827]">
                Vai precisar de troco?
              </h3>
              <button
                type="button"
                onClick={() => setShowChangeSheet(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F3F4F6]"
              >
                <X size={20} className="text-[#6B7280]" />
              </button>
            </div>

            <p className="text-[13px] text-[#6B7280] mb-4">
              Digite o valor que você vai pagar em dinheiro para levarmos o troco.
            </p>

            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-[#9CA3AF]">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={changeInput}
                onChange={(e) => setChangeInput(e.target.value)}
                autoFocus
                className="w-full h-14 rounded-[12px] border-2 border-[#E5E7EB] bg-white pl-12 pr-4 text-[20px] font-bold text-[#111827] placeholder-[#D1D5DB] outline-none focus:border-[#DC2626] transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={confirmChange}
              disabled={!changeInput}
              className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#DC2626] text-[15px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-40"
            >
              Confirmar
            </button>

            <button
              type="button"
              onClick={() => {
                onSetCashChangeAmount(null);
                setShowChangeSheet(false);
              }}
              className="flex h-10 w-full items-center justify-center mt-2 text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Não preciso de troco
            </button>
          </div>
        </>
      )}
    </div>
  );
}
