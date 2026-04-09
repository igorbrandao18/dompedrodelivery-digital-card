"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Banknote, Check } from "lucide-react";

interface ProfilePaymentProps {
  onBack: () => void;
}

const METHODS = [
  { id: "cash", label: "Dinheiro", desc: "Pague na entrega", icon: Banknote, color: "text-[#059669]" },
  { id: "credit_visa", label: "Visa", desc: "Crédito na entrega", icon: CreditCard, color: "text-[#1A1F71]" },
  { id: "credit_mastercard", label: "Mastercard", desc: "Crédito na entrega", icon: CreditCard, color: "text-[#EB001B]" },
  { id: "credit_elo", label: "Elo", desc: "Crédito na entrega", icon: CreditCard, color: "text-[#00A4E0]" },
  { id: "credit_hipercard", label: "Hipercard", desc: "Crédito na entrega", icon: CreditCard, color: "text-[#822124]" },
];

export function ProfilePayment({ onBack }: ProfilePaymentProps) {
  const [selected, setSelected] = useState("cash");

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#111827]" />
        </button>
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Pagamento</h2>
          <p className="text-[12px] text-[#9CA3AF]">Formas aceitas na entrega</p>
        </div>
      </div>

      {/* Methods */}
      <div className="px-4 space-y-2 mt-2">
        {METHODS.map((m) => {
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={`flex w-full items-center gap-3 rounded-[14px] p-4 transition-all ${
                active
                  ? "bg-[#FEF2F2] ring-2 ring-[#DC2626]"
                  : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                active ? "bg-[#DC2626]" : "bg-white"
              }`}>
                <m.icon size={20} className={active ? "text-white" : m.color} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-semibold text-[#111827]">{m.label}</p>
                <p className="text-[12px] text-[#9CA3AF]">{m.desc}</p>
              </div>
              {active && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626]">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Pix coming soon */}
      <div className="mx-4 mt-4 rounded-[14px] border border-dashed border-[#E5E7EB] p-4 text-center">
        <p className="text-[13px] font-semibold text-[#6B7280]">Pix e pagamento online</p>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">Em breve</p>
      </div>
    </div>
  );
}
