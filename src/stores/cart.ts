"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  addItem: (item: Omit<CartLine, "lineId">) => void;
  setQuantity: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clearAll: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  lines: [],

  addItem: (item) => {
    let lines = get().lines;
    // Clear cart if adding item from a different restaurant
    if (lines.length > 0 && lines[0].restaurantId !== item.restaurantId) {
      lines = [];
    }
    // Check if same product with same options exists
    const optKey = item.selectedOptions.map((o) => o.id).sort().join(",");
    const existing = lines.find(
      (l) =>
        l.productId === item.productId &&
        l.selectedOptions.map((o) => o.id).sort().join(",") === optKey
    );
    if (existing) {
      set({
        lines: lines.map((l) =>
          l.lineId === existing.lineId
            ? { ...l, quantity: Math.min(99, l.quantity + item.quantity) }
            : l
        ),
      });
    } else {
      set({ lines: [...lines, { ...item, lineId: generateId(), quantity: Math.min(99, item.quantity) }] });
    }
  },

  setQuantity: (lineId, qty) => {
    if (qty <= 0) {
      set({ lines: get().lines.filter((l) => l.lineId !== lineId) });
    } else {
      const capped = Math.min(99, qty);
      set({
        lines: get().lines.map((l) =>
          l.lineId === lineId ? { ...l, quantity: capped } : l
        ),
      });
    }
  },

  removeLine: (lineId) => {
    set({ lines: get().lines.filter((l) => l.lineId !== lineId) });
  },

  clearAll: () => set({ lines: [] }),

  getSubtotal: () => {
    return get().lines.reduce((sum, l) => {
      const optTotal = l.selectedOptions.reduce(
        (s, o) => s + o.priceModifier,
        0
      );
      return sum + (l.unitPrice + optTotal) * l.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().lines.reduce((sum, l) => sum + l.quantity, 0);
  },
}),
    { name: "dompedro-cart" },
  ),
);
