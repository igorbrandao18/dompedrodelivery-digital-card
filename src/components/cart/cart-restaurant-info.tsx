"use client";

import { UtensilsCrossed } from "lucide-react";

interface CartRestaurantInfoProps {
  name: string;
  logoUrl?: string | null;
  onAddMore: () => void;
}

export function CartRestaurantInfo({
  name,
  logoUrl,
  onAddMore,
}: CartRestaurantInfoProps) {
  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="h-12 w-12 rounded-full bg-[#F9FAFB] object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F9FAFB]">
            <UtensilsCrossed className="h-6 w-6 text-[#6B7280]" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-[16px] font-bold text-[#111827]">{name}</p>
          <button
            type="button"
            onClick={onAddMore}
            className="mt-0.5 text-[14px] font-semibold text-[#DC2626] hover:underline"
          >
            Adicionar mais itens
          </button>
        </div>
      </div>

      <p className="mt-6 mb-2 text-[14px] font-bold text-[#111827]">
        Itens adicionados
      </p>
    </div>
  );
}
