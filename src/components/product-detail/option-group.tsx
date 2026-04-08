"use client";

import type { MenuOptionGroup } from "@/lib/types";
import { OptionItem } from "./option-item";

interface OptionGroupProps {
  group: MenuOptionGroup;
  groupSubtitle: (group: MenuOptionGroup) => string;
  isSelected: (groupId: string, optionId: string) => boolean;
  toggleOption: (groupId: string, optionId: string, multi: boolean) => void;
}

export function OptionGroup({
  group,
  groupSubtitle,
  isSelected,
  toggleOption,
}: OptionGroupProps) {
  const multi = group.maxSelections > 1;
  const isRequired = group.minSelections > 0;

  return (
    <div>
      {/* Group header */}
      <div className="sticky top-0 z-10 flex items-start justify-between border-y border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
        <div>
          <p className="text-[16px] font-bold text-[#111827]">{group.name}</p>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            {groupSubtitle(group)}
          </p>
        </div>
        {isRequired && (
          <span className="mt-1 rounded-[4px] bg-[#111827] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Obrigatório
          </span>
        )}
      </div>

      {/* Options */}
      <div className="divide-y divide-[#E5E7EB] mx-4">
        {group.options.map((option) => (
          <OptionItem
            key={option.id}
            name={option.name}
            description={option.description}
            priceModifier={option.priceModifier}
            imageUrl={option.imageUrl}
            selected={isSelected(group.id, option.id)}
            multi={multi}
            onToggle={() => toggleOption(group.id, option.id, multi)}
          />
        ))}
      </div>
    </div>
  );
}
