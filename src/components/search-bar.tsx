"use client";

import type { MenuCategory } from "@/lib/types";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  categories: MenuCategory[];
  activeIds: Set<string>;
  onCategoryPress: (id: string) => void;
}

export function SearchBar({
  value,
  onChange,
  categories,
  activeIds,
  onCategoryPress,
}: SearchBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-white pb-2 pt-3">
      {/* Search input */}
      <div className="relative px-4">
        <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar no cardápio"
          className="h-10 w-full rounded-[12px] border border-[#E5E7EB] bg-white pl-10 pr-4 text-[14px] text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
        />
      </div>

      {/* Category pills */}
      <div className="mt-2 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = activeIds.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryPress(cat.id)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-[#DC2626] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280]"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
