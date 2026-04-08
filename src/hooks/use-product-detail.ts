"use client";

import { useState, useMemo } from "react";
import type { MenuProduct, MenuOption, MenuOptionGroup } from "@/lib/types";

interface UseProductDetailResult {
  quantity: number;
  incrementQty: () => void;
  decrementQty: () => void;
  selectedOptions: Record<string, Set<string>>;
  toggleOption: (groupId: string, optionId: string, multi: boolean) => void;
  isSelected: (groupId: string, optionId: string) => boolean;
  canAdd: boolean;
  allSelectedOptions: MenuOption[];
  optionsTotal: number;
  unitTotal: number;
  lineTotal: number;
  customerNote: string;
  setCustomerNote: (note: string) => void;
  groupSubtitle: (group: MenuOptionGroup) => string;
}

const NOTE_MAX_LENGTH = 500;

export function useProductDetail(product: MenuProduct): UseProductDetailResult {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, Set<string>>
  >({});
  const [customerNote, setCustomerNote] = useState("");

  const toggleOption = (
    groupId: string,
    optionId: string,
    multi: boolean
  ) => {
    setSelectedOptions((prev) => {
      const next = { ...prev };
      if (!next[groupId]) next[groupId] = new Set();
      const group = new Set(next[groupId]);

      if (multi) {
        if (group.has(optionId)) {
          group.delete(optionId);
        } else {
          // Enforce maxSelections limit
          const optGroup = product.optionGroups.find((g) => g.id === groupId);
          if (optGroup && group.size >= optGroup.maxSelections) {
            // At max — remove the oldest selection to make room
            const first = group.values().next().value;
            if (first !== undefined) group.delete(first);
          }
          group.add(optionId);
        }
      } else {
        group.clear();
        group.add(optionId);
      }
      next[groupId] = group;
      return next;
    });
  };

  const isSelected = (groupId: string, optionId: string) =>
    selectedOptions[groupId]?.has(optionId) || false;

  const canAdd = product.optionGroups.every(
    (g) => (selectedOptions[g.id]?.size || 0) >= g.minSelections
  );

  const allSelectedOptions = useMemo(() => {
    const opts: MenuOption[] = [];
    for (const group of product.optionGroups) {
      for (const opt of group.options) {
        if (selectedOptions[group.id]?.has(opt.id)) opts.push(opt);
      }
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions, product.optionGroups]);

  const optionsTotal = allSelectedOptions.reduce(
    (sum, o) => sum + o.priceModifier,
    0
  );
  const unitTotal = product.price + optionsTotal;
  const lineTotal = unitTotal * quantity;

  const groupSubtitle = (group: MenuOptionGroup): string => {
    const min = group.minSelections;
    const max = group.maxSelections;

    if (min === 0 && max <= 1) return "Opcional";
    if (min === 0 && max > 1) return `Escolha até ${max} opções`;
    if (min === max && min === 1) return "Escolha 1 opção";
    if (min === max) return `Escolha ${min} opções`;
    if (min > 0 && max > min) return `Escolha de ${min} a ${max} opções`;
    if (min > 0) return `Escolha ${min} opção${min > 1 ? "ões" : ""}`;
    return "Opcional";
  };

  const handleSetNote = (note: string) => {
    setCustomerNote(note.slice(0, NOTE_MAX_LENGTH));
  };

  return {
    quantity,
    incrementQty: () => setQuantity((q) => q + 1),
    decrementQty: () => setQuantity((q) => Math.max(1, q - 1)),
    selectedOptions,
    toggleOption,
    isSelected,
    canAdd,
    allSelectedOptions,
    optionsTotal,
    unitTotal,
    lineTotal,
    customerNote,
    setCustomerNote: handleSetNote,
    groupSubtitle,
  };
}
