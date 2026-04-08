"use client";

import { Check, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface OptionItemProps {
  name: string;
  description?: string | null;
  priceModifier: number;
  imageUrl?: string | null;
  selected: boolean;
  multi: boolean;
  onToggle: () => void;
}

export function OptionItem({
  name,
  description,
  priceModifier,
  imageUrl,
  selected,
  multi,
  onToggle,
}: OptionItemProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 py-4 text-left transition-colors"
    >
      {/* Text content */}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-[#111827]">{name}</p>
        {description && (
          <p className="mt-0.5 text-[13px] text-[#6B7280]">{description}</p>
        )}
        {priceModifier > 0 && (
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            + {formatCurrency(priceModifier)}
          </p>
        )}
      </div>

      {/* Product image (if any) */}
      {imageUrl && (
        <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[8px] bg-[#F9FAFB]">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Action: + button (multi) or radio (single) */}
      {multi ? (
        selected ? (
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#DC2626]">
            <Check className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
            <Plus className="h-6 w-6 text-[#DC2626]" />
          </div>
        )
      ) : (
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-[#DC2626]" : "border-[#D1D5DB]"
          }`}
        >
          {selected && (
            <div className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
          )}
        </div>
      )}
    </button>
  );
}
