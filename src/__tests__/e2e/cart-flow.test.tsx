import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/stores/cart";
import type { MenuOption } from "@/lib/types";

function makeOption(id: string, price: number): MenuOption {
  return { id, name: `Option ${id}`, description: null, imageUrl: null, priceModifier: price };
}

function makeCartItem(overrides: Partial<Parameters<typeof useCartStore.getState>["0"]["lines"][0]> = {}) {
  return {
    restaurantId: "rest-1",
    restaurantName: "Restaurant 1",
    productId: "prod-1",
    name: "Burger",
    unitPrice: 25,
    quantity: 1,
    selectedOptions: [] as MenuOption[],
    optionsSummary: "",
    customerNote: "",
    ...overrides,
  };
}

describe("Cart Flow (E2E)", () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] });
  });

  it("adds an item and increases cart count", () => {
    const { addItem, getItemCount } = useCartStore.getState();
    addItem(makeCartItem());
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(getItemCount()).toBe(1);
  });

  it("increments quantity when adding same product with same options", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeCartItem({ quantity: 2 }));
    addItem(makeCartItem({ quantity: 1 }));
    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("clears previous items when adding item from different restaurant", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeCartItem({ restaurantId: "rest-1", productId: "prod-1" }));
    addItem(makeCartItem({ restaurantId: "rest-2", productId: "prod-2" }));
    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].restaurantId).toBe("rest-2");
  });

  it("removes item when quantity is set to 0", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeCartItem());
    const lineId = useCartStore.getState().lines[0].lineId;
    useCartStore.getState().setQuantity(lineId, 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("calculates subtotal correctly with options", () => {
    const { addItem } = useCartStore.getState();
    const opts = [makeOption("opt-1", 3), makeOption("opt-2", 5)];
    addItem(makeCartItem({ unitPrice: 20, quantity: 2, selectedOptions: opts }));
    // (20 + 3 + 5) * 2 = 56
    expect(useCartStore.getState().getSubtotal()).toBe(56);
  });

  it("calculates subtotal with multiple lines", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeCartItem({ productId: "prod-1", unitPrice: 10, quantity: 1, selectedOptions: [] }));
    addItem(makeCartItem({ productId: "prod-2", unitPrice: 15, quantity: 3, selectedOptions: [makeOption("o1", 2)] }));
    // 10*1 + (15+2)*3 = 10 + 51 = 61
    expect(useCartStore.getState().getSubtotal()).toBe(61);
  });

  it("clears all items with clearAll", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeCartItem({ productId: "prod-1" }));
    addItem(makeCartItem({ productId: "prod-2" }));
    useCartStore.getState().clearAll();
    expect(useCartStore.getState().lines).toHaveLength(0);
    expect(useCartStore.getState().getItemCount()).toBe(0);
    expect(useCartStore.getState().getSubtotal()).toBe(0);
  });
});
