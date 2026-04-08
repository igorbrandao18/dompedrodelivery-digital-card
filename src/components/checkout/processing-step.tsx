"use client";

import { Loader2, CheckCircle2 } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";

interface ProcessingStepProps {
  status: "processing" | "success";
  onViewOrders: () => void;
}

export function ProcessingStep({ status, onViewOrders }: ProcessingStepProps) {
  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <Loader2 size={48} className="animate-spin text-[#DC2626] mb-4" />
        <p className="text-[16px] font-bold text-[#111827]">
          Enviando seu pedido...
        </p>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Aguarde um momento
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-5">
        <CheckCircle2 size={44} className="text-[#22C55E]" />
      </div>
      <h2 className="text-[22px] font-bold text-[#111827] mb-2">
        Pedido enviado!
      </h2>
      <p className="text-[14px] text-[#6B7280] text-center mb-8">
        Acompanhe o status na aba Pedidos
      </p>
      <PrimaryButton onClick={onViewOrders}>
        Ver pedidos
      </PrimaryButton>
    </div>
  );
}
