"use client";

import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ProductInfoProps {
  name: string;
  description?: string | null;
  servingCount?: number | null;
  price: number;
  listPrice?: number | null;
}

export function ProductInfo({
  name,
  description,
  servingCount,
  price,
  listPrice,
}: ProductInfoProps) {
  return (
    <div className="px-4 pb-4 pt-4">
      <h2 className="text-[20px] font-bold text-[#111827]">{name}</h2>

      {description && (
        <p className="mt-1 text-[14px] leading-[20px] text-[#6B7280]">
          {description}
        </p>
      )}

      {servingCount != null && servingCount > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[13px] text-[#6B7280]">
          <Users className="h-4 w-4" />
          Serve {servingCount} {servingCount === 1 ? "pessoa" : "pessoas"}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        {listPrice != null && listPrice > price && (
          <span className="text-[14px] text-[#6B7280] line-through">
            {formatCurrency(listPrice)}
          </span>
        )}
        <span className="text-[18px] font-bold text-[#111827]">
          {formatCurrency(price)}
        </span>
      </div>
    </div>
  );
}
